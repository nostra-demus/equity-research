#!/usr/bin/env python3
"""Supervisor CLI for frozen research-memory runs and per-agent task receipts."""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import sqlite3
import sys
from pathlib import Path

from memory_profiles import parse_profile
from memory_projection import verify_projection
from memory_runtime import (
    EXCHANGE_MICS,
    MemoryRuntimeError,
    ProjectionManager,
    RuntimeLifecycle,
    authorize_provider,
    ed25519_checkpoint_signer,
    ed25519_checkpoint_verifier,
    ed25519_policy_verifier,
    resolve_identity,
    _safe_regular,
)
from research_memory_run import (
    ResearchMemoryError,
    build_provider_authorization,
    build_run_episode,
    build_run_receipt,
    build_task_episode,
    compile_agent_packet,
    ed25519_contract_signer,
    ed25519_contract_verifier,
    load_provider_authorization,
    load_run_receipt,
    materialize_memory_use,
    sha,
    store_packet,
    store_provider_authorization,
    store_run_receipt,
    utc_now,
    validate_memory_use,
)


SAFE_AGENT_KEY = re.compile(r"^(?:[a-z][a-z0-9-]*/[0-9]{2}_[a-z0-9-]+|master/synthesizer)$")
SAFE_RUN_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
SAFE_EVIDENCE_LOCATOR = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._~:/?&=,+-]{0,255}$")


def load_object(path: str | Path) -> dict:
    value = json.loads(_safe_regular(Path(path)))
    if not isinstance(value, dict):
        raise ResearchMemoryError("input-not-object")
    return value


def dump(value: object) -> None:
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def safe_run_id(value: str) -> str:
    if SAFE_RUN_ID.fullmatch(value) is None:
        raise ResearchMemoryError("runtime-run-id-invalid")
    return value


def receipt_path(state_root: Path, run_id: str) -> Path:
    return state_root / "resumes" / safe_run_id(run_id) / "run-receipt.json"


def frozen_projection_path(state_root: Path, run_id: str) -> Path:
    return state_root / "resumes" / safe_run_id(run_id) / "projection.sqlite"


def load_bound_authorization(
    state: Path, *, run_id: str, path: str, expected_sha256: str,
    receipt: dict, verifier,
) -> dict:
    authorized_root = (state / "resumes" / safe_run_id(run_id) / "provider-authorizations").resolve()
    authorization_path = Path(path)
    if (
        not authorization_path.is_absolute()
        or authorization_path.parent.resolve() != authorized_root
        or authorization_path.suffix != ".json"
    ):
        raise ResearchMemoryError("provider-authorization-path-invalid")
    authorization = load_provider_authorization(
        authorization_path, receipt=receipt, verifier=verifier,
    )
    if (
        authorization_path.stem != authorization["authorization_id"]
        or expected_sha256 != authorization["authorization_sha256"]
    ):
        raise ResearchMemoryError("provider-authorization-binding-invalid")
    return authorization


