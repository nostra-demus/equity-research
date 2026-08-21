#!/usr/bin/env python3
"""Structural closure and runtime parity checks for Phase 4 JSON contracts."""
from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any

from memory_mcp_server import tool_definition
from memory_shadow import (
    RECALL_EVENT_TYPES,
    ShadowError,
    ShadowRequest,
    access_scope_from_dict,
    seal_shadow_feedback,
    verify_shadow_feedback,
)


ROOT = Path(__file__).resolve().parents[1]
SCHEMAS = (
    "shadow-request-v1.schema.json",
    "shadow-response-v1.schema.json",
    "shadow-access-scope-v1.schema.json",
    "shadow-feedback-v1.schema.json",
)


def _walk(value: Any):
    yield value
    if isinstance(value, dict):
        for nested in value.values():
            yield from _walk(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from _walk(nested)


def _expect_error(fn, contains: str) -> None:
    try:
        fn()
    except ShadowError as exc:
        assert contains in str(exc), str(exc)
        return
    raise AssertionError(f"expected ShadowError containing {contains!r}")


def main() -> None:
    for name in SCHEMAS:
        schema = json.loads(
            (ROOT / "frameworks" / "memory" / name).read_text(encoding="utf-8")
        )
        assert schema["$schema"] == "http://json-schema.org/draft-07/schema#"
        assert schema["$id"] == f"frameworks/memory/{name}"
        assert schema["additionalProperties"] is False
        for node in _walk(schema):
            if isinstance(node, dict) and node.get("type") == "object":
                assert node.get("additionalProperties") is False, (name, node)

    query = {
        "schema": "memory-query-spec/v1",
        "task": "Recall prior decisions, open forecasts, and corrections",
        "requesting_module": "synthesizer",
        "query_text": "decision forecast correction",
        "subject_ids": ["entity:internal:test"],
        "as_of_system_time": "2026-08-21T00:00:00Z",
        "valid_time": {"from": "2025-01-01", "to": "2026-08-21"},
        "permitted_source_tiers": [10],
        "permitted_classifications": ["internal"],
        "event_types": list(RECALL_EVENT_TYPES),
        "record_types": ["legacy-adapter"],
        "reporting_basis": None,
        "currency": None,
        "metric": None,
        "segment": None,
        "max_results": 10,
        "max_context_tokens": 10000,
    }
    request = {"schema": "memory-shadow-request/v1", "query": query}
    parsed = ShadowRequest.from_dict(request)
    normalized_request = parsed.to_dict()
    assert ShadowRequest.from_dict(normalized_request).to_dict() == normalized_request
    hostile_request = copy.deepcopy(request)
    hostile_request["access_scope"] = {"classifications": ["restricted"]}
    _expect_error(lambda: ShadowRequest.from_dict(hostile_request), "exactly schema and query")

    scope = {
        "schema": "memory-shadow-access-scope/v1",
        "scope_id": "schema-test",
        "policy_version": "2026-08-21",
        "classifications": ["internal"],
        "source_tiers": [10],
        "embedding_classifications": [],
        "entitlement_ids": [],
    }
    assert access_scope_from_dict(scope).classifications == ("internal",)
    hostile_scope = dict(scope)
    hostile_scope["principal"] = "untrusted"
    _expect_error(lambda: access_scope_from_dict(hostile_scope), "exactly the v1 fields")
    duplicate_entitlement_scope = copy.deepcopy(scope)
    duplicate_entitlement_scope["entitlement_ids"] = ["licensed-feed", "licensed-feed"]
    _expect_error(
        lambda: access_scope_from_dict(duplicate_entitlement_scope), "unique bounded"
    )
    oversized_entitlement_scope = copy.deepcopy(scope)
    oversized_entitlement_scope["entitlement_ids"] = [
        f"entitlement-{position}" for position in range(10_001)
    ]
    _expect_error(
        lambda: access_scope_from_dict(oversized_entitlement_scope), "unique bounded"
    )

    feedback_content = {
        "context_packet_id": "context-packet_00000000-0000-5000-8000-000000000001",
        "packet_sha256": "sha256:" + "a" * 64,
        "query_sha256": "sha256:" + "b" * 64,
        "client_id": "schema-test-client",
        "observed_at": "2026-08-21T00:00:00Z",
        "items": [
            {
                "category": "missing",
                "event_id": None,
                "evidence_id": None,
                "note": "The packet did not contain the next scheduled review.",
            }
        ],
        "status": "inert-shadow-only",
        "canonical_write": "none",
        "rating_effect": "none",
    }
    artifact = seal_shadow_feedback(feedback_content)
    verify_shadow_feedback(artifact)
    admitted = copy.deepcopy(feedback_content)
    admitted["canonical_write"] = "append"
    _expect_error(lambda: seal_shadow_feedback(admitted), "must remain inert")

    tool = tool_definition()
    assert tool["inputSchema"]["additionalProperties"] is False
    assert tool["outputSchema"]["additionalProperties"] is False
    for schema_name in ("inputSchema", "outputSchema"):
        for node in _walk(tool[schema_name]):
            if isinstance(node, dict) and "$ref" in node:
                assert node["$ref"].startswith("#"), (schema_name, node["$ref"])
            if isinstance(node, dict) and node.get("type") == "object":
                assert node.get("additionalProperties") is False, (schema_name, node)
    restrictions = tool["inputSchema"]["properties"]["query"]["properties"]
    assert restrictions["event_types"]["const"] == list(RECALL_EVENT_TYPES)
    assert restrictions["record_types"]["const"] == ["legacy-adapter"]
    assert all(
        restrictions[field]["const"] is None
        for field in ("reporting_basis", "currency", "metric", "segment")
    )

    print("memory shadow schema tests: PASS")


if __name__ == "__main__":
    main()
