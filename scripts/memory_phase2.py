#!/usr/bin/env python3
"""Fail-closed runtime semantics for permanent-memory Phase 2 domain records.

The JSON Schemas define portable closed shapes.  This module enforces the relationships that
draft-07 cannot express: content-address agreement, exact source/extraction/evidence linkage,
deterministic set and store-root commitments, signed checkpoint chains, and purge proofs.

Trust and deletion are explicit boundaries.  Signature verification always requires injected
trust and cryptographic resolvers.  A purge is accepted only when injected resolvers attest the
removed targets, the *complete* transitive event/object closure, every erasure surface, and the
surviving tombstone.  Merely presenting receipt hashes never proves deletion.
"""
from __future__ import annotations

import base64
import binascii
import copy
import functools
import hashlib
import json
import re
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:  # Direct ``python scripts/...`` imports.
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_contract import (
        parse_aware_datetime,
        validate_event,
        validate_intake_receipt,
        validate_object_manifest,
    )
    from validate_screener_json import Checker
except ModuleNotFoundError:  # Package-style imports from the repository root.
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_contract import (
        parse_aware_datetime,
        validate_event,
        validate_intake_receipt,
        validate_object_manifest,
    )
    from scripts.validate_screener_json import Checker


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_DIR = ROOT / "frameworks" / "memory"
COLLECTION_NAMES = ("manifests", "events", "receipts", "tombstones")
SURFACE_NAMES = ("key_envelopes", "backups", "projections")
MAX_SAFE_INTEGER = 9_007_199_254_740_991
_HASH_REF_RE = re.compile(r"^sha256:[0-9a-f]{64}$")
_OBJECT_ID_RE = re.compile(r"^object:sha256:[0-9a-f]{64}$")
_EVENT_ID_RE = re.compile(
    r"^evt_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)
_ACQUISITION_ID_RE = re.compile(
    r"^acquisition_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)
_SOURCE_VERSION_ID_RE = re.compile(
    r"^source-version_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)
_RFC3339_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$"
)
_TRUSTED_SIGNATURE_SCHEMAS = frozenset(
    {
        "memory-intake-receipt/v1",
        "memory-store-checkpoint/v1",
        "memory-purge-receipt/v1",
    }
)

_SOURCE_SCHEMA = "source-v2.schema.json"
_EVIDENCE_SCHEMA = "evidence-span-v2.schema.json"
_EXTRACTION_SCHEMA = "extraction-artifact-v1.schema.json"
_CHECKPOINT_SCHEMA = "store-checkpoint-v1.schema.json"
_PURGE_SCHEMA = "purge-receipt-v1.schema.json"


class Phase2ContractError(ValueError):
    """Raised by deterministic builders when an input cannot form a canonical contract."""


@dataclass(frozen=True)
class RemovedRecord:
    """A trusted resolver's pre-purge record plus its post-purge absence result."""

    record: Mapping[str, Any]
    removed: bool


@dataclass(frozen=True)
class DerivativeClosure:
    """Trusted complete transitive closure over downstream event and object records.

    ``complete`` must be the singleton ``True``.  A plain list, partial page, best-effort query, or
    resolver that cannot attest completeness is rejected.
    """

    events: tuple[RemovedRecord, ...]
    objects: tuple[RemovedRecord, ...]
    complete: bool


@dataclass(frozen=True)
class RetiredObjectKey:
    """Exact store identity for one retired manifest, even when content bytes are shared."""

    object_id: str
    content_sha256: str
    manifest_sha256: str
    acquisition_id: str
    source_version_id: str


@dataclass(frozen=True)
class CheckpointSnapshot:
    """Trusted complete resolver snapshot used to authenticate checkpoint commitments.

    Receipt hashes are a required trusted-resolver attestation that signature/trust verification
    was completed outside checkpoint validation; the hashes are not cryptographic proof by
    themselves.  Retired IDs prove that tombstones target intentionally absent records and let the
    validator reject live dependants that would retain references to purged bytes.
    """

    collections: Mapping[str, Sequence[Mapping[str, Any]]]
    complete: bool
    authenticated_receipt_sha256: tuple[str, ...]
    retired_event_ids: tuple[str, ...]
    retired_object_keys: tuple[RetiredObjectKey, ...]


@dataclass(frozen=True)
class PurgeTransition:
    """Atomically constructed purge receipt, forward checkpoint, and authenticated snapshot."""

    receipt: Mapping[str, Any]
    checkpoint: Mapping[str, Any]
    snapshot: CheckpointSnapshot


def _fail_closed(function: Callable[..., list[str]]) -> Callable[..., list[str]]:
    @functools.wraps(function)
    def wrapped(*args: Any, **kwargs: Any) -> list[str]:
        try:
            result = function(*args, **kwargs)
        except Exception as exc:
            return [
                f"(root) — {function.__name__} failed closed on malformed input "
                f"({type(exc).__name__})"
            ]
        if not isinstance(result, list) or not all(isinstance(item, str) for item in result):
            return [f"(root) — {function.__name__} returned an invalid validation result"]
        return result

    return wrapped


def _err(errors: list[str], path: str, message: str) -> None:
    errors.append(f"{path or '(root)'} — {message}")


def _prefix(errors: Iterable[str], path: str) -> list[str]:
    return [f"{path}.{error}" if not error.startswith("(root)") else f"{path} — {error}" for error in errors]


def _string_leaves(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, Mapping):
        for child in value.values():
            yield from _string_leaves(child)
    elif isinstance(value, list):
        for child in value:
            yield from _string_leaves(child)


@functools.lru_cache(maxsize=None)
def _schema(name: str) -> dict[str, Any]:
    with (SCHEMA_DIR / name).open(encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise Phase2ContractError(f"schema {name} is not an object")
    return value


def _schema_errors(name: str, value: Any) -> list[str]:
    try:
        schema = _schema(name)
        checker = Checker(schema)
        checker.check(schema, value, "")
    except Exception as exc:
        return [f"(root) — schema validation failed closed ({type(exc).__name__})"]
    return checker.errors


def _canonical_errors(value: Any, path: str = "") -> list[str]:
    try:
        canonical_json_bytes(value)
    except (TypeError, ValueError, UnicodeError) as exc:
        return [f"{path or '(root)'} — is not canonical JSON: {exc}"]
    return []


def _object_digest(value: Any) -> str | None:
    prefix = "object:sha256:"
    if isinstance(value, str) and value.startswith(prefix) and len(value) == len(prefix) + 64:
        return value[len(prefix) :]
    return None


def _hash_digest(value: Any) -> str | None:
    prefix = "sha256:"
    if isinstance(value, str) and value.startswith(prefix) and len(value) == len(prefix) + 64:
        return value[len(prefix) :]
    return None


def _check_object_hash(
    object_value: Any,
    hash_value: Any,
    path: str,
    errors: list[str],
) -> None:
    object_digest = _object_digest(object_value)
    content_digest = _hash_digest(hash_value)
    if object_digest is not None and content_digest is not None and object_digest != content_digest:
        _err(errors, path, "object_id digest must equal content_sha256")


def canonical_record_sha256(record: Any) -> str:
    """Return the repository-wide canonical JSON digest for one complete record."""

    return f"sha256:{canonical_sha256(record)}"


def _domain_digest(domain: bytes, value: Any) -> str:
    return hashlib.sha256(domain + b"\0" + canonical_json_bytes(value)).hexdigest()


def _instant(value: Any, path: str, errors: list[str]):
    try:
        return parse_aware_datetime(value)
    except (TypeError, ValueError):
        _err(errors, path, "must be a timezone-aware RFC 3339 instant")
        return None


@_fail_closed
def validate_source_v2_payload(source: Any) -> list[str]:
    """Validate the self-contained semantics of one v2 source payload."""

    errors = _schema_errors(_SOURCE_SCHEMA, source)
    errors.extend(_canonical_errors(source))
    if errors or not isinstance(source, Mapping):
        return errors
    _check_object_hash(
        source.get("source_object_id"), source.get("content_sha256"), "source_object_id", errors
    )
    acquired_at = _instant(source.get("acquired_at"), "acquired_at", errors)
    licence = source.get("licence")
    if isinstance(licence, Mapping) and licence.get("expires_at") is not None:
        expires_at = _instant(licence.get("expires_at"), "licence.expires_at", errors)
        if acquired_at is not None and expires_at is not None and expires_at <= acquired_at:
            _err(errors, "licence.expires_at", "must be later than acquired_at")
    return errors


validate_source_v2 = validate_source_v2_payload


@_fail_closed
def validate_extraction_artifact_payload(artifact: Any) -> list[str]:
    """Validate an extraction payload without resolving its bound source record."""

    errors = _schema_errors(_EXTRACTION_SCHEMA, artifact)
    errors.extend(_canonical_errors(artifact))
    if errors or not isinstance(artifact, Mapping):
        return errors
    source_object = artifact.get("source_object")
    output_object = artifact.get("output_object")
    if isinstance(source_object, Mapping):
        _check_object_hash(
            source_object.get("object_id"),
            source_object.get("content_sha256"),
            "source_object.object_id",
            errors,
        )
    if isinstance(output_object, Mapping):
        _check_object_hash(
            output_object.get("object_id"),
            output_object.get("content_sha256"),
            "output_object.object_id",
            errors,
        )
    _instant(artifact.get("created_at"), "created_at", errors)
    return errors


@_fail_closed
def validate_extraction_artifact(
    artifact: Any,
    *,
    source: Any = None,
) -> list[str]:
    """Validate a reproducible extraction and exact equality to its source binding."""

    errors = validate_extraction_artifact_payload(artifact)
    if source is None:
        _err(errors, "source", "a source-v2 record is required for exact reference validation")
    else:
        errors.extend(_prefix(validate_source_v2(source), "source"))
    if errors or not isinstance(artifact, Mapping) or not isinstance(source, Mapping):
        return errors

    rights = source.get("rights")
    if isinstance(rights, Mapping) and rights.get("derivative_use") == "prohibited":
        _err(errors, "source.rights.derivative_use", "prohibits extraction derivatives")

    source_object = artifact.get("source_object")
    output_object = artifact.get("output_object")
    if not isinstance(source_object, Mapping) or not isinstance(output_object, Mapping):
        return errors
    equality = {
        "document_id": source.get("document_id"),
        "source_version_id": source.get("source_version_id"),
        "acquisition_id": source.get("acquisition_id"),
    }
    for field, expected in equality.items():
        if artifact.get(field) != expected:
            _err(errors, field, f"must exactly equal source.{field}")
    if source_object.get("object_id") != source.get("source_object_id"):
        _err(errors, "source_object.object_id", "must exactly equal source.source_object_id")
    if source_object.get("content_sha256") != source.get("content_sha256"):
        _err(errors, "source_object.content_sha256", "must exactly equal source.content_sha256")

    acquired_at = _instant(source.get("acquired_at"), "source.acquired_at", errors)
    created_at = _instant(artifact.get("created_at"), "created_at", errors)
    if acquired_at is not None and created_at is not None and created_at < acquired_at:
        _err(errors, "created_at", "must not precede source.acquired_at")
    return errors


@_fail_closed
def validate_evidence_span_v2_payload(evidence: Any) -> list[str]:
    """Validate an evidence payload without resolving source or extraction records."""

    errors = _schema_errors(_EVIDENCE_SCHEMA, evidence)
    errors.extend(_canonical_errors(evidence))
    if errors or not isinstance(evidence, Mapping):
        return errors
    _check_object_hash(
        evidence.get("source_object_id"),
        evidence.get("source_content_sha256"),
        "source_object_id",
        errors,
    )
    locator = evidence.get("locator")
    if not isinstance(locator, Mapping):
        return errors
    _check_object_hash(
        locator.get("coordinate_artifact_object_id"),
        locator.get("coordinate_artifact_content_sha256"),
        "locator.coordinate_artifact_object_id",
        errors,
    )

    char_start, char_end = locator.get("char_start"), locator.get("char_end")
    if (char_start is None) != (char_end is None):
        _err(errors, "locator", "char_start and char_end must be both null or both set")
    elif isinstance(char_start, int) and isinstance(char_end, int) and char_end <= char_start:
        _err(errors, "locator.char_end", "must be greater than char_start")
    time_start = locator.get("timestamp_start_millis")
    time_end = locator.get("timestamp_end_millis")
    if (time_start is None) != (time_end is None):
        _err(
            errors,
            "locator",
            "timestamp_start_millis and timestamp_end_millis must be both null or both set",
        )
    elif isinstance(time_start, int) and isinstance(time_end, int) and time_end <= time_start:
        _err(errors, "locator.timestamp_end_millis", "must be greater than timestamp_start_millis")

    required_coordinate = {
        "page": ("page",),
        "section": ("section",),
        "table": ("table",),
        "cell": ("table", "cell"),
        "character": ("char_start", "char_end"),
        "record": ("record_index",),
        "timestamp": ("timestamp_start_millis", "timestamp_end_millis"),
        "image-region": ("image_region",),
    }.get(locator.get("kind"), ())
    for field in required_coordinate:
        if locator.get(field) is None:
            _err(errors, f"locator.{field}", f"is required for locator kind {locator.get('kind')!r}")
    region = locator.get("image_region")
    if locator.get("kind") == "image-region" and isinstance(region, Mapping):
        x_min, x_max = region.get("x_min"), region.get("x_max")
        y_min, y_max = region.get("y_min"), region.get("y_max")
        if isinstance(x_min, int) and isinstance(x_max, int) and x_min >= x_max:
            _err(errors, "locator.image_region.x_max", "must be greater than x_min")
        if isinstance(y_min, int) and isinstance(y_max, int) and y_min >= y_max:
            _err(errors, "locator.image_region.y_max", "must be greater than y_min")
    return errors


@_fail_closed
def validate_evidence_span_v2(
    evidence: Any,
    *,
    source: Any = None,
    extraction_artifact: Any = None,
) -> list[str]:
    """Validate stable evidence against exact source and coordinate-artifact records."""

    errors = validate_evidence_span_v2_payload(evidence)
    if source is None:
        _err(errors, "source", "a source-v2 record is required for exact reference validation")
    else:
        errors.extend(_prefix(validate_source_v2(source), "source"))
    if extraction_artifact is None:
        _err(
            errors,
            "extraction_artifact",
            "an extraction artifact is required for coordinate validation",
        )
    else:
        errors.extend(
            _prefix(
                validate_extraction_artifact(extraction_artifact, source=source),
                "extraction_artifact",
            )
        )
    if (
        errors
        or not isinstance(evidence, Mapping)
        or not isinstance(source, Mapping)
        or not isinstance(extraction_artifact, Mapping)
    ):
        return errors

    equality = {
        "document_id": source.get("document_id"),
        "source_version_id": source.get("source_version_id"),
        "acquisition_id": source.get("acquisition_id"),
        "source_object_id": source.get("source_object_id"),
        "source_content_sha256": source.get("content_sha256"),
    }
    for field, expected in equality.items():
        if evidence.get(field) != expected:
            source_field = "content_sha256" if field == "source_content_sha256" else field
            _err(errors, field, f"must exactly equal source.{source_field}")

    locator = evidence.get("locator")
    output = extraction_artifact.get("output_object")
    coordinate_system = extraction_artifact.get("coordinate_system")
    if not isinstance(locator, Mapping) or not isinstance(output, Mapping) or not isinstance(
        coordinate_system, Mapping
    ):
        return errors
    locator_equality = {
        "extraction_id": extraction_artifact.get("extraction_id"),
        "coordinate_artifact_object_id": output.get("object_id"),
        "coordinate_artifact_content_sha256": output.get("content_sha256"),
        "coordinate_system_sha256": coordinate_system.get("specification_sha256"),
    }
    for field, expected in locator_equality.items():
        if locator.get(field) != expected:
            _err(errors, f"locator.{field}", "must exactly equal extraction artifact binding")
    return errors


def _validate_manifest_policy_against_source(
    source: Mapping[str, Any],
    object_manifest: Mapping[str, Any],
    path: str,
    errors: list[str],
) -> None:
    """Prevent a source or derivative manifest from laundering source access terms."""

    policy = object_manifest.get("policy")
    licence = source.get("licence")
    if not isinstance(policy, Mapping) or not isinstance(licence, Mapping):
        return
    classification = licence.get("classification")
    entitlement = licence.get("entitlement")
    expires_at_text = licence.get("expires_at")
    if classification == "unknown" or entitlement == "unknown":
        if policy.get("classification") not in {"restricted", "confidential"}:
            _err(
                errors,
                f"{path}.policy.classification",
                "unknown licence/entitlement must fail closed as restricted or confidential",
            )
    elif policy.get("classification") != classification:
        _err(
            errors,
            f"{path}.policy.classification",
            "must exactly equal source.licence.classification",
        )
    if expires_at_text is not None:
        if policy.get("retention") != "expires":
            _err(
                errors,
                f"{path}.policy.retention",
                "a licence expiry requires expires retention",
            )
        expiry = _instant(expires_at_text, "source.licence.expires_at", errors)
        retain_until = _instant(
            policy.get("retain_until"), f"{path}.policy.retain_until", errors
        )
        if expiry is not None and retain_until is not None and retain_until > expiry:
            _err(
                errors,
                f"{path}.policy.retain_until",
                "must not outlive source.licence.expires_at",
            )
    elif (
        classification == "unknown"
        or entitlement in {"required", "named-principals", "owner-only", "unknown"}
    ) and policy.get("retention") != "source-policy":
        _err(
            errors,
            f"{path}.policy.retention",
            "unknown or entitlement-controlled content requires source-policy retention without an earlier expiry",
        )


@_fail_closed
def validate_source_manifest_binding(source: Any, object_manifest: Any) -> list[str]:
    """Bind source-v2 metadata to the exact persisted source-object manifest."""

    errors = validate_source_v2(source)
    errors.extend(_prefix(validate_object_manifest(object_manifest), "object_manifest"))
    if errors or not isinstance(source, Mapping) or not isinstance(object_manifest, Mapping):
        return errors
    equality = {
        "object_id": source.get("source_object_id"),
        "content_sha256": source.get("content_sha256"),
        "acquisition_id": source.get("acquisition_id"),
        "source_version_id": source.get("source_version_id"),
        "byte_length": source.get("byte_length"),
        "media_type": source.get("mime_type"),
    }
    for field, expected in equality.items():
        if object_manifest.get(field) != expected:
            _err(errors, f"object_manifest.{field}", f"must exactly equal source binding {expected!r}")
    if object_manifest.get("object_kind") != "source":
        _err(errors, "object_manifest.object_kind", "must equal 'source'")
    lineage = object_manifest.get("source_lineage")
    if isinstance(lineage, Mapping):
        expected_source_id = "source:sha256:" + str(source.get("content_sha256", "")).removeprefix(
            "sha256:"
        )
        if lineage.get("source_id") != expected_source_id:
            _err(errors, "object_manifest.source_lineage.source_id", "must bind source content digest")
    source_clock = _instant(source.get("acquired_at"), "source.acquired_at", errors)
    manifest_clock = _instant(
        object_manifest.get("created_at"), "object_manifest.created_at", errors
    )
    if source_clock is not None and manifest_clock is not None and source_clock != manifest_clock:
        _err(errors, "object_manifest.created_at", "must equal source.acquired_at as an instant")
    _validate_manifest_policy_against_source(source, object_manifest, "object_manifest", errors)
    return errors


@_fail_closed
def validate_extraction_manifest_bindings(
    artifact: Any,
    *,
    source: Any,
    source_manifest: Any,
    output_manifest: Any,
) -> list[str]:
    """Bind an extraction's exact input/output references to persisted manifests."""

    errors = validate_extraction_artifact(artifact, source=source)
    errors.extend(_prefix(validate_source_manifest_binding(source, source_manifest), "source_binding"))
    errors.extend(_prefix(validate_object_manifest(output_manifest), "output_manifest"))
    if (
        errors
        or not isinstance(artifact, Mapping)
        or not isinstance(source_manifest, Mapping)
        or not isinstance(output_manifest, Mapping)
    ):
        return errors
    source_object = artifact.get("source_object")
    output_object = artifact.get("output_object")
    if not isinstance(source_object, Mapping) or not isinstance(output_object, Mapping):
        return errors
    if source_object.get("object_id") != source_manifest.get("object_id"):
        _err(errors, "source_manifest.object_id", "must equal artifact.source_object.object_id")
    if source_object.get("content_sha256") != source_manifest.get("content_sha256"):
        _err(
            errors,
            "source_manifest.content_sha256",
            "must equal artifact.source_object.content_sha256",
        )
    output_equality = {
        "object_id": output_object.get("object_id"),
        "content_sha256": output_object.get("content_sha256"),
        "byte_length": output_object.get("byte_length"),
        "media_type": output_object.get("media_type"),
        "acquisition_id": artifact.get("acquisition_id"),
        "source_version_id": artifact.get("source_version_id"),
    }
    for field, expected in output_equality.items():
        if output_manifest.get(field) != expected:
            _err(errors, f"output_manifest.{field}", "must exactly equal extraction binding")
    if output_manifest.get("object_kind") != "extraction":
        _err(errors, "output_manifest.object_kind", "must equal 'extraction'")
    if isinstance(source, Mapping):
        _validate_manifest_policy_against_source(
            source, output_manifest, "output_manifest", errors
        )
    lineage = output_manifest.get("source_lineage")
    if isinstance(lineage, Mapping):
        exact_source_pointer = {
            "object_id": source_manifest.get("object_id"),
            "acquisition_id": source_manifest.get("acquisition_id"),
            "source_version_id": source_manifest.get("source_version_id"),
            "manifest_sha256": canonical_record_sha256(source_manifest),
        }
        if lineage.get("source_object") != exact_source_pointer:
            _err(
                errors,
                "output_manifest.source_lineage.source_object",
                "must equal the exact source manifest pointer",
            )
        derived = lineage.get("derived_from_objects")
        if not isinstance(derived, list) or exact_source_pointer not in derived:
            _err(
                errors,
                "output_manifest.source_lineage.derived_from_objects",
                "must contain the exact source manifest pointer",
            )
    provenance = output_manifest.get("provenance")
    if isinstance(provenance, Mapping):
        extraction = provenance.get("extraction")
        tool = provenance.get("tool")
        if isinstance(extraction, Mapping):
            if extraction.get("extraction_id") != artifact.get("extraction_id"):
                _err(errors, "output_manifest.provenance.extraction.extraction_id", "must match artifact")
            if extraction.get("method") != artifact.get("method"):
                _err(errors, "output_manifest.provenance.extraction.method", "must match artifact")
        artifact_tool = artifact.get("tool")
        if isinstance(tool, Mapping) and isinstance(artifact_tool, Mapping):
            for field, manifest_field in (
                ("tool_id", "tool_id"),
                ("version", "version"),
                ("artifact_sha256", "sha256"),
            ):
                if artifact_tool.get(field) != tool.get(manifest_field):
                    _err(errors, f"output_manifest.provenance.tool.{manifest_field}", "must match artifact")
    return errors


@_fail_closed
def validate_evidence_manifest_bindings(
    evidence: Any,
    *,
    source: Any,
    extraction_artifact: Any,
    source_manifest: Any,
    coordinate_manifest: Any,
) -> list[str]:
    """Bind evidence through source and extraction records to both exact object manifests."""

    errors = validate_evidence_span_v2(
        evidence, source=source, extraction_artifact=extraction_artifact
    )
    errors.extend(
        _prefix(
            validate_extraction_manifest_bindings(
                extraction_artifact,
                source=source,
                source_manifest=source_manifest,
                output_manifest=coordinate_manifest,
            ),
            "manifest_bindings",
        )
    )
    if errors or not isinstance(evidence, Mapping) or not isinstance(coordinate_manifest, Mapping):
        return errors
    locator = evidence.get("locator")
    if isinstance(locator, Mapping):
        if locator.get("coordinate_artifact_object_id") != coordinate_manifest.get("object_id"):
            _err(errors, "locator.coordinate_artifact_object_id", "must equal coordinate manifest")
        if locator.get("coordinate_artifact_content_sha256") != coordinate_manifest.get(
            "content_sha256"
        ):
            _err(errors, "locator.coordinate_artifact_content_sha256", "must equal coordinate manifest")
    return errors


def _record_id(collection: str, record: Mapping[str, Any]) -> str:
    if collection == "manifests":
        return f"manifest:sha256:{canonical_sha256(record)}"
    if collection == "events":
        value = record.get("event_id")
        if isinstance(value, str) and value:
            return value
    elif collection == "receipts":
        values = [record.get("receipt_id"), record.get("purge_receipt_id")]
        present = [value for value in values if isinstance(value, str) and value]
        if len(present) == 1:
            return present[0]
    elif collection == "tombstones":
        value = record.get("event_id") or record.get("tombstone_event_id")
        if isinstance(value, str) and value:
            return value
        return f"tombstone:sha256:{canonical_sha256(record)}"
    raise Phase2ContractError(f"{collection} record has no unambiguous canonical record ID")


def canonical_set_commitment(
    collection: str,
    records: Iterable[Mapping[str, Any]],
) -> dict[str, Any]:
    """Build one order-independent commitment using canonical record-ID ordering."""

    if collection not in COLLECTION_NAMES:
        raise Phase2ContractError(f"unknown checkpoint collection {collection!r}")
    if isinstance(records, (str, bytes, bytearray, Mapping)):
        raise Phase2ContractError("records must be an iterable of record objects")
    try:
        rows = list(records)
    except TypeError as exc:
        raise Phase2ContractError("records must be iterable") from exc
    indexed: list[tuple[str, Mapping[str, Any]]] = []
    seen: set[str] = set()
    for position, record in enumerate(rows):
        if not isinstance(record, Mapping):
            raise Phase2ContractError(f"records[{position}] is not an object")
        canonical_json_bytes(record)
        identifier = _record_id(collection, record)
        if identifier in seen:
            raise Phase2ContractError(f"duplicate canonical record ID {identifier!r}")
        seen.add(identifier)
        indexed.append((identifier, record))
    indexed.sort(key=lambda item: item[0])
    identifiers = [identifier for identifier, _ in indexed]
    ordered_records = [record for _, record in indexed]
    return {
        "record_count": len(indexed),
        "ordered_ids_sha256": "sha256:"
        + _domain_digest(
            b"memory-checkpoint-set-ids/v1",
            {"collection": collection, "ids": identifiers},
        ),
        "records_sha256": "sha256:"
        + _domain_digest(
            b"memory-checkpoint-set-records/v1",
            {"collection": collection, "records": ordered_records},
        ),
    }


def canonical_store_commitments(
    collections: Mapping[str, Iterable[Mapping[str, Any]]],
) -> dict[str, dict[str, Any]]:
    """Build all four required checkpoint commitments and reject missing/extra sets."""

    if not isinstance(collections, Mapping) or set(collections) != set(COLLECTION_NAMES):
        raise Phase2ContractError(
            f"collections must contain exactly {list(COLLECTION_NAMES)!r}"
        )
    return {
        name: canonical_set_commitment(name, collections[name])
        for name in COLLECTION_NAMES
    }


def store_root_sha256(checkpoint: Mapping[str, Any]) -> str:
    """Recompute the domain-separated root over checkpoint state, excluding signing metadata."""

    if not isinstance(checkpoint, Mapping):
        raise Phase2ContractError("checkpoint must be an object")
    required = (
        "checkpoint_id",
        "mode",
        "sequence",
        "purge_high_water",
        "prior_checkpoint",
        "canonicalization",
        "commitments",
        "retired_state",
    )
    if any(field not in checkpoint for field in required):
        raise Phase2ContractError("checkpoint is missing store-root material")
    material = {
        "schema": "memory-store-root/v1",
        **{field: copy.deepcopy(checkpoint[field]) for field in required},
    }
    return "sha256:" + _domain_digest(b"memory-store-root/v1", material)


def _signing_bytes(record: Mapping[str, Any], schema_name: str) -> bytes:
    if not isinstance(record, Mapping):
        raise Phase2ContractError("signed record must be an object")
    signature = record.get("signature")
    if not isinstance(signature, Mapping) or set(signature) != {
        "algorithm",
        "key_id",
        "signed_sha256",
        "value",
    }:
        raise Phase2ContractError("signature must have exactly the detached-signature fields")
    algorithm, key_id = signature.get("algorithm"), signature.get("key_id")
    if not isinstance(algorithm, str) or not isinstance(key_id, str):
        raise Phase2ContractError("signature algorithm and key_id must be strings")
    protected = copy.deepcopy(dict(record))
    protected["signature"] = {"algorithm": algorithm, "key_id": key_id}
    return schema_name.encode("ascii") + b"\0" + canonical_json_bytes(protected)


def store_checkpoint_signing_bytes(checkpoint: Mapping[str, Any]) -> bytes:
    return _signing_bytes(checkpoint, "memory-store-checkpoint/v1")


def store_checkpoint_signing_sha256(checkpoint: Mapping[str, Any]) -> str:
    return "sha256:" + hashlib.sha256(store_checkpoint_signing_bytes(checkpoint)).hexdigest()


def purge_receipt_signing_bytes(receipt: Mapping[str, Any]) -> bytes:
    return _signing_bytes(receipt, "memory-purge-receipt/v1")


def purge_receipt_signing_sha256(receipt: Mapping[str, Any]) -> str:
    return "sha256:" + hashlib.sha256(purge_receipt_signing_bytes(receipt)).hexdigest()


def store_checkpoint_reference(checkpoint: Mapping[str, Any]) -> str:
    """Hash the complete signed checkpoint record for use by the next checkpoint."""

    return "checkpoint:sha256:" + _domain_digest(
        b"memory-store-checkpoint-record/v1", checkpoint
    )


def purge_receipt_record_sha256(receipt: Mapping[str, Any]) -> str:
    return "sha256:" + _domain_digest(b"memory-purge-receipt-record/v1", receipt)


def checkpoint_pointer(checkpoint: Mapping[str, Any]) -> dict[str, Any]:
    """Return the exact predecessor pointer committed by a later checkpoint/receipt."""

    return {
        "checkpoint_id": checkpoint["checkpoint_id"],
        "checkpoint_sha256": store_checkpoint_reference(checkpoint),
        "sequence": checkpoint["sequence"],
        "purge_high_water": checkpoint["purge_high_water"],
    }


def _valid_retired_object_key(value: RetiredObjectKey) -> bool:
    return (
        isinstance(value.object_id, str)
        and _OBJECT_ID_RE.fullmatch(value.object_id) is not None
        and isinstance(value.content_sha256, str)
        and _HASH_REF_RE.fullmatch(value.content_sha256) is not None
        and _object_digest(value.object_id) == _hash_digest(value.content_sha256)
        and isinstance(value.manifest_sha256, str)
        and _HASH_REF_RE.fullmatch(value.manifest_sha256) is not None
        and isinstance(value.acquisition_id, str)
        and _ACQUISITION_ID_RE.fullmatch(value.acquisition_id) is not None
        and isinstance(value.source_version_id, str)
        and _SOURCE_VERSION_ID_RE.fullmatch(value.source_version_id) is not None
    )


def canonical_retired_state(snapshot: CheckpointSnapshot) -> dict[str, Any]:
    """Return the policy-safe retirement state committed by one checkpoint.

    Unlike a digest-only side attestation, these exact identities remain available
    to the next checkpoint verifier.  That makes monotonic no-resurrection checks
    possible without trusting an uncommitted reconstruction of the prior snapshot.
    """

    if not isinstance(snapshot, CheckpointSnapshot) or snapshot.complete is not True:
        raise Phase2ContractError("a trusted complete CheckpointSnapshot is required")
    event_ids = snapshot.retired_event_ids
    if (
        not isinstance(event_ids, tuple)
        or not all(
            isinstance(value, str) and _EVENT_ID_RE.fullmatch(value) is not None
            for value in event_ids
        )
        or len(set(event_ids)) != len(event_ids)
    ):
        raise Phase2ContractError(
            "snapshot retired_event_ids must be unique canonical event IDs"
        )
    object_keys = snapshot.retired_object_keys
    if (
        not isinstance(object_keys, tuple)
        or not all(isinstance(value, RetiredObjectKey) for value in object_keys)
        or len(set(object_keys)) != len(object_keys)
        or not all(_valid_retired_object_key(value) for value in object_keys)
    ):
        raise Phase2ContractError(
            "snapshot retired_object_keys must be unique exact retired object identities"
        )
    return {
        "event_ids": sorted(event_ids),
        "object_keys": [
            {
                "object_id": value.object_id,
                "content_sha256": value.content_sha256,
                "manifest_sha256": value.manifest_sha256,
                "acquisition_id": value.acquisition_id,
                "source_version_id": value.source_version_id,
            }
            for value in sorted(
                object_keys,
                key=lambda item: (
                    item.object_id,
                    item.content_sha256,
                    item.manifest_sha256,
                    item.acquisition_id,
                    item.source_version_id,
                ),
            )
        ],
    }


def _snapshot_rows(
    snapshot: Any,
    errors: list[str],
    *,
    pending_receipt_sha256: frozenset[str] = frozenset(),
) -> dict[str, list[Mapping[str, Any]]] | None:
    if not isinstance(snapshot, CheckpointSnapshot):
        _err(
            errors,
            "snapshot",
            "a CheckpointSnapshot resolver attestation is required",
        )
        return None
    if snapshot.complete is not True:
        _err(errors, "snapshot.complete", "must be the singleton true")
    collections = snapshot.collections
    if not isinstance(collections, Mapping) or set(collections) != set(COLLECTION_NAMES):
        _err(errors, "snapshot.collections", f"must contain exactly {list(COLLECTION_NAMES)!r}")
        return None
    rows: dict[str, list[Mapping[str, Any]]] = {}
    for name in COLLECTION_NAMES:
        values = collections.get(name)
        if isinstance(values, (str, bytes, bytearray, Mapping)):
            _err(errors, f"snapshot.collections.{name}", "must be a sequence of record objects")
            continue
        try:
            materialized = list(values)
        except TypeError:
            _err(errors, f"snapshot.collections.{name}", "must be iterable")
            continue
        if not all(isinstance(record, Mapping) for record in materialized):
            _err(errors, f"snapshot.collections.{name}", "contains a non-object record")
            continue
        rows[name] = materialized
    if set(rows) != set(COLLECTION_NAMES):
        return None

    retired = snapshot.retired_event_ids
    if (
        not isinstance(retired, tuple)
        or not all(
            isinstance(value, str) and _EVENT_ID_RE.fullmatch(value) is not None
            for value in retired
        )
        or len(set(retired)) != len(retired)
    ):
        _err(
            errors,
            "snapshot.retired_event_ids",
            "must be a unique tuple of canonical event IDs",
        )
        retired_set: set[str] = set()
    else:
        retired_set = set(retired)
    retired_objects = snapshot.retired_object_keys
    if (
        not isinstance(retired_objects, tuple)
        or not all(isinstance(value, RetiredObjectKey) for value in retired_objects)
        or len(set(retired_objects)) != len(retired_objects)
    ):
        _err(
            errors,
            "snapshot.retired_object_keys",
            "must be a unique tuple of exact RetiredObjectKey values",
        )
        retired_manifest_set: set[str] = set()
    else:
        for position, retired_object in enumerate(retired_objects):
            if not _valid_retired_object_key(retired_object):
                _err(
                    errors,
                    f"snapshot.retired_object_keys[{position}]",
                    "must be a valid exact object/acquisition/source-version/manifest identity",
                )
        retired_manifest_set = {value.manifest_sha256 for value in retired_objects}
    live_event_ids = {
        record.get("event_id")
        for record in rows["events"]
        if isinstance(record.get("event_id"), str)
    }
    overlap = sorted(live_event_ids & retired_set)
    if overlap:
        _err(errors, "snapshot.retired_event_ids", f"also appear in live events: {overlap!r}")

    for position, manifest in enumerate(rows["manifests"]):
        prefix = f"snapshot.collections.manifests[{position}]"
        errors.extend(
            _prefix(validate_object_manifest(manifest), prefix)
        )
        try:
            manifest_sha256 = canonical_record_sha256(manifest)
        except (TypeError, ValueError, UnicodeError):
            manifest_sha256 = None
        if manifest_sha256 in retired_manifest_set:
            _err(errors, prefix, "is simultaneously live and retired")
        retired_references = sorted(set(_string_leaves(manifest)) & retired_manifest_set)
        if retired_references:
            _err(
                errors,
                prefix,
                f"live manifest retains an exact lineage reference to retired content: {retired_references!r}",
            )
    for position, event in enumerate(rows["events"]):
        prefix = f"snapshot.collections.events[{position}]"
        errors.extend(_prefix(validate_event(event), prefix))
        payload = event.get("payload")
        if isinstance(payload, Mapping) and payload.get("schema") == "memory-tombstone/v1":
            _err(errors, f"{prefix}.payload", "tombstones belong only in the tombstones collection")
        references = set(_string_leaves(event))
        retired_references = sorted((references & retired_set) | (references & retired_manifest_set))
        if retired_references:
            _err(
                errors,
                prefix,
                f"live event retains a reference to retired content: {retired_references!r}",
            )

    receipt_hashes: set[str] = set()
    for position, receipt in enumerate(rows["receipts"]):
        schema_name = receipt.get("schema")
        if schema_name == "memory-intake-receipt/v1":
            receipt_errors = validate_intake_receipt(receipt)
        elif schema_name == "memory-purge-receipt/v1":
            receipt_errors = _validate_purge_receipt_local(receipt)
        else:
            receipt_errors = [f"schema — unsupported checkpoint receipt {schema_name!r}"]
        errors.extend(
            _prefix(receipt_errors, f"snapshot.collections.receipts[{position}]")
        )
        receipt_hashes.add(canonical_record_sha256(receipt))

    authenticated = snapshot.authenticated_receipt_sha256
    if (
        not isinstance(authenticated, tuple)
        or not all(isinstance(value, str) for value in authenticated)
        or len(set(authenticated)) != len(authenticated)
    ):
        _err(
            errors,
            "snapshot.authenticated_receipt_sha256",
            "must be a unique tuple of canonical receipt digests",
        )
        authenticated_set: set[str] = set()
    else:
        authenticated_set = set(authenticated)
    expected_authenticated = receipt_hashes - set(pending_receipt_sha256)
    allowed_authenticated = (expected_authenticated, receipt_hashes)
    if authenticated_set not in allowed_authenticated:
        _err(
            errors,
            "snapshot.authenticated_receipt_sha256",
            "must exactly attest every receipt, optionally excluding only the receipt currently undergoing verification",
        )

    tombstones_by_id: dict[str, Mapping[str, Any]] = {}
    for position, tombstone_event in enumerate(rows["tombstones"]):
        prefix = f"snapshot.collections.tombstones[{position}]"
        errors.extend(_prefix(validate_event(tombstone_event), prefix))
        tombstone_event_id = tombstone_event.get("event_id")
        if isinstance(tombstone_event_id, str):
            if tombstone_event_id in tombstones_by_id:
                _err(errors, f"{prefix}.event_id", "duplicates a tombstone event ID")
            tombstones_by_id[tombstone_event_id] = tombstone_event
        payload = tombstone_event.get("payload")
        if not isinstance(payload, Mapping) or payload.get("schema") != "memory-tombstone/v1":
            _err(errors, f"{prefix}.payload", "must be a memory-tombstone/v1 payload")
            continue
        target = payload.get("target_event_id")
        if target not in retired_set:
            _err(
                errors,
                f"{prefix}.payload.target_event_id",
                "requires snapshot-aware retired-target attestation",
            )

    for position, receipt in enumerate(rows["receipts"]):
        if receipt.get("schema") != "memory-purge-receipt/v1":
            continue
        path = f"snapshot.collections.receipts[{position}].surviving_tombstone"
        pointer = receipt.get("surviving_tombstone")
        if not isinstance(pointer, Mapping):
            continue
        tombstone_event = tombstones_by_id.get(pointer.get("tombstone_event_id"))
        if tombstone_event is None:
            _err(errors, path, "does not resolve to a committed tombstone event")
            continue
        try:
            event_sha256 = canonical_record_sha256(tombstone_event)
            payload_sha256 = canonical_record_sha256(tombstone_event.get("payload"))
        except (TypeError, ValueError, UnicodeError):
            continue
        if pointer.get("tombstone_event_sha256") != event_sha256:
            _err(errors, f"{path}.tombstone_event_sha256", "does not match committed tombstone")
        if pointer.get("tombstone_payload_sha256") != payload_sha256:
            _err(errors, f"{path}.tombstone_payload_sha256", "does not match committed tombstone")
        policy = tombstone_event.get("policy")
        if isinstance(policy, Mapping):
            if pointer.get("classification") != policy.get("classification"):
                _err(
                    errors,
                    f"{path}.classification",
                    "does not match committed tombstone policy",
                )
            if pointer.get("retention") != policy.get("retention"):
                _err(
                    errors,
                    f"{path}.retention",
                    "does not match committed tombstone policy",
                )
    return rows


def _validate_store_checkpoint_local(
    checkpoint: Any,
    *,
    snapshot: Any = None,
    require_snapshot: bool,
    pending_receipt_sha256: frozenset[str] = frozenset(),
) -> tuple[list[str], dict[str, list[Mapping[str, Any]]] | None]:
    errors = _schema_errors(_CHECKPOINT_SCHEMA, checkpoint)
    errors.extend(_canonical_errors(checkpoint))
    rows = None
    if require_snapshot:
        rows = _snapshot_rows(
            snapshot,
            errors,
            pending_receipt_sha256=pending_receipt_sha256,
        )
        try:
            expected_retired_state = canonical_retired_state(snapshot)
        except (Phase2ContractError, TypeError, ValueError, UnicodeError) as exc:
            _err(errors, "retired_state", f"cannot resolve exact retired state: {exc}")
        else:
            if isinstance(checkpoint, Mapping) and checkpoint.get(
                "retired_state"
            ) != expected_retired_state:
                _err(
                    errors,
                    "retired_state",
                    "must exactly equal the complete resolved snapshot retirement state",
                )
    if errors or not isinstance(checkpoint, Mapping):
        return errors, rows
    if rows is not None:
        try:
            actual_commitments = canonical_store_commitments(rows)
        except (Phase2ContractError, TypeError, ValueError, UnicodeError) as exc:
            _err(errors, "commitments", f"cannot build resolved commitments: {exc}")
        else:
            if checkpoint.get("commitments") != actual_commitments:
                _err(errors, "commitments", "do not equal the complete resolved record sets")
            purge_sequences: list[int] = []
            for receipt in rows["receipts"]:
                if receipt.get("schema") == "memory-purge-receipt/v1":
                    sequence = receipt.get("purge_sequence")
                    if isinstance(sequence, int) and not isinstance(sequence, bool):
                        purge_sequences.append(sequence)
            high_water = checkpoint.get("purge_high_water")
            if isinstance(high_water, int) and not isinstance(high_water, bool):
                expected = list(range(1, high_water + 1))
                if sorted(purge_sequences) != expected:
                    _err(
                        errors,
                        "purge_high_water",
                        "must equal a unique contiguous 1..N purge-receipt sequence in the complete receipt set",
                    )
    try:
        actual_root = store_root_sha256(checkpoint)
    except (Phase2ContractError, TypeError, ValueError, UnicodeError) as exc:
        _err(errors, "store_root_sha256", f"cannot recompute store root: {exc}")
    else:
        if checkpoint.get("store_root_sha256") != actual_root:
            _err(errors, "store_root_sha256", f"must equal deterministic root {actual_root}")
    try:
        signed_sha = store_checkpoint_signing_sha256(checkpoint)
    except (Phase2ContractError, TypeError, ValueError, UnicodeError) as exc:
        _err(errors, "signature.signed_sha256", f"cannot canonicalize signing bytes: {exc}")
    else:
        signature = checkpoint.get("signature")
        if isinstance(signature, Mapping) and signature.get("signed_sha256") != signed_sha:
            _err(errors, "signature.signed_sha256", f"must equal {signed_sha}")
    _instant(checkpoint.get("created_at"), "created_at", errors)
    return errors, rows


def _validate_store_checkpoint_chain(
    checkpoint: Mapping[str, Any],
    errors: list[str],
    *,
    prior_checkpoint: Any,
    trusted_prior_checkpoint_ref: Any,
) -> None:
    mode = checkpoint.get("mode")
    if mode == "genesis":
        if prior_checkpoint is not None:
            _err(errors, "prior_checkpoint", "must be null for genesis")
        if trusted_prior_checkpoint_ref is not None:
            _err(errors, "trusted_prior_checkpoint_ref", "must be null for genesis")
        if checkpoint.get("sequence") != 0:
            _err(errors, "sequence", "genesis sequence must equal 0")
        if checkpoint.get("purge_high_water") != 0:
            _err(errors, "purge_high_water", "genesis purge high-water must equal 0")
        return
    if not isinstance(prior_checkpoint, Mapping):
        _err(errors, "prior_checkpoint_record", "is required for an append checkpoint")
        return
    prior_errors, _ = _validate_store_checkpoint_local(
        prior_checkpoint, require_snapshot=False
    )
    errors.extend(_prefix(prior_errors, "prior_checkpoint_record"))
    try:
        prior_ref = store_checkpoint_reference(prior_checkpoint)
        expected_pointer = checkpoint_pointer(prior_checkpoint)
    except (Phase2ContractError, TypeError, ValueError, KeyError, UnicodeError) as exc:
        _err(errors, "prior_checkpoint_record", f"cannot derive trusted predecessor: {exc}")
        return
    if trusted_prior_checkpoint_ref is None:
        _err(errors, "trusted_prior_checkpoint_ref", "is required for append")
    elif trusted_prior_checkpoint_ref != prior_ref:
        _err(errors, "trusted_prior_checkpoint_ref", "does not equal prior checkpoint record")
    if checkpoint.get("prior_checkpoint") != expected_pointer:
        _err(errors, "prior_checkpoint", "must exactly bind the supplied predecessor record")
    if checkpoint.get("sequence") != prior_checkpoint.get("sequence", -2) + 1:
        _err(errors, "sequence", "must increment prior checkpoint sequence by exactly one")
    if checkpoint.get("checkpoint_id") == prior_checkpoint.get("checkpoint_id"):
        _err(errors, "checkpoint_id", "must differ from prior checkpoint ID")
    current_retired = checkpoint.get("retired_state")
    prior_retired = prior_checkpoint.get("retired_state")
    if isinstance(current_retired, Mapping) and isinstance(prior_retired, Mapping):
        current_event_ids = current_retired.get("event_ids")
        prior_event_ids = prior_retired.get("event_ids")
        if isinstance(current_event_ids, list) and isinstance(prior_event_ids, list):
            missing_event_ids = sorted(set(prior_event_ids) - set(current_event_ids))
            if missing_event_ids:
                _err(
                    errors,
                    "retired_state.event_ids",
                    f"must monotonically preserve prior retired event IDs: {missing_event_ids!r}",
                )
        current_object_keys = current_retired.get("object_keys")
        prior_object_keys = prior_retired.get("object_keys")
        if isinstance(current_object_keys, list) and isinstance(prior_object_keys, list):
            try:
                current_key_bytes = {
                    canonical_json_bytes(value) for value in current_object_keys
                }
                missing_object_keys = [
                    value
                    for value in prior_object_keys
                    if canonical_json_bytes(value) not in current_key_bytes
                ]
            except (TypeError, ValueError, UnicodeError):
                missing_object_keys = []
            if missing_object_keys:
                _err(
                    errors,
                    "retired_state.object_keys",
                    "must monotonically preserve every prior exact retired object identity",
                )
    current_high = checkpoint.get("purge_high_water")
    prior_high = prior_checkpoint.get("purge_high_water")
    if isinstance(current_high, int) and isinstance(prior_high, int) and current_high < prior_high:
        _err(errors, "purge_high_water", "must not decrease")
    current_time = _instant(checkpoint.get("created_at"), "created_at", errors)
    prior_time = _instant(
        prior_checkpoint.get("created_at"), "prior_checkpoint_record.created_at", errors
    )
    if current_time is not None and prior_time is not None and current_time <= prior_time:
        _err(errors, "created_at", "must be later than prior checkpoint created_at")


@_fail_closed
def validate_store_checkpoint(
    checkpoint: Any,
    *,
    snapshot: Any = None,
    prior_checkpoint: Any = None,
    trusted_prior_checkpoint_ref: Any = None,
) -> list[str]:
    """Validate a complete checkpoint snapshot and its trusted predecessor transition."""

    errors, _ = _validate_store_checkpoint_local(
        checkpoint,
        snapshot=snapshot,
        require_snapshot=True,
    )
    if isinstance(checkpoint, Mapping):
        _validate_store_checkpoint_chain(
            checkpoint,
            errors,
            prior_checkpoint=prior_checkpoint,
            trusted_prior_checkpoint_ref=trusted_prior_checkpoint_ref,
        )
    return errors


def _b64url(value: Any, *, expected_length: int, path: str, errors: list[str]) -> bytes | None:
    encoded_length = (expected_length * 8 + 5) // 6
    if (
        not isinstance(value, str)
        or len(value) != encoded_length
        or "=" in value
    ):
        _err(errors, path, "must be canonical unpadded base64url")
        return None
    try:
        decoded = base64.b64decode(
            value + "=" * (-len(value) % 4), altchars=b"-_", validate=True
        )
    except (binascii.Error, ValueError):
        _err(errors, path, "must be canonical unpadded base64url")
        return None
    if base64.urlsafe_b64encode(decoded).rstrip(b"=").decode("ascii") != value:
        _err(errors, path, "must be canonical unpadded base64url")
        return None
    if len(decoded) != expected_length:
        _err(errors, path, f"must decode to exactly {expected_length} bytes")
        return None
    return decoded


def _verify_signature(
    record: Mapping[str, Any],
    *,
    schema_name: str,
    signer_id: Any,
    record_clock: Any,
    signing_bytes: Callable[[Mapping[str, Any]], bytes],
    trust_resolver: Any,
    signature_verifier: Any,
) -> list[str]:
    errors: list[str] = []
    if not callable(trust_resolver):
        _err(errors, "trust_resolver", "a callable trust resolver is required")
    if not callable(signature_verifier):
        _err(errors, "signature_verifier", "a callable cryptographic verifier is required")
    if errors:
        return errors
    signature = record.get("signature")
    if not isinstance(signature, Mapping):
        return ["signature — must be an object"]
    try:
        key = trust_resolver(signature.get("key_id"))
    except Exception:
        return ["trust_resolver — failed closed while resolving signature.key_id"]
    if not isinstance(key, Mapping):
        return ["signature.key_id — trust resolver returned no valid key record"]
    required = {
        "key_id",
        "signer_id",
        "algorithm",
        "public_key",
        "status",
        "valid_from",
        "valid_until",
        "revoked_at",
        "authorized_schemas",
    }
    if set(key) != required:
        return ["trust_key — resolver record is not the closed trust-key shape"]
    if key.get("key_id") != signature.get("key_id"):
        _err(errors, "trust_key.key_id", "must equal signature.key_id")
    if key.get("signer_id") != signer_id:
        _err(errors, "trust_key.signer_id", "is not authorized for the record signer")
    if key.get("algorithm") != signature.get("algorithm"):
        _err(errors, "trust_key.algorithm", "is not authorized for signature.algorithm")
    authorized = key.get("authorized_schemas")
    if (
        not isinstance(authorized, list)
        or not authorized
        or not all(isinstance(value, str) for value in authorized)
        or len(set(authorized)) != len(authorized)
        or not set(authorized).issubset(_TRUSTED_SIGNATURE_SCHEMAS)
    ):
        _err(
            errors,
            "trust_key.authorized_schemas",
            "must be a nonempty unique subset of trusted signature schemas",
        )
    elif schema_name not in authorized:
        _err(errors, "trust_key.authorized_schemas", "does not authorize this record schema")
    if key.get("status") != "active" or key.get("revoked_at") is not None:
        _err(errors, "trust_key.status", "key is revoked or inactive")
    clock = _instant(record_clock, "record_clock", errors)
    valid_from_text = key.get("valid_from")
    if not isinstance(valid_from_text, str) or _RFC3339_RE.fullmatch(valid_from_text) is None:
        _err(errors, "trust_key.valid_from", "must be an RFC 3339 instant")
        valid_from = None
    else:
        valid_from = _instant(valid_from_text, "trust_key.valid_from", errors)
    valid_until = None
    if key.get("valid_until") is not None:
        valid_until_text = key.get("valid_until")
        if not isinstance(valid_until_text, str) or _RFC3339_RE.fullmatch(valid_until_text) is None:
            _err(errors, "trust_key.valid_until", "must be null or an RFC 3339 instant")
        else:
            valid_until = _instant(valid_until_text, "trust_key.valid_until", errors)
    if valid_from is not None and valid_until is not None and valid_until <= valid_from:
        _err(errors, "trust_key.valid_until", "must be later than valid_from")
    if clock is not None and valid_from is not None and clock < valid_from:
        _err(errors, "trust_key.valid_from", "key was not yet valid at record clock")
    if clock is not None and valid_until is not None and clock >= valid_until:
        _err(errors, "trust_key.valid_until", "key was no longer valid at record clock")
    public_key = _b64url(
        key.get("public_key"), expected_length=32, path="trust_key.public_key", errors=errors
    )
    signature_bytes = _b64url(
        signature.get("value"), expected_length=64, path="signature.value", errors=errors
    )
    if errors or public_key is None or signature_bytes is None:
        return errors
    try:
        message = signing_bytes(record)
        verified = signature_verifier(
            signature.get("algorithm"), public_key, message, signature_bytes
        )
    except Exception:
        return ["signature.value — cryptographic verifier failed closed"]
    if verified is not True:
        return ["signature.value — invalid detached signature"]
    return []


@_fail_closed
def verify_store_checkpoint(
    checkpoint: Any,
    *,
    snapshot: Any = None,
    prior_checkpoint: Any = None,
    trusted_prior_checkpoint_ref: Any = None,
    trust_resolver: Any = None,
    signature_verifier: Any = None,
) -> list[str]:
    """Validate and cryptographically authenticate one checkpoint transition."""

    errors = validate_store_checkpoint(
        checkpoint,
        snapshot=snapshot,
        prior_checkpoint=prior_checkpoint,
        trusted_prior_checkpoint_ref=trusted_prior_checkpoint_ref,
    )
    if errors or not isinstance(checkpoint, Mapping):
        return errors
    errors.extend(
        _verify_signature(
            checkpoint,
            schema_name="memory-store-checkpoint/v1",
            signer_id=checkpoint.get("signer_id"),
            record_clock=checkpoint.get("created_at"),
            signing_bytes=store_checkpoint_signing_bytes,
            trust_resolver=trust_resolver,
            signature_verifier=signature_verifier,
        )
    )
    return errors


def purge_target_set_sha256(removed_targets: Mapping[str, Any]) -> str:
    """Digest the canonical exact event/object target pointers in a purge receipt."""

    if not isinstance(removed_targets, Mapping):
        raise Phase2ContractError("removed_targets must be an object")
    events = removed_targets.get("events")
    objects = removed_targets.get("objects")
    if not isinstance(events, list) or not isinstance(objects, list):
        raise Phase2ContractError("removed_targets events/objects must be arrays")
    material = {
        "schema": "memory-purge-target-set/v1",
        "events": copy.deepcopy(events),
        "objects": copy.deepcopy(objects),
    }
    return "sha256:" + _domain_digest(b"memory-purge-target-set/v1", material)


def purge_derivative_closure_sha256(closure: Mapping[str, Any]) -> str:
    """Digest the joint downstream event/object closure, excluding count diagnostics."""

    if not isinstance(closure, Mapping):
        raise Phase2ContractError("removed_transitive_derivatives must be an object")
    events = closure.get("events")
    objects = closure.get("objects")
    if not isinstance(events, list) or not isinstance(objects, list):
        raise Phase2ContractError("derivative events/objects must be arrays")
    material = {
        "schema": "memory-purge-derivative-closure/v1",
        "events": copy.deepcopy(events),
        "objects": copy.deepcopy(objects),
    }
    return "sha256:" + _domain_digest(
        b"memory-purge-derivative-closure/v1", material
    )


def purge_surface_removed_set_sha256(
    surface: str,
    event_pointers: Sequence[Mapping[str, Any]],
    object_pointers: Sequence[Mapping[str, Any]],
) -> str:
    """Bind an erasure-surface attestation to exact affected event/manifest pointers."""

    if surface not in SURFACE_NAMES:
        raise Phase2ContractError(f"unknown erasure surface {surface!r}")
    material = {
        "schema": "memory-purge-surface-set/v1",
        "surface": surface,
        "events": copy.deepcopy(list(event_pointers)),
        "objects": copy.deepcopy(list(object_pointers)),
    }
    return "sha256:" + _domain_digest(b"memory-purge-surface-set/v1", material)


def _event_pointer(record: Mapping[str, Any]) -> dict[str, Any]:
    event_id = record.get("event_id")
    if not isinstance(event_id, str):
        raise Phase2ContractError("resolved event has no event_id")
    return {"event_id": event_id, "event_sha256": canonical_record_sha256(record)}


def _object_pointer(manifest: Mapping[str, Any]) -> dict[str, Any]:
    object_id = manifest.get("object_id")
    content_sha256 = manifest.get("content_sha256")
    if not isinstance(object_id, str) or not isinstance(content_sha256, str):
        raise Phase2ContractError("resolved object manifest lacks exact object hashes")
    return {
        "object_id": object_id,
        "content_sha256": content_sha256,
        "manifest_sha256": canonical_record_sha256(manifest),
    }


def _canonical_pointer_order(
    values: list[Mapping[str, Any]], key_fields: tuple[str, ...]
) -> bool:
    keys = [tuple(value.get(field) for field in key_fields) for value in values]
    return all(all(isinstance(part, str) for part in key) for key in keys) and keys == sorted(keys)


def _validate_purge_receipt_local(receipt: Any) -> list[str]:
    """Validate local purge math without claiming external deletion or closure completeness."""

    errors = _schema_errors(_PURGE_SCHEMA, receipt)
    errors.extend(_canonical_errors(receipt))
    if errors or not isinstance(receipt, Mapping):
        return errors
    targets = receipt.get("removed_targets")
    closure = receipt.get("removed_transitive_derivatives")
    if not isinstance(targets, Mapping) or not isinstance(closure, Mapping):
        return errors
    target_events = targets.get("events")
    target_objects = targets.get("objects")
    derivative_events = closure.get("events")
    derivative_objects = closure.get("objects")
    if not all(
        isinstance(value, list)
        for value in (target_events, target_objects, derivative_events, derivative_objects)
    ):
        return errors
    if not _canonical_pointer_order(target_events, ("event_id", "event_sha256")):
        _err(errors, "removed_targets.events", "must use ascending canonical event_id order")
    if not _canonical_pointer_order(
        target_objects, ("object_id", "content_sha256", "manifest_sha256")
    ):
        _err(errors, "removed_targets.objects", "must use ascending canonical exact-pointer order")
    if not _canonical_pointer_order(derivative_events, ("event_id", "event_sha256")):
        _err(
            errors,
            "removed_transitive_derivatives.events",
            "must use ascending canonical event_id order",
        )
    if not _canonical_pointer_order(
        derivative_objects, ("object_id", "content_sha256", "manifest_sha256")
    ):
        _err(
            errors,
            "removed_transitive_derivatives.objects",
            "must use ascending canonical exact-pointer order",
        )
    for path, pointers in (
        ("removed_targets.objects", target_objects),
        ("removed_transitive_derivatives.objects", derivative_objects),
    ):
        for position, pointer in enumerate(pointers):
            if isinstance(pointer, Mapping):
                _check_object_hash(
                    pointer.get("object_id"),
                    pointer.get("content_sha256"),
                    f"{path}[{position}].object_id",
                    errors,
                )
    if closure.get("event_count") != len(derivative_events):
        _err(
            errors,
            "removed_transitive_derivatives.event_count",
            "must equal the number of derivative event pointers",
        )
    if closure.get("object_count") != len(derivative_objects):
        _err(
            errors,
            "removed_transitive_derivatives.object_count",
            "must equal the number of derivative object pointers",
        )
    target_event_id_list = [pointer.get("event_id") for pointer in target_events]
    derivative_event_id_list = [pointer.get("event_id") for pointer in derivative_events]
    if len(set(target_event_id_list)) != len(target_event_id_list):
        _err(errors, "removed_targets.events", "must not repeat one logical event ID")
    if len(set(derivative_event_id_list)) != len(derivative_event_id_list):
        _err(
            errors,
            "removed_transitive_derivatives.events",
            "must not repeat one logical event ID",
        )
    target_event_ids = set(target_event_id_list)
    derivative_event_ids = set(derivative_event_id_list)
    if target_event_ids & derivative_event_ids:
        _err(errors, "removed_transitive_derivatives.events", "must exclude direct target events")
    target_manifest_id_list = [pointer.get("manifest_sha256") for pointer in target_objects]
    derivative_manifest_id_list = [
        pointer.get("manifest_sha256") for pointer in derivative_objects
    ]
    if len(set(target_manifest_id_list)) != len(target_manifest_id_list):
        _err(errors, "removed_targets.objects", "must not repeat one exact manifest identity")
    if len(set(derivative_manifest_id_list)) != len(derivative_manifest_id_list):
        _err(
            errors,
            "removed_transitive_derivatives.objects",
            "must not repeat one exact manifest identity",
        )
    target_manifest_ids = set(target_manifest_id_list)
    derivative_manifest_ids = set(derivative_manifest_id_list)
    if target_manifest_ids & derivative_manifest_ids:
        _err(errors, "removed_transitive_derivatives.objects", "must exclude direct target manifests")
    try:
        target_digest = purge_target_set_sha256(targets)
        closure_digest = purge_derivative_closure_sha256(closure)
    except (Phase2ContractError, TypeError, ValueError, UnicodeError) as exc:
        _err(errors, "removed_targets", f"cannot recompute purge-set digests: {exc}")
    else:
        if targets.get("set_sha256") != target_digest:
            _err(errors, "removed_targets.set_sha256", f"must equal {target_digest}")
        if closure.get("closure_sha256") != closure_digest:
            _err(
                errors,
                "removed_transitive_derivatives.closure_sha256",
                f"must equal {closure_digest}",
            )
        tombstone = receipt.get("surviving_tombstone")
        if isinstance(tombstone, Mapping) and tombstone.get("target_set_sha256") != target_digest:
            _err(
                errors,
                "surviving_tombstone.target_set_sha256",
                "must equal removed_targets.set_sha256",
            )
    if len(target_events) != 1:
        _err(
            errors,
            "removed_targets.events",
            "v1 requires exactly one direct target event per policy-safe tombstone",
        )

    all_events = list(target_events) + list(derivative_events)
    all_objects = list(target_objects) + list(derivative_objects)
    surfaces = receipt.get("erasure_surfaces")
    completed_at = _instant(receipt.get("completed_at"), "completed_at", errors)
    if isinstance(surfaces, Mapping):
        for surface in SURFACE_NAMES:
            proof = surfaces.get(surface)
            if not isinstance(proof, Mapping):
                continue
            if proof.get("matched_count") != proof.get("removed_count"):
                _err(
                    errors,
                    f"erasure_surfaces.{surface}.removed_count",
                    "must equal matched_count",
                )
            try:
                removed_set = purge_surface_removed_set_sha256(
                    surface, all_events, all_objects
                )
            except (Phase2ContractError, TypeError, ValueError, UnicodeError) as exc:
                _err(errors, f"erasure_surfaces.{surface}", f"cannot bind removed set: {exc}")
            else:
                if proof.get("removed_set_sha256") != removed_set:
                    _err(
                        errors,
                        f"erasure_surfaces.{surface}.removed_set_sha256",
                        "must bind the exact affected event/manifest pointers",
                    )
            verified_at = _instant(
                proof.get("verified_at"), f"erasure_surfaces.{surface}.verified_at", errors
            )
            if completed_at is not None and verified_at is not None and verified_at > completed_at:
                _err(
                    errors,
                    f"erasure_surfaces.{surface}.verified_at",
                    "must not be later than completed_at",
                )
    authority = receipt.get("authority")
    if isinstance(authority, Mapping):
        authorized_at = _instant(authority.get("authorized_at"), "authority.authorized_at", errors)
        if completed_at is not None and authorized_at is not None and authorized_at > completed_at:
            _err(errors, "authority.authorized_at", "must not be later than completed_at")
    sequence = receipt.get("purge_sequence")
    if receipt.get("new_purge_high_water") != sequence:
        _err(errors, "new_purge_high_water", "must equal purge_sequence")
    try:
        signed_sha = purge_receipt_signing_sha256(receipt)
    except (Phase2ContractError, TypeError, ValueError, UnicodeError) as exc:
        _err(errors, "signature.signed_sha256", f"cannot canonicalize signing bytes: {exc}")
    else:
        signature = receipt.get("signature")
        if isinstance(signature, Mapping) and signature.get("signed_sha256") != signed_sha:
            _err(errors, "signature.signed_sha256", f"must equal {signed_sha}")
    return errors


def _resolve_removed(
    resolver: Any,
    kind: str,
    pointer: Mapping[str, Any],
    path: str,
    errors: list[str],
) -> Mapping[str, Any] | None:
    try:
        resolved = resolver(kind, copy.deepcopy(dict(pointer)))
    except Exception:
        _err(errors, path, "target resolver failed closed")
        return None
    if not isinstance(resolved, RemovedRecord):
        _err(errors, path, "target resolver must return RemovedRecord")
        return None
    if resolved.removed is not True:
        _err(errors, path, "resolver did not attest post-purge absence")
    if not isinstance(resolved.record, Mapping):
        _err(errors, path, "resolver pre-purge record must be an object")
        return None
    record = resolved.record
    if kind == "event":
        record_errors = validate_event(record)
        try:
            actual_pointer = _event_pointer(record)
        except (Phase2ContractError, TypeError, ValueError, UnicodeError) as exc:
            _err(errors, path, f"cannot derive event pointer: {exc}")
            return None
    else:
        record_errors = validate_object_manifest(record)
        try:
            actual_pointer = _object_pointer(record)
        except (Phase2ContractError, TypeError, ValueError, UnicodeError) as exc:
            _err(errors, path, f"cannot derive object pointer: {exc}")
            return None
    errors.extend(_prefix(record_errors, path))
    if actual_pointer != pointer:
        _err(errors, path, "resolved pre-purge record does not equal the exact signed pointer")
    return record


def _contains_canonical(rows: Sequence[Mapping[str, Any]], record: Mapping[str, Any]) -> bool:
    target = canonical_json_bytes(record)
    return any(canonical_json_bytes(row) == target for row in rows)


def _validate_purge_resolvers(
    receipt: Mapping[str, Any],
    errors: list[str],
    *,
    target_resolver: Any,
    derivative_closure_resolver: Any,
    surface_resolver: Any,
    tombstone_resolver: Any,
) -> tuple[list[Mapping[str, Any]], list[Mapping[str, Any]], Mapping[str, Any] | None]:
    for name, resolver in (
        ("target_resolver", target_resolver),
        ("derivative_closure_resolver", derivative_closure_resolver),
        ("surface_resolver", surface_resolver),
        ("tombstone_resolver", tombstone_resolver),
    ):
        if not callable(resolver):
            _err(errors, name, "a callable trusted resolver is required")
    if errors:
        return [], [], None
    targets = receipt["removed_targets"]
    closure_record = receipt["removed_transitive_derivatives"]
    target_events = targets["events"]
    target_objects = targets["objects"]
    resolved_events: list[Mapping[str, Any]] = []
    resolved_objects: list[Mapping[str, Any]] = []
    for position, pointer in enumerate(target_events):
        record = _resolve_removed(
            target_resolver,
            "event",
            pointer,
            f"removed_targets.events[{position}]",
            errors,
        )
        if record is not None:
            resolved_events.append(record)
    for position, pointer in enumerate(target_objects):
        record = _resolve_removed(
            target_resolver,
            "object",
            pointer,
            f"removed_targets.objects[{position}]",
            errors,
        )
        if record is not None:
            resolved_objects.append(record)

    try:
        closure = derivative_closure_resolver(
            tuple(copy.deepcopy(target_events)),
            tuple(copy.deepcopy(target_objects)),
        )
    except Exception:
        _err(errors, "derivative_closure_resolver", "failed closed")
        closure = None
    if not isinstance(closure, DerivativeClosure):
        _err(
            errors,
            "derivative_closure_resolver",
            "must return a DerivativeClosure attestation",
        )
    elif closure.complete is not True:
        _err(
            errors,
            "derivative_closure_resolver.complete",
            "must be the singleton true; partial closure cannot prove purge",
        )
    else:
        derived_event_pointers: list[dict[str, Any]] = []
        derived_object_pointers: list[dict[str, Any]] = []
        for position, resolved in enumerate(closure.events):
            path = f"derivative_closure.events[{position}]"
            if not isinstance(resolved, RemovedRecord) or resolved.removed is not True:
                _err(errors, path, "must be a RemovedRecord with removed=true")
                continue
            if not isinstance(resolved.record, Mapping):
                _err(errors, path, "record must be an object")
                continue
            errors.extend(_prefix(validate_event(resolved.record), path))
            derived_event_pointers.append(_event_pointer(resolved.record))
            resolved_events.append(resolved.record)
        for position, resolved in enumerate(closure.objects):
            path = f"derivative_closure.objects[{position}]"
            if not isinstance(resolved, RemovedRecord) or resolved.removed is not True:
                _err(errors, path, "must be a RemovedRecord with removed=true")
                continue
            if not isinstance(resolved.record, Mapping):
                _err(errors, path, "record must be an object")
                continue
            errors.extend(_prefix(validate_object_manifest(resolved.record), path))
            derived_object_pointers.append(_object_pointer(resolved.record))
            resolved_objects.append(resolved.record)
        derived_event_pointers.sort(key=lambda pointer: pointer["event_id"])
        derived_object_pointers.sort(
            key=lambda pointer: (
                pointer["object_id"],
                pointer["content_sha256"],
                pointer["manifest_sha256"],
            )
        )
        if derived_event_pointers != closure_record["events"]:
            _err(
                errors,
                "removed_transitive_derivatives.events",
                "must exactly equal the resolver-attested complete event closure",
            )
        if derived_object_pointers != closure_record["objects"]:
            _err(
                errors,
                "removed_transitive_derivatives.objects",
                "must exactly equal the resolver-attested complete object closure",
            )

    all_event_pointers = list(target_events) + list(closure_record["events"])
    all_object_pointers = list(target_objects) + list(closure_record["objects"])
    for surface in SURFACE_NAMES:
        try:
            proof = surface_resolver(
                surface,
                tuple(copy.deepcopy(all_event_pointers)),
                tuple(copy.deepcopy(all_object_pointers)),
            )
        except Exception:
            _err(errors, f"surface_resolver.{surface}", "failed closed")
            continue
        if not isinstance(proof, Mapping) or dict(proof) != receipt["erasure_surfaces"][surface]:
            _err(
                errors,
                f"erasure_surfaces.{surface}",
                "must exactly equal trusted surface resolver proof",
            )

    tombstone_pointer = receipt["surviving_tombstone"]
    try:
        tombstone_event = tombstone_resolver(tombstone_pointer["tombstone_event_id"])
    except Exception:
        _err(errors, "tombstone_resolver", "failed closed")
        tombstone_event = None
    if not isinstance(tombstone_event, Mapping):
        _err(errors, "surviving_tombstone", "resolver returned no tombstone event")
        return resolved_events, resolved_objects, None
    errors.extend(_prefix(validate_event(tombstone_event), "surviving_tombstone.event"))
    if tombstone_event.get("event_id") != tombstone_pointer.get("tombstone_event_id"):
        _err(errors, "surviving_tombstone.tombstone_event_id", "does not match resolved event")
    if canonical_record_sha256(tombstone_event) != tombstone_pointer.get("tombstone_event_sha256"):
        _err(errors, "surviving_tombstone.tombstone_event_sha256", "does not match resolved event")
    payload = tombstone_event.get("payload")
    if not isinstance(payload, Mapping):
        _err(errors, "surviving_tombstone.event.payload", "must be an object")
    else:
        if canonical_record_sha256(payload) != tombstone_pointer.get("tombstone_payload_sha256"):
            _err(errors, "surviving_tombstone.tombstone_payload_sha256", "does not match payload")
        if payload.get("reason_code") != tombstone_pointer.get("reason_code"):
            _err(errors, "surviving_tombstone.reason_code", "does not match tombstone payload")
        if payload.get("target_event_id") != target_events[0].get("event_id"):
            _err(errors, "surviving_tombstone.event.payload.target_event_id", "must equal direct target")
    policy = tombstone_event.get("policy")
    if not isinstance(policy, Mapping) or policy.get("classification") != "internal" or policy.get(
        "retention"
    ) != "tombstone-only" or policy.get("retain_until") is not None:
        _err(
            errors,
            "surviving_tombstone.event.policy",
            "must be internal tombstone-only non-content state",
        )
    elif (
        tombstone_pointer.get("classification") != policy.get("classification")
        or tombstone_pointer.get("retention") != policy.get("retention")
    ):
        _err(
            errors,
            "surviving_tombstone",
            "classification and retention must exactly match the resolved tombstone policy",
        )
    completed_at = _instant(receipt.get("completed_at"), "completed_at", errors)
    tombstone_at = _instant(tombstone_event.get("system_time"), "surviving_tombstone.event.system_time", errors)
    authority = receipt.get("authority")
    authorized_at = (
        _instant(authority.get("authorized_at"), "authority.authorized_at", errors)
        if isinstance(authority, Mapping)
        else None
    )
    if authorized_at is not None and tombstone_at is not None and tombstone_at < authorized_at:
        _err(
            errors,
            "surviving_tombstone.event.system_time",
            "must not precede purge authorization",
        )
    if completed_at is not None and tombstone_at is not None and tombstone_at > completed_at:
        _err(errors, "surviving_tombstone.event.system_time", "must not be later than completed_at")
    return resolved_events, resolved_objects, tombstone_event


def _validate_purge_chain(
    receipt: Mapping[str, Any],
    errors: list[str],
    *,
    prior_purge_receipt: Any,
) -> None:
    if receipt.get("mode") == "genesis":
        if prior_purge_receipt is not None:
            _err(errors, "prior_purge_receipt", "must be null for genesis")
        return
    if not isinstance(prior_purge_receipt, Mapping):
        _err(errors, "prior_purge_receipt", "is required for append")
        return
    prior_errors = _validate_purge_receipt_local(prior_purge_receipt)
    errors.extend(_prefix(prior_errors, "prior_purge_receipt"))
    try:
        prior_hash = purge_receipt_record_sha256(prior_purge_receipt)
    except (Phase2ContractError, TypeError, ValueError, UnicodeError) as exc:
        _err(errors, "prior_purge_receipt", f"cannot hash prior receipt: {exc}")
        return
    if receipt.get("prior_purge_receipt_sha256") != prior_hash:
        _err(errors, "prior_purge_receipt_sha256", "must exactly bind prior purge receipt")
    if receipt.get("purge_sequence") != prior_purge_receipt.get("purge_sequence", -2) + 1:
        _err(errors, "purge_sequence", "must increment prior purge sequence by exactly one")
    if receipt.get("prior_purge_high_water") != prior_purge_receipt.get(
        "new_purge_high_water"
    ):
        _err(errors, "prior_purge_high_water", "must equal prior receipt high-water")
    current_time = _instant(receipt.get("completed_at"), "completed_at", errors)
    prior_time = _instant(
        prior_purge_receipt.get("completed_at"), "prior_purge_receipt.completed_at", errors
    )
    if current_time is not None and prior_time is not None and current_time <= prior_time:
        _err(errors, "completed_at", "must be later than prior purge receipt")


def _validate_purge_checkpoints(
    receipt: Mapping[str, Any],
    errors: list[str],
    *,
    prior_checkpoint: Any,
    prior_snapshot: Any,
    new_checkpoint: Any,
    new_snapshot: Any,
    trusted_prior_checkpoint_ref: Any,
) -> tuple[dict[str, list[Mapping[str, Any]]] | None, dict[str, list[Mapping[str, Any]]] | None]:
    prior_errors, prior_rows = _validate_store_checkpoint_local(
        prior_checkpoint,
        snapshot=prior_snapshot,
        require_snapshot=True,
    )
    errors.extend(_prefix(prior_errors, "prior_checkpoint_record"))
    pending = frozenset({canonical_record_sha256(receipt)})
    new_errors, new_rows = _validate_store_checkpoint_local(
        new_checkpoint,
        snapshot=new_snapshot,
        require_snapshot=True,
        pending_receipt_sha256=pending,
    )
    errors.extend(_prefix(new_errors, "new_checkpoint_record"))
    if not isinstance(prior_checkpoint, Mapping) or not isinstance(new_checkpoint, Mapping):
        return prior_rows, new_rows
    try:
        prior_ref = store_checkpoint_reference(prior_checkpoint)
        prior_pointer = checkpoint_pointer(prior_checkpoint)
    except (Phase2ContractError, TypeError, ValueError, KeyError, UnicodeError) as exc:
        _err(errors, "prior_checkpoint_record", f"cannot derive pointer: {exc}")
        return prior_rows, new_rows
    if trusted_prior_checkpoint_ref != prior_ref:
        _err(errors, "trusted_prior_checkpoint_ref", "must equal the supplied prior checkpoint")
    if receipt.get("prior_checkpoint") != prior_pointer:
        _err(errors, "prior_checkpoint", "must exactly bind the trusted prior checkpoint")
    if receipt.get("prior_purge_high_water") != prior_checkpoint.get("purge_high_water"):
        _err(errors, "prior_purge_high_water", "must equal prior checkpoint purge high-water")
    forward = receipt.get("new_checkpoint")
    expected_forward = {
        "checkpoint_id": new_checkpoint.get("checkpoint_id"),
        "sequence": new_checkpoint.get("sequence"),
        "purge_high_water": new_checkpoint.get("purge_high_water"),
    }
    if forward != expected_forward:
        _err(errors, "new_checkpoint", "must exactly bind the finalized forward checkpoint identity")
    _validate_store_checkpoint_chain(
        new_checkpoint,
        errors,
        prior_checkpoint=prior_checkpoint,
        trusted_prior_checkpoint_ref=prior_ref,
    )
    if new_checkpoint.get("purge_high_water") != receipt.get("new_purge_high_water"):
        _err(errors, "new_checkpoint.purge_high_water", "must equal receipt new high-water")
    completed_at = _instant(receipt.get("completed_at"), "completed_at", errors)
    prior_time = _instant(prior_checkpoint.get("created_at"), "prior_checkpoint_record.created_at", errors)
    new_time = _instant(new_checkpoint.get("created_at"), "new_checkpoint_record.created_at", errors)
    if completed_at is not None and prior_time is not None and completed_at <= prior_time:
        _err(errors, "completed_at", "must be later than prior checkpoint")
    if completed_at is not None and new_time is not None and new_time < completed_at:
        _err(errors, "new_checkpoint_record.created_at", "must not precede purge completion")
    return prior_rows, new_rows


def _validate_purge_snapshot_transition(
    receipt: Mapping[str, Any],
    errors: list[str],
    *,
    prior_rows: dict[str, list[Mapping[str, Any]]] | None,
    new_rows: dict[str, list[Mapping[str, Any]]] | None,
    resolved_events: Sequence[Mapping[str, Any]],
    resolved_objects: Sequence[Mapping[str, Any]],
    tombstone_event: Mapping[str, Any] | None,
    prior_snapshot: Any,
    new_snapshot: Any,
) -> None:
    if prior_rows is None or new_rows is None:
        return
    for record in resolved_events:
        if not _contains_canonical(prior_rows["events"], record):
            _err(errors, "prior_checkpoint_record.events", "does not contain a purged event preimage")
        if _contains_canonical(new_rows["events"], record):
            _err(errors, "new_checkpoint_record.events", "still contains a purged event")
    for manifest in resolved_objects:
        if not _contains_canonical(prior_rows["manifests"], manifest):
            _err(errors, "prior_checkpoint_record.manifests", "does not contain a purged manifest preimage")
        if _contains_canonical(new_rows["manifests"], manifest):
            _err(errors, "new_checkpoint_record.manifests", "still contains a purged manifest")
    if tombstone_event is not None and not _contains_canonical(new_rows["tombstones"], tombstone_event):
        _err(errors, "new_checkpoint_record.tombstones", "does not contain the surviving tombstone")
    if not _contains_canonical(new_rows["receipts"], receipt):
        _err(errors, "new_checkpoint_record.receipts", "does not commit this purge receipt")
    for collection in ("receipts", "tombstones"):
        new_record_bytes = {canonical_json_bytes(record) for record in new_rows[collection]}
        if any(
            canonical_json_bytes(record) not in new_record_bytes
            for record in prior_rows[collection]
        ):
            _err(
                errors,
                f"new_checkpoint_record.{collection}",
                f"must preserve every prior append-only {collection} record",
            )
    if isinstance(prior_snapshot, CheckpointSnapshot) and isinstance(
        new_snapshot, CheckpointSnapshot
    ):
        if not set(prior_snapshot.retired_event_ids).issubset(
            set(new_snapshot.retired_event_ids)
        ):
            _err(
                errors,
                "new_snapshot.retired_event_ids",
                "must monotonically preserve prior retired event identities",
            )
        if not set(prior_snapshot.retired_object_keys).issubset(
            set(new_snapshot.retired_object_keys)
        ):
            _err(
                errors,
                "new_snapshot.retired_object_keys",
                "must monotonically preserve prior exact retired object identities",
            )
    if isinstance(new_snapshot, CheckpointSnapshot):
        event_ids = {record.get("event_id") for record in resolved_events}
        object_keys = {
            RetiredObjectKey(
                object_id=str(record.get("object_id")),
                content_sha256=str(record.get("content_sha256")),
                manifest_sha256=canonical_record_sha256(record),
                acquisition_id=str(record.get("acquisition_id")),
                source_version_id=str(record.get("source_version_id")),
            )
            for record in resolved_objects
        }
        if not event_ids.issubset(set(new_snapshot.retired_event_ids)):
            _err(errors, "new_snapshot.retired_event_ids", "must attest every purged event")
        if not object_keys.issubset(set(new_snapshot.retired_object_keys)):
            _err(
                errors,
                "new_snapshot.retired_object_keys",
                "must attest every exact purged manifest identity",
            )


@_fail_closed
def validate_purge_receipt(
    receipt: Any,
    *,
    prior_purge_receipt: Any = None,
    prior_checkpoint: Any = None,
    prior_snapshot: Any = None,
    new_checkpoint: Any = None,
    new_snapshot: Any = None,
    trusted_prior_checkpoint_ref: Any = None,
    target_resolver: Any = None,
    derivative_closure_resolver: Any = None,
    surface_resolver: Any = None,
    tombstone_resolver: Any = None,
) -> list[str]:
    """Validate a purge only through complete trusted resolver and checkpoint boundaries."""

    errors = _validate_purge_receipt_local(receipt)
    if errors or not isinstance(receipt, Mapping):
        return errors
    _validate_purge_chain(receipt, errors, prior_purge_receipt=prior_purge_receipt)
    resolved_events, resolved_objects, tombstone_event = _validate_purge_resolvers(
        receipt,
        errors,
        target_resolver=target_resolver,
        derivative_closure_resolver=derivative_closure_resolver,
        surface_resolver=surface_resolver,
        tombstone_resolver=tombstone_resolver,
    )
    prior_rows, new_rows = _validate_purge_checkpoints(
        receipt,
        errors,
        prior_checkpoint=prior_checkpoint,
        prior_snapshot=prior_snapshot,
        new_checkpoint=new_checkpoint,
        new_snapshot=new_snapshot,
        trusted_prior_checkpoint_ref=trusted_prior_checkpoint_ref,
    )
    _validate_purge_snapshot_transition(
        receipt,
        errors,
        prior_rows=prior_rows,
        new_rows=new_rows,
        resolved_events=resolved_events,
        resolved_objects=resolved_objects,
        tombstone_event=tombstone_event,
        prior_snapshot=prior_snapshot,
        new_snapshot=new_snapshot,
    )
    if isinstance(tombstone_event, Mapping) and isinstance(prior_checkpoint, Mapping):
        tombstone_time = _instant(
            tombstone_event.get("system_time"),
            "surviving_tombstone.event.system_time",
            errors,
        )
        prior_checkpoint_time = _instant(
            prior_checkpoint.get("created_at"),
            "prior_checkpoint_record.created_at",
            errors,
        )
        if (
            tombstone_time is not None
            and prior_checkpoint_time is not None
            and tombstone_time <= prior_checkpoint_time
        ):
            _err(
                errors,
                "surviving_tombstone.event.system_time",
                "must be later than the trusted prior checkpoint",
            )
    return errors


@_fail_closed
def verify_purge_receipt(
    receipt: Any,
    *,
    prior_purge_receipt: Any = None,
    prior_checkpoint: Any = None,
    prior_snapshot: Any = None,
    new_checkpoint: Any = None,
    new_snapshot: Any = None,
    trusted_prior_checkpoint_ref: Any = None,
    target_resolver: Any = None,
    derivative_closure_resolver: Any = None,
    surface_resolver: Any = None,
    tombstone_resolver: Any = None,
    trust_resolver: Any = None,
    signature_verifier: Any = None,
) -> list[str]:
    """Validate a purge transition and authenticate receipt/checkpoint signatures."""

    errors = validate_purge_receipt(
        receipt,
        prior_purge_receipt=prior_purge_receipt,
        prior_checkpoint=prior_checkpoint,
        prior_snapshot=prior_snapshot,
        new_checkpoint=new_checkpoint,
        new_snapshot=new_snapshot,
        trusted_prior_checkpoint_ref=trusted_prior_checkpoint_ref,
        target_resolver=target_resolver,
        derivative_closure_resolver=derivative_closure_resolver,
        surface_resolver=surface_resolver,
        tombstone_resolver=tombstone_resolver,
    )
    if errors or not isinstance(receipt, Mapping):
        return errors
    authority = receipt.get("authority")
    signer_id = authority.get("authorizer_id") if isinstance(authority, Mapping) else None
    errors.extend(
        _verify_signature(
            receipt,
            schema_name="memory-purge-receipt/v1",
            signer_id=signer_id,
            record_clock=receipt.get("completed_at"),
            signing_bytes=purge_receipt_signing_bytes,
            trust_resolver=trust_resolver,
            signature_verifier=signature_verifier,
        )
    )
    for path, checkpoint in (
        ("prior_checkpoint_record", prior_checkpoint),
        ("new_checkpoint_record", new_checkpoint),
    ):
        if isinstance(checkpoint, Mapping):
            errors.extend(
                _prefix(
                    _verify_signature(
                        checkpoint,
                        schema_name="memory-store-checkpoint/v1",
                        signer_id=checkpoint.get("signer_id"),
                        record_clock=checkpoint.get("created_at"),
                        signing_bytes=store_checkpoint_signing_bytes,
                        trust_resolver=trust_resolver,
                        signature_verifier=signature_verifier,
                    ),
                    path,
                )
            )
    if isinstance(prior_purge_receipt, Mapping):
        prior_authority = prior_purge_receipt.get("authority")
        prior_signer = (
            prior_authority.get("authorizer_id")
            if isinstance(prior_authority, Mapping)
            else None
        )
        errors.extend(
            _prefix(
                _verify_signature(
                    prior_purge_receipt,
                    schema_name="memory-purge-receipt/v1",
                    signer_id=prior_signer,
                    record_clock=prior_purge_receipt.get("completed_at"),
                    signing_bytes=purge_receipt_signing_bytes,
                    trust_resolver=trust_resolver,
                    signature_verifier=signature_verifier,
                ),
                "prior_purge_receipt",
            )
        )
    return errors


def _signed_value(
    record: Mapping[str, Any],
    *,
    algorithm: str,
    key_id: str,
    signing_bytes: Callable[[Mapping[str, Any]], bytes],
    signer: Any,
) -> str:
    """Call an injected key handle; private key bytes never enter this module or a record."""

    if not callable(signer):
        raise Phase2ContractError("signer must be a callable external key handle")
    try:
        signature_bytes = signer(algorithm, key_id, signing_bytes(record))
    except Exception as exc:
        raise Phase2ContractError("external signer failed closed") from exc
    if type(signature_bytes) is not bytes or len(signature_bytes) != 64:
        raise Phase2ContractError("external signer must return exactly 64 signature bytes")
    return base64.urlsafe_b64encode(signature_bytes).rstrip(b"=").decode("ascii")


def _raise_builder_errors(kind: str, errors: Sequence[str]) -> None:
    if errors:
        raise Phase2ContractError(f"constructed {kind} failed validation: " + "; ".join(errors))


def _snapshot_purge_high_water(snapshot: CheckpointSnapshot) -> int:
    if not isinstance(snapshot, CheckpointSnapshot) or snapshot.complete is not True:
        raise Phase2ContractError("a trusted complete CheckpointSnapshot is required")
    collections = snapshot.collections
    if not isinstance(collections, Mapping) or "receipts" not in collections:
        raise Phase2ContractError("checkpoint snapshot has no complete receipt collection")
    try:
        receipts = list(collections["receipts"])
    except TypeError as exc:
        raise Phase2ContractError("checkpoint receipt collection is not iterable") from exc
    sequences = [
        receipt.get("purge_sequence")
        for receipt in receipts
        if isinstance(receipt, Mapping)
        and receipt.get("schema") == "memory-purge-receipt/v1"
    ]
    if any(not isinstance(value, int) or isinstance(value, bool) for value in sequences):
        raise Phase2ContractError("checkpoint snapshot contains an invalid purge sequence")
    return max(sequences, default=0)


def build_store_checkpoint(
    *,
    checkpoint_id: str,
    created_at: str,
    snapshot: CheckpointSnapshot,
    signer_id: str,
    key_id: str,
    signer: Any,
    trust_resolver: Any,
    signature_verifier: Any,
    prior_checkpoint: Mapping[str, Any] | None = None,
    trusted_prior_checkpoint_ref: str | None = None,
    algorithm: str = "ed25519",
) -> dict[str, Any]:
    """Build, externally sign, and immediately authenticate a deterministic checkpoint.

    ``signer`` receives ``(algorithm, key_id, signing_bytes)`` and returns 64 signature bytes.
    For append mode, ``trusted_prior_checkpoint_ref`` is mandatory and must independently anchor
    the supplied prior record; the builder never promotes a caller-supplied record to trusted head.
    """

    mode = "genesis" if prior_checkpoint is None else "append"
    if mode == "genesis":
        if trusted_prior_checkpoint_ref is not None:
            raise Phase2ContractError("genesis checkpoint cannot have a trusted prior head")
        sequence = 0
        prior_pointer = None
    else:
        if not isinstance(prior_checkpoint, Mapping):
            raise Phase2ContractError("append checkpoint requires a prior checkpoint record")
        actual_prior_ref = store_checkpoint_reference(prior_checkpoint)
        if trusted_prior_checkpoint_ref != actual_prior_ref:
            raise Phase2ContractError("conflicting or missing trusted prior checkpoint head")
        prior_sequence = prior_checkpoint.get("sequence")
        if not isinstance(prior_sequence, int) or isinstance(prior_sequence, bool):
            raise Phase2ContractError("prior checkpoint sequence is invalid")
        sequence = prior_sequence + 1
        prior_pointer = checkpoint_pointer(prior_checkpoint)
    try:
        commitments = canonical_store_commitments(snapshot.collections)
        retired_state = canonical_retired_state(snapshot)
        purge_high_water = _snapshot_purge_high_water(snapshot)
    except (TypeError, ValueError, UnicodeError, KeyError) as exc:
        if isinstance(exc, Phase2ContractError):
            raise
        raise Phase2ContractError("cannot construct checkpoint commitments") from exc
    placeholder_value = base64.urlsafe_b64encode(bytes(64)).rstrip(b"=").decode("ascii")
    checkpoint: dict[str, Any] = {
        "schema": "memory-store-checkpoint/v1",
        "checkpoint_id": checkpoint_id,
        "mode": mode,
        "sequence": sequence,
        "purge_high_water": purge_high_water,
        "created_at": created_at,
        "prior_checkpoint": prior_pointer,
        "canonicalization": {
            "json": "memory-canonical-json/v1",
            "record_order": "lexicographic-record-id",
            "set_digest": "sha256-canonical-array/v1",
        },
        "commitments": commitments,
        "retired_state": retired_state,
        "store_root_sha256": "sha256:" + "0" * 64,
        "signer_id": signer_id,
        "signature": {
            "algorithm": algorithm,
            "key_id": key_id,
            "signed_sha256": "sha256:" + "0" * 64,
            "value": placeholder_value,
        },
    }
    checkpoint["store_root_sha256"] = store_root_sha256(checkpoint)
    checkpoint["signature"]["signed_sha256"] = store_checkpoint_signing_sha256(checkpoint)
    _raise_builder_errors(
        "unsigned store checkpoint",
        validate_store_checkpoint(
            checkpoint,
            snapshot=snapshot,
            prior_checkpoint=prior_checkpoint,
            trusted_prior_checkpoint_ref=trusted_prior_checkpoint_ref,
        ),
    )
    checkpoint["signature"]["value"] = _signed_value(
        checkpoint,
        algorithm=algorithm,
        key_id=key_id,
        signing_bytes=store_checkpoint_signing_bytes,
        signer=signer,
    )
    _raise_builder_errors(
        "store checkpoint",
        verify_store_checkpoint(
            checkpoint,
            snapshot=snapshot,
            prior_checkpoint=prior_checkpoint,
            trusted_prior_checkpoint_ref=trusted_prior_checkpoint_ref,
            trust_resolver=trust_resolver,
            signature_verifier=signature_verifier,
        ),
    )
    return checkpoint


def _fill_derived_field(
    obj: dict[str, Any], field: str, expected: Any, path: str
) -> None:
    if field in obj and obj[field] != expected:
        raise Phase2ContractError(f"{path}.{field} conflicts with deterministic value")
    obj[field] = expected


def seal_purge_receipt(
    receipt_fields: Mapping[str, Any],
    *,
    key_id: str,
    signer: Any,
    trust_resolver: Any,
    signature_verifier: Any,
    prior_purge_receipt: Mapping[str, Any] | None = None,
    algorithm: str = "ed25519",
) -> dict[str, Any]:
    """Fill purge set/count/signing derivations and authenticate the signed local record.

    This sealer deliberately performs only local math, purge-chain, and signature verification.
    It does **not** claim that deletion or transitive closure is complete; use
    :func:`build_purge_transition` to construct and verify the complete state transition.
    """

    if not isinstance(receipt_fields, Mapping):
        raise Phase2ContractError("purge receipt fields must be an object")
    receipt = copy.deepcopy(dict(receipt_fields))
    targets = receipt.get("removed_targets")
    closure = receipt.get("removed_transitive_derivatives")
    surfaces = receipt.get("erasure_surfaces")
    tombstone = receipt.get("surviving_tombstone")
    if not all(isinstance(value, dict) for value in (targets, closure, surfaces, tombstone)):
        raise Phase2ContractError("purge receipt derived sections must be mutable objects")
    target_events = targets.get("events")
    target_objects = targets.get("objects")
    derived_events = closure.get("events")
    derived_objects = closure.get("objects")
    if not all(
        isinstance(value, list)
        for value in (target_events, target_objects, derived_events, derived_objects)
    ):
        raise Phase2ContractError("purge target and closure pointers must be arrays")
    target_digest = purge_target_set_sha256(targets)
    closure_digest = purge_derivative_closure_sha256(closure)
    _fill_derived_field(targets, "set_sha256", target_digest, "removed_targets")
    _fill_derived_field(
        closure,
        "event_count",
        len(derived_events),
        "removed_transitive_derivatives",
    )
    _fill_derived_field(
        closure,
        "object_count",
        len(derived_objects),
        "removed_transitive_derivatives",
    )
    _fill_derived_field(
        closure,
        "closure_sha256",
        closure_digest,
        "removed_transitive_derivatives",
    )
    _fill_derived_field(
        tombstone, "target_set_sha256", target_digest, "surviving_tombstone"
    )
    sequence = receipt.get("purge_sequence")
    _fill_derived_field(receipt, "new_purge_high_water", sequence, "(root)")
    all_events = list(target_events) + list(derived_events)
    all_objects = list(target_objects) + list(derived_objects)
    for surface in SURFACE_NAMES:
        proof = surfaces.get(surface)
        if not isinstance(proof, dict):
            raise Phase2ContractError(f"erasure_surfaces.{surface} must be an object")
        matched_count = proof.get("matched_count")
        removed_count = proof.get("removed_count")
        residual_count = proof.get("residual_count")
        if (
            not isinstance(matched_count, int)
            or isinstance(matched_count, bool)
            or matched_count < 0
            or not isinstance(removed_count, int)
            or isinstance(removed_count, bool)
            or removed_count < 0
            or matched_count != removed_count
            or residual_count != 0
        ):
            raise Phase2ContractError(
                f"erasure_surfaces.{surface} must attest nonnegative equal physical "
                "matched/removed counts and zero residue"
            )
        _fill_derived_field(
            proof,
            "removed_set_sha256",
            purge_surface_removed_set_sha256(surface, all_events, all_objects),
            f"erasure_surfaces.{surface}",
        )
    receipt["signature"] = {
        "algorithm": algorithm,
        "key_id": key_id,
        "signed_sha256": "sha256:" + "0" * 64,
        "value": base64.urlsafe_b64encode(bytes(64)).rstrip(b"=").decode("ascii"),
    }
    receipt["signature"]["signed_sha256"] = purge_receipt_signing_sha256(receipt)
    errors = _validate_purge_receipt_local(receipt)
    if not errors:
        _validate_purge_chain(
            receipt, errors, prior_purge_receipt=prior_purge_receipt
        )
    _raise_builder_errors("unsigned purge receipt", errors)
    receipt["signature"]["value"] = _signed_value(
        receipt,
        algorithm=algorithm,
        key_id=key_id,
        signing_bytes=purge_receipt_signing_bytes,
        signer=signer,
    )
    authority = receipt.get("authority")
    signer_id = (
        authority.get("authorizer_id") if isinstance(authority, Mapping) else None
    )
    errors = _verify_signature(
        receipt,
        schema_name="memory-purge-receipt/v1",
        signer_id=signer_id,
        record_clock=receipt.get("completed_at"),
        signing_bytes=purge_receipt_signing_bytes,
        trust_resolver=trust_resolver,
        signature_verifier=signature_verifier,
    )
    _raise_builder_errors("purge receipt", errors)
    return receipt


def _exact_retired_key(manifest: Mapping[str, Any]) -> RetiredObjectKey:
    return RetiredObjectKey(
        object_id=str(manifest.get("object_id")),
        content_sha256=str(manifest.get("content_sha256")),
        manifest_sha256=canonical_record_sha256(manifest),
        acquisition_id=str(manifest.get("acquisition_id")),
        source_version_id=str(manifest.get("source_version_id")),
    )


def build_purge_transition(
    *,
    purge_receipt_id: str,
    completed_at: str,
    target_events: Sequence[Mapping[str, Any]],
    target_objects: Sequence[Mapping[str, Any]],
    tombstone_event: Mapping[str, Any],
    authority: Mapping[str, Any],
    prior_checkpoint: Mapping[str, Any],
    prior_snapshot: CheckpointSnapshot,
    trusted_prior_checkpoint_ref: str,
    new_checkpoint_id: str,
    new_checkpoint_created_at: str,
    checkpoint_signer_id: str,
    checkpoint_key_id: str,
    checkpoint_signer: Any,
    purge_key_id: str,
    purge_signer: Any,
    trust_resolver: Any,
    signature_verifier: Any,
    target_resolver: Any,
    derivative_closure_resolver: Any,
    surface_resolver: Any,
    tombstone_resolver: Any,
    prior_purge_receipt: Mapping[str, Any] | None = None,
    algorithm: str = "ed25519",
) -> PurgeTransition:
    """Atomically build and verify a purge receipt plus its receipt-committing checkpoint.

    The atomic API is required by the deliberate acyclic contract: a receipt commits the next
    checkpoint identity/sequence/high-water, while that finalized checkpoint commits the complete
    signed receipt bytes.  A standalone receipt builder could not immediately prove both bindings.
    """

    prior_errors, prior_rows = _validate_store_checkpoint_local(
        prior_checkpoint,
        snapshot=prior_snapshot,
        require_snapshot=True,
    )
    _raise_builder_errors("trusted prior checkpoint", prior_errors)
    actual_prior_ref = store_checkpoint_reference(prior_checkpoint)
    if trusted_prior_checkpoint_ref != actual_prior_ref:
        raise Phase2ContractError("conflicting trusted prior checkpoint head")
    if prior_rows is None:
        raise Phase2ContractError("trusted prior snapshot did not resolve complete rows")
    if isinstance(target_events, (str, bytes, bytearray, Mapping)) or len(target_events) != 1:
        raise Phase2ContractError("purge transition requires exactly one target event record")
    if isinstance(target_objects, (str, bytes, bytearray, Mapping)):
        raise Phase2ContractError("target_objects must be a sequence of manifests")
    target_event_records = list(target_events)
    target_object_records = list(target_objects)
    target_event_pointers = sorted(
        (_event_pointer(record) for record in target_event_records),
        key=lambda pointer: (pointer["event_id"], pointer["event_sha256"]),
    )
    target_object_pointers = sorted(
        (_object_pointer(record) for record in target_object_records),
        key=lambda pointer: (
            pointer["object_id"],
            pointer["content_sha256"],
            pointer["manifest_sha256"],
        ),
    )
    if not callable(derivative_closure_resolver):
        raise Phase2ContractError("a complete derivative closure resolver is required")
    try:
        closure = derivative_closure_resolver(
            tuple(copy.deepcopy(target_event_pointers)),
            tuple(copy.deepcopy(target_object_pointers)),
        )
    except Exception as exc:
        raise Phase2ContractError("derivative closure resolver failed closed") from exc
    if not isinstance(closure, DerivativeClosure) or closure.complete is not True:
        raise Phase2ContractError("derivative closure resolver must attest complete=true")
    derived_event_records: list[Mapping[str, Any]] = []
    derived_object_records: list[Mapping[str, Any]] = []
    for resolved in closure.events:
        if not isinstance(resolved, RemovedRecord) or resolved.removed is not True or not isinstance(
            resolved.record, Mapping
        ):
            raise Phase2ContractError("derivative event closure contains an invalid removal proof")
        derived_event_records.append(resolved.record)
    for resolved in closure.objects:
        if not isinstance(resolved, RemovedRecord) or resolved.removed is not True or not isinstance(
            resolved.record, Mapping
        ):
            raise Phase2ContractError("derivative object closure contains an invalid removal proof")
        derived_object_records.append(resolved.record)
    derived_event_pointers = sorted(
        (_event_pointer(record) for record in derived_event_records),
        key=lambda pointer: (pointer["event_id"], pointer["event_sha256"]),
    )
    derived_object_pointers = sorted(
        (_object_pointer(record) for record in derived_object_records),
        key=lambda pointer: (
            pointer["object_id"],
            pointer["content_sha256"],
            pointer["manifest_sha256"],
        ),
    )
    all_event_pointers = target_event_pointers + derived_event_pointers
    all_object_pointers = target_object_pointers + derived_object_pointers
    if not callable(surface_resolver):
        raise Phase2ContractError("a trusted surface resolver is required")
    surface_proofs: dict[str, Any] = {}
    for surface in SURFACE_NAMES:
        try:
            proof = surface_resolver(
                surface,
                tuple(copy.deepcopy(all_event_pointers)),
                tuple(copy.deepcopy(all_object_pointers)),
            )
        except Exception as exc:
            raise Phase2ContractError(f"{surface} resolver failed closed") from exc
        if not isinstance(proof, Mapping):
            raise Phase2ContractError(f"{surface} resolver returned no proof object")
        surface_proofs[surface] = copy.deepcopy(dict(proof))
    payload = tombstone_event.get("payload") if isinstance(tombstone_event, Mapping) else None
    if not isinstance(payload, Mapping):
        raise Phase2ContractError("surviving tombstone has no closed payload")
    prior_high_water = prior_checkpoint.get("purge_high_water")
    prior_sequence = prior_checkpoint.get("sequence")
    if not isinstance(prior_high_water, int) or isinstance(prior_high_water, bool):
        raise Phase2ContractError("prior checkpoint purge high-water is invalid")
    if not isinstance(prior_sequence, int) or isinstance(prior_sequence, bool):
        raise Phase2ContractError("prior checkpoint sequence is invalid")
    purge_sequence = prior_high_water + 1
    mode = "genesis" if purge_sequence == 1 else "append"
    if (mode == "genesis") != (prior_purge_receipt is None):
        raise Phase2ContractError("prior purge receipt does not match trusted purge high-water")
    receipt_fields: dict[str, Any] = {
        "schema": "memory-purge-receipt/v1",
        "purge_receipt_id": purge_receipt_id,
        "mode": mode,
        "purge_sequence": purge_sequence,
        "prior_purge_receipt_sha256": (
            None
            if prior_purge_receipt is None
            else purge_receipt_record_sha256(prior_purge_receipt)
        ),
        "prior_purge_high_water": prior_high_water,
        "completed_at": completed_at,
        "removed_targets": {
            "events": target_event_pointers,
            "objects": target_object_pointers,
        },
        "removed_transitive_derivatives": {
            "events": derived_event_pointers,
            "objects": derived_object_pointers,
        },
        "erasure_surfaces": surface_proofs,
        "surviving_tombstone": {
            "tombstone_event_id": tombstone_event.get("event_id"),
            "tombstone_event_sha256": canonical_record_sha256(tombstone_event),
            "tombstone_payload_sha256": canonical_record_sha256(payload),
            "reason_code": payload.get("reason_code"),
            "classification": "internal",
            "retention": "tombstone-only",
        },
        "prior_checkpoint": checkpoint_pointer(prior_checkpoint),
        "new_checkpoint": {
            "checkpoint_id": new_checkpoint_id,
            "sequence": prior_sequence + 1,
            "purge_high_water": purge_sequence,
        },
        "authority": copy.deepcopy(dict(authority)),
    }
    receipt = seal_purge_receipt(
        receipt_fields,
        key_id=purge_key_id,
        signer=purge_signer,
        trust_resolver=trust_resolver,
        signature_verifier=signature_verifier,
        prior_purge_receipt=prior_purge_receipt,
        algorithm=algorithm,
    )
    removed_event_records = target_event_records + derived_event_records
    removed_object_records = target_object_records + derived_object_records
    removed_event_bytes = {canonical_json_bytes(record) for record in removed_event_records}
    removed_object_bytes = {canonical_json_bytes(record) for record in removed_object_records}
    new_collections = {
        "manifests": [
            copy.deepcopy(record)
            for record in prior_rows["manifests"]
            if canonical_json_bytes(record) not in removed_object_bytes
        ],
        "events": [
            copy.deepcopy(record)
            for record in prior_rows["events"]
            if canonical_json_bytes(record) not in removed_event_bytes
        ],
        "receipts": [copy.deepcopy(record) for record in prior_rows["receipts"]]
        + [copy.deepcopy(receipt)],
        "tombstones": [copy.deepcopy(record) for record in prior_rows["tombstones"]]
        + [copy.deepcopy(dict(tombstone_event))],
    }
    authenticated_receipts = tuple(
        sorted(
            set(prior_snapshot.authenticated_receipt_sha256)
            | {canonical_record_sha256(receipt)}
        )
    )
    retired_event_ids = tuple(
        sorted(
            set(prior_snapshot.retired_event_ids)
            | {str(record.get("event_id")) for record in removed_event_records}
        )
    )
    retired_object_keys = tuple(
        sorted(
            set(prior_snapshot.retired_object_keys)
            | {_exact_retired_key(record) for record in removed_object_records},
            key=lambda value: (
                value.object_id,
                value.content_sha256,
                value.acquisition_id,
                value.source_version_id,
                value.manifest_sha256,
            ),
        )
    )
    new_snapshot = CheckpointSnapshot(
        collections=new_collections,
        complete=True,
        authenticated_receipt_sha256=authenticated_receipts,
        retired_event_ids=retired_event_ids,
        retired_object_keys=retired_object_keys,
    )
    checkpoint = build_store_checkpoint(
        checkpoint_id=new_checkpoint_id,
        created_at=new_checkpoint_created_at,
        snapshot=new_snapshot,
        signer_id=checkpoint_signer_id,
        key_id=checkpoint_key_id,
        signer=checkpoint_signer,
        trust_resolver=trust_resolver,
        signature_verifier=signature_verifier,
        prior_checkpoint=prior_checkpoint,
        trusted_prior_checkpoint_ref=trusted_prior_checkpoint_ref,
        algorithm=algorithm,
    )
    _raise_builder_errors(
        "purge transition",
        verify_purge_receipt(
            receipt,
            prior_purge_receipt=prior_purge_receipt,
            prior_checkpoint=prior_checkpoint,
            prior_snapshot=prior_snapshot,
            new_checkpoint=checkpoint,
            new_snapshot=new_snapshot,
            trusted_prior_checkpoint_ref=trusted_prior_checkpoint_ref,
            target_resolver=target_resolver,
            derivative_closure_resolver=derivative_closure_resolver,
            surface_resolver=surface_resolver,
            tombstone_resolver=tombstone_resolver,
            trust_resolver=trust_resolver,
            signature_verifier=signature_verifier,
        ),
    )
    return PurgeTransition(receipt=receipt, checkpoint=checkpoint, snapshot=new_snapshot)


__all__ = [
    "CheckpointSnapshot",
    "DerivativeClosure",
    "Phase2ContractError",
    "PurgeTransition",
    "RemovedRecord",
    "RetiredObjectKey",
    "canonical_record_sha256",
    "canonical_set_commitment",
    "canonical_store_commitments",
    "build_purge_transition",
    "build_store_checkpoint",
    "canonical_retired_state",
    "checkpoint_pointer",
    "purge_derivative_closure_sha256",
    "purge_receipt_record_sha256",
    "purge_receipt_signing_bytes",
    "purge_receipt_signing_sha256",
    "purge_surface_removed_set_sha256",
    "purge_target_set_sha256",
    "seal_purge_receipt",
    "store_checkpoint_reference",
    "store_checkpoint_signing_bytes",
    "store_checkpoint_signing_sha256",
    "store_root_sha256",
    "validate_evidence_manifest_bindings",
    "validate_evidence_span_v2",
    "validate_evidence_span_v2_payload",
    "validate_extraction_artifact",
    "validate_extraction_artifact_payload",
    "validate_extraction_manifest_bindings",
    "validate_purge_receipt",
    "validate_source_manifest_binding",
    "validate_source_v2",
    "validate_source_v2_payload",
    "validate_store_checkpoint",
    "verify_purge_receipt",
    "verify_store_checkpoint",
]