def verify_current_evidence(
    root: Path, *, ticker: str, output: str, rows: object,
) -> tuple[Path, list[str]]:
    root = root.resolve()
    if not isinstance(rows, list) or len(rows) > 128:
        raise ResearchMemoryError("memory-use-current-evidence-invalid")
    output_relative = Path(output)
    if output_relative.is_absolute() or ".." in output_relative.parts:
        raise ResearchMemoryError("memory-output-path-invalid")
    output_path = (root / output_relative).resolve()
    try:
        output_parts = output_path.relative_to(root).parts
    except ValueError as exc:
        raise ResearchMemoryError("memory-output-path-invalid") from exc
    if len(output_parts) < 3 or output_parts[0] != "analyses":
        raise ResearchMemoryError("memory-output-path-invalid")
    output_root = (root / output_parts[0] / output_parts[1]).resolve()
    data_root = (root / "data" / ticker).resolve()
    refs: list[str] = []
    for row in rows:
        if not isinstance(row, dict) or set(row) != {"ref", "path", "locator"}:
            raise ResearchMemoryError("memory-use-current-evidence-invalid")
        relative = row.get("path")
        locator = row.get("locator")
        ref = row.get("ref")
        if (
            not isinstance(relative, str)
            or Path(relative).is_absolute()
            or "\\" in relative
            or Path(relative).as_posix() != relative
            or ".." in Path(relative).parts
        ):
            raise ResearchMemoryError("memory-use-current-evidence-path-invalid")
        if not isinstance(locator, str) or SAFE_EVIDENCE_LOCATOR.fullmatch(locator) is None:
            raise ResearchMemoryError("memory-use-current-evidence-locator-invalid")
        target = (root / relative).resolve()
        if not (
            target == data_root or data_root in target.parents
            or target == output_root or output_root in target.parents
        ):
            raise ResearchMemoryError("memory-use-current-evidence-path-outside-run")
        raw = _safe_regular(target, owner_only=False)
        digest = hashlib.sha256(raw).hexdigest()
        expected = f"evidence:sha256:{digest}#{locator}"
        if ref != expected:
            raise ResearchMemoryError("memory-use-current-evidence-hash-mismatch")
        refs.append(expected)
    return output_path, refs


def normalize_agent_draft(
    root: Path, *, ticker: str, output: str, draft: object,
) -> tuple[Path, dict]:
    expected_fields = {
        "schema", "used", "checked_rejected", "contradicted", "not_applicable",
        "current_evidence", "playbook", "candidate_suggestions",
    }
    if not isinstance(draft, dict) or draft.get("schema") != "memory-use-draft/v1" or set(draft) != expected_fields:
        raise ResearchMemoryError("memory-use-agent-input-must-be-closed-draft")
    output_path, refs = verify_current_evidence(
        root, ticker=ticker, output=output, rows=draft.get("current_evidence"),
    )
    internal = {**draft, "current_evidence_refs": refs}
    internal.pop("current_evidence", None)
    return output_path, internal


def copy_frozen_projection(source: Path, target: Path, expected_digest: str) -> None:
    target.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    temporary = target.parent / f".{target.name}.{os.getpid()}"
    source_uri = f"file:{source.resolve().as_posix()}?mode=ro&immutable=1"
    try:
        src = sqlite3.connect(source_uri, uri=True)
        dst = sqlite3.connect(temporary)
        try:
            src.backup(dst)
            dst.commit()
        finally:
            dst.close()
            src.close()
        os.chmod(temporary, 0o600)
        verify_projection(temporary, expected_digest=expected_digest.removeprefix("sha256:"))
        os.replace(temporary, target)
        if os.name == "posix":
            directory = os.open(target.parent, os.O_RDONLY)
            try:
                os.fsync(directory)
            finally:
                os.close(directory)
    finally:
        if temporary.exists():
            temporary.unlink()


def _profile(root: Path, agent_key: str) -> tuple[dict, str, str]:
    if SAFE_AGENT_KEY.fullmatch(agent_key) is None:
        raise ResearchMemoryError("agent-key-invalid")
    if agent_key == "master/synthesizer":
        path = root / ".claude" / "agents" / "synthesizer.md"
        role = "master-synthesizer"
        agent_id = "master-synthesizer"
    else:
        module, stem = agent_key.split("/", 1)
        path = root / ".claude" / "agents" / module / f"{stem}.md"
        role = "module-synthesizer" if stem.startswith("99_") else "specialist"
        agent_id = f"{module}-{stem[3:]}"
    profile = parse_profile(path.read_text(encoding="utf-8"), path)
    return profile, role, agent_id


