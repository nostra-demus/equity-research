#!/usr/bin/env python3
"""Runtime semantic and trust-boundary regressions for permanent-memory Phase 2."""
from __future__ import annotations

import base64
import copy
import sys
import unittest
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

import memory_phase2 as phase2  # noqa: E402
from canonical_json import canonical_json_bytes  # noqa: E402
from memory_contract import (  # noqa: E402
    build_trust_resolver,
    seal_event,
    validate_object_manifest,
)
from test_memory_phase2_schemas import (  # noqa: E402
    UUID1,
    UUID2,
    UUID3,
    UUID4,
    evidence_v2,
    extraction_artifact,
    hash_ref,
    object_id,
    source_v2,
)


SIGNER = "producer:memory.phase2-authority"
KEY_ID = f"key_{UUID1}"
SIGNATURE_VALUE = base64.urlsafe_b64encode(bytes(range(64))).rstrip(b"=").decode("ascii")
PUBLIC_KEY = base64.urlsafe_b64encode(bytes(range(32))).rstrip(b"=").decode("ascii")
UUID5 = "018f6f78-89ab-7cde-8f01-23456789abce"


def valid_source() -> dict[str, Any]:
    value = source_v2()
    value["acquired_at"] = "2026-08-21T04:00:00Z"
    return value


def exact_manifest_pointer(manifest: dict[str, Any]) -> dict[str, Any]:
    return {
        "object_id": manifest["object_id"],
        "acquisition_id": manifest["acquisition_id"],
        "source_version_id": manifest["source_version_id"],
        "manifest_sha256": phase2.canonical_record_sha256(manifest),
    }


def source_manifest(source: dict[str, Any] | None = None) -> dict[str, Any]:
    source = copy.deepcopy(source) if source is not None else valid_source()
    digest = source["content_sha256"].removeprefix("sha256:")
    return {
        "schema": "memory-object-manifest/v1",
        "object_id": source["source_object_id"],
        "acquisition_id": source["acquisition_id"],
        "source_version_id": source["source_version_id"],
        "object_kind": "source",
        "content_sha256": source["content_sha256"],
        "byte_length": source["byte_length"],
        "media_type": source["mime_type"],
        "locator": {
            "kind": "repository-path",
            "value": f"objects/sha256/{digest}",
            "version_id": source["content_sha256"],
        },
        "source_lineage": {
            "source_id": f"source:sha256:{digest}",
            "source_object": None,
            "derived_from_objects": [],
        },
        "provenance": {
            "producer": {
                "producer_id": "producer:memory.source-intake",
                "kind": "system",
                "name": "memory-source-intake",
            },
            "run_id": f"run_{UUID1}",
            "tool": None,
            "extraction": None,
            "prompt_program": None,
            "context_packet": None,
        },
        "created_at": source["acquired_at"],
        "policy": {
            "classification": source["licence"]["classification"],
            "retention": "permanent",
            "retain_until": None,
        },
    }


def output_manifest(
    artifact: dict[str, Any] | None = None,
    source_object_manifest: dict[str, Any] | None = None,
) -> dict[str, Any]:
    artifact = copy.deepcopy(artifact) if artifact is not None else extraction_artifact()
    source_object_manifest = (
        copy.deepcopy(source_object_manifest)
        if source_object_manifest is not None
        else source_manifest()
    )
    pointer = exact_manifest_pointer(source_object_manifest)
    digest = artifact["output_object"]["content_sha256"].removeprefix("sha256:")
    return {
        "schema": "memory-object-manifest/v1",
        "object_id": artifact["output_object"]["object_id"],
        "acquisition_id": artifact["acquisition_id"],
        "source_version_id": artifact["source_version_id"],
        "object_kind": "extraction",
        "content_sha256": artifact["output_object"]["content_sha256"],
        "byte_length": artifact["output_object"]["byte_length"],
        "media_type": artifact["output_object"]["media_type"],
        "locator": {
            "kind": "repository-path",
            "value": f"objects/sha256/{digest}",
            "version_id": artifact["output_object"]["content_sha256"],
        },
        "source_lineage": {
            "source_id": "source:sha256:"
            + source_object_manifest["content_sha256"].removeprefix("sha256:"),
            "source_object": pointer,
            "derived_from_objects": [pointer],
        },
        "provenance": {
            "producer": {
                "producer_id": "producer:memory.synthetic-extractor",
                "kind": "system",
                "name": "memory-synthetic-extractor",
            },
            "run_id": artifact["run_id"],
            "tool": {
                "tool_id": artifact["tool"]["tool_id"],
                "version": artifact["tool"]["version"],
                "sha256": artifact["tool"]["artifact_sha256"],
            },
            "extraction": {
                "extraction_id": artifact["extraction_id"],
                "method": artifact["method"],
                "sha256": artifact["output_object"]["content_sha256"],
            },
            "prompt_program": None,
            "context_packet": None,
        },
        "created_at": artifact["created_at"],
        "policy": {
            "classification": "public",
            "retention": "permanent",
            "retain_until": None,
        },
    }


def event(
    event_uuid: str,
    *,
    system_time: str,
    derived_from: list[str] | None = None,
    payload: dict[str, Any] | None = None,
    policy: dict[str, Any] | None = None,
) -> dict[str, Any]:
    row = {
        "schema": "memory-event/v1",
        "event_id": f"evt_{event_uuid}",
        "event_type": "decision.recorded",
        "subject_ids": ["entity:internal:synthetic-issuer"],
        "valid_time": {"from": "2026-08-21", "to": None},
        "system_time": system_time,
        "producer": {
            "kind": "system",
            "name": "memory-phase2-test",
            "runtime": "python",
            "model": None,
            "prompt_program_sha": None,
        },
        "run_id": f"run_{UUID1}",
        "trace_id": "1" * 32,
        "payload": payload
        or {
            "legacy_schema": "decision-record/v1",
            "source_path": "synthetic/decision.json",
            "record": {"decision": "Research More"},
        },
        "evidence_refs": [],
        "derived_from": derived_from or [],
        "supersedes": [],
        "integrity": {"payload_sha256": "0" * 64, "signature": None},
        "policy": policy
        or {"classification": "licensed", "retention": "source-policy", "retain_until": None},
    }
    return seal_event(row)


