#!/usr/bin/env python3
"""Operator CLI for governed procedural-memory intake, promotion, and execution."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path

from canonical_json import canonical_sha256
from memory_crypto import AESGCMSIVEnvelopeCipher
from memory_procedural import (
    ProceduralMemoryError,
    ProceduralState,
    build_activation_request,
    build_candidate,
    build_execution_receipt,
    build_playbook,
    build_promotion_manifest,
    build_quarantine_request,
    build_review_attestation,
    build_status_request,
    evaluate_candidate,
    open_deprecation_pull_request,
    open_promotion_pull_request,
    procedural_signer,
    procedural_verifier,
    seed_initial_candidates,
    verify_execution,
    verify_merged_promotion,
)
from memory_runtime import _safe_regular, load_master_key_file


def load(path: str) -> dict:
    try:
        value = json.loads(_safe_regular(Path(path)))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ProceduralMemoryError("playbook-input-invalid") from exc
    if not isinstance(value, dict):
        raise ProceduralMemoryError("playbook-input-not-object")
    return value


def load_rows(path: str) -> list[dict]:
    try:
        value = json.loads(_safe_regular(Path(path)))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ProceduralMemoryError("playbook-list-input-invalid") from exc
    if not isinstance(value, list) or any(not isinstance(item, dict) for item in value):
        raise ProceduralMemoryError("playbook-list-input-not-object-array")
    return value


def moment(value: str | None) -> dt.datetime | None:
    if value is None:
        return None
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ProceduralMemoryError("playbook-clock-must-be-aware")
    return parsed


def dump(value: object) -> None:
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def state(args: argparse.Namespace) -> ProceduralState:
    key_path = getattr(args, "protected_master_key", None)
    key_id = getattr(args, "protected_key_id", None)
    if (key_path is None) != (key_id is None):
        raise ProceduralMemoryError("protected-playbook-key-configuration-incomplete")
    cipher = (
        AESGCMSIVEnvelopeCipher(load_master_key_file(key_path), key_id=key_id)
        if key_path is not None else None
    )
    return ProceduralState(
        args.state_root, repository_root=args.root, protected_cipher=cipher,
    )


def protected(policy: dict) -> bool:
    return policy.get("classification") in {"licensed", "confidential", "restricted"}


def review_verifier(path: str):
    trust = load(path)
    if not trust or any(not isinstance(key, str) or not isinstance(value, str) for key, value in trust.items()):
        raise ProceduralMemoryError("playbook-review-trust-invalid")

    def verify(message: bytes, signature: dict[str, str]) -> bool:
        key_id = signature.get("key_id")
        public_key = trust.get(key_id) if isinstance(key_id, str) else None
        return bool(
            isinstance(public_key, str)
            and procedural_verifier(public_key, key_id=key_id)(message, signature)
        )

    return verify


def emit_artifact(
    *, schema: str, value: dict, path: Path, hash_field: str, policy: dict,
    extra: dict | None = None,
) -> None:
    result = {"schema": schema, hash_field: value[hash_field], "path": str(path)}
    result.update(extra or {})
    if not protected(policy):
        result["artifact"] = value
    dump(result)


def candidate_command(args: argparse.Namespace) -> int:
    value = build_candidate(
        playbook=load(args.playbook),
        created_by={"kind": args.creator_kind, "id": args.creator_id},
        policy=load(args.policy), now=moment(args.now),
    )
    path = state(args).put_candidate(value)
    emit_artifact(
        schema="memory-playbook-candidate-intake-result/v1", value=value,
        path=path, hash_field="candidate_sha256", policy=value["policy"],
    )
    return 0


def seed_command(args: argparse.Namespace) -> int:
    store = state(args)
    values = seed_initial_candidates(
        created_by={"kind": args.creator_kind, "id": args.creator_id}, now=moment(args.now),
    )
    paths = [store.put_candidate(value) for value in values]
    dump({
        "schema": "memory-playbook-seed-result/v1", "candidate_count": len(paths),
        "paths": [str(path) for path in paths],
    })
    return 0


def evaluation_command(args: argparse.Namespace) -> int:
    store = state(args)
    candidate = store.read_record(args.candidate)
    value = evaluate_candidate(
        candidate, cases=load_rows(args.cases),
        review_attestations=load_rows(args.review_attestations),
        verifier=review_verifier(args.review_trust),
        metric_regressions=args.metric_regression,
        security_failures=args.security_failure, now=moment(args.now),
    )
    path = store.put_evaluation(value, policy=candidate["policy"])
    emit_artifact(
        schema="memory-playbook-evaluation-result/v1", value=value, path=path,
        hash_field="evaluation_sha256", policy=candidate["policy"],
    )
    return 0


def review_command(args: argparse.Namespace) -> int:
    store = state(args)
    candidate = store.read_record(args.candidate)
    value = build_review_attestation(
        candidate, cases=load_rows(args.cases), role=args.role,
        reviewer={"kind": args.reviewer_kind, "id": args.reviewer_id},
        signer=procedural_signer(args.private_key, key_id=args.key_id),
        now=moment(args.now),
    )
    path = store.put_record(
        "reviews/playbook", value["attestation_sha256"].removeprefix("sha256:"),
        value, policy=candidate["policy"],
    )
    emit_artifact(
        schema="memory-playbook-review-result/v1", value=value, path=path,
        hash_field="attestation_sha256", policy=candidate["policy"],
    )
    return 0


def promoted(args: argparse.Namespace, store: ProceduralState) -> tuple[dict, dict, dict]:
    candidate = store.read_record(args.candidate)
    evaluation = store.read_record(args.evaluation)
    prior = store.read_record(args.prior_playbook) if args.prior_playbook else None
    playbook = build_playbook(
        candidate, evaluation, owner=args.owner, version=args.version,
        review_verifier=review_verifier(args.review_trust),
        playbook_id=args.playbook_id, prior_version=(
            {"schema": "memory-playbook/v1", "record_id": prior["playbook_id"],
             "content_sha256": prior["playbook_sha256"]} if prior else None
        ),
        now=moment(args.now), expires_days=args.expires_days,
    )
    return candidate, evaluation, playbook


def store_promotion(
    store: ProceduralState, playbook: dict, manifest: dict,
) -> tuple[Path, Path]:
    category = f"promotions/playbook/{manifest['manifest_id']}"
    playbook_path = store.put_record(
        category, "playbook", playbook, policy=playbook["policy"],
    )
    manifest_path = store.put_record(
        category, "manifest", manifest, policy=playbook["policy"],
    )
    return playbook_path, manifest_path


def bundle_command(args: argparse.Namespace) -> int:
    store = state(args)
    candidate, evaluation, playbook = promoted(args, store)
    manifest = build_promotion_manifest(
        candidate, playbook, evaluation,
        author={"kind": "service", "id": args.promotion_service}, branch=args.branch,
        pull_request=args.pull_request,
        signer=procedural_signer(args.private_key, key_id=args.key_id),
        review_verifier=review_verifier(args.review_trust),
        now=moment(args.now),
    )
    playbook_path, manifest_path = store_promotion(store, playbook, manifest)
    result = {
        "schema": "memory-playbook-promotion-bundle-result/v1",
        "playbook_sha256": playbook["playbook_sha256"],
        "playbook_path": str(playbook_path), "manifest_path": str(manifest_path),
    }
    if not protected(playbook["policy"]):
        result["manifest"] = manifest
    dump(result)
    return 0


def open_pr_command(args: argparse.Namespace) -> int:
    store = state(args)
    candidate, evaluation, playbook = promoted(args, store)
    manifest, url = open_promotion_pull_request(
        candidate, playbook, evaluation,
        author={"kind": "service", "id": args.promotion_service}, branch=args.branch,
        repository_root=args.root,
        signer=procedural_signer(args.private_key, key_id=args.key_id),
        review_verifier=review_verifier(args.review_trust),
        now=moment(args.now),
    )
    playbook_path, manifest_path = store_promotion(store, playbook, manifest)
    result = {
        "schema": "memory-playbook-promotion-pr-result/v1", "pull_request": url,
        "playbook_sha256": playbook["playbook_sha256"],
        "playbook_path": str(playbook_path), "manifest_path": str(manifest_path),
    }
    if not protected(playbook["policy"]):
        result["manifest"] = manifest
    dump(result)
    return 0


def activation_command(args: argparse.Namespace) -> int:
    store = state(args)
    candidate = store.read_record(args.candidate)
    evaluation = store.read_record(args.evaluation)
    playbook = store.read_record(args.playbook)
    manifest = store.read_record(args.manifest)
    verifier = procedural_verifier(args.public_key, key_id=args.key_id)
    merged = verify_merged_promotion(manifest, repository_root=args.root, verifier=verifier)
    current = moment(args.now) or dt.datetime.now(dt.timezone.utc)
    merged_at = dt.datetime.fromisoformat(merged["merged_at"].replace("Z", "+00:00"))
    if current < merged_at:
        raise ProceduralMemoryError("playbook-activation-cannot-predate-pr-merge")
    prior = store.read_record(args.prior_event) if args.prior_event else None
    event, request = build_activation_request(
        candidate, playbook, evaluation, manifest,
        expected_head=args.expected_head, service_id=args.promotion_service,
        verifier=verifier, prior_event=prior,
        store_bindings=[load(path) for path in args.store_binding], now=current,
    )
    category = f"activations/playbook/{manifest['manifest_id']}"
    event_path = store.put_record(category, "event", event, policy=event["policy"])
    request_path = store.put_record(category, "request", request, policy=event["policy"])
    dump({
        "schema": "memory-playbook-activation-request-result/v1", "merged": merged,
        "request_sha256": "sha256:" + canonical_sha256(request),
        "event_path": str(event_path), "request_path": str(request_path),
    })
    return 0


def quarantine_command(args: argparse.Namespace) -> int:
    store = state(args)
    prior = store.read_record(args.active_event)
    executions = [store.read_record(path) for path in args.execution]
    playbook, event, request = build_quarantine_request(
        prior, executions, expected_head=args.expected_head,
        service_id=args.quarantine_service,
        store_bindings=[load(path) for path in args.store_binding], now=moment(args.now),
    )
    category = f"quarantines/playbook/{event['event_id']}"
    event_path = store.put_record(category, "event", event, policy=event["policy"])
    request_path = store.put_record(category, "request", request, policy=event["policy"])
    dump({
        "schema": "memory-playbook-quarantine-request-result/v1",
        "playbook_sha256": playbook["playbook_sha256"],
        "event_path": str(event_path), "request_path": str(request_path),
    })
    return 0


def deprecation_command(args: argparse.Namespace) -> int:
    store = state(args)
    candidate = store.read_record(args.candidate)
    evaluation = store.read_record(args.evaluation)
    active = store.read_record(args.playbook)
    executions = [store.read_record(path) for path in args.execution]
    deprecated, manifest, url = open_deprecation_pull_request(
        candidate, active, evaluation, executions,
        author={"kind": "service", "id": args.promotion_service}, branch=args.branch,
        repository_root=args.root,
        signer=procedural_signer(args.private_key, key_id=args.key_id),
        review_verifier=review_verifier(args.review_trust),
        now=moment(args.now),
    )
    playbook_path, manifest_path = store_promotion(store, deprecated, manifest)
    result = {
        "schema": "memory-playbook-deprecation-pr-result/v1", "pull_request": url,
        "playbook_sha256": deprecated["playbook_sha256"],
        "playbook_path": str(playbook_path), "manifest_path": str(manifest_path),
    }
    if not protected(deprecated["policy"]):
        result["manifest"] = manifest
    dump(result)
    return 0


def status_request_command(args: argparse.Namespace) -> int:
    store = state(args)
    prior = store.read_record(args.active_event)
    status_playbook = store.read_record(args.playbook)
    manifest = store.read_record(args.manifest)
    verifier = procedural_verifier(args.public_key, key_id=args.key_id)
    merged = verify_merged_promotion(manifest, repository_root=args.root, verifier=verifier)
    current = moment(args.now) or dt.datetime.now(dt.timezone.utc)
    merged_at = dt.datetime.fromisoformat(merged["merged_at"].replace("Z", "+00:00"))
    if current < merged_at:
        raise ProceduralMemoryError("playbook-status-cannot-predate-pr-merge")
    event, request = build_status_request(
        prior, status_playbook, expected_head=args.expected_head,
        service_id=args.promotion_service, manifest=manifest,
        store_bindings=[load(path) for path in args.store_binding], now=current,
    )
    category = f"status/playbook/{manifest['manifest_id']}"
    event_path = store.put_record(category, "event", event, policy=event["policy"])
    request_path = store.put_record(category, "request", request, policy=event["policy"])
    dump({
        "schema": "memory-playbook-status-request-result/v1", "merged": merged,
        "event_path": str(event_path), "request_path": str(request_path),
    })
    return 0


def execution_command(args: argparse.Namespace) -> int:
    store = state(args)
    playbook = store.read_record(args.playbook)
    packet = load(args.packet)
    value = build_execution_receipt(
        playbook, run_id=args.run_id, task_id=args.task_id, packet=packet,
        projection_digest=args.projection_digest, steps=load_rows(args.steps),
        status=args.status, deviation_codes=args.deviation,
        incident_codes=args.incident, canonical_hash_verified_before=args.hash_before,
        canonical_hash_verified_after=args.hash_after,
        started_at=args.started_at, completed_at=args.completed_at,
    )
    path = store.put_execution(value, policy=playbook["policy"])
    emit_artifact(
        schema="memory-playbook-execution-result/v1", value=value, path=path,
        hash_field="execution_sha256", policy=playbook["policy"],
    )
    return 0


def verify_execution_command(args: argparse.Namespace) -> int:
    store = state(args)
    execution = store.read_record(args.execution)
    verify_execution(
        execution, packet=load(args.packet),
        active_event_before=store.read_record(args.active_event_before),
        active_event_after=store.read_record(args.active_event_after),
    )
    dump({
        "schema": "memory-playbook-execution-verification-result/v1",
        "verified": True, "execution_sha256": execution["execution_sha256"],
    })
    return 0


def status_command(args: argparse.Namespace) -> int:
    root = Path(args.state_root).resolve()
    if not root.is_dir():
        raise ProceduralMemoryError("playbook-state-root-missing")
    counts: dict[str, int] = {}
    for name in ("candidates", "reviews", "evaluations", "promotions", "activations", "executions", "quarantines", "status"):
        directory = root / name
        counts[name] = sum(
            1 for path in directory.rglob("*")
            if path.is_file() and not path.is_symlink()
            and (path.name.endswith(".json.enc") or (
                path.name.endswith(".json") and not path.name.endswith(".key.json")
            ))
        ) if directory.is_dir() else 0
    dump({"schema": "memory-playbook-status/v1", "state_root": str(root), "counts": counts})
    return 0


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(prog="memory-procedural")
    commands = root.add_subparsers(dest="command", required=True)

    def operational(command: argparse.ArgumentParser) -> None:
        command.add_argument("--root", default=".")
        command.add_argument("--state-root", required=True)
        command.add_argument("--now")
        command.add_argument("--protected-master-key")
        command.add_argument("--protected-key-id")

    candidate = commands.add_parser("candidate-intake")
    operational(candidate)
    candidate.add_argument("--playbook", required=True)
    candidate.add_argument("--policy", required=True)
    candidate.add_argument("--creator-kind", choices=["agent", "human", "supervisor", "adapter", "system", "service"], required=True)
    candidate.add_argument("--creator-id", required=True)
    candidate.set_defaults(handler=candidate_command)

    seed = commands.add_parser("seed-initial")
    operational(seed)
    seed.add_argument("--creator-kind", choices=["human", "supervisor", "system", "service"], required=True)
    seed.add_argument("--creator-id", required=True)
    seed.set_defaults(handler=seed_command)

    evaluation = commands.add_parser("evaluate")
    operational(evaluation)
    evaluation.add_argument("--candidate", required=True)
    evaluation.add_argument("--cases", required=True)
    evaluation.add_argument("--review-attestations", required=True)
    evaluation.add_argument("--review-trust", required=True)
    evaluation.add_argument("--metric-regression", action="append", default=[])
    evaluation.add_argument("--security-failure", action="append", default=[])
    evaluation.set_defaults(handler=evaluation_command)

    review = commands.add_parser("review")
    operational(review)
    review.add_argument("--candidate", required=True)
    review.add_argument("--cases", required=True)
    review.add_argument("--role", choices=["evidence", "applicability", "security"], required=True)
    review.add_argument("--reviewer-kind", choices=["human", "service", "system"], required=True)
    review.add_argument("--reviewer-id", required=True)
    review.add_argument("--private-key", required=True)
    review.add_argument("--key-id", required=True)
    review.set_defaults(handler=review_command)

    def promotion(command: argparse.ArgumentParser) -> None:
        operational(command)
        command.add_argument("--candidate", required=True)
        command.add_argument("--evaluation", required=True)
        command.add_argument("--owner", required=True)
        command.add_argument("--version", type=int, default=1)
        command.add_argument("--playbook-id")
        command.add_argument("--prior-playbook")
        command.add_argument("--expires-days", type=int, default=180)
        command.add_argument("--promotion-service", required=True)
        command.add_argument("--branch", required=True)
        command.add_argument("--private-key", required=True)
        command.add_argument("--key-id", required=True)
        command.add_argument("--review-trust", required=True)

    bundle = commands.add_parser("promotion-bundle")
    promotion(bundle)
    bundle.add_argument("--pull-request", type=int, required=True)
    bundle.set_defaults(handler=bundle_command)

    open_pr = commands.add_parser("open-promotion-pr")
    promotion(open_pr)
    open_pr.set_defaults(handler=open_pr_command)

    activation = commands.add_parser("activation-request")
    operational(activation)
    for option in ("candidate", "evaluation", "playbook", "manifest", "expected-head", "promotion-service", "public-key", "key-id"):
        activation.add_argument(f"--{option}", required=True)
    activation.add_argument("--prior-event")
    activation.add_argument("--store-binding", action="append", default=[])
    activation.set_defaults(handler=activation_command)

    execution = commands.add_parser("execution-receipt")
    operational(execution)
    for option in ("playbook", "run-id", "task-id", "packet", "projection-digest", "steps", "started-at", "completed-at"):
        execution.add_argument(f"--{option}", required=True)
    execution.add_argument("--status", choices=["completed", "failed", "deviated", "abstained"], required=True)
    execution.add_argument("--deviation", action="append", default=[])
    execution.add_argument("--incident", action="append", default=[])
    execution.add_argument("--hash-before", action=argparse.BooleanOptionalAction, default=True)
    execution.add_argument("--hash-after", action=argparse.BooleanOptionalAction, default=True)
    execution.set_defaults(handler=execution_command)

    verified = commands.add_parser("verify-execution")
    operational(verified)
    for option in ("execution", "packet", "active-event-before", "active-event-after"):
        verified.add_argument(f"--{option}", required=True)
    verified.set_defaults(handler=verify_execution_command)

    quarantine = commands.add_parser("quarantine-request")
    operational(quarantine)
    quarantine.add_argument("--active-event", required=True)
    quarantine.add_argument("--execution", action="append", required=True)
    quarantine.add_argument("--expected-head", required=True)
    quarantine.add_argument("--quarantine-service", required=True)
    quarantine.add_argument("--store-binding", action="append", default=[])
    quarantine.set_defaults(handler=quarantine_command)

    deprecate = commands.add_parser("open-deprecation-pr")
    operational(deprecate)
    for option in ("candidate", "evaluation", "playbook", "promotion-service", "branch", "private-key", "key-id", "review-trust"):
        deprecate.add_argument(f"--{option}", required=True)
    deprecate.add_argument("--execution", action="append", required=True)
    deprecate.set_defaults(handler=deprecation_command)

    status_request = commands.add_parser("status-request")
    operational(status_request)
    for option in ("active-event", "playbook", "manifest", "expected-head", "promotion-service", "public-key", "key-id"):
        status_request.add_argument(f"--{option}", required=True)
    status_request.add_argument("--store-binding", action="append", default=[])
    status_request.set_defaults(handler=status_request_command)

    status = commands.add_parser("status")
    operational(status)
    status.set_defaults(handler=status_command)
    return root


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        return int(args.handler(args))
    except (OSError, ValueError, ProceduralMemoryError) as exc:
        dump({"schema": "memory-playbook-error/v1", "ok": False, "code": str(exc)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
