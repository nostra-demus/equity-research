#!/usr/bin/env python3
"""Closed contracts for controlled permanent-memory writes and calibration intake.

This module is deliberately separate from the Phase 1/2 contract module.  It always
delegates envelope validation to :func:`memory_contract.validate_event`; Phase 5 does
not reinterpret an unknown payload as an untyped legacy event.  The small registry
integration required for ``memory-feedback-review/v1`` and ``memory-correction/v1``
belongs in ``memory_contract`` and is reviewed as an explicit compatibility change.
"""
from __future__ import annotations

import copy
import datetime as dt
import functools
import json
from pathlib import Path
from typing import Any, Iterable, Mapping

try:
    from calibrate import match_resolved_forecasts
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_contract import parse_aware_datetime, validate_claim, validate_event
    from memory_three_layer_contract import validate_contract as validate_three_layer_contract
    from memory_shadow import ShadowError, parse_closed_json, verify_shadow_feedback
    from validate_screener_json import Checker
except ImportError:  # pragma: no cover - package-style imports
    from scripts.calibrate import match_resolved_forecasts
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_contract import parse_aware_datetime, validate_claim, validate_event
    from scripts.memory_three_layer_contract import validate_contract as validate_three_layer_contract
    from scripts.memory_shadow import ShadowError, parse_closed_json, verify_shadow_feedback
    from scripts.validate_screener_json import Checker


SCHEMA_DIR = Path(__file__).resolve().parents[1] / "frameworks" / "memory"
WRITE_REQUEST_SCHEMA = "controlled-write-request-v1.schema.json"
WRITE_RESULT_SCHEMA = "controlled-write-result-v1.schema.json"
DEAD_LETTER_SCHEMA = "controlled-write-dead-letter-v1.schema.json"
FEEDBACK_REVIEW_SCHEMA = "feedback-review-v1.schema.json"
CORRECTION_SCHEMA = "correction-v1.schema.json"
FORECAST_OUTCOME_SCHEMA = "forecast-outcome-v1.schema.json"
CALIBRATION_OBSERVATION_SCHEMA = "calibration-observation-v1.schema.json"

PHASE5_PAYLOAD_SCHEMAS = frozenset(
    {"memory-feedback-review/v1", "memory-correction/v1", "memory-semantic-lesson/v1"}
)
OPERATIONS = frozenset(
    {
        "claim-append",
        "claim-correction",
        "feedback-promotion",
        "feedback-correction",
        "semantic-promotion",
        "semantic-supersession",
    }
)


class Phase5ContractError(ValueError):
    """A Phase 5 object was not eligible for controlled use."""


@functools.lru_cache(maxsize=None)
def _load_schema(name: str) -> dict[str, Any]:
    with (SCHEMA_DIR / name).open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise Phase5ContractError(f"schema {name!r} is not an object")
    return value


def _schema_errors(name: str, value: Any) -> list[str]:
    try:
        schema = _load_schema(name)
        checker = Checker(schema)
        checker.check(schema, value, "")
    except Exception as exc:
        return [f"(root) — schema validation failed closed ({type(exc).__name__})"]
    return checker.errors


def _prefix(errors: Iterable[str], prefix: str) -> list[str]:
    result: list[str] = []
    for error in errors:
        path, separator, message = error.partition(" — ")
        joined = prefix if path == "(root)" else f"{prefix}.{path}"
        result.append(joined + (separator + message if separator else ""))
    return result


def _canonical_errors(value: Any) -> list[str]:
    try:
        canonical_json_bytes(value)
    except (TypeError, ValueError, UnicodeError, RecursionError) as exc:
        return [f"(root) — is not canonical finite JSON: {exc}"]
    return []


def _instant(value: Any, field: str, errors: list[str]) -> dt.datetime | None:
    try:
        return parse_aware_datetime(value).astimezone(dt.timezone.utc)
    except (TypeError, ValueError):
        errors.append(f"{field} — must be an aware canonical date-time")
        return None


def validate_feedback_review_payload(payload: Any) -> list[str]:
    """Validate the closed review payload without consulting an external artifact."""

    errors = _schema_errors(FEEDBACK_REVIEW_SCHEMA, payload)
    errors.extend(_canonical_errors(payload))
    if errors or not isinstance(payload, Mapping):
        return errors
    item_reviews = payload.get("item_reviews")
    if isinstance(item_reviews, list):
        indices = [item.get("item_index") for item in item_reviews if isinstance(item, Mapping)]
        if indices != list(range(len(item_reviews))):
            errors.append(
                "item_reviews — item_index values must be exact, unique, and contiguous from zero"
            )
        item_dispositions = [
            item.get("disposition") for item in item_reviews if isinstance(item, Mapping)
        ]
        disposition = payload.get("disposition")
        if disposition == "rejected" and any(item != "rejected" for item in item_dispositions):
            errors.append("disposition — rejected requires every item to be rejected")
        if disposition == "needs-work" and "needs-work" not in item_dispositions:
            errors.append("disposition — needs-work requires at least one needs-work item")
        if disposition == "accepted" and (
            "accepted" not in item_dispositions or "needs-work" in item_dispositions
        ):
            errors.append(
                "disposition — accepted requires at least one accepted item and no needs-work item"
            )
    expected_retrieval_effect = (
        "reviewed-signal-only" if payload.get("disposition") == "accepted" else "none"
    )
    if payload.get("retrieval_effect") != expected_retrieval_effect:
        errors.append(
            "retrieval_effect — must be reviewed-signal-only only for accepted feedback"
        )
    return errors