def tombstone_event(
    target_event_id: str,
    *,
    event_uuid: str = UUID4,
    system_time: str = "2026-08-21T05:09:00Z",
) -> dict[str, Any]:
    payload = {
        "schema": "memory-tombstone/v1",
        "target_event_id": target_event_id,
        "reason_code": "retention-ended",
        "basis": "retention-policy",
        "basis_id": None,
    }
    row = event(
        event_uuid,
        system_time=system_time,
        payload=payload,
        policy={
            "classification": "internal",
            "retention": "tombstone-only",
            "retain_until": None,
        },
    )
    row["event_type"] = "tombstone.recorded"
    row["supersedes"] = [target_event_id]
    return seal_event(row)


def signature() -> dict[str, Any]:
    return {
        "algorithm": "ed25519",
        "key_id": KEY_ID,
        "signed_sha256": hash_ref("0"),
        "value": SIGNATURE_VALUE,
    }


def retired_key(manifest: dict[str, Any]) -> phase2.RetiredObjectKey:
    return phase2.RetiredObjectKey(
        object_id=manifest["object_id"],
        content_sha256=manifest["content_sha256"],
        manifest_sha256=phase2.canonical_record_sha256(manifest),
        acquisition_id=manifest["acquisition_id"],
        source_version_id=manifest["source_version_id"],
    )


def checkpoint_snapshot(
    *,
    manifests: list[dict[str, Any]],
    events: list[dict[str, Any]],
    receipts: list[dict[str, Any]],
    tombstones: list[dict[str, Any]],
    authenticated_receipts: tuple[str, ...] = (),
    retired_events: tuple[str, ...] = (),
    retired_objects: tuple[phase2.RetiredObjectKey, ...] = (),
) -> phase2.CheckpointSnapshot:
    return phase2.CheckpointSnapshot(
        collections={
            "manifests": manifests,
            "events": events,
            "receipts": receipts,
            "tombstones": tombstones,
        },
        complete=True,
        authenticated_receipt_sha256=authenticated_receipts,
        retired_event_ids=retired_events,
        retired_object_keys=retired_objects,
    )


def checkpoint(
    checkpoint_uuid: str,
    *,
    mode: str,
    sequence: int,
    purge_high_water: int,
    created_at: str,
    snapshot: phase2.CheckpointSnapshot,
    prior: dict[str, Any] | None,
) -> dict[str, Any]:
    row = {
        "schema": "memory-store-checkpoint/v1",
        "checkpoint_id": f"checkpoint_{checkpoint_uuid}",
        "mode": mode,
        "sequence": sequence,
        "purge_high_water": purge_high_water,
        "created_at": created_at,
        "prior_checkpoint": phase2.checkpoint_pointer(prior) if prior is not None else None,
        "canonicalization": {
            "json": "memory-canonical-json/v1",
            "record_order": "lexicographic-record-id",
            "set_digest": "sha256-canonical-array/v1",
        },
        "commitments": phase2.canonical_store_commitments(snapshot.collections),
        "retired_state": phase2.canonical_retired_state(snapshot),
        "store_root_sha256": hash_ref("0"),
        "signer_id": SIGNER,
        "signature": signature(),
    }
    row["store_root_sha256"] = phase2.store_root_sha256(row)
    row["signature"]["signed_sha256"] = phase2.store_checkpoint_signing_sha256(row)
    return row


def event_pointer(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "event_id": record["event_id"],
        "event_sha256": phase2.canonical_record_sha256(record),
    }


def object_pointer(manifest: dict[str, Any]) -> dict[str, Any]:
    return {
        "object_id": manifest["object_id"],
        "content_sha256": manifest["content_sha256"],
        "manifest_sha256": phase2.canonical_record_sha256(manifest),
    }


def purge_receipt(
    *,
    prior_checkpoint: dict[str, Any],
    tombstone: dict[str, Any],
    target_event: dict[str, Any],
    target_manifest: dict[str, Any] | None,
    derivative_events: list[dict[str, Any]],
    derivative_manifests: list[dict[str, Any]],
    new_checkpoint_id: str,
    new_checkpoint_sequence: int,
    sequence: int = 1,
    prior_receipt: dict[str, Any] | None = None,
    completed_at: str = "2026-08-21T05:10:00Z",
    verified_at: str = "2026-08-21T05:09:30Z",
    authorized_at: str = "2026-08-21T04:59:00Z",
) -> dict[str, Any]:
    target_events = [event_pointer(target_event)]
    target_objects = [object_pointer(target_manifest)] if target_manifest is not None else []
    closure_events = sorted(
        [event_pointer(record) for record in derivative_events], key=lambda row: row["event_id"]
    )
    closure_objects = sorted(
        [object_pointer(record) for record in derivative_manifests],
        key=lambda row: (row["object_id"], row["manifest_sha256"]),
    )
    targets = {"events": target_events, "objects": target_objects, "set_sha256": hash_ref("0")}
    closure = {
        "event_count": len(closure_events),
        "events": closure_events,
        "object_count": len(closure_objects),
        "objects": closure_objects,
        "closure_sha256": hash_ref("0"),
    }
    targets["set_sha256"] = phase2.purge_target_set_sha256(targets)
    closure["closure_sha256"] = phase2.purge_derivative_closure_sha256(closure)
    all_events = target_events + closure_events
    all_objects = target_objects + closure_objects
    surfaces = {}
    for index, name in enumerate(phase2.SURFACE_NAMES, start=1):
        surfaces[name] = {
            "scope_sha256": hash_ref(str(index)),
            "matched_count": len(all_events) + len(all_objects),
            "removed_count": len(all_events) + len(all_objects),
            "residual_count": 0,
            "removed_set_sha256": phase2.purge_surface_removed_set_sha256(
                name, all_events, all_objects
            ),
            "verification_sha256": hash_ref("9"),
            "verified_at": verified_at,
        }
    row = {
        "schema": "memory-purge-receipt/v1",
        "purge_receipt_id": f"purge-receipt_{UUID1 if sequence == 1 else UUID2}",
        "mode": "genesis" if sequence == 1 else "append",
        "purge_sequence": sequence,
        "prior_purge_receipt_sha256": (
            None if prior_receipt is None else phase2.purge_receipt_record_sha256(prior_receipt)
        ),
        "prior_purge_high_water": sequence - 1,
        "new_purge_high_water": sequence,
        "completed_at": completed_at,
        "removed_targets": targets,
        "removed_transitive_derivatives": closure,
        "erasure_surfaces": surfaces,
        "surviving_tombstone": {
            "tombstone_event_id": tombstone["event_id"],
            "tombstone_event_sha256": phase2.canonical_record_sha256(tombstone),
            "tombstone_payload_sha256": phase2.canonical_record_sha256(tombstone["payload"]),
            "target_set_sha256": targets["set_sha256"],
            "reason_code": "retention-ended",
            "classification": "internal",
            "retention": "tombstone-only",
        },
        "prior_checkpoint": phase2.checkpoint_pointer(prior_checkpoint),
        "new_checkpoint": {
            "checkpoint_id": f"checkpoint_{new_checkpoint_id}",
            "sequence": new_checkpoint_sequence,
            "purge_high_water": sequence,
        },
        "authority": {
            "authority_id": "authority:sha256:" + "d" * 64,
            "authorizer_id": SIGNER,
            "authorization_sha256": hash_ref("e"),
            "authorized_at": authorized_at,
        },
        "signature": signature(),
    }
    row["signature"]["signed_sha256"] = phase2.purge_receipt_signing_sha256(row)
    return row


