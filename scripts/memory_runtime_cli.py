#!/usr/bin/env python3
"""Operator CLI for the production memory projection and lifecycle boundary."""
from __future__ import annotations

import argparse
import dataclasses
import datetime as dt
import json
import sys
from pathlib import Path

from memory_runtime import (
    IdentityResolutionError,
    MemoryRuntimeError,
    ProjectionManager,
    ProviderAuthorizationError,
    RuntimeLifecycle,
    authorize_provider,
    build_identity_registry,
    ed25519_checkpoint_signer,
    ed25519_checkpoint_verifier,
    ed25519_policy_verifier,
    resolve_identity,
)


def _load(path: str) -> dict:
    value = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise MemoryRuntimeError("input-is-not-object")
    return value


def _dump(value: object) -> None:
    sys.stdout.write(json.dumps(value, indent=2, sort_keys=True) + "\n")


def _prepare(args: argparse.Namespace) -> int:
    manager = ProjectionManager(
        args.root,
        args.state_root,
        checkpoint_path=args.checkpoint,
        writer_owner_path=args.writer_owner,
        writer_head_path=args.writer_head,
        canonical_ledger_path=args.canonical_ledger,
        protected_store_root=args.protected_store,
        protected_master_key_path=args.protected_master_key,
        protected_key_id=args.protected_key_id,
        projection_service_identity=args.projection_service_identity,
        signer=ed25519_checkpoint_signer(args.private_key, key_id=args.key_id),
        verifier=ed25519_checkpoint_verifier(args.public_key, key_id=args.key_id),
    )
    now = dt.datetime.fromisoformat(args.now.replace("Z", "+00:00")) if args.now else None
    _dump({"schema": "memory-runtime-prepare-result/v1", "ok": True, "snapshot": dataclasses.asdict(manager.prepare(now=now))})
    return 0


def _identity_build(args: argparse.Namespace) -> int:
    _dump(build_identity_registry(args.root, as_of_system_time=args.as_of))
    return 0


def _identity_resolve(args: argparse.Namespace) -> int:
    _dump(resolve_identity(
        _load(args.registry), legal_name=args.legal_name, venue=args.venue,
        currency=args.currency, ticker=args.ticker, identifiers=args.identifier,
    ))
    return 0


def _authorize(args: argparse.Namespace) -> int:
    _dump(authorize_provider(
        _load(args.policy), provider=args.provider, model=args.model,
        service_identity=args.service_identity,
        requested_classifications=args.classification,
        requested_source_tiers=args.source_tier,
        verifier=ed25519_policy_verifier(args.public_key, key_id=args.key_id),
    ))
    return 0


def _purge(args: argparse.Namespace) -> int:
    lifecycle = RuntimeLifecycle(args.state_root)
    removed = lifecycle.purge_event(args.event_id)
    _dump({"schema": "memory-runtime-purge-result/v1", "event_id": args.event_id, "removed": list(removed), "absent": lifecycle.event_absent(args.event_id)})
    return 0


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(prog="memory-runtime", description=__doc__)
    commands = root.add_subparsers(dest="command", required=True)

    prepare = commands.add_parser("prepare", help="verify production state or perform one clean rebuild")
    prepare.add_argument("--root", default=".")
    prepare.add_argument("--state-root", required=True)
    prepare.add_argument("--checkpoint", required=True)
    prepare.add_argument("--writer-owner", required=True)
    prepare.add_argument("--writer-head", required=True)
    prepare.add_argument("--canonical-ledger", required=True)
    prepare.add_argument("--protected-store", required=True)
    prepare.add_argument("--protected-master-key", required=True)
    prepare.add_argument("--protected-key-id", required=True)
    prepare.add_argument("--projection-service-identity", required=True)
    prepare.add_argument("--private-key", required=True)
    prepare.add_argument("--public-key", required=True)
    prepare.add_argument("--key-id", required=True)
    prepare.add_argument("--now")
    prepare.set_defaults(handler=_prepare)

    identity = commands.add_parser("identity-build", help="backfill the conservative identity registry")
    identity.add_argument("--root", default=".")
    identity.add_argument("--as-of", required=True)
    identity.set_defaults(handler=_identity_build)

    resolve = commands.add_parser("identity-resolve", help="resolve one exact issuer/listing tuple")
    resolve.add_argument("--registry", required=True)
    resolve.add_argument("--legal-name", required=True)
    resolve.add_argument("--venue", required=True)
    resolve.add_argument("--currency", required=True)
    resolve.add_argument("--ticker", required=True)
    resolve.add_argument("--identifier", action="append", default=[])
    resolve.set_defaults(handler=_identity_resolve)

    authorize = commands.add_parser("authorize", help="narrow one signed provider policy")
    authorize.add_argument("--policy", required=True)
    authorize.add_argument("--provider", required=True)
    authorize.add_argument("--model", required=True)
    authorize.add_argument("--service-identity", required=True)
    authorize.add_argument("--classification", action="append", required=True)
    authorize.add_argument("--source-tier", action="append", required=True, type=int)
    authorize.add_argument("--public-key", required=True)
    authorize.add_argument("--key-id", required=True)
    authorize.set_defaults(handler=_authorize)

    purge = commands.add_parser("purge", help="purge all registered runtime derivatives for one event")
    purge.add_argument("--state-root", required=True)
    purge.add_argument("--event-id", required=True)
    purge.set_defaults(handler=_purge)
    return root


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        return int(args.handler(args))
    except (OSError, ValueError, MemoryRuntimeError, IdentityResolutionError, ProviderAuthorizationError) as exc:
        _dump({"schema": "memory-runtime-error/v1", "ok": False, "code": str(exc)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