def validate_feedback_review(payload: Any, shadow_feedback: Any) -> list[str]:
    """Validate one review against the exact immutable Phase 4 artifact."""

    errors = validate_feedback_review_payload(payload)
    try:
        verify_shadow_feedback(shadow_feedback)
    except (ShadowError, TypeError, RecursionError) as exc:
        errors.append(f"shadow_feedback — {exc}")
    if errors or not isinstance(payload, Mapping) or not isinstance(shadow_feedback, Mapping):
        return errors

    content = shadow_feedback["content"]
    exact_fields = {
        "shadow_feedback_id": shadow_feedback["feedback_id"],
        "shadow_content_sha256": shadow_feedback["content_sha256"],
        "context_packet_id": content["context_packet_id"],
        "packet_sha256": content["packet_sha256"],
        "query_sha256": content["query_sha256"],
    }
    for field, expected in exact_fields.items():
        if payload.get(field) != expected:
            errors.append(f"{field} — must exactly bind the Phase 4 shadow artifact")

    item_reviews = payload.get("item_reviews")
    if isinstance(item_reviews, list):
        if len(item_reviews) != len(content["items"]):
            errors.append(
                "item_reviews — must adjudicate every shadow item exactly once in original order"
            )
    return errors


def validate_correction_payload(payload: Any, shadow_feedback: Any = None) -> list[str]:
    errors = _schema_errors(CORRECTION_SCHEMA, payload)
    errors.extend(_canonical_errors(payload))
    if errors or not isinstance(payload, Mapping):
        return errors
    replacement: Any = None
    raw = payload.get("replacement_canonical_json")
    try:
        replacement = parse_closed_json(raw)
    except (ShadowError, TypeError) as exc:
        errors.append(f"replacement_canonical_json — is not strict JSON: {exc}")
    if replacement is not None:
        try:
            canonical = canonical_json_bytes(replacement).decode("utf-8")
        except (TypeError, ValueError, UnicodeError) as exc:
            errors.append(f"replacement_canonical_json — cannot canonicalize: {exc}")
        else:
            if canonical != raw:
                errors.append("replacement_canonical_json — must be exact canonical JSON")
            actual_hash = "sha256:" + canonical_sha256(replacement)
            if payload.get("replacement_payload_sha256") != actual_hash:
                errors.append(
                    f"replacement_payload_sha256 — must equal {actual_hash}"
                )
        if not isinstance(replacement, Mapping):
            errors.append("replacement_canonical_json — decoded replacement must be an object")
        elif payload.get("replacement_schema") != replacement.get("schema"):
            errors.append("replacement_schema — must equal the decoded replacement schema")

    domain = payload.get("replacement_domain")
    expected_schema = (
        "memory-claim/v1" if domain == "claim" else "memory-feedback-review/v1"
    )
    if payload.get("replacement_schema") != expected_schema:
        errors.append(
            f"replacement_schema — must equal {expected_schema!r} for {domain!r}"
        )
    if isinstance(replacement, Mapping) and domain == "claim":
        errors.extend(_prefix(validate_claim(replacement), "replacement"))
    elif isinstance(replacement, Mapping) and domain == "feedback-review":
        review_errors = (
            validate_feedback_review(replacement, shadow_feedback)
            if shadow_feedback is not None
            else validate_feedback_review_payload(replacement)
        )
        errors.extend(_prefix(review_errors, "replacement"))
    return errors


def correction_replacement(
    payload: Mapping[str, Any], *, shadow_feedback: Any = None
) -> Mapping[str, Any]:
    """Return the already hash-bound strict replacement or fail closed."""

    errors = validate_correction_payload(payload, shadow_feedback)
    if errors:
        raise Phase5ContractError("; ".join(errors))
    value = parse_closed_json(payload["replacement_canonical_json"])
    if not isinstance(value, Mapping):
        raise Phase5ContractError("decoded correction replacement is not an object")
    return value


def validate_phase5_payload(payload: Any, *, shadow_feedback: Any = None) -> list[str]:
    if not isinstance(payload, Mapping):
        return ["(root) — payload must be an object"]
    schema = payload.get("schema")
    if schema == "memory-feedback-review/v1":
        return (
            validate_feedback_review(payload, shadow_feedback)
            if shadow_feedback is not None
            else validate_feedback_review_payload(payload)
        )
    if schema == "memory-correction/v1":
        return validate_correction_payload(payload, shadow_feedback)
    if schema == "memory-semantic-lesson/v1":
        return validate_three_layer_contract(payload)
    return [f"schema — unsupported Phase 5 payload schema {schema!r}"]


