#!/usr/bin/env python3
"""Operator CLI for governed semantic learning; all runtime files remain outside Git."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path

from canonical_json import canonical_sha256
from memory_crypto import AESGCMSIVEnvelopeCipher
from memory_incident_control import candidate_intake_guard
from memory_runtime import _atomic_private_write, _safe_regular, load_master_key_file
from memory_semantic import (
    SemanticMemoryError,
    SemanticState,
    build_activation_request,
    build_candidate,
    build_lesson,
    build_promotion_manifest,
    open_promotion_pull_request,
    semantic_signer,
    semantic_verifier,
    seed_reviewed_candidates,
    verify_candidate,
    verify_merged_promotion,
)


def load(path: str) -> dict:
    try:
        value = json.loads(_safe_regular(Path(path)))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise SemanticMemoryError("semantic-input-invalid") from exc
    if not isinstance(value, dict):
        raise SemanticMemoryError("semantic-input-not-object")
    return value


def now(value: str | None) -> dt.datetime | None:
    if value is None:
        return None
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise SemanticMemoryError("semantic-clock-must-be-aware")
    return parsed


def dump(value: object) -> None:
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def reviews(paths: list[str], store: SemanticState) -> list[dict]:
    return [store.read_record(path) for path in paths]


def state(args: argparse.Namespace) -> SemanticState:
    key_path = getattr(args, "protected_master_key", None)
    key_id = getattr(args, "protected_key_id", None)
    if (key_path is None) != (key_id is None):
        raise SemanticMemoryError("protected-semantic-key-configuration-incomplete")
    cipher = (
        AESGCMSIVEnvelopeCipher(load_master_key_file(key_path), key_id=key_id)
        if key_path is not None
        else None
    )
    return SemanticState(
        args.state_root, repository_root=args.root, protected_cipher=cipher,
    )


def protected(policy: dict) -> bool:
    return policy.get("classification") in {"licensed", "confidential", "restricted"}


def candidate_command(args: argparse.Namespace) -> int:
    value = build_candidate(
        candidate_type=args.candidate_type, source_basis=args.source_basis,
        semantic=load(args.semantic), originating_episode_ids=args.origin,
        created_by={"kind": args.creator_kind, "id": args.creator_id},
        policy=load(args.policy), now=now(args.now),
    )
    with candidate_intake_guard(args.state_root):
        path = state(args).put_candidate(value)
    result = {
        "schema": "memory-semantic-candidate-intake-result/v1",
        "candidate_sha256": value["candidate_sha256"],
        "path": str(path),
    }
    if not protected(value["policy"]):
        result["candidate"] = value
    dump(result)
    return 0


def verify_command(args: argparse.Namespace) -> int:
    store = state(args)
    value = store.read_record(args.candidate)
    review = verify_candidate(
        value, database_path=args.projection, projection_digest=args.projection_digest,
        role=args.role, reviewer={"kind": args.reviewer_kind, "id": args.reviewer_id},
        signer=semantic_signer(args.private_key, key_id=args.key_id), now=now(args.now),
    )
    path = store.put_verification(review, policy=value["policy"])
    result = {
        "schema": "memory-semantic-verification-result/v1",
        "verification_sha256": review["verification_sha256"],
        "path": str(path),
    }
    if not protected(value["policy"]):
        result["verification"] = review
    dump(result)
    return 0


def seed_command(args: argparse.Namespace) -> int:
    store = state(args)
    with candidate_intake_guard(args.state_root):
        paths = seed_reviewed_candidates(
            database_path=args.projection, projection_digest=args.projection_digest,
            state=store, now=now(args.now),
        )
    dump({"schema": "memory-semantic-seed-result/v1", "candidate_count": len(paths), "paths": [str(path) for path in paths]})
    return 0


def lesson(
    args: argparse.Namespace, *, verifier, store: SemanticState,
) -> tuple[dict, dict, list[dict]]:
    candidate = store.read_record(args.candidate)
    reviewed = reviews(args.review, store)
    value = build_lesson(
        candidate, reviews=reviewed, owner=args.owner, verifier=verifier,
        version=args.version, lesson_id=args.lesson_id, now=now(args.now),
        supersedes=load(args.supersedes) if args.supersedes else None,
    )
    return candidate, value, reviewed


def bundle_command(args: argparse.Namespace) -> int:
    store = state(args)
    verifier = semantic_verifier(args.public_key, key_id=args.key_id)
    candidate, promoted, reviewed = lesson(args, verifier=verifier, store=store)
    manifest = build_promotion_manifest(
        candidate, promoted, reviews=reviewed,
        author={"kind": "service", "id": args.promotion_service}, branch=args.branch,
        pull_request=args.pull_request,
        signer=semantic_signer(args.private_key, key_id=args.key_id), verifier=verifier,
        now=now(args.now),
    )
    category = f"promotions/semantic/{manifest['manifest_id']}"
    lesson_path = store.put_record(
        category, "lesson", promoted,
        policy=promoted["policy"],
    )
    manifest_path = Path(args.state_root).resolve() / category / "manifest.json"
    _atomic_private_write(manifest_path, manifest)
    result = {
        "schema": "memory-semantic-promotion-bundle-result/v1",
        "lesson_sha256": promoted["lesson_sha256"], "manifest": manifest,
        "lesson_path": str(lesson_path), "manifest_path": str(manifest_path),
    }
    if not protected(promoted["policy"]):
        result["lesson"] = promoted
    dump(result)
    return 0


def open_pr_command(args: argparse.Namespace) -> int:
    store = state(args)
    verifier = semantic_verifier(args.public_key, key_id=args.key_id)
    candidate, promoted, reviewed = lesson(args, verifier=verifier, store=store)
    manifest, url = open_promotion_pull_request(
        candidate, promoted, reviews=reviewed,
        author={"kind": "service", "id": args.promotion_service}, branch=args.branch,
        repository_root=args.root, signer=semantic_signer(args.private_key, key_id=args.key_id),
        verifier=verifier, now=now(args.now),
    )
    category = f"promotions/semantic/{manifest['manifest_id']}"
    lesson_path = store.put_record(
        category, "lesson", promoted,
        policy=promoted["policy"],
    )
    manifest_path = Path(args.state_root).resolve() / category / "manifest.json"
    _atomic_private_write(manifest_path, manifest)
    dump({
        "schema": "memory-semantic-promotion-pr-result/v1", "pull_request": url,
        "manifest": manifest, "lesson_sha256": promoted["lesson_sha256"],
        "lesson_path": str(lesson_path), "manifest_path": str(manifest_path),
    })
    return 0


def activation_command(args: argparse.Namespace) -> int:
    store = state(args)
    candidate = store.read_record(args.candidate)
    promoted = store.read_record(args.lesson)
    manifest = load(args.manifest)
    manifest_verifier = semantic_verifier(args.public_key, key_id=args.key_id)
    merged = verify_merged_promotion(
        manifest, repository_root=args.root, verifier=manifest_verifier,
    )
    activation_time = now(args.now) or dt.datetime.now(dt.timezone.utc)
    merged_at = dt.datetime.fromisoformat(merged["merged_at"].replace("Z", "+00:00"))
    if activation_time < merged_at:
        raise SemanticMemoryError("semantic-activation-cannot-predate-pr-merge")
    prior = store.read_record(args.prior_event) if args.prior_event else None
    event, request = build_activation_request(
        candidate, promoted, manifest, expected_head=args.expected_head,
        service_id=args.promotion_service,
        verifier=manifest_verifier,
        prior_event=prior, store_bindings=[load(path) for path in args.store_binding],
        now=activation_time,
    )
    category = f"activations/semantic/{manifest['manifest_id']}"
    event_path = store.put_record(
        category, "event", event,
        policy=event["policy"],
    )
    request_path = store.put_record(
        category, "request", request,
        policy=event["policy"],
    )
    result = {
        "schema": "memory-semantic-activation-request-result/v1", "merged": merged,
        "request_sha256": "sha256:" + canonical_sha256(request),
        "event_path": str(event_path),
        "request_path": str(request_path),
    }
    if not protected(event["policy"]):
        result["request"] = request
    dump(result)
    return 0


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(prog="memory-semantic")
    commands = root.add_subparsers(dest="command", required=True)

    def operational(command: argparse.ArgumentParser) -> None:
        command.add_argument("--root", default=".")
        command.add_argument("--state-root", required=True)
        command.add_argument("--now")
        command.add_argument("--protected-master-key")
        command.add_argument("--protected-key-id")

    intake = commands.add_parser("candidate-intake")
    operational(intake)
    intake.add_argument("--candidate-type", choices=["fact", "lesson"], required=True)
    intake.add_argument("--source-basis", choices=[
        "structured-correction", "reviewed-outcome", "authoritative-policy",
        "empirical-observations", "current-evidence-extraction",
    ], required=True)
    intake.add_argument("--semantic", required=True)
    intake.add_argument("--origin", action="append", required=True)
    intake.add_argument("--creator-kind", choices=["agent", "human", "supervisor", "adapter", "system", "service"], required=True)
    intake.add_argument("--creator-id", required=True)
    intake.add_argument("--policy", required=True)
    intake.set_defaults(handler=candidate_command)

    verify = commands.add_parser("verify")
    operational(verify)
    verify.add_argument("--candidate", required=True)
    verify.add_argument("--projection", required=True)
    verify.add_argument("--projection-digest", required=True)
    verify.add_argument("--role", choices=["evidence", "applicability", "security", "extraction"], required=True)
    verify.add_argument("--reviewer-kind", choices=["human", "service", "system"], required=True)
    verify.add_argument("--reviewer-id", required=True)
    verify.add_argument("--private-key", required=True)
    verify.add_argument("--key-id", required=True)
    verify.set_defaults(handler=verify_command)

    seed = commands.add_parser("seed-reviewed")
    operational(seed)
    seed.add_argument("--projection", required=True)
    seed.add_argument("--projection-digest", required=True)
    seed.set_defaults(handler=seed_command)

    def promotion(command: argparse.ArgumentParser) -> None:
        operational(command)
        command.add_argument("--candidate", required=True)
        command.add_argument("--review", action="append", required=True)
        command.add_argument("--owner", required=True)
        command.add_argument("--version", type=int, default=1)
        command.add_argument("--lesson-id")
        command.add_argument("--supersedes")
        command.add_argument("--promotion-service", required=True)
        command.add_argument("--branch", required=True)
        command.add_argument("--private-key", required=True)
        command.add_argument("--public-key", required=True)
        command.add_argument("--key-id", required=True)

    bundle = commands.add_parser("promotion-bundle")
    promotion(bundle)
    bundle.add_argument("--pull-request", type=int, required=True)
    bundle.set_defaults(handler=bundle_command)

    open_pr = commands.add_parser("open-promotion-pr")
    promotion(open_pr)
    open_pr.set_defaults(handler=open_pr_command)

    activation = commands.add_parser("activation-request")
    operational(activation)
    activation.add_argument("--candidate", required=True)
    activation.add_argument("--lesson", required=True)
    activation.add_argument("--manifest", required=True)
    activation.add_argument("--prior-event")
    activation.add_argument("--store-binding", action="append", default=[])
    activation.add_argument("--expected-head", required=True)
    activation.add_argument("--promotion-service", required=True)
    activation.add_argument("--public-key", required=True)
    activation.add_argument("--key-id", required=True)
    activation.set_defaults(handler=activation_command)
    return root


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        return int(args.handler(args))
    except (OSError, ValueError, SemanticMemoryError) as exc:
        dump({"schema": "memory-semantic-error/v1", "ok": False, "code": str(exc)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
