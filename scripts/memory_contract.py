#!/usr/bin/env python3
"""Deterministic, dependency-free helpers for canonical memory contracts.

The checked-in JSON Schemas are the portable structural contract.  This module mirrors their
closed shapes and enforces the cross-field rules JSON Schema cannot express cleanly: canonical
payload hashes, bitemporal ordering, content-address agreement, the evidence/inference rule,
namespace definitions, and append-only supersession basics.

Public validators return a stable ``list[str]`` and never mutate their input.  An empty list means
valid.  Digest helpers deliberately reuse ``scripts/canonical_json.py`` so Python and TypeScript
hash the same bytes.
"""
from __future__ import annotations

import copy
import datetime as dt
import functools
import math
import re
from collections.abc import Iterable, Mapping
from typing import Any, Callable

try:  # Direct ``python scripts/...`` imports.
    from canonical_json import canonical_sha256
except ModuleNotFoundError:  # Package-style imports from the repository root.
    from scripts.canonical_json import canonical_sha256


UUID_PATTERN = r"[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"
EVENT_ID_RE = re.compile(rf"evt_{UUID_PATTERN}")
RUN_ID_RE = re.compile(rf"run_{UUID_PATTERN}")
CLAIM_ID_RE = re.compile(rf"claim_{UUID_PATTERN}")
RELATIONSHIP_ID_RE = re.compile(rf"rel_{UUID_PATTERN}")
FORECAST_ID_RE = re.compile(rf"forecast_{UUID_PATTERN}")
DOCUMENT_ID_RE = re.compile(rf"document_{UUID_PATTERN}")
REGISTRY_ID_RE = re.compile(rf"identity-registry_{UUID_PATTERN}")
TRACE_ID_RE = re.compile(r"(?!0{32})[0-9a-f]{32}")
SHA256_RE = re.compile(r"[0-9a-f]{64}")
GIT_SHA_RE = re.compile(r"git:[0-9a-f]{40}(?:[0-9a-f]{24})?")
EVENT_TYPE_RE = re.compile(r"[a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)+")
SUBJECT_ID_RE = re.compile(
    r"(?:issuer:lei:[A-Z0-9]{20}"
    r"|security:figi:[A-Z0-9]{12}"
    r"|security:isin:[A-Z]{2}[A-Z0-9]{9}[0-9]"
    r"|security:mic-ticker:[A-Z0-9]{4}:[A-Z0-9][A-Z0-9.-]{0,31}"
    r"|entity:internal:[a-z0-9][a-z0-9._-]{0,127})"
)
SECURITY_ID_RE = re.compile(
    r"(?:security:figi:[A-Z0-9]{12}"
    r"|security:isin:[A-Z]{2}[A-Z0-9]{9}[0-9]"
    r"|security:mic-ticker:[A-Z0-9]{4}:[A-Z0-9][A-Z0-9.-]{0,31})"
)
ISSUER_SUBJECT_ID_RE = re.compile(
    r"(?:issuer:lei:[A-Z0-9]{20}|entity:internal:[a-z0-9][a-z0-9._-]{0,127})"
)
EVIDENCE_REF_RE = re.compile(
    r"evidence:sha256:([0-9a-f]{64})#([A-Za-z0-9][A-Za-z0-9._~:/?&=,+-]{0,255})"
)
SOURCE_ID_RE = re.compile(r"source:sha256:([0-9a-f]{64})")
HASH_REF_RE = re.compile(r"sha256:([0-9a-f]{64})")
PREDICATE_RE = re.compile(r"[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*")
LANGUAGE_RE = re.compile(r"[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*")
MIME_RE = re.compile(r"[A-Za-z0-9!#$&^_.+-]+/[A-Za-z0-9!#$&^_.+-]+")
PRODUCER_NAME_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._/-]{0,127}")
LOCATOR_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._~:/?&=,+-]{0,255}")
SIGNATURE_RE = re.compile(r"[a-z0-9][a-z0-9._-]*:[A-Za-z0-9+/=_-]+")
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
AWARE_DATETIME_RE = re.compile(
    r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})"
)

CLASSIFICATIONS = frozenset({"public", "internal", "licensed", "confidential", "restricted"})
RETENTIONS = frozenset({"permanent", "source-policy", "expires", "tombstone-only"})
PRODUCER_KINDS = frozenset({"agent", "human", "adapter", "system"})
RELATIONSHIP_TYPES = frozenset(
    {
        "supports",
        "contradicts",
        "qualifies",
        "derived_from",
        "supersedes",
        "same_as",
        "about",
        "resolved_by",
    }
)
TOMBSTONE_REASONS = frozenset(
    {
        "administrative-revocation",
        "integrity-revocation",
        "legal-erasure",
        "licence-withdrawn",
        "privacy-erasure",
        "retention-ended",
    }
)
TOMBSTONE_BASES = frozenset(
    {
        "data-subject-request",
        "integrity-policy",
        "legal-obligation",
        "licence-policy",
        "retention-policy",
    }
)
BASIS_ID_RE = re.compile(
    rf"(?:basis_{UUID_PATTERN}|basis:sha256:[0-9a-f]{{64}})"
)

# These definitions are part of v1, not suggestions.  A registry may add namespaces but cannot
# silently redefine a built-in authority or spelling rule.
NAMESPACE_RULES: dict[str, dict[str, Any]] = {
    "issuer:lei": {
        "entity_kind": "issuer",
        "id_pattern": r"^issuer:lei:[A-Z0-9]{20}$",
        "authority": "GLEIF",
        "case_sensitive": True,
    },
    "security:figi": {
        "entity_kind": "security",
        "id_pattern": r"^security:figi:[A-Z0-9]{12}$",
        "authority": "Bloomberg/OpenFIGI",
        "case_sensitive": True,
    },
    "security:isin": {
        "entity_kind": "security",
        "id_pattern": r"^security:isin:[A-Z]{2}[A-Z0-9]{9}[0-9]$",
        "authority": "ISO 6166",
        "case_sensitive": True,
    },
    "security:mic-ticker": {
        "entity_kind": "security",
        "id_pattern": r"^security:mic-ticker:[A-Z0-9]{4}:[A-Z0-9][A-Z0-9.-]{0,31}$",
        "authority": "ISO 10383 + listing venue",
        "case_sensitive": True,
    },
    "entity:internal": {
        "entity_kind": "entity",
        "id_pattern": r"^entity:internal:[a-z0-9][a-z0-9._-]{0,127}$",
        "authority": "repository",
        "case_sensitive": True,
    },
    "run": {
        "entity_kind": "run",
        "id_pattern": rf"^run_{UUID_PATTERN}$",
        "authority": "repository",
        "case_sensitive": True,
    },
    "forecast": {
        "entity_kind": "forecast",
        "id_pattern": rf"^forecast_{UUID_PATTERN}$",
        "authority": "repository",
        "case_sensitive": True,
    },
    "claim": {
        "entity_kind": "claim",
        "id_pattern": rf"^claim_{UUID_PATTERN}$",
        "authority": "repository",
        "case_sensitive": True,
    },
    "source": {
        "entity_kind": "source",
        "id_pattern": r"^source:sha256:[0-9a-f]{64}$",
        "authority": "SHA-256",
        "case_sensitive": True,
    },
}


def _path(path: str) -> str:
    return path or "(root)"


def _err(errors: list[str], path: str, message: str) -> None:
    errors.append(f"{_path(path)} — {message}")