def _phase5_event_semantics(
    event: Mapping[str, Any],
    *,
    shadow_feedback: Any,
    event_index: Mapping[str, Mapping[str, Any]] | None,
) -> list[str]:
    errors: list[str] = []
    payload = event.get("payload")
    if not isinstance(payload, Mapping):
        return errors
    schema = payload.get("schema")
    if schema in PHASE5_PAYLOAD_SCHEMAS:
        errors.extend(_prefix(validate_phase5_payload(payload, shadow_feedback=shadow_feedback), "payload"))
    if event.get("run_id") is None:
        errors.append("run_id — controlled writes require an attributable run")
    if event.get("trace_id") is None:
        errors.append("trace_id — controlled writes require an attributable trace")

    producer = event.get("producer")
    if schema == "memory-feedback-review/v1" and isinstance(producer, Mapping):
        reviewer = payload.get("reviewer")
        if not isinstance(reviewer, Mapping) or (
            reviewer.get("kind"), reviewer.get("name")
        ) != (producer.get("kind"), producer.get("name")):
            errors.append("payload.reviewer — must exactly equal the envelope producer identity")
        if payload.get("reviewed_at") != event.get("system_time"):
            errors.append("payload.reviewed_at — must equal envelope system_time")
        if event.get("supersedes") != []:
            errors.append("supersedes — a first feedback review cannot supersede another event")
    elif schema == "memory-correction/v1" and isinstance(producer, Mapping):
        authority = payload.get("authority")
        if not isinstance(authority, Mapping) or (
            authority.get("reviewer_kind"), authority.get("reviewer_name")
        ) != (producer.get("kind"), producer.get("name")):
            errors.append("payload.authority — reviewer must equal the envelope producer identity")
        if (
            not isinstance(authority, Mapping)
            or authority.get("authorized_at") != event.get("system_time")
        ):
            errors.append("payload.authority.authorized_at — must equal envelope system_time")
        if payload.get("target_event_ids") != event.get("supersedes"):
            errors.append("supersedes — must exactly equal payload.target_event_ids in order")
        if payload.get("evidence_refs") != event.get("evidence_refs"):
            errors.append("evidence_refs — must exactly equal payload.evidence_refs in order")
        try:
            replacement = parse_closed_json(payload.get("replacement_canonical_json"))
        except (ShadowError, TypeError):
            replacement = None
        if isinstance(replacement, Mapping) and payload.get("replacement_domain") == "claim":
            replacement_refs = replacement.get("evidence_refs")
            if isinstance(replacement_refs, list) and not set(replacement_refs).issubset(
                set(event.get("evidence_refs", []))
            ):
                errors.append(
                    "evidence_refs — must retain every evidence reference used by the replacement claim"
                )
            if replacement.get("subject_id") not in event.get("subject_ids", []):
                errors.append(
                    "payload.replacement.subject_id — must be one of the correction envelope subjects"
                )

        if event_index is not None:
            expected_types = (
                {"claim.asserted", "claim.corrected"}
                if payload.get("replacement_domain") == "claim"
                else {"feedback.reviewed", "feedback.corrected"}
            )
            effective_targets: list[tuple[int, Mapping[str, Any]]] = []
            for position, target_id in enumerate(payload.get("target_event_ids", [])):
                target = event_index.get(target_id)
                if isinstance(target, Mapping) and target.get("event_type") not in expected_types:
                    errors.append(
                        f"supersedes[{position}] — target event_type is outside the typed correction transition"
                    )
                if isinstance(target, Mapping) and target.get("policy") != event.get("policy"):
                    errors.append(
                        f"supersedes[{position}] — correction policy must exactly equal target policy"
                    )
                if isinstance(target, Mapping) and target.get("subject_ids") != event.get(
                    "subject_ids"
                ):
                    errors.append(
                        f"supersedes[{position}] — correction subject_ids must exactly equal target subject_ids"
                    )
                target_payload = target.get("payload") if isinstance(target, Mapping) else None
                if isinstance(target_payload, Mapping) and target_payload.get("schema") == "memory-correction/v1":
                    target_errors = validate_correction_payload(
                        target_payload, shadow_feedback
                    )
                    if target_errors:
                        errors.append(
                            f"supersedes[{position}] — target correction capsule is invalid"
                        )
                        continue
                    try:
                        target_payload = correction_replacement(
                            target_payload, shadow_feedback=shadow_feedback
                        )
                    except Phase5ContractError:
                        errors.append(
                            f"supersedes[{position}] — target correction capsule cannot be decoded"
                        )
                        continue
                if isinstance(target_payload, Mapping):
                    effective_targets.append((position, target_payload))

            if isinstance(replacement, Mapping):
                domain = payload.get("replacement_domain")
                expected_schema = (
                    "memory-claim/v1" if domain == "claim" else "memory-feedback-review/v1"
                )
                logical_field = "claim_id" if domain == "claim" else "review_id"
                for position, target_payload in effective_targets:
                    if target_payload.get("schema") != expected_schema:
                        errors.append(
                            f"supersedes[{position}] — target effective payload has the wrong domain schema"
                        )
                        continue
                    if target_payload.get(logical_field) != replacement.get(logical_field):
                        errors.append(
                            f"supersedes[{position}] — correction must retain logical {logical_field}"
                        )
                    if domain == "claim" and target_payload.get("subject_id") != replacement.get(
                        "subject_id"
                    ):
                        errors.append(
                            f"supersedes[{position}] — correction must retain the target claim subject_id"
                        )
                    if domain == "feedback-review" and (
                        target_payload.get("shadow_feedback_id"),
                        target_payload.get("shadow_content_sha256"),
                    ) != (
                        replacement.get("shadow_feedback_id"),
                        replacement.get("shadow_content_sha256"),
                    ):
                        errors.append(
                            f"supersedes[{position}] — feedback correction must retain the exact shadow artifact"
                        )
    return errors