def trust_resolver(key_id: str) -> dict[str, Any] | None:
    if key_id != KEY_ID:
        return None
    return {
        "key_id": KEY_ID,
        "signer_id": SIGNER,
        "algorithm": "ed25519",
        "public_key": PUBLIC_KEY,
        "status": "active",
        "valid_from": "2026-08-21T00:00:00Z",
        "valid_until": "2026-08-22T00:00:00Z",
        "revoked_at": None,
        "authorized_schemas": [
            "memory-store-checkpoint/v1",
            "memory-purge-receipt/v1",
        ],
    }


def signature_verifier(
    algorithm: object, public_key: bytes, message: bytes, signature_bytes: bytes
) -> bool:
    return (
        algorithm == "ed25519"
        and public_key == bytes(range(32))
        and isinstance(message, bytes)
        and signature_bytes == bytes(range(64))
    )


def external_signer(algorithm: object, key_id: object, message: object) -> bytes:
    if algorithm != "ed25519" or key_id != KEY_ID or not isinstance(message, bytes):
        raise ValueError("unexpected signing request")
    return bytes(range(64))


def purge_environment(*, include_target_object: bool = True) -> dict[str, Any]:
    source = valid_source()
    extraction = extraction_artifact()
    evidence = evidence_v2()
    source_object = source_manifest(source)
    derivative_object = output_manifest(extraction, source_object)
    target = event(UUID1, system_time="2026-08-21T04:30:00Z")
    derivative = event(
        UUID2,
        system_time="2026-08-21T04:40:00Z",
        derived_from=[target["event_id"]],
    )
    spare = event(UUID3, system_time="2026-08-21T04:45:00Z")
    prior_manifests = [source_object, derivative_object] if include_target_object else []
    prior_snapshot = checkpoint_snapshot(
        manifests=prior_manifests,
        events=[target, derivative, spare],
        receipts=[],
        tombstones=[],
    )
    prior_checkpoint = checkpoint(
        UUID1,
        mode="genesis",
        sequence=0,
        purge_high_water=0,
        created_at="2026-08-21T05:00:00Z",
        snapshot=prior_snapshot,
        prior=None,
    )
    tombstone = tombstone_event(target["event_id"])
    receipt = purge_receipt(
        prior_checkpoint=prior_checkpoint,
        tombstone=tombstone,
        target_event=target,
        target_manifest=source_object if include_target_object else None,
        derivative_events=[derivative],
        derivative_manifests=[derivative_object] if include_target_object else [],
        new_checkpoint_id=UUID2,
        new_checkpoint_sequence=1,
    )
    removed_manifests = [source_object, derivative_object] if include_target_object else []
    new_snapshot = checkpoint_snapshot(
        manifests=[],
        events=[spare],
        receipts=[receipt],
        tombstones=[tombstone],
        authenticated_receipts=(),
        retired_events=(target["event_id"], derivative["event_id"]),
        retired_objects=tuple(retired_key(row) for row in removed_manifests),
    )
    new_checkpoint = checkpoint(
        UUID2,
        mode="append",
        sequence=1,
        purge_high_water=1,
        created_at="2026-08-21T05:11:00Z",
        snapshot=new_snapshot,
        prior=prior_checkpoint,
    )
    target_records = {canonical_json_bytes(event_pointer(target)): target}
    if include_target_object:
        target_records[canonical_json_bytes(object_pointer(source_object))] = source_object

    def target_resolver(kind: str, pointer: dict[str, Any]) -> phase2.RemovedRecord | None:
        record = target_records.get(canonical_json_bytes(pointer))
        return phase2.RemovedRecord(record=record, removed=True) if record is not None else None

    def closure_resolver(
        event_roots: tuple[dict[str, Any], ...], object_roots: tuple[dict[str, Any], ...]
    ) -> phase2.DerivativeClosure:
        del event_roots, object_roots
        return phase2.DerivativeClosure(
            events=(phase2.RemovedRecord(derivative, True),),
            objects=(phase2.RemovedRecord(derivative_object, True),)
            if include_target_object
            else (),
            complete=True,
        )

    def surface_resolver(
        name: str,
        event_pointers: tuple[dict[str, Any], ...],
        object_pointers: tuple[dict[str, Any], ...],
    ) -> dict[str, Any]:
        del event_pointers, object_pointers
        return copy.deepcopy(receipt["erasure_surfaces"][name])

    def tombstone_resolver(event_id: str) -> dict[str, Any] | None:
        return copy.deepcopy(tombstone) if event_id == tombstone["event_id"] else None

    kwargs = {
        "prior_purge_receipt": None,
        "prior_checkpoint": prior_checkpoint,
        "prior_snapshot": prior_snapshot,
        "new_checkpoint": new_checkpoint,
        "new_snapshot": new_snapshot,
        "trusted_prior_checkpoint_ref": phase2.store_checkpoint_reference(prior_checkpoint),
        "target_resolver": target_resolver,
        "derivative_closure_resolver": closure_resolver,
        "surface_resolver": surface_resolver,
        "tombstone_resolver": tombstone_resolver,
    }
    return {
        "source": source,
        "extraction": extraction,
        "evidence": evidence,
        "source_manifest": source_object,
        "output_manifest": derivative_object,
        "receipt": receipt,
        "prior_checkpoint": prior_checkpoint,
        "prior_snapshot": prior_snapshot,
        "new_checkpoint": new_checkpoint,
        "new_snapshot": new_snapshot,
        "target_event": target,
        "derivative_event": derivative,
        "spare_event": spare,
        "tombstone_event": tombstone,
        "kwargs": kwargs,
    }