def _fail_closed_validator(
    function: Callable[..., list[str]],
) -> Callable[..., list[str]]:
    """Keep public validators total over arbitrary JSON-shaped input."""

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


def _is_integer(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _closed_object(
    value: Any,
    path: str,
    required: tuple[str, ...],
    allowed: frozenset[str],
    errors: list[str],
) -> Mapping[str, Any] | None:
    if not isinstance(value, Mapping):
        _err(errors, path, f"expected object, got {type(value).__name__}")
        return None
    for name in required:
        if name not in value:
            _err(errors, path, f"missing required property {name!r}")
    for name in sorted(value, key=lambda item: (type(item).__name__, repr(item))):
        if not isinstance(name, str):
            _err(errors, path, f"object key {name!r} is not a string")
        elif name not in allowed:
            _err(errors, f"{path}.{name}" if path else name, "additional property is not allowed")
    return value


def _string(
    value: Any,
    path: str,
    errors: list[str],
    *,
    pattern: re.Pattern[str] | None = None,
    nullable: bool = False,
    min_length: int = 1,
    max_length: int | None = None,
) -> str | None:
    if value is None and nullable:
        return None
    if not isinstance(value, str):
        _err(errors, path, f"expected {'string or null' if nullable else 'string'}, got {type(value).__name__}")
        return None
    if len(value) < min_length:
        _err(errors, path, f"shorter than minLength {min_length}")
    if max_length is not None and len(value) > max_length:
        _err(errors, path, f"longer than maxLength {max_length}")
    if pattern is not None and pattern.fullmatch(value) is None:
        _err(errors, path, f"{value!r} does not match canonical format")
    return value


def _enum(value: Any, path: str, allowed: frozenset[str], errors: list[str]) -> None:
    if not isinstance(value, str) or value not in allowed:
        _err(errors, path, f"{value!r} is not one of {sorted(allowed)!r}")


def _string_array(
    value: Any,
    path: str,
    errors: list[str],
    *,
    pattern: re.Pattern[str] | None = None,
    min_length: int | None = None,
    max_length: int | None = None,
) -> list[str] | None:
    if not isinstance(value, list):
        _err(errors, path, f"expected array, got {type(value).__name__}")
        return None
    seen: set[str] = set()
    valid: list[str] = []
    for index, item in enumerate(value):
        item_path = f"{path}[{index}]"
        if not isinstance(item, str):
            _err(errors, item_path, f"expected string, got {type(item).__name__}")
            continue
        if min_length is not None and len(item) < min_length:
            _err(errors, item_path, f"shorter than minLength {min_length}")
        if max_length is not None and len(item) > max_length:
            _err(errors, item_path, f"longer than maxLength {max_length}")
        if pattern is not None and pattern.fullmatch(item) is None:
            _err(errors, item_path, f"{item!r} does not match canonical format")
        if item in seen:
            _err(errors, item_path, f"duplicate value {item!r}")
        seen.add(item)
        valid.append(item)
    return valid


@functools.lru_cache(maxsize=4096)
def _parse_aware_datetime_text(value: str) -> dt.datetime:
    if AWARE_DATETIME_RE.fullmatch(value) is None:
        raise ValueError("not a canonical timezone-aware RFC 3339 date-time")
    parse_text = re.sub(
        r"\.(\d{1,6})(?=Z|[+-]\d{2}:\d{2}$)",
        lambda match: "." + match.group(1).ljust(6, "0"),
        value,
    )
    parsed = dt.datetime.fromisoformat(
        parse_text[:-1] + "+00:00" if parse_text.endswith("Z") else parse_text
    )
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise ValueError("date-time must carry an explicit UTC offset")
    return parsed.astimezone(dt.timezone.utc)


def parse_aware_datetime(value: str) -> dt.datetime:
    """Parse one contract-valid RFC 3339 instant consistently on Python 3.9+.

    Python 3.9's ``fromisoformat`` accepts only three or six fractional digits. The
    contract accepts one through six, so shorter fractions are padded without changing
    the represented instant before parsing. Type-check before the cache boundary so
    malformed, unhashable JSON values still fail with the documented ``ValueError``.
    """
    if not isinstance(value, str):
        raise ValueError("not a canonical timezone-aware RFC 3339 date-time")
    return _parse_aware_datetime_text(value)


def _aware_datetime(value: Any, path: str, errors: list[str]) -> dt.datetime | None:
    text = _string(value, path, errors, pattern=AWARE_DATETIME_RE)
    if text is None or AWARE_DATETIME_RE.fullmatch(text) is None:
        return None
    try:
        return parse_aware_datetime(text)
    except ValueError:
        _err(errors, path, f"{text!r} is not a valid RFC 3339 date-time")
        return None


def _date(value: Any, path: str, errors: list[str], *, nullable: bool = False) -> dt.date | None:
    if value is None and nullable:
        return None
    text = _string(value, path, errors, pattern=DATE_RE)
    if text is None or DATE_RE.fullmatch(text) is None:
        return None
    try:
        return dt.date.fromisoformat(text)
    except ValueError:
        _err(errors, path, f"{text!r} is not a valid calendar date")
        return None


def _valid_endpoint(value: Any, path: str, errors: list[str]) -> tuple[str, dt.date | dt.datetime] | None:
    if isinstance(value, str) and DATE_RE.fullmatch(value):
        parsed_date = _date(value, path, errors)
        return ("date", parsed_date) if parsed_date is not None else None
    parsed_time = _aware_datetime(value, path, errors)
    return ("date-time", parsed_time) if parsed_time is not None else None


@_fail_closed_validator
def validate_valid_time(value: Any, *, path: str = "valid_time") -> list[str]:
    """Validate a closed ``{from, to}`` interval; ``to`` may be null (open ended)."""
    errors: list[str] = []
    obj = _closed_object(value, path, ("from", "to"), frozenset({"from", "to"}), errors)
    if obj is None:
        return errors
    start = _valid_endpoint(obj.get("from"), f"{path}.from", errors) if "from" in obj else None
    end = None
    if "to" in obj and obj["to"] is not None:
        end = _valid_endpoint(obj["to"], f"{path}.to", errors)
    if start is not None and end is not None:
        if start[0] != end[0]:
            _err(errors, path, "from and to must use the same precision (date or date-time)")
        elif start[1] > end[1]:
            _err(errors, path, "from must be less than or equal to to")
    return errors


def _canonical(value: Any, path: str, errors: list[str]) -> bool:
    try:
        canonical_sha256(value)
    except (TypeError, ValueError, UnicodeError) as exc:
        _err(errors, path, f"not canonical JSON: {exc}")
        return False
    return True


def payload_sha256(payload: Any) -> str:
    """Return the lowercase, unprefixed SHA-256 of canonical JSON payload bytes."""
    return canonical_sha256(payload)


def event_sha256(event: Any) -> str:
    """Return the lowercase, unprefixed SHA-256 of the complete canonical event."""
    return canonical_sha256(event)


@_fail_closed_validator
def validate_tombstone(payload: Any) -> list[str]:
    """Validate a closed, non-content ``memory-tombstone/v1`` payload."""
    errors: list[str] = []
    required = ("schema", "target_event_id", "reason_code", "basis", "basis_id")
    obj = _closed_object(payload, "", required, frozenset(required), errors)
    if obj is None:
        return errors
    if obj.get("schema") != "memory-tombstone/v1":
        _err(errors, "schema", "must equal 'memory-tombstone/v1'")
    _string(obj.get("target_event_id"), "target_event_id", errors, pattern=EVENT_ID_RE)
    _enum(obj.get("reason_code"), "reason_code", TOMBSTONE_REASONS, errors)
    _enum(obj.get("basis"), "basis", TOMBSTONE_BASES, errors)
    basis_id = obj.get("basis_id")
    if basis_id is not None:
        _string(basis_id, "basis_id", errors, pattern=BASIS_ID_RE, max_length=77)
    _canonical(payload, "", errors)
    return errors


def seal_event(event: Mapping[str, Any]) -> dict[str, Any]:
    """Deep-copy an unsigned v1 event and fill its canonical payload hash."""
    if not isinstance(event, Mapping):
        raise TypeError("event must be an object")
    sealed = copy.deepcopy(dict(event))
    payload = sealed.get("payload")
    if not isinstance(payload, Mapping):
        raise ValueError("event.payload must be an object")
    integrity = sealed.setdefault("integrity", {})
    if not isinstance(integrity, dict):
        raise ValueError("event.integrity must be an object")
    if integrity.get("signature") is not None:
        raise ValueError("event.integrity.signature must be null in v1")
    integrity["signature"] = None
    integrity["payload_sha256"] = payload_sha256(payload)
    return sealed


def _validate_period(value: Any, path: str, errors: list[str]) -> None:
    obj = _closed_object(
        value,
        path,
        ("from", "to", "label"),
        frozenset({"from", "to", "label"}),
        errors,
    )
    if obj is None:
        return
    start = _date(obj.get("from"), f"{path}.from", errors, nullable=True) if "from" in obj else None
    end = _date(obj.get("to"), f"{path}.to", errors, nullable=True) if "to" in obj else None
    if "label" in obj:
        _string(obj["label"], f"{path}.label", errors, nullable=True, max_length=128)
    if all(obj.get(name) is None for name in ("from", "to", "label")):
        _err(errors, path, "at least one of from, to, or label must be present")
    if start is not None and end is not None and start > end:
        _err(errors, path, "from must be less than or equal to to")


@_fail_closed_validator
def validate_source(payload: Any) -> list[str]:
    """Validate a ``memory-source/v1`` domain payload."""
    errors: list[str] = []
    required = (
        "schema",
        "source_id",
        "document_id",
        "title",
        "issuer_ids",
        "source_tier",
        "publication_date",
        "filing_date",
        "effective_date",
        "language",
        "licence",
        "uri",
        "content_sha256",
        "mime_type",
        "byte_length",
        "extraction_status",
    )
    obj = _closed_object(payload, "", required, frozenset(required), errors)
    if obj is None:
        return errors
    if obj.get("schema") != "memory-source/v1":
        _err(errors, "schema", "must equal 'memory-source/v1'")
    source_id = _string(obj.get("source_id"), "source_id", errors, pattern=SOURCE_ID_RE)
    _string(obj.get("document_id"), "document_id", errors, pattern=DOCUMENT_ID_RE)
    _string(obj.get("title"), "title", errors, max_length=1024)
    _string_array(
        obj.get("issuer_ids"),
        "issuer_ids",
        errors,
        pattern=ISSUER_SUBJECT_ID_RE,
    )
    tier = obj.get("source_tier")
    if not _is_integer(tier) or not 1 <= tier <= 10:
        _err(errors, "source_tier", "must be an integer from 1 through 10")
    for field in ("publication_date", "filing_date", "effective_date"):
        if field in obj:
            _date(obj[field], field, errors, nullable=True)
    _string(obj.get("language"), "language", errors, pattern=LANGUAGE_RE, max_length=63)
    licence = _closed_object(
        obj.get("licence"),
        "licence",
        ("name", "uri", "expires_at", "derived_data"),
        frozenset({"name", "uri", "expires_at", "derived_data"}),
        errors,
    )
    if licence is not None:
        _string(licence.get("name"), "licence.name", errors, nullable=True, max_length=256)
        _string(licence.get("uri"), "licence.uri", errors, nullable=True, max_length=2048)
        if licence.get("expires_at") is not None:
            _aware_datetime(licence["expires_at"], "licence.expires_at", errors)
        _enum(
            licence.get("derived_data"),
            "licence.derived_data",
            frozenset({"allowed", "restricted", "prohibited"}),
            errors,
        )
    _string(obj.get("uri"), "uri", errors, nullable=True, max_length=4096)
    content_hash = _string(obj.get("content_sha256"), "content_sha256", errors, pattern=HASH_REF_RE)
    _string(obj.get("mime_type"), "mime_type", errors, pattern=MIME_RE, max_length=255)
    byte_length = obj.get("byte_length")
    if not _is_integer(byte_length) or byte_length < 0:
        _err(errors, "byte_length", "must be a non-negative integer")
    _enum(
        obj.get("extraction_status"),
        "extraction_status",
        frozenset({"not-started", "succeeded", "partial", "failed"}),
        errors,
    )
    if source_id and content_hash and SOURCE_ID_RE.fullmatch(source_id) and HASH_REF_RE.fullmatch(content_hash):
        if SOURCE_ID_RE.fullmatch(source_id).group(1) != HASH_REF_RE.fullmatch(content_hash).group(1):
            _err(errors, "source_id", "digest must equal content_sha256")
    _canonical(payload, "", errors)
    return errors


@_fail_closed_validator
def validate_evidence_span(payload: Any) -> list[str]:
    """Validate a ``memory-evidence-span/v1`` domain payload."""
    errors: list[str] = []
    required = (
        "schema",
        "evidence_id",
        "source_id",
        "source_sha256",
        "locator",
        "language",
        "extraction_method",
        "extraction_tool",
        "extraction_version",
        "extraction_confidence",
    )
    allowed = frozenset(required + ("verbatim_text", "verbatim_value"))
    obj = _closed_object(payload, "", required, allowed, errors)
    if obj is None:
        return errors
    if obj.get("schema") != "memory-evidence-span/v1":
        _err(errors, "schema", "must equal 'memory-evidence-span/v1'")
    evidence_id = _string(obj.get("evidence_id"), "evidence_id", errors, pattern=EVIDENCE_REF_RE)
    source_id = _string(obj.get("source_id"), "source_id", errors, pattern=SOURCE_ID_RE)
    source_hash = _string(obj.get("source_sha256"), "source_sha256", errors, pattern=HASH_REF_RE)
    locator = _closed_object(
        obj.get("locator"),
        "locator",
        ("kind", "ref", "page", "section", "table", "cell", "char_start", "char_end"),
        frozenset({"kind", "ref", "page", "section", "table", "cell", "char_start", "char_end"}),
        errors,
    )
    if locator is not None:
        locator_kinds = frozenset({"page", "section", "table", "cell", "character", "record", "timestamp"})
        kind = locator.get("kind")
        _enum(kind, "locator.kind", locator_kinds, errors)
        locator_ref = _string(locator.get("ref"), "locator.ref", errors, pattern=LOCATOR_RE, max_length=256)
        for field, minimum in (("page", 1), ("char_start", 0), ("char_end", 0)):
            value = locator.get(field)
            if value is not None and (not _is_integer(value) or value < minimum):
                _err(errors, f"locator.{field}", f"must be null or an integer >= {minimum}")
        for field, maximum in (("section", 512), ("table", 256), ("cell", 64)):
            _string(locator.get(field), f"locator.{field}", errors, nullable=True, max_length=maximum)
        required_locator_fields = {
            "page": ("page",),
            "section": ("section",),
            "table": ("table",),
            "cell": ("table", "cell"),
            "character": ("char_start", "char_end"),
        }
        for field in required_locator_fields.get(kind, ()) if isinstance(kind, str) else ():
            if locator.get(field) is None:
                _err(errors, f"locator.{field}", f"is required when locator.kind is {kind!r}")
        start = locator.get("char_start")
        end = locator.get("char_end")
        if _is_integer(start) and _is_integer(end) and start >= end:
            _err(errors, "locator", "char_start must be less than char_end")
        if evidence_id and locator_ref and EVIDENCE_REF_RE.fullmatch(evidence_id):
            if EVIDENCE_REF_RE.fullmatch(evidence_id).group(2) != locator_ref:
                _err(errors, "evidence_id", "locator fragment must equal locator.ref")
    _string(obj.get("language"), "language", errors, pattern=LANGUAGE_RE, max_length=63)
    has_text = "verbatim_text" in obj
    has_value = "verbatim_value" in obj
    if has_text == has_value:
        _err(errors, "", "exactly one of verbatim_text or verbatim_value is required")
    if has_text:
        _string(obj["verbatim_text"], "verbatim_text", errors, min_length=1)
    if has_value:
        value = obj["verbatim_value"]
        if isinstance(value, (dict, list)):
            _err(errors, "verbatim_value", "must be a JSON scalar")
        elif isinstance(value, float) and not math.isfinite(value):
            _err(errors, "verbatim_value", "must be a finite JSON number")
        _canonical(value, "verbatim_value", errors)
    _enum(
        obj.get("extraction_method"),
        "extraction_method",
        frozenset({"native-text", "ocr", "table-parser", "api", "manual"}),
        errors,
    )
    _string(obj.get("extraction_tool"), "extraction_tool", errors, nullable=True, max_length=256)
    _string(obj.get("extraction_version"), "extraction_version", errors, nullable=True, max_length=128)
    confidence = obj.get("extraction_confidence")
    if not _is_number(confidence) or not math.isfinite(confidence) or not 0 <= confidence <= 1:
        _err(errors, "extraction_confidence", "must be a finite number from 0 through 1")
    matches = (
        EVIDENCE_REF_RE.fullmatch(evidence_id) if evidence_id else None,
        SOURCE_ID_RE.fullmatch(source_id) if source_id else None,
        HASH_REF_RE.fullmatch(source_hash) if source_hash else None,
    )
    if all(matches):
        digests = {match.group(1) for match in matches if match is not None}
        if len(digests) != 1:
            _err(errors, "evidence_id", "digest must agree with source_id and source_sha256")
    _canonical(payload, "", errors)
    return errors


@_fail_closed_validator
def validate_claim(payload: Any) -> list[str]:
    """Validate a ``memory-claim/v1`` payload and its evidence/inference semantics."""
    errors: list[str] = []
    required = (
        "schema",
        "claim_id",
        "subject_id",
        "predicate",
        "unit",
        "currency",
        "accounting_standard",
        "period",
        "scope",
        "qualifier",
        "basis",
        "epistemic_status",
        "claim_quality",
        "evidence_refs",
        "derived_from_claims",
        "material",
    )
    allowed = frozenset(required + ("object_id", "value"))
    obj = _closed_object(payload, "", required, allowed, errors)
    if obj is None:
        return errors
    if obj.get("schema") != "memory-claim/v1":
        _err(errors, "schema", "must equal 'memory-claim/v1'")
    claim_id = _string(obj.get("claim_id"), "claim_id", errors, pattern=CLAIM_ID_RE)
    _string(obj.get("subject_id"), "subject_id", errors, pattern=SUBJECT_ID_RE)
    _string(obj.get("predicate"), "predicate", errors, pattern=PREDICATE_RE, max_length=128)
    has_object = "object_id" in obj
    has_value = "value" in obj
    if has_object == has_value:
        _err(errors, "", "exactly one of object_id or value is required")
    if has_object:
        _validate_memory_ref(obj["object_id"], "object_id", errors)
    if has_value:
        _canonical(obj["value"], "value", errors)
    _string(obj.get("unit"), "unit", errors, nullable=True, max_length=64)
    currency = obj.get("currency")
    if currency is not None and (not isinstance(currency, str) or re.fullmatch(r"[A-Z]{3}", currency) is None):
        _err(errors, "currency", "must be null or an uppercase ISO 4217-style three-letter code")
    _string(obj.get("accounting_standard"), "accounting_standard", errors, nullable=True, max_length=64)
    _validate_period(obj.get("period"), "period", errors)
    scope = _closed_object(
        obj.get("scope"),
        "scope",
        ("consolidation", "segment", "geography", "security_id"),
        frozenset({"consolidation", "segment", "geography", "security_id"}),
        errors,
    )
    if scope is not None:
        consolidation = scope.get("consolidation")
        _enum(
            consolidation,
            "scope.consolidation",
            frozenset({"consolidated", "standalone", "segment", "not-applicable", "unknown"}),
            errors,
        )
        _string(scope.get("segment"), "scope.segment", errors, nullable=True, max_length=256)
        _string(scope.get("geography"), "scope.geography", errors, nullable=True, max_length=256)
        security_id = scope.get("security_id")
        if security_id is not None:
            _string(
                security_id,
                "scope.security_id",
                errors,
                pattern=SECURITY_ID_RE,
            )
        if consolidation == "segment" and scope.get("segment") is None:
            _err(errors, "scope.segment", "is required when consolidation is 'segment'")
    _string(obj.get("qualifier"), "qualifier", errors, max_length=4096)
    _string(obj.get("basis"), "basis", errors, max_length=4096)
    status = obj.get("epistemic_status")
    _enum(status, "epistemic_status", frozenset({"supported", "inference", "not-proven"}), errors)
    quality = obj.get("claim_quality")
    if not _is_integer(quality) or not 0 <= quality <= 5:
        _err(errors, "claim_quality", "must be an integer from 0 through 5")
    evidence = _string_array(obj.get("evidence_refs"), "evidence_refs", errors, pattern=EVIDENCE_REF_RE)
    derived = _string_array(obj.get("derived_from_claims"), "derived_from_claims", errors, pattern=CLAIM_ID_RE)
    if claim_id and derived and claim_id in derived:
        _err(errors, "derived_from_claims", "a claim cannot derive from itself")
    if status == "supported":
        if not evidence:
            _err(errors, "evidence_refs", "a supported claim requires at least one evidence reference")
        if _is_integer(quality) and quality < 2:
            _err(errors, "claim_quality", "a supported claim must have quality 2 through 5")
    elif status == "inference" and _is_integer(quality) and quality > 1:
        _err(errors, "claim_quality", "an inference must have quality 0 or 1")
    elif status == "not-proven" and quality != 0:
        _err(errors, "claim_quality", "a not-proven claim must have quality 0")
    if not isinstance(obj.get("material"), bool):
        _err(errors, "material", "must be a boolean")
    _canonical(payload, "", errors)
    return errors


def _validate_memory_ref(value: Any, path: str, errors: list[str]) -> None:
    if not isinstance(value, str):
        _err(errors, path, f"expected string, got {type(value).__name__}")
        return
    patterns = (
        SUBJECT_ID_RE,
        EVENT_ID_RE,
        RUN_ID_RE,
        CLAIM_ID_RE,
        FORECAST_ID_RE,
        RELATIONSHIP_ID_RE,
        SOURCE_ID_RE,
        EVIDENCE_REF_RE,
    )
    if not any(pattern.fullmatch(value) for pattern in patterns):
        _err(errors, path, f"{value!r} is not a canonical memory reference")


def _memory_ref_kind(value: str) -> str | None:
    for name, pattern in (
        ("event", EVENT_ID_RE),
        ("run", RUN_ID_RE),
        ("claim", CLAIM_ID_RE),
        ("forecast", FORECAST_ID_RE),
        ("relationship", RELATIONSHIP_ID_RE),
        ("source", SOURCE_ID_RE),
        ("evidence", EVIDENCE_REF_RE),
        ("identity", SUBJECT_ID_RE),
    ):
        if pattern.fullmatch(value):
            return name
    return None


@_fail_closed_validator
def validate_relationship(payload: Any) -> list[str]:
    """Validate a ``memory-relationship/v1`` domain payload."""
    errors: list[str] = []
    required = (
        "schema",
        "relationship_id",
        "relationship_type",
        "source_ref",
        "target_ref",
        "qualifier",
        "evidence_refs",
    )
    obj = _closed_object(payload, "", required, frozenset(required), errors)
    if obj is None:
        return errors
    if obj.get("schema") != "memory-relationship/v1":
        _err(errors, "schema", "must equal 'memory-relationship/v1'")
    _string(obj.get("relationship_id"), "relationship_id", errors, pattern=RELATIONSHIP_ID_RE)
    relation = obj.get("relationship_type")
    _enum(relation, "relationship_type", RELATIONSHIP_TYPES, errors)
    _validate_memory_ref(obj.get("source_ref"), "source_ref", errors)
    _validate_memory_ref(obj.get("target_ref"), "target_ref", errors)
    if obj.get("source_ref") == obj.get("target_ref"):
        _err(errors, "target_ref", "a relationship cannot point to itself")
    if relation in {"same_as", "supersedes"} and all(
        isinstance(obj.get(name), str) for name in ("source_ref", "target_ref")
    ):
        if _memory_ref_kind(obj["source_ref"]) != _memory_ref_kind(obj["target_ref"]):
            _err(
                errors,
                "target_ref",
                f"{relation} must connect records of the same reference kind",
            )
    _string(obj.get("qualifier"), "qualifier", errors, nullable=True, max_length=4096)
    evidence_refs = _string_array(
        obj.get("evidence_refs"), "evidence_refs", errors, pattern=EVIDENCE_REF_RE
    )
    if evidence_refs is not None and not evidence_refs:
        _err(errors, "evidence_refs", "a relationship requires at least one evidence reference")
    _canonical(payload, "", errors)
    return errors


def identity_namespace(identifier: str) -> str | None:
    """Return the built-in namespace matching ``identifier``, or ``None``."""
    if not isinstance(identifier, str):
        return None
    for name, rule in NAMESPACE_RULES.items():
        if re.fullmatch(rule["id_pattern"], identifier):
            return name
    return None


@_fail_closed_validator
def validate_identity_id(identifier: Any, *, namespace: str | None = None) -> list[str]:
    """Validate one identifier against a named or auto-detected built-in namespace."""
    errors: list[str] = []
    if not isinstance(identifier, str):
        _err(errors, "id", f"expected string, got {type(identifier).__name__}")
        return errors
    if namespace is not None:
        rule = NAMESPACE_RULES.get(namespace)
        if rule is None:
            _err(errors, "namespace", f"unknown built-in namespace {namespace!r}")
        elif re.fullmatch(rule["id_pattern"], identifier) is None:
            _err(errors, "id", f"does not match namespace {namespace!r}")
    elif identity_namespace(identifier) is None:
        _err(errors, "id", "does not match a built-in namespace")
    return errors


@_fail_closed_validator
def validate_identity_registry(registry: Any) -> list[str]:
    """Validate namespace immutability, unique identities, and canonical alias targets."""
    errors: list[str] = []
    required = ("schema", "registry_id", "generated_at", "namespaces", "identities")
    obj = _closed_object(registry, "", required, frozenset(required), errors)
    if obj is None:
        return errors
    if obj.get("schema") != "memory-identity-registry/v1":
        _err(errors, "schema", "must equal 'memory-identity-registry/v1'")
    _string(obj.get("registry_id"), "registry_id", errors, pattern=REGISTRY_ID_RE)
    _aware_datetime(obj.get("generated_at"), "generated_at", errors)
    namespaces = obj.get("namespaces")
    definitions: dict[str, Mapping[str, Any]] = {}
    if not isinstance(namespaces, list):
        _err(errors, "namespaces", f"expected array, got {type(namespaces).__name__}")
    else:
        for index, item in enumerate(namespaces):
            path = f"namespaces[{index}]"
            definition = _closed_object(
                item,
                path,
                ("name", "entity_kind", "id_pattern", "authority", "case_sensitive"),
                frozenset({"name", "entity_kind", "id_pattern", "authority", "case_sensitive"}),
                errors,
            )
            if definition is None:
                continue
            name = _string(
                definition.get("name"),
                f"{path}.name",
                errors,
                pattern=re.compile(r"[a-z][a-z0-9-]*(?::[a-z][a-z0-9-]*)?"),
            )
            _enum(
                definition.get("entity_kind"),
                f"{path}.entity_kind",
                frozenset({"issuer", "security", "entity", "run", "forecast", "claim", "source"}),
                errors,
            )
            pattern = _string(definition.get("id_pattern"), f"{path}.id_pattern", errors, max_length=512)
            if pattern is not None:
                try:
                    re.compile(pattern)
                except re.error as exc:
                    _err(errors, f"{path}.id_pattern", f"invalid regular expression: {exc}")
            _string(definition.get("authority"), f"{path}.authority", errors, max_length=256)
            if not isinstance(definition.get("case_sensitive"), bool):
                _err(errors, f"{path}.case_sensitive", "must be a boolean")
            if name is not None:
                if name in definitions:
                    _err(errors, f"{path}.name", f"duplicate namespace {name!r}")
                else:
                    definitions[name] = definition
    for name, expected in NAMESPACE_RULES.items():
        actual = definitions.get(name)
        if actual is None:
            _err(errors, "namespaces", f"missing required built-in namespace {name!r}")
            continue
        for field, expected_value in expected.items():
            if actual.get(field) != expected_value:
                _err(errors, f"namespaces[{name!r}].{field}", f"built-in value must equal {expected_value!r}")

    reserved_roots = {name.split(":", 1)[0] for name in NAMESPACE_RULES}
    for name, definition in definitions.items():
        if name in NAMESPACE_RULES:
            continue
        if ":" not in name and name in reserved_roots:
            _err(
                errors,
                f"namespaces[{name!r}].name",
                "root is reserved by a built-in namespace",
            )
        pattern = definition.get("id_pattern")
        if isinstance(pattern, str) and not pattern.startswith(f"^{name}:"):
            _err(
                errors,
                f"namespaces[{name!r}].id_pattern",
                f"custom pattern must start with the declared namespace prefix '^{name}:'",
            )

    identities = obj.get("identities")
    records: dict[str, Mapping[str, Any]] = {}
    casefold_records: dict[str, str] = {}
    if not isinstance(identities, list):
        _err(errors, "identities", f"expected array, got {type(identities).__name__}")
    else:
        for index, item in enumerate(identities):
            path = f"identities[{index}]"
            record = _closed_object(
                item,
                path,
                ("id", "namespace", "entity_kind", "canonical_id", "status", "valid_time", "aliases"),
                frozenset({"id", "namespace", "entity_kind", "canonical_id", "status", "valid_time", "aliases"}),
                errors,
            )
            if record is None:
                continue
            identifier = _string(record.get("id"), f"{path}.id", errors, max_length=256)
            namespace = _string(
                record.get("namespace"),
                f"{path}.namespace",
                errors,
                pattern=re.compile(r"[a-z][a-z0-9-]*(?::[a-z][a-z0-9-]*)?"),
            )
            _enum(
                record.get("entity_kind"),
                f"{path}.entity_kind",
                frozenset({"issuer", "security", "entity", "run", "forecast", "claim", "source"}),
                errors,
            )
            canonical_id = _string(
                record.get("canonical_id"), f"{path}.canonical_id", errors, max_length=256
            )
            _enum(record.get("status"), f"{path}.status", frozenset({"active", "superseded", "retired"}), errors)
            errors.extend(validate_valid_time(record.get("valid_time"), path=f"{path}.valid_time"))
            _string_array(
                record.get("aliases"),
                f"{path}.aliases",
                errors,
                min_length=1,
                max_length=256,
            )
            if identifier is not None:
                if identifier in records:
                    _err(errors, f"{path}.id", f"duplicate identity {identifier!r}")
                else:
                    records[identifier] = {
                        **record,
                        "canonical_id": canonical_id,
                    }
            definition = definitions.get(namespace) if namespace else None
            if definition is None and namespace is not None:
                _err(errors, f"{path}.namespace", f"undefined namespace {namespace!r}")
            elif definition is not None and identifier is not None:
                case_sensitive = definition.get("case_sensitive")
                flags = 0 if case_sensitive is not False else re.IGNORECASE
                try:
                    matches = re.fullmatch(
                        str(definition.get("id_pattern")), identifier, flags=flags
                    )
                except re.error:
                    matches = None
                if matches is None:
                    _err(errors, f"{path}.id", f"does not match namespace {namespace!r}")
                if record.get("entity_kind") != definition.get("entity_kind"):
                    _err(errors, f"{path}.entity_kind", f"must match namespace kind {definition.get('entity_kind')!r}")
                if namespace not in NAMESPACE_RULES:
                    prefix = f"{namespace}:"
                    prefix_matches = (
                        identifier.startswith(prefix)
                        if case_sensitive is not False
                        else identifier.casefold().startswith(prefix.casefold())
                    )
                    suffix = identifier[len(prefix):] if prefix_matches else ""
                    if not prefix_matches or not suffix or ":" in suffix:
                        _err(
                            errors,
                            f"{path}.id",
                            "must use its declared custom namespace prefix and one opaque local part",
                        )
                    if identity_namespace(identifier) is not None:
                        _err(
                            errors,
                            f"{path}.namespace",
                            "custom namespace cannot shadow a built-in identifier",
                        )
                if case_sensitive is False:
                    folded = identifier.casefold()
                    prior = casefold_records.get(folded)
                    if prior is not None and prior != identifier:
                        _err(
                            errors,
                            f"{path}.id",
                            f"duplicates {prior!r} under a case-insensitive namespace",
                        )
                    else:
                        casefold_records[folded] = identifier
    for identifier, record in records.items():
        canonical_id = record.get("canonical_id")
        if record.get("status") == "active" and canonical_id != identifier:
            _err(
                errors,
                f"identities[{identifier!r}].canonical_id",
                "an active identity must be self-canonical",
            )
        target_identifier = canonical_id if isinstance(canonical_id, str) else None
        if target_identifier not in records and isinstance(canonical_id, str):
            target_identifier = casefold_records.get(canonical_id.casefold())
        if target_identifier is None or target_identifier not in records:
            _err(errors, f"identities[{identifier!r}].canonical_id", f"target {canonical_id!r} does not exist")
            continue
        target = records[target_identifier]
        if target.get("entity_kind") != record.get("entity_kind"):
            _err(errors, f"identities[{identifier!r}].canonical_id", "target has a different entity_kind")
        target_canonical = target.get("canonical_id")
        if target_canonical != target_identifier:
            _err(errors, f"identities[{identifier!r}].canonical_id", "target must be self-canonical (alias chains are forbidden)")
        if record.get("status") == "superseded" and canonical_id == identifier:
            _err(errors, f"identities[{identifier!r}].canonical_id", "a superseded identity must point to a different canonical identity")
    _canonical(registry, "", errors)
    return errors


PAYLOAD_VALIDATORS: dict[str, Callable[[Any], list[str]]] = {
    "memory-source/v1": validate_source,
    "memory-evidence-span/v1": validate_evidence_span,
    "memory-claim/v1": validate_claim,
    "memory-relationship/v1": validate_relationship,
    "memory-identity-registry/v1": validate_identity_registry,
    "memory-tombstone/v1": validate_tombstone,
}


@_fail_closed_validator
def validate_payload(payload: Any) -> list[str]:
    """Dispatch a recognized typed payload by its ``schema`` discriminator."""
    if not isinstance(payload, Mapping):
        return [f"(root) — expected object, got {type(payload).__name__}"]
    schema = payload.get("schema")
    if not isinstance(schema, str):
        return ["schema — a typed payload requires a string schema discriminator"]
    validator = PAYLOAD_VALIDATORS.get(schema)
    if validator is None:
        return [f"schema — unsupported typed payload schema {schema!r}"]
    return validator(payload)


def _prefix_errors(errors: Iterable[str], prefix: str) -> list[str]:
    prefixed: list[str] = []
    for error in errors:
        path, separator, message = error.partition(" — ")
        if path == "(root)":
            path = prefix
        else:
            path = f"{prefix}.{path}"
        prefixed.append(path + (separator + message if separator else ""))
    return prefixed


def _event_index_mapping(event_index: Any, errors: list[str]) -> Mapping[str, Mapping[str, Any]] | None:
    if event_index is None:
        return None
    if not isinstance(event_index, Mapping):
        _err(errors, "event_index", "must be a mapping from event_id to event")
        return None
    valid: dict[str, Mapping[str, Any]] = {}
    for key in sorted(event_index, key=str):
        item = event_index[key]
        if not isinstance(key, str) or EVENT_ID_RE.fullmatch(key) is None:
            _err(errors, f"event_index[{key!r}]", "key is not a canonical event ID")
            continue
        if not isinstance(item, Mapping):
            _err(errors, f"event_index[{key!r}]", "value is not an event object")
            continue
        if item.get("event_id") != key:
            _err(errors, f"event_index[{key!r}].event_id", "must equal its index key")
            continue
        valid[key] = item
    return valid


def _reachable_event(
    start: str,
    target: str,
    index: Mapping[str, Mapping[str, Any]],
) -> bool:
    pending = [start]
    seen: set[str] = set()
    while pending:
        current = pending.pop()
        if current == target:
            return True
        if current in seen:
            continue
        seen.add(current)
        row = index.get(current)
        if not isinstance(row, Mapping):
            continue
        links = row.get("supersedes")
        if isinstance(links, list):
            pending.extend(link for link in links if isinstance(link, str))
    return False


@_fail_closed_validator
def validate_event(
    event: Any,
    *,
    event_index: Mapping[str, Mapping[str, Any]] | None = None,
) -> list[str]:
    """Validate one ``memory-event/v1`` envelope.

    ``event_index`` is optional.  When supplied, it must map event IDs to events and enables target
    existence, temporal ordering, duplicate-ID, and supersession-cycle checks.
    """
    errors: list[str] = []
    required = (
        "schema",
        "event_id",
        "event_type",
        "subject_ids",
        "valid_time",
        "system_time",
        "producer",
        "run_id",
        "trace_id",
        "payload",
        "evidence_refs",
        "derived_from",
        "supersedes",
        "integrity",
        "policy",
    )
    obj = _closed_object(event, "", required, frozenset(required), errors)
    if obj is None:
        return errors
    if obj.get("schema") != "memory-event/v1":
        _err(errors, "schema", "must equal 'memory-event/v1'")
    event_id = _string(obj.get("event_id"), "event_id", errors, pattern=EVENT_ID_RE)
    event_type = _string(obj.get("event_type"), "event_type", errors, pattern=EVENT_TYPE_RE, max_length=128)
    subjects = _string_array(obj.get("subject_ids"), "subject_ids", errors, pattern=SUBJECT_ID_RE)
    errors.extend(validate_valid_time(obj.get("valid_time"), path="valid_time"))
    system_time = _aware_datetime(obj.get("system_time"), "system_time", errors)

    producer = _closed_object(
        obj.get("producer"),
        "producer",
        ("kind", "name", "runtime", "model", "prompt_program_sha"),
        frozenset({"kind", "name", "runtime", "model", "prompt_program_sha"}),
        errors,
    )
    if producer is not None:
        _enum(producer.get("kind"), "producer.kind", PRODUCER_KINDS, errors)
        _string(producer.get("name"), "producer.name", errors, pattern=PRODUCER_NAME_RE, max_length=128)
        _string(producer.get("runtime"), "producer.runtime", errors, nullable=True, max_length=128)
        _string(producer.get("model"), "producer.model", errors, nullable=True, max_length=256)
        prompt_sha = producer.get("prompt_program_sha")
        if prompt_sha is not None:
            _string(prompt_sha, "producer.prompt_program_sha", errors, pattern=GIT_SHA_RE)
    run_id = obj.get("run_id")
    if run_id is not None:
        _string(run_id, "run_id", errors, pattern=RUN_ID_RE)
    trace_id = obj.get("trace_id")
    if trace_id is not None:
        _string(trace_id, "trace_id", errors, pattern=TRACE_ID_RE)
    payload = obj.get("payload")
    if not isinstance(payload, Mapping):
        _err(errors, "payload", f"expected object, got {type(payload).__name__}")
    else:
        _canonical(payload, "payload", errors)
        payload_schema = payload.get("schema")
        if isinstance(payload_schema, str) and payload_schema.startswith("memory-"):
            errors.extend(_prefix_errors(validate_payload(payload), "payload"))
            expected_domain = {
                "memory-source/v1": "source",
                "memory-evidence-span/v1": "evidence",
                "memory-claim/v1": "claim",
                "memory-relationship/v1": "relationship",
                "memory-identity-registry/v1": "identity",
            }.get(payload_schema)
            if expected_domain and isinstance(event_type, str) and not event_type.startswith(expected_domain + "."):
                _err(errors, "event_type", f"must start with {expected_domain + '.'!r} for {payload_schema}")
        if isinstance(event_type, str):
            event_domain = event_type.split(".", 1)[0]
            required_payload_schema = {
                "source": "memory-source/v1",
                "evidence": "memory-evidence-span/v1",
                "claim": "memory-claim/v1",
                "relationship": "memory-relationship/v1",
                "identity": "memory-identity-registry/v1",
            }.get(event_domain)
            if (
                required_payload_schema
                and payload_schema != "memory-tombstone/v1"
                and payload_schema != required_payload_schema
            ):
                _err(
                    errors,
                    "payload.schema",
                    f"must equal {required_payload_schema!r} for {event_domain!r} events",
                )
    evidence_refs = _string_array(obj.get("evidence_refs"), "evidence_refs", errors, pattern=EVIDENCE_REF_RE)
    derived_from = _string_array(obj.get("derived_from"), "derived_from", errors, pattern=EVENT_ID_RE)
    supersedes = _string_array(obj.get("supersedes"), "supersedes", errors, pattern=EVENT_ID_RE)
    if event_id and derived_from and event_id in derived_from:
        _err(errors, "derived_from", "an event cannot derive from itself")
    if event_id and supersedes and event_id in supersedes:
        _err(errors, "supersedes", "an event cannot supersede itself")
    if derived_from and supersedes:
        overlap = sorted(set(derived_from) & set(supersedes))
        if overlap:
            _err(errors, "supersedes", f"events cannot also appear in derived_from: {overlap!r}")
    if isinstance(payload, Mapping) and payload.get("schema") == "memory-tombstone/v1":
        target_event_id = payload.get("target_event_id")
        expected_supersedes = [target_event_id] if isinstance(target_event_id, str) else None
        if supersedes != expected_supersedes:
            _err(
                errors,
                "supersedes",
                "must exactly equal [payload.target_event_id] for a tombstone",
            )
        if evidence_refs != []:
            _err(errors, "evidence_refs", "must be empty for a tombstone")
        if derived_from != []:
            _err(errors, "derived_from", "must be empty for a tombstone")
        if evidence_refs != []:
            _err(errors, "evidence_refs", "must be empty for a policy-safe tombstone")
        if derived_from != []:
            _err(errors, "derived_from", "must be empty for a policy-safe tombstone")

    integrity = _closed_object(
        obj.get("integrity"),
        "integrity",
        ("payload_sha256", "signature"),
        frozenset({"payload_sha256", "signature"}),
        errors,
    )
    if integrity is not None:
        stated_hash = _string(integrity.get("payload_sha256"), "integrity.payload_sha256", errors, pattern=SHA256_RE)
        signature = integrity.get("signature")
        if signature is not None:
            _err(
                errors,
                "integrity.signature",
                "must be null in v1; signature verification requires a configured trust store",
            )
        if stated_hash and isinstance(payload, Mapping):
            try:
                actual_hash = payload_sha256(payload)
            except (TypeError, ValueError, UnicodeError):
                actual_hash = None
            if actual_hash is not None and stated_hash != actual_hash:
                _err(errors, "integrity.payload_sha256", f"does not match canonical payload digest {actual_hash}")

    policy = _closed_object(
        obj.get("policy"),
        "policy",
        ("classification", "retention", "retain_until"),
        frozenset({"classification", "retention", "retain_until"}),
        errors,
    )
    if policy is not None:
        _enum(policy.get("classification"), "policy.classification", CLASSIFICATIONS, errors)
        retention = policy.get("retention")
        _enum(retention, "policy.retention", RETENTIONS, errors)
        retain_until = policy.get("retain_until")
        if retention == "expires":
            if retain_until is None:
                _err(errors, "policy.retain_until", "is required when retention is 'expires'")
            else:
                expiry_time = _aware_datetime(retain_until, "policy.retain_until", errors)
                if (
                    expiry_time is not None
                    and system_time is not None
                    and expiry_time <= system_time
                ):
                    _err(errors, "policy.retain_until", "must be later than system_time")
        elif retain_until is not None:
            _err(errors, "policy.retain_until", "must be null unless retention is 'expires'")
        payload_schema = payload.get("schema") if isinstance(payload, Mapping) else None
        if retention == "tombstone-only" and payload_schema != "memory-tombstone/v1":
            _err(
                errors,
                "policy.retention",
                "tombstone-only requires a memory-tombstone/v1 payload",
            )
        elif payload_schema == "memory-tombstone/v1" and retention != "tombstone-only":
            _err(
                errors,
                "policy.retention",
                "must equal 'tombstone-only' for a memory-tombstone/v1 payload",
            )

    if isinstance(payload, Mapping):
        payload_schema = payload.get("schema")
        if payload_schema == "memory-claim/v1":
            if subjects is not None and payload.get("subject_id") not in subjects:
                _err(errors, "subject_ids", "must contain payload.subject_id")
            if evidence_refs is not None and isinstance(payload.get("evidence_refs"), list):
                if evidence_refs != payload["evidence_refs"]:
                    _err(errors, "evidence_refs", "must exactly equal payload.evidence_refs in canonical order")
        elif payload_schema == "memory-source/v1":
            issuer_ids = payload.get("issuer_ids")
            valid_issuer_ids = (
                [item for item in issuer_ids if isinstance(item, str)]
                if isinstance(issuer_ids, list)
                else []
            )
            if (
                subjects is not None
                and isinstance(issuer_ids, list)
                and not set(valid_issuer_ids).issubset(set(subjects))
            ):
                _err(errors, "subject_ids", "must contain every payload.issuer_ids entry")
            licence = payload.get("licence")
            if isinstance(licence, Mapping) and isinstance(policy, Mapping):
                derived_data = licence.get("derived_data")
                classification = policy.get("classification")
                retention = policy.get("retention")
                if isinstance(derived_data, str) and derived_data in {"restricted", "prohibited"}:
                    if (
                        not isinstance(classification, str)
                        or classification not in {"licensed", "restricted", "confidential"}
                    ):
                        _err(
                            errors,
                            "policy.classification",
                            "restricted/prohibited source terms require a protected classification",
                        )
                    if retention == "permanent":
                        _err(
                            errors,
                            "policy.retention",
                            "restricted/prohibited source terms cannot use permanent retention",
                        )
                expires_at = licence.get("expires_at")
                if isinstance(expires_at, str):
                    if retention != "expires":
                        _err(
                            errors,
                            "policy.retention",
                            "a source licence with expires_at requires expires retention",
                        )
                    retain_until = policy.get("retain_until")
                    parse_errors: list[str] = []
                    licence_expiry = _aware_datetime(
                        expires_at, "payload.licence.expires_at", parse_errors
                    )
                    retention_expiry = _aware_datetime(
                        retain_until, "policy.retain_until", parse_errors
                    )
                    if (
                        licence_expiry is not None
                        and retention_expiry is not None
                        and retention_expiry > licence_expiry
                    ):
                        _err(
                            errors,
                            "policy.retain_until",
                            "cannot be later than payload.licence.expires_at",
                        )
            system_calendar_date = None
            system_time_text = obj.get("system_time")
            if system_time is not None and isinstance(system_time_text, str):
                try:
                    system_calendar_date = dt.date.fromisoformat(system_time_text[:10])
                except ValueError:  # already reported by the envelope clock validator
                    pass
            if system_calendar_date is not None:
                for source_date_field in ("publication_date", "filing_date"):
                    source_date_errors: list[str] = []
                    source_date = _date(
                        payload.get(source_date_field),
                        f"payload.{source_date_field}",
                        source_date_errors,
                        nullable=True,
                    )
                    if source_date is not None and source_date > system_calendar_date:
                        _err(
                            errors,
                            f"payload.{source_date_field}",
                            "must not be later than system_time at date precision",
                        )
        elif payload_schema == "memory-identity-registry/v1":
            generated_at = _aware_datetime(
                payload.get("generated_at"), "payload.generated_at", []
            )
            if (
                generated_at is not None
                and system_time is not None
                and generated_at > system_time
            ):
                _err(
                    errors,
                    "payload.generated_at",
                    "must not be later than envelope system_time",
                )
        elif payload_schema == "memory-relationship/v1":
            if evidence_refs is not None and isinstance(payload.get("evidence_refs"), list):
                if evidence_refs != payload["evidence_refs"]:
                    _err(errors, "evidence_refs", "must exactly equal payload.evidence_refs in canonical order")

    index = _event_index_mapping(event_index, errors)
    if index is not None and event_id and EVENT_ID_RE.fullmatch(event_id):
        existing = index.get(event_id)
        if existing is not None and existing != event:
            _err(errors, "event_id", "duplicates a different event in event_index")
        for field, refs in (("derived_from", derived_from), ("supersedes", supersedes)):
            if refs is None:
                continue
            for position, ref in enumerate(refs):
                target = index.get(ref)
                if target is None:
                    _err(errors, f"{field}[{position}]", f"target {ref!r} does not exist")
                    continue
                target_time_errors: list[str] = []
                target_time = _aware_datetime(target.get("system_time"), "system_time", target_time_errors)
                errors.extend(
                    _prefix_errors(target_time_errors, f"{field}[{position}].target")
                )
                if system_time is not None and target_time is not None:
                    if field == "supersedes" and target_time >= system_time:
                        _err(errors, f"{field}[{position}]", "target must have an earlier system_time")
                    elif field == "derived_from" and target_time >= system_time:
                        _err(
                            errors,
                            f"{field}[{position}]",
                            "target must have an earlier system_time",
                        )
                if field == "supersedes" and _reachable_event(ref, event_id, index):
                    _err(errors, f"{field}[{position}]", "would create a supersedes cycle")
                if field == "supersedes":
                    target_type = target.get("event_type")
                    if not isinstance(event_type, str) or target_type != event_type:
                        _err(
                            errors,
                            f"{field}[{position}]",
                            "target must have exactly the same event_type",
                        )
                    target_subjects = target.get("subject_ids")
                    target_subject_set = {
                        item for item in target_subjects if isinstance(item, str)
                    } if isinstance(target_subjects, list) else set()
                    if subjects is not None and not set(subjects) & target_subject_set:
                        _err(
                            errors,
                            f"{field}[{position}]",
                            "target must share at least one canonical subject",
                        )
    _canonical(event, "", errors)
    return errors


@_fail_closed_validator
def validate_events(events: Iterable[Mapping[str, Any]]) -> list[str]:
    """Validate an event collection with global ID uniqueness and referential checks."""
    try:
        rows = list(events)
    except TypeError:
        return ["events — expected an iterable of event objects"]
    errors: list[str] = []
    index: dict[str, Mapping[str, Any]] = {}
    positions: dict[str, int] = {}
    for position, event in enumerate(rows):
        if not isinstance(event, Mapping):
            _err(errors, f"events[{position}]", f"expected object, got {type(event).__name__}")
            continue
        event_id = event.get("event_id")
        if not isinstance(event_id, str):
            continue
        if event_id in positions:
            _err(errors, f"events[{position}].event_id", f"duplicates events[{positions[event_id]}].event_id")
            continue
        positions[event_id] = position
        index[event_id] = event
    for position, event in enumerate(rows):
        if isinstance(event, Mapping):
            errors.extend(_prefix_errors(validate_event(event, event_index=index), f"events[{position}]"))
    return errors


__all__ = [
    "CLASSIFICATIONS",
    "NAMESPACE_RULES",
    "PAYLOAD_VALIDATORS",
    "RETENTIONS",
    "TOMBSTONE_BASES",
    "TOMBSTONE_REASONS",
    "event_sha256",
    "identity_namespace",
    "parse_aware_datetime",
    "payload_sha256",
    "seal_event",
    "validate_claim",
    "validate_event",
    "validate_events",
    "validate_evidence_span",
    "validate_identity_id",
    "validate_identity_registry",
    "validate_payload",
    "validate_relationship",
    "validate_source",
    "validate_tombstone",
    "validate_valid_time",
]