def validate_controlled_event(
    event: Any,
    *,
    shadow_feedback: Any = None,
    event_index: Mapping[str, Mapping[str, Any]] | None = None,
) -> list[str]:
    """Validate through the canonical envelope validator, then Phase 5 semantics."""

    try:
        errors = validate_event(event, event_index=event_index)
    except (TypeError, ValueError, UnicodeError, RecursionError) as exc:
        return [f"(root) — canonical event validation failed closed ({type(exc).__name__})"]
    if isinstance(event, Mapping):
        try:
            errors.extend(
                _phase5_event_semantics(
                    event,
                    shadow_feedback=shadow_feedback,
                    event_index=event_index,
                )
            )
        except (TypeError, ValueError, UnicodeError, RecursionError) as exc:
            errors.append(
                f"(root) — Phase 5 event semantics failed closed ({type(exc).__name__})"
            )
    return errors


def effective_phase5_event(
    event: Mapping[str, Any],
    *,
    shadow_feedback: Any = None,
    event_index: Mapping[str, Mapping[str, Any]] | None = None,
) -> dict[str, Any]:
    """Return the typed-payload view a validated projection should index.

    The canonical correction envelope remains the source of event identity, time, policy,
    provenance, edges, and integrity. Only its already hash-bound replacement payload is exposed
    to typed indexes. Callers must retain the original event as the canonical/PIT history row.
    Validation is repeated here so this adapter cannot become a payload-smuggling bypass.
    """

    errors = validate_controlled_event(
        event, shadow_feedback=shadow_feedback, event_index=event_index
    )
    if errors:
        raise Phase5ContractError("; ".join(errors))
    value = copy.deepcopy(dict(event))
    payload = value.get("payload")
    if isinstance(payload, Mapping) and payload.get("schema") == "memory-correction/v1":
        value["payload"] = copy.deepcopy(
            dict(correction_replacement(payload, shadow_feedback=shadow_feedback))
        )
    return value


def _decode_capsule(
    raw: Any,
    expected_sha256: Any,
    *,
    field: str,
) -> tuple[Mapping[str, Any] | None, list[str]]:
    errors: list[str] = []
    try:
        value = parse_closed_json(raw)
    except (ShadowError, TypeError) as exc:
        return None, [f"{field} — is not strict JSON: {exc}"]
    if not isinstance(value, Mapping):
        errors.append(f"{field} — decoded value must be an object")
        return None, errors
    try:
        canonical = canonical_json_bytes(value).decode("utf-8")
        digest = "sha256:" + canonical_sha256(value)
    except (TypeError, ValueError, UnicodeError) as exc:
        return None, [f"{field} — cannot canonicalize: {exc}"]
    if canonical != raw:
        errors.append(f"{field} — must contain exact canonical JSON")
    if expected_sha256 != digest:
        errors.append(f"{field}_sha256 — must equal {digest}")
    return value, errors


def request_event(request: Mapping[str, Any]) -> Mapping[str, Any]:
    """Decode and hash-check the request's closed event capsule."""

    value, errors = _decode_capsule(
        request.get("event_canonical_json"),
        request.get("event_sha256"),
        field="event_canonical_json",
    )
    if errors or value is None:
        raise Phase5ContractError("; ".join(errors))
    return value


def request_shadow_feedback(request: Mapping[str, Any]) -> Mapping[str, Any] | None:
    """Decode and hash-check the optional immutable Phase 4 feedback capsule."""

    raw = request.get("shadow_feedback_canonical_json")
    digest = request.get("shadow_feedback_sha256")
    if raw is None and digest is None:
        return None
    if raw is None or digest is None:
        raise Phase5ContractError(
            "shadow feedback canonical JSON and digest must either both be null or both be present"
        )
    value, errors = _decode_capsule(raw, digest, field="shadow_feedback_canonical_json")
    if errors or value is None:
        raise Phase5ContractError("; ".join(errors))
    return value


def request_promotion_manifest(request: Mapping[str, Any]) -> Mapping[str, Any] | None:
    """Decode and hash-check the optional signed PR activation commitment."""

    raw = request.get("promotion_manifest_canonical_json")
    digest = request.get("promotion_manifest_sha256")
    if raw is None and digest is None:
        return None
    if raw is None or digest is None:
        raise Phase5ContractError(
            "promotion manifest canonical JSON and digest must either both be null or both be present"
        )
    value, errors = _decode_capsule(
        raw, digest, field="promotion_manifest_canonical_json"
    )
    if errors or value is None:
        raise Phase5ContractError("; ".join(errors))
    manifest_errors = validate_three_layer_contract(value)
    if manifest_errors:
        raise Phase5ContractError(
            "promotion_manifest_canonical_json — "
            + "; ".join(manifest_errors[:12])
        )
    return value