def second_purge_environment() -> dict[str, Any]:
    first = purge_environment()
    prior_receipt = first["receipt"]
    prior_checkpoint = first["new_checkpoint"]
    first_snapshot = first["new_snapshot"]
    prior_snapshot = checkpoint_snapshot(
        manifests=list(first_snapshot.collections["manifests"]),
        events=list(first_snapshot.collections["events"]),
        receipts=list(first_snapshot.collections["receipts"]),
        tombstones=list(first_snapshot.collections["tombstones"]),
        authenticated_receipts=(phase2.canonical_record_sha256(prior_receipt),),
        retired_events=first_snapshot.retired_event_ids,
        retired_objects=first_snapshot.retired_object_keys,
    )
    target = first["spare_event"]
    tombstone = tombstone_event(
        target["event_id"], event_uuid=UUID5, system_time="2026-08-21T05:19:00Z"
    )
    receipt = purge_receipt(
        prior_checkpoint=prior_checkpoint,
        tombstone=tombstone,
        target_event=target,
        target_manifest=None,
        derivative_events=[],
        derivative_manifests=[],
        new_checkpoint_id=UUID5,
        new_checkpoint_sequence=2,
        sequence=2,
        prior_receipt=prior_receipt,
        completed_at="2026-08-21T05:20:00Z",
        verified_at="2026-08-21T05:19:30Z",
        authorized_at="2026-08-21T05:12:00Z",
    )
    new_snapshot = checkpoint_snapshot(
        manifests=[],
        events=[],
        receipts=[prior_receipt, receipt],
        tombstones=[first["tombstone_event"], tombstone],
        authenticated_receipts=(phase2.canonical_record_sha256(prior_receipt),),
        retired_events=first_snapshot.retired_event_ids + (target["event_id"],),
        retired_objects=first_snapshot.retired_object_keys,
    )
    new_checkpoint = checkpoint(
        UUID5,
        mode="append",
        sequence=2,
        purge_high_water=2,
        created_at="2026-08-21T05:21:00Z",
        snapshot=new_snapshot,
        prior=prior_checkpoint,
    )

    def target_resolver(kind: str, pointer: dict[str, Any]) -> phase2.RemovedRecord | None:
        if kind == "event" and pointer == event_pointer(target):
            return phase2.RemovedRecord(record=target, removed=True)
        return None

    def closure_resolver(*_: object) -> phase2.DerivativeClosure:
        return phase2.DerivativeClosure(events=(), objects=(), complete=True)

    def surface_resolver(
        name: str,
        event_pointers: tuple[dict[str, Any], ...],
        object_pointers: tuple[dict[str, Any], ...],
    ) -> dict[str, Any]:
        del event_pointers, object_pointers
        return copy.deepcopy(receipt["erasure_surfaces"][name])

    def tombstone_resolver(event_id: str) -> dict[str, Any] | None:
        return copy.deepcopy(tombstone) if event_id == tombstone["event_id"] else None

    kwargs = {
        "prior_purge_receipt": prior_receipt,
        "prior_checkpoint": prior_checkpoint,
        "prior_snapshot": prior_snapshot,
        "new_checkpoint": new_checkpoint,
        "new_snapshot": new_snapshot,
        "trusted_prior_checkpoint_ref": phase2.store_checkpoint_reference(prior_checkpoint),
        "target_resolver": target_resolver,
        "derivative_closure_resolver": closure_resolver,
        "surface_resolver": surface_resolver,
        "tombstone_resolver": tombstone_resolver,
    }
    return {
        "first": first,
        "prior_receipt": prior_receipt,
        "receipt": receipt,
        "prior_checkpoint": prior_checkpoint,
        "prior_snapshot": prior_snapshot,
        "new_checkpoint": new_checkpoint,
        "new_snapshot": new_snapshot,
        "target_event": target,
        "tombstone_event": tombstone,
        "kwargs": kwargs,
    }


def single_node_mutations(value: Any) -> list[Any]:
    """Replace each JSON node once with a hostile value, including nested nodes."""

    paths: list[tuple[object, ...]] = []

    def collect(node: Any, path: tuple[object, ...]) -> None:
        paths.append(path)
        if isinstance(node, dict):
            for key, child in node.items():
                collect(child, path + (key,))
        elif isinstance(node, list):
            for position, child in enumerate(node):
                collect(child, path + (position,))

    collect(value, ())
    mutations: list[Any] = []
    for path in paths:
        replacement: Any = {7: "non-string-key", "nan": float("nan")}
        if not path:
            mutations.append(replacement)
            continue
        candidate = copy.deepcopy(value)
        parent = candidate
        for part in path[:-1]:
            parent = parent[part]
        parent[path[-1]] = replacement
        mutations.append(candidate)
    cycle: dict[str, Any] = {}
    cycle["self"] = cycle
    mutations.append(cycle)
    return mutations