def prepare(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    state = Path(args.state_root).resolve()
    verifier = ed25519_contract_verifier(args.contract_public_key, key_id=args.contract_key_id)
    signer = ed25519_contract_signer(args.contract_private_key, key_id=args.contract_key_id)
    policy = load_object(args.provider_policy)
    provider_access = authorize_provider(
        policy, provider=args.provider, model=args.model, service_identity=args.service_identity,
        requested_classifications=args.classification, requested_source_tiers=args.source_tier,
        verifier=ed25519_policy_verifier(args.policy_public_key, key_id=args.policy_key_id),
    )
    existing = receipt_path(state, args.run_id)
    if args.reuse and existing.exists():
        receipt = load_run_receipt(existing, verifier=verifier)
        projection = frozen_projection_path(state, args.run_id)
        verify_projection(projection, expected_digest=receipt["projection_digest"].removeprefix("sha256:"))
        listing = receipt["issuer_listing"]
        if (
            " ".join(args.legal_name.split()).casefold() != str(listing["legal_name"]).casefold()
            or EXCHANGE_MICS.get(args.venue) != listing["mic"]
            or args.currency.upper() != listing["currency"]
            or args.ticker.upper() != listing["ticker"]
        ):
            raise ResearchMemoryError("resume-issuer-listing-mismatch")
        now = dt.datetime.fromisoformat(args.now.replace("Z", "+00:00")) if args.now else None
        authorization = build_provider_authorization(
            receipt=receipt, provider_access=provider_access, signer=signer, now=now,
        )
        authorization_path = store_provider_authorization(state, args.run_id, authorization)
        dump({
            "schema": "research-memory-prepare-result/v1", "ok": True, "reused": True,
            "receipt_id": receipt["receipt_id"], "receipt_path": str(existing),
            "projection_path": str(projection), "receipt_sha256": receipt["receipt_sha256"],
            "authorization_id": authorization["authorization_id"],
            "authorization_path": str(authorization_path),
            "authorization_sha256": authorization["authorization_sha256"],
        })
        return 0
    projection_root = state / "projection"
    manager = ProjectionManager(
        root, projection_root, checkpoint_path=args.checkpoint,
        writer_owner_path=args.writer_owner, writer_head_path=args.writer_head,
        canonical_ledger_path=args.canonical_ledger,
        protected_store_root=args.protected_store,
        protected_master_key_path=args.protected_master_key,
        protected_key_id=args.protected_key_id,
        projection_service_identity=args.projection_service_identity,
        signer=ed25519_checkpoint_signer(args.checkpoint_private_key, key_id=args.checkpoint_key_id),
        verifier=ed25519_checkpoint_verifier(args.checkpoint_public_key, key_id=args.checkpoint_key_id),
    )
    now = dt.datetime.fromisoformat(args.now.replace("Z", "+00:00")) if args.now else None
    snapshot = manager.prepare(now=now)
    registry = load_object(projection_root / "identity-registry.json")
    listing = resolve_identity(
        registry, legal_name=args.legal_name, venue=args.venue,
        currency=args.currency, ticker=args.ticker, identifiers=args.identifier,
    )
    parent_id = None
    if args.parent_receipt:
        parent_id = load_run_receipt(args.parent_receipt, verifier=verifier)["receipt_id"]
    receipt = build_run_receipt(
        run_id=args.run_id, snapshot=snapshot, issuer_listing=listing,
        provider_access=provider_access, active_playbooks=[],
        snapshot_reason="deliberate-rerun" if args.parent_receipt else "new-run",
        parent_receipt_id=parent_id,
        signer=signer,
        now=now,
    )
    frozen = frozen_projection_path(state, args.run_id)
    copy_frozen_projection(projection_root / "projection.sqlite", frozen, snapshot.projection_digest)
    stored = store_run_receipt(state, receipt)
    # Recheck the exact immutable copy and signed receipt after both renames.
    verify_projection(frozen, expected_digest=receipt["projection_digest"].removeprefix("sha256:"))
    load_run_receipt(stored, verifier=verifier)
    authorization = build_provider_authorization(
        receipt=receipt, provider_access=provider_access, signer=signer, now=now,
    )
    authorization_path = store_provider_authorization(state, args.run_id, authorization)
    dump({
        "schema": "research-memory-prepare-result/v1", "ok": True, "reused": False,
        "receipt_id": receipt["receipt_id"], "receipt_path": str(stored),
        "projection_path": str(frozen), "receipt_sha256": receipt["receipt_sha256"],
        "authorization_id": authorization["authorization_id"],
        "authorization_path": str(authorization_path),
        "authorization_sha256": authorization["authorization_sha256"],
    })
    return 0


def verify(args: argparse.Namespace) -> int:
    state = Path(args.state_root).resolve()
    receipt = load_run_receipt(
        receipt_path(state, args.run_id),
        verifier=ed25519_contract_verifier(args.contract_public_key, key_id=args.contract_key_id),
    )
    projection = frozen_projection_path(state, args.run_id)
    result = verify_projection(projection, expected_digest=receipt["projection_digest"].removeprefix("sha256:"))
    authorization = load_bound_authorization(
        state, run_id=args.run_id, path=args.authorization,
        expected_sha256=args.authorization_sha256, receipt=receipt,
        verifier=ed25519_contract_verifier(args.contract_public_key, key_id=args.contract_key_id),
    )
    dump({
        "schema": "research-memory-verify-result/v1", "ok": True,
        "receipt_id": receipt["receipt_id"], "receipt_sha256": receipt["receipt_sha256"],
        "projection_digest": "sha256:" + result.digest,
        "authorization_id": authorization["authorization_id"],
        "authorization_sha256": authorization["authorization_sha256"],
    })
    return 0


def compile_packet(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    state = Path(args.state_root).resolve()
    receipt = load_run_receipt(
        receipt_path(state, args.run_id),
        verifier=ed25519_contract_verifier(args.contract_public_key, key_id=args.contract_key_id),
    )
    authorization = load_bound_authorization(
        state, run_id=args.run_id, path=args.authorization,
        expected_sha256=args.authorization_sha256, receipt=receipt,
        verifier=ed25519_contract_verifier(args.contract_public_key, key_id=args.contract_key_id),
    )
    effective_receipt = {**receipt, "provider_access": authorization["provider_access"]}
    profile, role, _agent_id = _profile(root, args.agent_key)
    disabled_playbooks: list[tuple[str, int | None]] = []
    for item in args.disable_playbook:
        playbook_id, separator, version_text = item.rpartition("@")
        if separator and version_text.isdigit():
            disabled_playbooks.append((playbook_id, int(version_text)))
        else:
            disabled_playbooks.append((item, None))
    pinned_playbooks: dict[str, int] = {}
    for item in args.pin_playbook:
        playbook_id, separator, version_text = item.rpartition("@")
        if not separator or not version_text.isdigit() or playbook_id in pinned_playbooks:
            raise ResearchMemoryError("memory-control-pin-invalid")
        pinned_playbooks[playbook_id] = int(version_text)
    query, packet, rendered = compile_agent_packet(
        frozen_projection_path(state, args.run_id), receipt=effective_receipt, profile=profile,
        agent_id=args.agent_key, role=role, valid_date=args.valid_date,
        disabled_layers=args.disable_layer, disabled_playbooks=disabled_playbooks,
        pinned_playbooks=pinned_playbooks,
    )
    query_path, packet_path, rendered_path = store_packet(
        state, run_id=args.run_id, agent_id=args.agent_key,
        query=query, packet=packet, rendered=rendered,
    )
    lifecycle = RuntimeLifecycle(state)
    for section in packet["sections"].values():
        for entry in section["entries"]:
            event_id = entry["record"]["record_id"]
            if re.fullmatch(r"evt_[0-9a-f-]{36}", event_id):
                for path in (query_path, packet_path, rendered_path):
                    lifecycle.register(event_id, "packet-cache", path)
    dump({
        "schema": "research-memory-compile-result/v1", "ok": True,
        "agent_key": args.agent_key, "packet_id": packet["context_packet_id"],
        "packet_sha256": packet["content_sha256"], "query_sha256": packet["query_sha256"],
        "packet_path": str(packet_path), "rendered_path": str(rendered_path),
        "rendered": rendered,
    })
    return 0


def attest(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    state = Path(args.state_root).resolve()
    receipt = load_run_receipt(
        receipt_path(state, args.run_id),
        verifier=ed25519_contract_verifier(args.contract_public_key, key_id=args.contract_key_id),
    )
    authorization = load_bound_authorization(
        state, run_id=args.run_id, path=args.authorization,
        expected_sha256=args.authorization_sha256, receipt=receipt,
        verifier=ed25519_contract_verifier(args.contract_public_key, key_id=args.contract_key_id),
    )
    effective_receipt = {**receipt, "provider_access": authorization["provider_access"]}
    profile, _role, agent_id = _profile(root, args.agent_key)
    safe_agent = re.sub(r"[^A-Za-z0-9._-]+", "_", args.agent_key)
    packet = load_object(state / "packet-cache" / args.run_id / safe_agent / "packet.json")
    query = load_object(state / "packet-cache" / args.run_id / safe_agent / "query.json")
    draft_or_use = load_object(args.use)
    output_path, internal_draft = normalize_agent_draft(
        root, ticker=receipt["issuer_listing"]["ticker"], output=args.output, draft=draft_or_use,
    )
    use = materialize_memory_use(
        internal_draft, receipt=effective_receipt, packet=packet,
        task_id=args.task_id, agent_id=agent_id,
    )
    output = _safe_regular(output_path, owner_only=False)
    attestation = validate_memory_use(
        use, packet=packet, output=output,
        signer=ed25519_contract_signer(args.contract_private_key, key_id=args.contract_key_id),
        supervisor_id=args.supervisor_id,
    )
    task = build_task_episode(
        run_id=args.run_id, task_id=args.task_id, issuer_listing=receipt["issuer_listing"],
        agent_id=agent_id, task=profile["task"],
        provider=authorization["provider_access"]["provider"],
        model=authorization["provider_access"]["model"], prompt_program_sha=receipt["repository_sha"],
        output=output, packet=packet, query=query, attestation=attestation,
        latency_milliseconds=args.latency_ms, cost_microusd=args.cost_microusd,
        quality_gates=[{"name": "output-contract", "passed": args.output_gate_passed}],
    )
    directory = state / "execution-receipts" / args.run_id / safe_agent
    attestation_path = directory / "use-attestation.json"
    episode_path = directory / "task-episode.json"
    from memory_runtime import _atomic_private_write
    _atomic_private_write(attestation_path, attestation)
    _atomic_private_write(directory / "memory-use.json", use)
    _atomic_private_write(episode_path, task)
    dump({
        "schema": "research-memory-attest-result/v1", "ok": True, "valid": attestation["valid"],
        "attestation_id": attestation["attestation_id"], "episode_id": task["episode_id"],
        "status": task["status"], "error_codes": task["error_codes"],
    })
    return 0 if attestation["valid"] or args.mode == "shadow" else 2


def finalize(args: argparse.Namespace) -> int:
    state = Path(args.state_root).resolve()
    receipt = load_run_receipt(
        receipt_path(state, args.run_id),
        verifier=ed25519_contract_verifier(args.contract_public_key, key_id=args.contract_key_id),
    )
    task_episodes = []
    root = state / "execution-receipts" / args.run_id
    for path in sorted(root.glob("*/task-episode.json")) if root.exists() else []:
        task_episodes.append(load_object(path))
    status = args.status
    if args.mode == "enforced" and len(task_episodes) != args.expected_tasks:
        status = "blocked"
    episode = build_run_episode(
        run_id=args.run_id, receipt=receipt, mode=args.mode, task_episodes=task_episodes,
        expected_task_count=args.expected_tasks, status=status,
        started_at=args.started_at, completed_at=utc_now() if status == "completed" else None,
    )
    from memory_runtime import _atomic_private_write
    output = state / "execution-receipts" / args.run_id / "run-episode.json"
    _atomic_private_write(output, episode)
    dump({
        "schema": "research-memory-finalize-result/v1", "ok": status == "completed",
        "status": status, "episode_id": episode["episode_id"],
        "coverage_pct": episode["memory_coverage_pct"], "path": str(output),
    })
    return 0 if status == "completed" or args.mode == "shadow" else 2


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(prog="research-memory-run")
    sub = root.add_subparsers(dest="command", required=True)

    def common(command: argparse.ArgumentParser) -> None:
        command.add_argument("--root", default=".")
        command.add_argument("--state-root", required=True)
        command.add_argument("--run-id", required=True)
        command.add_argument("--contract-public-key", required=True)
        command.add_argument("--contract-key-id", required=True)

    p = sub.add_parser("prepare")
    common(p)
    p.add_argument("--reuse", action="store_true")
    p.add_argument("--checkpoint", required=True)
    p.add_argument("--writer-owner", required=True)
    p.add_argument("--writer-head", required=True)
    p.add_argument("--canonical-ledger", required=True)
    p.add_argument("--protected-store", required=True)
    p.add_argument("--protected-master-key", required=True)
    p.add_argument("--protected-key-id", required=True)
    p.add_argument("--projection-service-identity", required=True)
    p.add_argument("--checkpoint-private-key", required=True)
    p.add_argument("--checkpoint-public-key", required=True)
    p.add_argument("--checkpoint-key-id", required=True)
    p.add_argument("--contract-private-key", required=True)
    p.add_argument("--provider-policy", required=True)
    p.add_argument("--policy-public-key", required=True)
    p.add_argument("--policy-key-id", required=True)
    p.add_argument("--provider", required=True)
    p.add_argument("--model", required=True)
    p.add_argument("--service-identity", required=True)
    p.add_argument("--classification", action="append", required=True)
    p.add_argument("--source-tier", action="append", required=True, type=int)
    p.add_argument("--legal-name", required=True)
    p.add_argument("--venue", required=True)
    p.add_argument("--currency", required=True)
    p.add_argument("--ticker", required=True)
    p.add_argument("--identifier", action="append", default=[])
    p.add_argument("--parent-receipt")
    p.add_argument("--now")
    p.set_defaults(handler=prepare)

    v = sub.add_parser("verify")
    common(v)
    v.add_argument("--authorization", required=True)
    v.add_argument("--authorization-sha256", required=True)
    v.set_defaults(handler=verify)

    c = sub.add_parser("compile")
    common(c)
    c.add_argument("--authorization", required=True)
    c.add_argument("--authorization-sha256", required=True)
    c.add_argument("--agent-key", required=True)
    c.add_argument("--valid-date", required=True)
    c.add_argument("--disable-layer", action="append", choices=["episodic", "semantic", "procedural"], default=[])
    c.add_argument("--disable-playbook", action="append", default=[])
    c.add_argument("--pin-playbook", action="append", default=[])
    c.set_defaults(handler=compile_packet)

    a = sub.add_parser("attest")
    common(a)
    a.add_argument("--authorization", required=True)
    a.add_argument("--authorization-sha256", required=True)
    a.add_argument("--contract-private-key", required=True)
    a.add_argument("--agent-key", required=True)
    a.add_argument("--task-id", required=True)
    a.add_argument("--output", required=True)
    a.add_argument("--use", required=True)
    a.add_argument("--supervisor-id", required=True)
    a.add_argument("--latency-ms", type=int, default=0)
    a.add_argument("--cost-microusd", type=int, default=0)
    a.add_argument("--output-gate-passed", action="store_true")
    a.add_argument("--mode", choices=["shadow", "enforced"], required=True)
    a.set_defaults(handler=attest)

    f = sub.add_parser("finalize")
    common(f)
    f.add_argument("--mode", choices=["shadow", "enforced"], required=True)
    f.add_argument("--expected-tasks", type=int, required=True)
    f.add_argument("--status", choices=["completed", "failed", "incomplete", "blocked"], required=True)
    f.add_argument("--started-at", required=True)
    f.set_defaults(handler=finalize)
    return root


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        return int(args.handler(args))
    except (OSError, ValueError, sqlite3.Error, MemoryRuntimeError, ResearchMemoryError) as exc:
        dump({"schema": "research-memory-error/v1", "ok": False, "code": str(exc)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