def validate_write_request(
    request: Any,
    *,
    event_index: Mapping[str, Mapping[str, Any]] | None = None,
) -> list[str]:
    errors = _schema_errors(WRITE_REQUEST_SCHEMA, request)
    errors.extend(_canonical_errors(request))
    if errors or not isinstance(request, Mapping):
        return errors
    try:
        event = request_event(request)
    except Phase5ContractError as exc:
        errors.append(str(exc))
        event = None
    try:
        shadow_feedback = request_shadow_feedback(request)
    except Phase5ContractError as exc:
        errors.append(str(exc))
        shadow_feedback = None
    try:
        promotion_manifest = request_promotion_manifest(request)
    except Phase5ContractError as exc:
        errors.append(str(exc))
        promotion_manifest = None
    if errors or event is None:
        return errors
    errors.extend(
        _prefix(
            validate_controlled_event(
                event,
                shadow_feedback=shadow_feedback,
                event_index=event_index,
            ),
            "event",
        )
    )
    if not isinstance(event, Mapping):
        return errors
    operation = request.get("operation")
    if operation in {"feedback-promotion", "feedback-correction"} and shadow_feedback is None:
        errors.append(
            "shadow_feedback_canonical_json — controlled feedback writes require the exact Phase 4 artifact"
        )
    if operation in {"semantic-promotion", "semantic-supersession"} and promotion_manifest is None:
        errors.append(
            "promotion_manifest_canonical_json — controlled semantic writes require the signed PR activation commitment"
        )
    payload = event.get("payload")
    payload_schema = payload.get("schema") if isinstance(payload, Mapping) else None
    event_type = event.get("event_type")
    expected = {
        "claim-append": ("claim.asserted", "memory-claim/v1"),
        "claim-correction": ("claim.corrected", "memory-correction/v1"),
        "feedback-promotion": ("feedback.reviewed", "memory-feedback-review/v1"),
        "feedback-correction": ("feedback.corrected", "memory-correction/v1"),
        "semantic-promotion": ("semantic.activated", "memory-semantic-lesson/v1"),
        "semantic-supersession": ("semantic.activated", "memory-semantic-lesson/v1"),
    }.get(operation)
    if expected is not None and (event_type, payload_schema) != expected:
        errors.append(
            f"operation — {operation!r} requires event_type/payload {expected!r}"
        )
    if operation == "claim-append" and event.get("supersedes") != []:
        errors.append("event.supersedes — claim-append must not supersede an event")
    if operation == "semantic-promotion" and event.get("supersedes") != []:
        errors.append("event.supersedes — first semantic promotion must not supersede an event")
    if operation == "semantic-supersession" and len(event.get("supersedes", [])) != 1:
        errors.append("event.supersedes — semantic supersession requires exactly one prior lesson event")
    if operation in {"semantic-promotion", "semantic-supersession"} and isinstance(payload, Mapping):
        if payload.get("status") != "active":
            errors.append("event.payload.status — controlled semantic activation requires active status")
        if payload.get("policy") != event.get("policy"):
            errors.append("event.policy — must exactly equal the semantic lesson policy")
        semantic = payload.get("semantic") if isinstance(payload.get("semantic"), Mapping) else {}
        expected_refs = sorted(
            set(semantic.get("supporting_evidence", []))
            | set(semantic.get("contradicting_evidence", []))
        )
        if sorted(event.get("evidence_refs", [])) != expected_refs:
            errors.append(
                "event.evidence_refs — must exactly bind supporting and contradicting semantic evidence"
            )
        if isinstance(promotion_manifest, Mapping) and (
            promotion_manifest.get("candidate_kind") != "semantic"
            or promotion_manifest.get("target_schema") != "memory-semantic-lesson/v1"
            or promotion_manifest.get("target_id") != payload.get("lesson_id")
            or promotion_manifest.get("target_version") != payload.get("version")
            or promotion_manifest.get("activation_content_sha256")
            != payload.get("lesson_sha256")
        ):
            errors.append(
                "promotion_manifest_canonical_json — does not authorize this exact semantic lesson"
            )
    if operation in {"claim-correction", "feedback-correction"} and isinstance(payload, Mapping):
        expected_domain = "claim" if operation == "claim-correction" else "feedback-review"
        if payload.get("replacement_domain") != expected_domain:
            errors.append(
                f"event.payload.replacement_domain — must equal {expected_domain!r}"
            )
    if request.get("submitted_at") != event.get("system_time"):
        errors.append("submitted_at — must exactly equal event.system_time")
    return errors


def validate_write_result(result: Any) -> list[str]:
    return _schema_errors(WRITE_RESULT_SCHEMA, result) + _canonical_errors(result)


def validate_dead_letter(dead_letter: Any) -> list[str]:
    return _schema_errors(DEAD_LETTER_SCHEMA, dead_letter) + _canonical_errors(dead_letter)


def forecast_outcome_payload_sha256(outcome: Mapping[str, Any]) -> str:
    unsigned = copy.deepcopy(dict(outcome))
    unsigned.pop("integrity", None)
    return "sha256:" + canonical_sha256(unsigned)