class Phase2RuntimeTests(unittest.TestCase):
    def test_local_payload_validators_do_not_fabricate_cross_record_bindings(self) -> None:
        source = valid_source()
        artifact = extraction_artifact()
        evidence = evidence_v2()
        self.assertEqual(phase2.validate_source_v2_payload(source), [])
        self.assertEqual(phase2.validate_extraction_artifact_payload(artifact), [])
        self.assertEqual(phase2.validate_evidence_span_v2_payload(evidence), [])
        self.assertTrue(phase2.validate_extraction_artifact(artifact))
        self.assertTrue(phase2.validate_evidence_span_v2(evidence))

    def test_source_extraction_evidence_and_exact_manifest_bindings(self) -> None:
        env = purge_environment()
        self.assertEqual(phase2.validate_source_v2(env["source"]), [])
        self.assertEqual(
            phase2.validate_extraction_artifact(env["extraction"], source=env["source"]),
            [],
        )
        self.assertEqual(
            phase2.validate_evidence_span_v2(
                env["evidence"],
                source=env["source"],
                extraction_artifact=env["extraction"],
            ),
            [],
        )
        self.assertEqual(
            phase2.validate_source_manifest_binding(env["source"], env["source_manifest"]),
            [],
        )
        self.assertEqual(
            phase2.validate_extraction_manifest_bindings(
                env["extraction"],
                source=env["source"],
                source_manifest=env["source_manifest"],
                output_manifest=env["output_manifest"],
            ),
            [],
        )
        self.assertEqual(
            phase2.validate_evidence_manifest_bindings(
                env["evidence"],
                source=env["source"],
                extraction_artifact=env["extraction"],
                source_manifest=env["source_manifest"],
                coordinate_manifest=env["output_manifest"],
            ),
            [],
        )

        wrong = copy.deepcopy(env["evidence"])
        wrong["acquisition_id"] = f"acquisition_{UUID4}"
        self.assertTrue(
            phase2.validate_evidence_span_v2(
                wrong, source=env["source"], extraction_artifact=env["extraction"]
            )
        )

    def test_exact_lineage_rejects_same_content_from_another_acquisition(self) -> None:
        env = purge_environment()
        swapped = copy.deepcopy(env["output_manifest"])
        for field in ("source_object", "derived_from_objects"):
            pointers = (
                [swapped["source_lineage"][field]]
                if field == "source_object"
                else swapped["source_lineage"][field]
            )
            for pointer in pointers:
                pointer["acquisition_id"] = f"acquisition_{UUID4}"
        self.assertEqual(validate_object_manifest(swapped), [])
        errors = phase2.validate_extraction_manifest_bindings(
            env["extraction"],
            source=env["source"],
            source_manifest=env["source_manifest"],
            output_manifest=swapped,
        )
        self.assertTrue(any("exact source manifest pointer" in error for error in errors), errors)

    def test_rights_and_policy_laundering_fail_closed(self) -> None:
        source = valid_source()
        artifact = extraction_artifact()
        source["licence"].update(
            {"classification": "licensed", "entitlement": "required"}
        )
        source_object = source_manifest(source)
        source_object["policy"] = {
            "classification": "licensed",
            "retention": "source-policy",
            "retain_until": None,
        }
        coordinate_object = output_manifest(artifact, source_object)
        self.assertEqual(phase2.validate_source_manifest_binding(source, source_object), [])
        errors = phase2.validate_extraction_manifest_bindings(
            artifact,
            source=source,
            source_manifest=source_object,
            output_manifest=coordinate_object,
        )
        self.assertTrue(any("output_manifest.policy.classification" in error for error in errors))
        self.assertTrue(any("output_manifest.policy.retention" in error for error in errors))

        source["rights"]["derivative_use"] = "prohibited"
        self.assertTrue(
            any(
                "prohibits extraction derivatives" in error
                for error in phase2.validate_extraction_artifact(artifact, source=source)
            )
        )
        self.assertTrue(
            any(
                "prohibits extraction derivatives" in error
                for error in phase2.validate_evidence_span_v2(
                    evidence_v2(), source=source, extraction_artifact=artifact
                )
            )
        )

    def test_expiry_overrides_source_policy_for_required_and_unknown_terms(self) -> None:
        for classification, entitlement in (
            ("licensed", "required"),
            ("unknown", "unknown"),
        ):
            with self.subTest(classification=classification, entitlement=entitlement):
                source = valid_source()
                source["licence"].update(
                    {
                        "classification": classification,
                        "entitlement": entitlement,
                        "expires_at": "2026-08-22T04:00:00Z",
                    }
                )
                if classification == "unknown":
                    source["rights"] = {
                        "derivative_use": "prohibited",
                        "embedding": "prohibited",
                        "redistribution": "prohibited",
                    }
                manifest = source_manifest(source)
                manifest["policy"] = {
                    "classification": (
                        "restricted" if classification == "unknown" else classification
                    ),
                    "retention": "expires",
                    "retain_until": "2026-08-22T03:59:59Z",
                }
                self.assertEqual(
                    phase2.validate_source_manifest_binding(source, manifest), []
                )
                manifest["policy"]["retain_until"] = "2026-08-22T04:00:01Z"
                self.assertTrue(
                    any(
                        "must not outlive" in error
                        for error in phase2.validate_source_manifest_binding(source, manifest)
                    )
                )

    def test_image_region_integer_bbox_is_exact_and_ordered(self) -> None:
        source = valid_source()
        extraction = extraction_artifact()
        evidence = evidence_v2()
        locator = evidence["locator"]
        locator.update(
            {
                "kind": "image-region",
                "ref": "image-1-region-1",
                "page": None,
                "section": None,
                "char_start": None,
                "char_end": None,
                "image_region": {
                    "x_min": 100000,
                    "y_min": 200000,
                    "x_max": 300000,
                    "y_max": 400000,
                },
            }
        )
        self.assertEqual(
            phase2.validate_evidence_span_v2(
                evidence, source=source, extraction_artifact=extraction
            ),
            [],
        )
        evidence["locator"]["image_region"]["x_max"] = 100000
        self.assertTrue(
            any(
                "x_max" in error
                for error in phase2.validate_evidence_span_v2(
                    evidence, source=source, extraction_artifact=extraction
                )
            )
        )

    def test_checkpoint_commitments_are_order_independent_and_authenticated(self) -> None:
        env = purge_environment()
        snapshot = env["prior_snapshot"]
        reordered = {
            name: list(reversed(rows)) for name, rows in snapshot.collections.items()
        }
        self.assertEqual(
            phase2.canonical_store_commitments(snapshot.collections),
            phase2.canonical_store_commitments(reordered),
        )
        self.assertEqual(
            phase2.verify_store_checkpoint(
                env["prior_checkpoint"],
                snapshot=snapshot,
                prior_checkpoint=None,
                trusted_prior_checkpoint_ref=None,
                trust_resolver=trust_resolver,
                signature_verifier=signature_verifier,
            ),
            [],
        )
        tampered = copy.deepcopy(env["prior_checkpoint"])
        tampered["commitments"]["events"]["record_count"] += 1
        self.assertTrue(
            phase2.validate_store_checkpoint(tampered, snapshot=snapshot)
        )

    def test_checkpoint_builder_round_trip_is_deterministic_and_head_safe(self) -> None:
        env = purge_environment()
        kwargs = {
            "checkpoint_id": env["prior_checkpoint"]["checkpoint_id"],
            "created_at": env["prior_checkpoint"]["created_at"],
            "snapshot": env["prior_snapshot"],
            "signer_id": SIGNER,
            "key_id": KEY_ID,
            "signer": external_signer,
            "trust_resolver": trust_resolver,
            "signature_verifier": signature_verifier,
        }
        first = phase2.build_store_checkpoint(**kwargs)
        second = phase2.build_store_checkpoint(**kwargs)
        self.assertEqual(first, second)
        self.assertEqual(first, env["prior_checkpoint"])
        with self.assertRaises(phase2.Phase2ContractError):
            phase2.build_store_checkpoint(
                checkpoint_id=f"checkpoint_{UUID2}",
                created_at="2026-08-21T05:11:00Z",
                snapshot=env["prior_snapshot"],
                signer_id=SIGNER,
                key_id=KEY_ID,
                signer=external_signer,
                trust_resolver=trust_resolver,
                signature_verifier=signature_verifier,
                prior_checkpoint=env["prior_checkpoint"],
                trusted_prior_checkpoint_ref="checkpoint:sha256:" + "f" * 64,
            )
        signing_calls: list[bytes] = []

        def recording_signer(algorithm: object, key_id: object, message: object) -> bytes:
            if isinstance(message, bytes):
                signing_calls.append(message)
            return external_signer(algorithm, key_id, message)

        with self.assertRaises(phase2.Phase2ContractError):
            phase2.build_store_checkpoint(
                checkpoint_id="checkpoint_550e8400-e29b-41d4-a716-446655440000",
                created_at=env["prior_checkpoint"]["created_at"],
                snapshot=env["prior_snapshot"],
                signer_id=SIGNER,
                key_id=KEY_ID,
                signer=recording_signer,
                trust_resolver=trust_resolver,
                signature_verifier=signature_verifier,
            )
        self.assertEqual(signing_calls, [], "invalid checkpoint must not reach signer")

    def test_checkpoint_snapshot_authenticates_rows_tombstones_and_retirement(self) -> None:
        env = purge_environment()
        authenticated_snapshot = checkpoint_snapshot(
            manifests=list(env["new_snapshot"].collections["manifests"]),
            events=list(env["new_snapshot"].collections["events"]),
            receipts=list(env["new_snapshot"].collections["receipts"]),
            tombstones=list(env["new_snapshot"].collections["tombstones"]),
            authenticated_receipts=(phase2.canonical_record_sha256(env["receipt"]),),
            retired_events=env["new_snapshot"].retired_event_ids,
            retired_objects=env["new_snapshot"].retired_object_keys,
        )
        self.assertEqual(
            phase2.validate_store_checkpoint(
                env["new_checkpoint"],
                snapshot=authenticated_snapshot,
                prior_checkpoint=env["prior_checkpoint"],
                trusted_prior_checkpoint_ref=phase2.store_checkpoint_reference(
                    env["prior_checkpoint"]
                ),
            ),
            [],
        )
        self.assertTrue(
            any(
                "authenticated_receipt_sha256" in error
                for error in phase2.validate_store_checkpoint(
                    env["new_checkpoint"],
                    snapshot=env["new_snapshot"],
                    prior_checkpoint=env["prior_checkpoint"],
                    trusted_prior_checkpoint_ref=phase2.store_checkpoint_reference(
                        env["prior_checkpoint"]
                    ),
                )
            )
        )

        tampered_retirement = copy.deepcopy(env["new_checkpoint"])
        tampered_retirement["retired_state"]["object_keys"] = []
        tampered_retirement["store_root_sha256"] = phase2.store_root_sha256(
            tampered_retirement
        )
        tampered_retirement["signature"][
            "signed_sha256"
        ] = phase2.store_checkpoint_signing_sha256(tampered_retirement)
        self.assertTrue(
            any(
                "retired_state" in error
                for error in phase2.validate_store_checkpoint(
                    tampered_retirement,
                    snapshot=authenticated_snapshot,
                    prior_checkpoint=env["prior_checkpoint"],
                    trusted_prior_checkpoint_ref=phase2.store_checkpoint_reference(
                        env["prior_checkpoint"]
                    ),
                )
            )
        )

        resurrected_snapshot = checkpoint_snapshot(
            manifests=[copy.deepcopy(env["source_manifest"])],
            events=[copy.deepcopy(env["spare_event"])],
            receipts=[copy.deepcopy(env["receipt"])],
            tombstones=[copy.deepcopy(env["tombstone_event"])],
            authenticated_receipts=(
                phase2.canonical_record_sha256(env["receipt"]),
            ),
            retired_events=env["new_snapshot"].retired_event_ids,
            retired_objects=(),
        )
        resurrection_signing_calls: list[bytes] = []

        def resurrection_signer(
            algorithm: object, key_id: object, message: object
        ) -> bytes:
            if isinstance(message, bytes):
                resurrection_signing_calls.append(message)
            return external_signer(algorithm, key_id, message)

        with self.assertRaises(phase2.Phase2ContractError):
            phase2.build_store_checkpoint(
                checkpoint_id=f"checkpoint_{UUID3}",
                created_at="2026-08-21T05:12:00Z",
                snapshot=resurrected_snapshot,
                signer_id=SIGNER,
                key_id=KEY_ID,
                signer=resurrection_signer,
                trust_resolver=trust_resolver,
                signature_verifier=signature_verifier,
                prior_checkpoint=env["new_checkpoint"],
                trusted_prior_checkpoint_ref=phase2.store_checkpoint_reference(
                    env["new_checkpoint"]
                ),
            )
        self.assertEqual(
            resurrection_signing_calls,
            [],
            "retirement rollback must fail before a checkpoint reaches the signer",
        )

        invalid_manifest = copy.deepcopy(env["source_manifest"])
        invalid_manifest["content_sha256"] = hash_ref("f")
        invalid_snapshot = checkpoint_snapshot(
            manifests=[invalid_manifest], events=[], receipts=[], tombstones=[]
        )
        invalid_checkpoint = checkpoint(
            UUID3,
            mode="genesis",
            sequence=0,
            purge_high_water=0,
            created_at="2026-08-21T05:00:00Z",
            snapshot=invalid_snapshot,
            prior=None,
        )
        self.assertTrue(
            any(
                "snapshot.collections.manifests" in error
                for error in phase2.validate_store_checkpoint(
                    invalid_checkpoint, snapshot=invalid_snapshot
                )
            )
        )

        mixed_snapshot = checkpoint_snapshot(
            manifests=[],
            events=[env["tombstone_event"]],
            receipts=[],
            tombstones=[],
            retired_events=(env["target_event"]["event_id"],),
        )
        mixed_checkpoint = checkpoint(
            UUID3,
            mode="genesis",
            sequence=0,
            purge_high_water=0,
            created_at="2026-08-21T05:30:00Z",
            snapshot=mixed_snapshot,
            prior=None,
        )
        self.assertTrue(
            any(
                "tombstones belong only" in error
                for error in phase2.validate_store_checkpoint(
                    mixed_checkpoint, snapshot=mixed_snapshot
                )
            )
        )

        lineage_snapshot = checkpoint_snapshot(
            manifests=[env["output_manifest"]],
            events=[],
            receipts=[],
            tombstones=[],
            retired_objects=(retired_key(env["source_manifest"]),),
        )
        lineage_checkpoint = checkpoint(
            UUID3,
            mode="genesis",
            sequence=0,
            purge_high_water=0,
            created_at="2026-08-21T05:30:00Z",
            snapshot=lineage_snapshot,
            prior=None,
        )
        self.assertTrue(
            any(
                "exact lineage reference" in error
                for error in phase2.validate_store_checkpoint(
                    lineage_checkpoint, snapshot=lineage_snapshot
                )
            )
        )

    def test_trust_resolver_purpose_lifetime_and_crypto_are_enforced(self) -> None:
        env = purge_environment()
        registry = {
            "schema": "memory-trust-key-registry/v1",
            "registry_id": f"trust-key-registry_{UUID5}",
            "generated_at": "2026-08-21T06:00:00Z",
            "keys": [trust_resolver(KEY_ID)],
        }
        official_resolver = build_trust_resolver(registry)
        verify_kwargs = {
            "snapshot": env["prior_snapshot"],
            "prior_checkpoint": None,
            "trusted_prior_checkpoint_ref": None,
            "signature_verifier": signature_verifier,
        }
        self.assertEqual(
            phase2.verify_store_checkpoint(
                env["prior_checkpoint"],
                trust_resolver=official_resolver,
                **verify_kwargs,
            ),
            [],
        )
        key_mutations = []
        unauthorized = trust_resolver(KEY_ID)
        unauthorized["authorized_schemas"] = ["memory-intake-receipt/v1"]
        key_mutations.append(unauthorized)
        expired = trust_resolver(KEY_ID)
        expired["valid_until"] = "2026-08-21T04:00:00Z"
        key_mutations.append(expired)
        revoked = trust_resolver(KEY_ID)
        revoked.update(
            {"status": "revoked", "revoked_at": "2026-08-21T04:30:00Z"}
        )
        key_mutations.append(revoked)
        oversized = trust_resolver(KEY_ID)
        oversized["public_key"] = "A" * 100_000
        key_mutations.append(oversized)
        unknown_purpose = trust_resolver(KEY_ID)
        unknown_purpose["authorized_schemas"].append("memory-unknown/v1")
        key_mutations.append(unknown_purpose)
        for key in key_mutations:
            with self.subTest(key=key.get("status"), purposes=key.get("authorized_schemas")):
                resolver = lambda key_id, row=key: copy.deepcopy(row) if key_id == KEY_ID else None
                self.assertTrue(
                    phase2.verify_store_checkpoint(
                        env["prior_checkpoint"],
                        trust_resolver=resolver,
                        **verify_kwargs,
                    )
                )
        self.assertTrue(
            phase2.verify_store_checkpoint(
                env["prior_checkpoint"],
                trust_resolver=trust_resolver,
                signature_verifier=lambda *_: False,
                snapshot=env["prior_snapshot"],
            )
        )

        def exploding_verifier(*_: object) -> bool:
            raise RuntimeError("synthetic verifier failure")

        self.assertTrue(
            phase2.verify_store_checkpoint(
                env["prior_checkpoint"],
                trust_resolver=trust_resolver,
                signature_verifier=exploding_verifier,
                snapshot=env["prior_snapshot"],
            )
        )

    def test_full_purge_verifies_and_requires_complete_closure(self) -> None:
        env = purge_environment()
        self.assertEqual(
            phase2.validate_purge_receipt(env["receipt"], **env["kwargs"]), []
        )
        self.assertEqual(
            phase2.verify_purge_receipt(
                env["receipt"],
                **env["kwargs"],
                trust_resolver=trust_resolver,
                signature_verifier=signature_verifier,
            ),
            [],
        )
        missing = dict(env["kwargs"])
        missing["derivative_closure_resolver"] = None
        self.assertTrue(phase2.validate_purge_receipt(env["receipt"], **missing))

        incomplete = dict(env["kwargs"])
        incomplete["derivative_closure_resolver"] = lambda *_: phase2.DerivativeClosure(
            events=(), objects=(), complete=False
        )
        errors = phase2.validate_purge_receipt(env["receipt"], **incomplete)
        self.assertTrue(any("partial closure" in error for error in errors), errors)

    def test_atomic_purge_builder_round_trips_receipt_and_forward_checkpoint(self) -> None:
        env = purge_environment()
        builder_kwargs = {
            "purge_receipt_id": env["receipt"]["purge_receipt_id"],
            "completed_at": env["receipt"]["completed_at"],
            "target_events": [env["target_event"]],
            "target_objects": [env["source_manifest"]],
            "tombstone_event": env["tombstone_event"],
            "authority": env["receipt"]["authority"],
            "prior_checkpoint": env["prior_checkpoint"],
            "prior_snapshot": env["prior_snapshot"],
            "trusted_prior_checkpoint_ref": phase2.store_checkpoint_reference(
                env["prior_checkpoint"]
            ),
            "new_checkpoint_id": env["new_checkpoint"]["checkpoint_id"],
            "new_checkpoint_created_at": env["new_checkpoint"]["created_at"],
            "checkpoint_signer_id": SIGNER,
            "checkpoint_key_id": KEY_ID,
            "checkpoint_signer": external_signer,
            "purge_key_id": KEY_ID,
            "purge_signer": external_signer,
            "trust_resolver": trust_resolver,
            "signature_verifier": signature_verifier,
            "target_resolver": env["kwargs"]["target_resolver"],
            "derivative_closure_resolver": env["kwargs"][
                "derivative_closure_resolver"
            ],
            "surface_resolver": env["kwargs"]["surface_resolver"],
            "tombstone_resolver": env["kwargs"]["tombstone_resolver"],
        }
        transition = phase2.build_purge_transition(**builder_kwargs)
        self.assertEqual(transition.receipt, env["receipt"])
        self.assertEqual(transition.checkpoint, env["new_checkpoint"])
        self.assertEqual(
            transition.receipt["surviving_tombstone"]["retention"],
            "tombstone-only",
        )
        self.assertIn(
            phase2.canonical_record_sha256(transition.receipt),
            transition.snapshot.authenticated_receipt_sha256,
        )
        self.assertEqual(
            phase2.verify_purge_receipt(
                transition.receipt,
                prior_purge_receipt=None,
                prior_checkpoint=env["prior_checkpoint"],
                prior_snapshot=env["prior_snapshot"],
                new_checkpoint=transition.checkpoint,
                new_snapshot=transition.snapshot,
                trusted_prior_checkpoint_ref=phase2.store_checkpoint_reference(
                    env["prior_checkpoint"]
                ),
                target_resolver=env["kwargs"]["target_resolver"],
                derivative_closure_resolver=env["kwargs"][
                    "derivative_closure_resolver"
                ],
                surface_resolver=env["kwargs"]["surface_resolver"],
                tombstone_resolver=env["kwargs"]["tombstone_resolver"],
                trust_resolver=trust_resolver,
                signature_verifier=signature_verifier,
            ),
            [],
        )

        physical_counts = {"key_envelopes": 0, "backups": 9, "projections": 2}

        def physical_surface_resolver(
            name: str,
            event_pointers: tuple[dict[str, Any], ...],
            object_pointers: tuple[dict[str, Any], ...],
        ) -> dict[str, Any]:
            proof = env["kwargs"]["surface_resolver"](
                name, event_pointers, object_pointers
            )
            proof["matched_count"] = physical_counts[name]
            proof["removed_count"] = physical_counts[name]
            return proof

        physical_kwargs = dict(builder_kwargs)
        physical_kwargs["surface_resolver"] = physical_surface_resolver
        physical_transition = phase2.build_purge_transition(**physical_kwargs)
        self.assertEqual(
            {
                name: proof["matched_count"]
                for name, proof in physical_transition.receipt[
                    "erasure_surfaces"
                ].items()
            },
            physical_counts,
        )
        self.assertEqual(
            physical_transition.receipt["removed_targets"]["set_sha256"],
            transition.receipt["removed_targets"]["set_sha256"],
        )

        conflicting = copy.deepcopy(env["receipt"])
        conflicting.pop("signature")
        conflicting["removed_targets"]["set_sha256"] = hash_ref("f")
        signing_calls: list[bytes] = []

        def recording_signer(algorithm: object, key_id: object, message: object) -> bytes:
            if isinstance(message, bytes):
                signing_calls.append(message)
            return external_signer(algorithm, key_id, message)

        with self.assertRaises(phase2.Phase2ContractError):
            phase2.seal_purge_receipt(
                conflicting,
                key_id=KEY_ID,
                signer=recording_signer,
                trust_resolver=trust_resolver,
                signature_verifier=signature_verifier,
            )
        self.assertEqual(signing_calls, [], "conflicting receipt must not reach signer")

    def test_objectless_target_event_purge_is_valid(self) -> None:
        env = purge_environment(include_target_object=False)
        self.assertEqual(env["receipt"]["removed_targets"]["objects"], [])
        self.assertEqual(
            phase2.validate_purge_receipt(env["receipt"], **env["kwargs"]), []
        )

    def test_append_purge_chain_is_monotonic_and_preserves_audit_state(self) -> None:
        env = second_purge_environment()
        self.assertEqual(
            phase2.validate_purge_receipt(env["receipt"], **env["kwargs"]), []
        )
        self.assertEqual(
            phase2.verify_purge_receipt(
                env["receipt"],
                **env["kwargs"],
                trust_resolver=trust_resolver,
                signature_verifier=signature_verifier,
            ),
            [],
        )
        stale = copy.deepcopy(env["receipt"])
        stale["completed_at"] = env["prior_receipt"]["completed_at"]
        stale["authority"]["authorized_at"] = "2026-08-21T04:59:00Z"
        for proof in stale["erasure_surfaces"].values():
            proof["verified_at"] = "2026-08-21T05:09:30Z"
        stale["signature"]["signed_sha256"] = phase2.purge_receipt_signing_sha256(stale)
        self.assertTrue(
            any(
                "later than prior purge" in error
                for error in phase2.validate_purge_receipt(stale, **env["kwargs"])
            )
        )

    def test_purge_count_digest_surface_and_checkpoint_drift_fail(self) -> None:
        env = purge_environment()
        mutations = []
        count = copy.deepcopy(env["receipt"])
        count["removed_transitive_derivatives"]["event_count"] += 1
        mutations.append(count)
        digest = copy.deepcopy(env["receipt"])
        digest["removed_targets"]["set_sha256"] = hash_ref("f")
        mutations.append(digest)
        surface = copy.deepcopy(env["receipt"])
        surface["erasure_surfaces"]["backups"]["residual_count"] = 1
        mutations.append(surface)
        count_surface = copy.deepcopy(env["receipt"])
        count_surface["erasure_surfaces"]["projections"]["matched_count"] -= 1
        count_surface["erasure_surfaces"]["projections"]["removed_count"] -= 1
        mutations.append(count_surface)
        forward = copy.deepcopy(env["receipt"])
        forward["new_checkpoint"]["sequence"] += 1
        mutations.append(forward)
        false_tombstone_policy = copy.deepcopy(env["receipt"])
        false_tombstone_policy["surviving_tombstone"]["retention"] = "permanent"
        mutations.append(false_tombstone_policy)
        for receipt in mutations:
            with self.subTest(field=receipt):
                self.assertTrue(phase2.validate_purge_receipt(receipt, **env["kwargs"]))

    def test_public_validators_fail_closed_for_hostile_json(self) -> None:
        env = purge_environment()
        validators = (
            lambda value: phase2.validate_source_v2(value),
            lambda value: phase2.validate_extraction_artifact(value, source=env["source"]),
            lambda value: phase2.validate_evidence_span_v2(
                value,
                source=env["source"],
                extraction_artifact=env["extraction"],
            ),
            lambda value: phase2.validate_store_checkpoint(
                value,
                snapshot=env["prior_snapshot"],
                prior_checkpoint=None,
                trusted_prior_checkpoint_ref=None,
            ),
            lambda value: phase2.validate_purge_receipt(value, **env["kwargs"]),
        )
        hostile = (None, True, 0, "", [], {}, {7: "non-string-key"}, {"x": float("nan")})
        for validator in validators:
            for value in hostile:
                with self.subTest(validator=validator, shape=type(value).__name__):
                    errors = validator(value)
                    self.assertIsInstance(errors, list)
                    self.assertTrue(errors)
                    self.assertTrue(all(isinstance(error, str) for error in errors))

    def test_recursive_hostile_json_never_escapes_public_validators(self) -> None:
        env = purge_environment()
        records_and_validators = (
            (env["source"], phase2.validate_source_v2_payload),
            (env["extraction"], phase2.validate_extraction_artifact_payload),
            (env["evidence"], phase2.validate_evidence_span_v2_payload),
            (
                env["prior_checkpoint"],
                lambda value: phase2.validate_store_checkpoint(
                    value, snapshot=env["prior_snapshot"]
                ),
            ),
            (
                env["receipt"],
                lambda value: phase2.validate_purge_receipt(value, **env["kwargs"]),
            ),
        )
        for record, validator in records_and_validators:
            for position, mutation in enumerate(single_node_mutations(record)):
                with self.subTest(
                    schema=record.get("schema"), position=position
                ):
                    errors = validator(mutation)
                    self.assertIsInstance(errors, list)
                    self.assertTrue(errors)
                    self.assertTrue(all(isinstance(error, str) for error in errors))


if __name__ == "__main__":
    unittest.main()