def forecast_source_commitment(
    record: Mapping[str, Any],
    source_event: Mapping[str, Any],
    record_integrity: Mapping[str, Any],
    *,
    integrity_verifier: Any,
) -> dict[str, Any]:
    """Commit to an out-of-band verifier's exact decision-record attestation."""

    errors: list[str] = []
    errors.extend(_prefix(validate_event(source_event), "source_event"))
    if not isinstance(source_event, Mapping):
        raise Phase5ContractError("; ".join(errors or ["source_event — must be an object"]))
    if source_event.get("event_type") != "decision.recorded":
        errors.append("source_event.event_type — must equal 'decision.recorded'")
    run_id = source_event.get("run_id")
    if not isinstance(run_id, str):
        errors.append("source_event.run_id — a source decision requires an attributable run")
    event_payload = source_event.get("payload")
    event_record = event_payload.get("record") if isinstance(event_payload, Mapping) else None
    try:
        exact_record_match = canonical_json_bytes(event_record) == canonical_json_bytes(record)
    except (TypeError, ValueError, UnicodeError, RecursionError):
        exact_record_match = False
    if not exact_record_match:
        errors.append(
            "source_event.payload.record — must have exactly the supplied canonical decision-record bytes"
        )
    integrity_fields = {
        "status", "verdict", "integrity_score", "banner", "report_file"
    }
    if not isinstance(record_integrity, Mapping):
        errors.append("record_integrity — must be an object")
    elif set(record_integrity) != integrity_fields:
        errors.append("record_integrity — must be the closed ledger_records integrity result")
    elif record_integrity.get("status") != "verified":
        errors.append(
            "record_integrity.status — calibration admission requires a verified source record"
        )
    elif (
        record_integrity.get("banner") is not False
        or not isinstance(record_integrity.get("verdict"), str)
        or record_integrity["verdict"].strip() not in {"Clean", "Minor issues"}
        or not isinstance(record_integrity.get("report_file"), str)
        or not record_integrity["report_file"]
    ):
        errors.append("record_integrity — verified status lacks the exact clean audit fields")
    try:
        record_sha256 = "sha256:" + canonical_sha256(record)
        event_sha256 = "sha256:" + canonical_sha256(source_event)
        integrity_sha256 = "sha256:" + canonical_sha256(record_integrity)
    except (TypeError, ValueError, UnicodeError) as exc:
        errors.append(f"source commitment — cannot canonicalize exact inputs: {exc}")
    if errors:
        raise Phase5ContractError("; ".join(errors))
    if not callable(integrity_verifier):
        raise Phase5ContractError(
            "integrity_verifier — an out-of-band exact-record verifier is required"
        )
    try:
        attestation = integrity_verifier(
            record=copy.deepcopy(dict(record)),
            source_event=copy.deepcopy(dict(source_event)),
            record_integrity=copy.deepcopy(dict(record_integrity)),
        )
    except Exception as exc:
        raise Phase5ContractError(
            f"integrity_verifier — exact-record verification failed closed ({type(exc).__name__})"
        ) from exc
    attestation_fields = {
        "schema", "verifier_id", "decision_event_sha256", "record_sha256",
        "record_integrity_sha256", "status",
    }
    if not isinstance(attestation, Mapping) or set(attestation) != attestation_fields:
        raise Phase5ContractError(
            "integrity_verifier — returned an open or incomplete attestation"
        )
    if (
        attestation.get("schema") != "memory-record-integrity-attestation/v1"
        or attestation.get("status") != "verified"
        or not isinstance(attestation.get("verifier_id"), str)
        or not attestation["verifier_id"]
        or len(attestation["verifier_id"]) > 128
        or attestation.get("decision_event_sha256") != event_sha256
        or attestation.get("record_sha256") != record_sha256
        or attestation.get("record_integrity_sha256") != integrity_sha256
    ):
        raise Phase5ContractError(
            "integrity_verifier — attestation does not bind the exact event, record, and integrity result"
        )
    try:
        attestation_sha256 = "sha256:" + canonical_sha256(attestation)
    except (TypeError, ValueError, UnicodeError) as exc:
        raise Phase5ContractError(
            "integrity_verifier — attestation is not finite canonical JSON"
        ) from exc
    return {
        "decision_event_id": source_event["event_id"],
        "decision_run_id": run_id,
        "decision_event_sha256": event_sha256,
        "record_sha256": record_sha256,
        "record_integrity_sha256": integrity_sha256,
        "record_integrity_status": "verified",
        "record_integrity_attestation_sha256": attestation_sha256,
        "record_integrity_verifier_id": attestation["verifier_id"],
    }


def validate_forecast_outcome(outcome: Any) -> list[str]:
    errors = _schema_errors(FORECAST_OUTCOME_SCHEMA, outcome)
    errors.extend(_canonical_errors(outcome))
    if errors or not isinstance(outcome, Mapping):
        return errors
    integrity = outcome.get("integrity")
    if isinstance(integrity, Mapping):
        actual = forecast_outcome_payload_sha256(outcome)
        if integrity.get("payload_sha256") != actual:
            errors.append(f"integrity.payload_sha256 — must equal {actual}")
    observed = _instant(outcome.get("observed_at"), "observed_at", errors)
    recorded = _instant(outcome.get("recorded_at"), "recorded_at", errors)
    if observed is not None and recorded is not None and recorded < observed:
        errors.append("recorded_at — must not precede observed_at")
    return errors


def validate_calibration_observation(observation: Any) -> list[str]:
    return _schema_errors(CALIBRATION_OBSERVATION_SCHEMA, observation) + _canonical_errors(
        observation
    )


def eligible_forecast_outcome(
    record: Mapping[str, Any],
    forecast: Mapping[str, Any],
    outcome: Mapping[str, Any],
    *,
    source_event: Mapping[str, Any],
    record_integrity: Mapping[str, Any],
    integrity_verifier: Any,
    outcome_verifier: Any,
    as_of: str,
) -> dict[str, Any]:
    """Return one existing-calibration-compatible pair after strict integrity/timing gates.

    ``record_integrity`` is the exact result attached by ``ledger_records``. A required trusted
    verifier must return a closed attestation binding that result to the canonical decision event
    and normalized record; a loose ``{"status": "verified"}`` is ineligible. The
    adapter invokes ``calibrate.match_resolved_forecasts`` instead of reimplementing probability
    scale, result matching, or thesis/module bucketing semantics.
    """

    errors = validate_forecast_outcome(outcome)
    if not isinstance(record, Mapping) or not isinstance(forecast, Mapping):
        errors.append("record/forecast — must be objects")
    as_of_time = _instant(as_of, "as_of", errors)
    if errors:
        raise Phase5ContractError("; ".join(errors))

    source_commitment = forecast_source_commitment(
        record, source_event, record_integrity, integrity_verifier=integrity_verifier
    )
    if outcome.get("source_commitment") != source_commitment:
        errors.append(
            "source_commitment — does not bind the exact supplied decision event, record, and integrity"
        )

    ledger = record.get("forecast_ledger")
    matches: list[int] = []
    try:
        supplied_forecast_bytes = canonical_json_bytes(forecast)
    except (TypeError, ValueError, UnicodeError, RecursionError):
        supplied_forecast_bytes = None
    if isinstance(ledger, list):
        for position, candidate in enumerate(ledger):
            try:
                if supplied_forecast_bytes is not None and canonical_json_bytes(
                    candidate
                ) == supplied_forecast_bytes:
                    matches.append(position)
            except (TypeError, ValueError, UnicodeError, RecursionError):
                continue
    if len(matches) != 1:
        errors.append(
            "record.forecast_ledger — must contain the exact canonical forecast bytes exactly once"
        )

    authoritative_forecast: Mapping[str, Any] | None = None
    if len(matches) == 1 and isinstance(ledger, list):
        candidate = ledger[matches[0]]
        if isinstance(candidate, Mapping):
            authoritative_forecast = candidate
        else:
            errors.append("record.forecast_ledger — admitted forecast must be an object")
    if authoritative_forecast is None:
        authoritative_forecast = forecast
    try:
        forecast_digest = "sha256:" + canonical_sha256(authoritative_forecast)
    except (TypeError, ValueError, UnicodeError, RecursionError):
        forecast_digest = "sha256:" + "0" * 64
        errors.append("forecast — authoritative ledger candidate is not canonical JSON")
    if outcome.get("forecast_sha256") != forecast_digest:
        errors.append("forecast_sha256 — does not bind the exact ledger forecast bytes")
    if outcome.get("forecast_id") != authoritative_forecast.get("forecast_id"):
        errors.append("forecast_id — does not equal the authoritative forecast ledger ID")

    status_at = _instant(
        authoritative_forecast.get("status_as_of"), "forecast.status_as_of", errors
    )
    window_start = _instant(
        authoritative_forecast.get("window_start"), "forecast.window_start", errors
    )
    window_end = _instant(
        authoritative_forecast.get("window_end"), "forecast.window_end", errors
    )
    observed = _instant(outcome.get("observed_at"), "outcome.observed_at", errors)
    recorded = _instant(outcome.get("recorded_at"), "outcome.recorded_at", errors)
    if (
        status_at is not None
        and window_start is not None
        and window_end is not None
        and not status_at <= window_start <= window_end
    ):
        errors.append("forecast timing — must satisfy status_as_of <= window_start <= window_end")
    if status_at is not None and observed is not None and observed <= status_at:
        errors.append("outcome.observed_at — must be strictly later than forecast.status_as_of")
    if recorded is not None and as_of_time is not None and recorded > as_of_time:
        errors.append("outcome.recorded_at — cannot be later than the trusted as_of clock")
    if outcome.get("status") == "expired":
        if observed is not None and window_end is not None and observed < window_end:
            errors.append("outcome.observed_at — an expired forecast cannot settle before window_end")
    elif observed is not None and window_start is not None and window_end is not None:
        if not window_start <= observed <= window_end:
            errors.append(
                "outcome.observed_at — confirmed/falsified outcomes must fall inside the declared window"
            )
    if errors:
        raise Phase5ContractError("; ".join(errors))

    if not callable(outcome_verifier):
        raise Phase5ContractError(
            "outcome_verifier — an out-of-band exact-outcome/evidence attestor is required"
        )
    unsigned_outcome_sha256 = forecast_outcome_payload_sha256(outcome)
    evidence_refs_sha256 = "sha256:" + canonical_sha256(outcome["evidence_refs"])
    try:
        outcome_attestation = outcome_verifier(
            outcome=copy.deepcopy(dict(outcome)),
            trusted_as_of=as_of,
        )
    except Exception as exc:
        raise Phase5ContractError(
            f"outcome_verifier — exact outcome verification failed closed ({type(exc).__name__})"
        ) from exc
    attestation_fields = {
        "schema",
        "attestor_id",
        "unsigned_outcome_sha256",
        "evidence_refs_sha256",
        "evidence_verification_sha256",
        "trusted_as_of",
        "status",
    }
    if not isinstance(outcome_attestation, Mapping) or set(outcome_attestation) != attestation_fields:
        raise Phase5ContractError(
            "outcome_verifier — returned an open or incomplete attestation"
        )
    attestor_id = outcome_attestation.get("attestor_id")
    evidence_verification_sha256 = outcome_attestation.get(
        "evidence_verification_sha256"
    )
    if (
        outcome_attestation.get("schema")
        != "memory-forecast-outcome-attestation/v1"
        or outcome_attestation.get("status") != "verified"
        or not isinstance(attestor_id, str)
        or not attestor_id
        or len(attestor_id) > 128
        or outcome_attestation.get("unsigned_outcome_sha256")
        != unsigned_outcome_sha256
        or outcome_attestation.get("evidence_refs_sha256") != evidence_refs_sha256
        or not isinstance(evidence_verification_sha256, str)
        or not evidence_verification_sha256.startswith("sha256:")
        or len(evidence_verification_sha256) != 71
        or outcome_attestation.get("trusted_as_of") != as_of
    ):
        raise Phase5ContractError(
            "outcome_verifier — attestation does not bind the exact unsigned outcome, resolved evidence, and trusted as_of"
        )
    try:
        int(evidence_verification_sha256[7:], 16)
        outcome_attestation_sha256 = "sha256:" + canonical_sha256(
            outcome_attestation
        )
    except (TypeError, ValueError, UnicodeError, RecursionError) as exc:
        raise Phase5ContractError(
            "outcome_verifier — attestation is not finite canonical JSON"
        ) from exc

    synthetic_review = {
        "review_date": outcome["recorded_at"][:10],
        "forecast_results": [
            {
                "forecast_index": matches[0] + 1,
                "prediction": authoritative_forecast.get("prediction"),
                "status": outcome.get("status"),
            }
        ],
    }
    pairs = match_resolved_forecasts(record, [synthetic_review])
    if len(pairs) != 1:
        raise Phase5ContractError(
            "existing calibration join did not resolve exactly one unambiguous forecast"
        )
    pair = pairs[0]
    observation = {
        "schema": "memory-calibration-observation/v1",
        "eligible": True,
        "eligibility_basis": (
            "calibrate.match_resolved_forecasts+verified-integrity+timing/v1"
        ),
        "forecast_id": outcome["forecast_id"],
        "forecast_ledger_index": matches[0],
        "outcome_id": outcome["outcome_id"],
        "forecast_sha256": forecast_digest,
        "outcome_payload_sha256": outcome["integrity"]["payload_sha256"],
        "source_commitment": copy.deepcopy(source_commitment),
        "outcome_provenance": {
            "evidence_refs": copy.deepcopy(outcome["evidence_refs"]),
            "integrity_status": outcome["integrity"]["status"],
            "verifier_id": outcome["integrity"]["verifier_id"],
            "outcome_attestation_sha256": outcome_attestation_sha256,
            "outcome_attestor_id": attestor_id,
            "evidence_verification_sha256": evidence_verification_sha256,
            "trusted_as_of": as_of,
        },
        "prob": pair["prob"],
        "realized": pair["realized"],
        "owner_module": pair["owner_module"],
        "forecast_type": pair["forecast_type"],
        "thesis_type": pair["thesis_type"],
        "ticker": pair["ticker"],
        "observed_at": outcome["observed_at"],
        "recorded_at": outcome["recorded_at"],
    }
    observation_errors = validate_calibration_observation(observation)
    if observation_errors:
        raise Phase5ContractError("; ".join(observation_errors))
    return observation


__all__ = [
    "CALIBRATION_OBSERVATION_SCHEMA",
    "CORRECTION_SCHEMA",
    "DEAD_LETTER_SCHEMA",
    "FEEDBACK_REVIEW_SCHEMA",
    "FORECAST_OUTCOME_SCHEMA",
    "OPERATIONS",
    "PHASE5_PAYLOAD_SCHEMAS",
    "Phase5ContractError",
    "WRITE_REQUEST_SCHEMA",
    "WRITE_RESULT_SCHEMA",
    "correction_replacement",
    "effective_phase5_event",
    "eligible_forecast_outcome",
    "forecast_outcome_payload_sha256",
    "forecast_source_commitment",
    "request_event",
    "request_shadow_feedback",
    "validate_calibration_observation",
    "validate_controlled_event",
    "validate_correction_payload",
    "validate_dead_letter",
    "validate_feedback_review",
    "validate_feedback_review_payload",
    "validate_forecast_outcome",
    "validate_phase5_payload",
    "validate_write_request",
    "validate_write_result",
]
