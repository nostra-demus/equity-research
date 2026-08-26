#!/usr/bin/env python3
"""Governed procedural memory: candidates, replay, promotion, execution, and quarantine.

Candidate procedures are inert. Only a reviewed ``memory-playbook/v1`` whose signed commitment was
merged through a ``codex/memory-promotion-*`` pull request can be activated by the controlled
writer. Emergency quarantine is the sole no-PR state transition and still requires the writer's
dedicated quarantine identity.
"""
from __future__ import annotations

import copy
import base64
import datetime as dt
import json
import re
import tempfile
from pathlib import Path
from typing import Any, Callable, Mapping, Sequence

try:
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_phase5_contract import validate_write_request
    from memory_profiles import parse_profile, research_agent_files
    from memory_runtime import (
        _safe_regular,
        ed25519_sign,
        ed25519_verify,
        load_master_key_file,
    )
    from memory_semantic import (
        CommandRunner,
        SemanticMemoryError,
        SemanticState,
        Signer,
        Verifier,
        _command,
        _event_id,
        _memory_id,
        _run_id,
        _trace_id,
        _without,
        verify_signed,
    )
    from memory_three_layer_contract import (
        PERMITTED_DETERMINISTIC_TOOLS,
        validate_contract,
        validate_promotion_bundle,
    )
    from research_memory_run import sha, utc_now
except ImportError:  # pragma: no cover - package-style imports
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_phase5_contract import validate_write_request
    from scripts.memory_profiles import parse_profile, research_agent_files
    from scripts.memory_runtime import (
        _safe_regular,
        ed25519_sign,
        ed25519_verify,
        load_master_key_file,
    )
    from scripts.memory_semantic import (
        CommandRunner,
        SemanticMemoryError,
        SemanticState,
        Signer,
        Verifier,
        _command,
        _event_id,
        _memory_id,
        _run_id,
        _trace_id,
        _without,
        verify_signed,
    )
    from scripts.memory_three_layer_contract import (
        PERMITTED_DETERMINISTIC_TOOLS,
        validate_contract,
        validate_promotion_bundle,
    )
    from scripts.research_memory_run import sha, utc_now


HASH_RE = re.compile(r"sha256:[0-9a-f]{64}")
EVENT_RE = re.compile(
    r"evt_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"
)
SAFE_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._/-]{0,127}")
PROMOTION_BRANCH = re.compile(r"codex/memory-promotion-[a-z0-9][a-z0-9-]{0,63}")
INJECTION = re.compile(
    r"(?is)(ignore\s+(?:all\s+)?(?:previous|prior)|system\s+prompt|<\s*/?\s*system|"
    r"curl\s+https?://|rm\s+-rf|BEGIN\s+(?:SYSTEM|INSTRUCTIONS)|"
    r"(?:execute|run)\s+(?:this\s+)?(?:shell|command))"
)
SERIOUS_INCIDENTS = frozenset(
    {"policy-leak", "stale-fact", "prompt-injection", "serious-evidence-error"}
)


class ProceduralMemoryError(ValueError):
    """The requested procedural-memory transition is not authorized or valid."""


def _json_list(value: Any) -> list[Any]:
    """Return only JSON arrays; nulls and scalar impostors are always inert."""

    return value if isinstance(value, list) else []


def _json_string_list(value: Any, *, field: str) -> list[str]:
    """Accept a JSON string array, including an intentionally empty scoped dimension."""

    if not isinstance(value, list) or any(
        not isinstance(item, str) or not item for item in value
    ):
        raise ProceduralMemoryError(f"{field}-must-be-string-array")
    return value


def _text_values(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, Mapping):
        return [text for child in value.values() for text in _text_values(child)]
    if isinstance(value, list):
        return [text for child in value for text in _text_values(child)]
    return []


def procedural_signer(key_path: str | Path, *, key_id: str) -> Signer:
    """Return a playbook-only signer with a protocol-separated signature domain."""

    if SAFE_ID.fullmatch(key_id) is None:
        raise ProceduralMemoryError("playbook-signing-key-id-invalid")

    def sign(message: bytes) -> Mapping[str, str]:
        signature = ed25519_sign(
            load_master_key_file(key_path), b"memory-procedural-governance/v1\0" + message,
        )
        return {
            "key_id": key_id,
            "algorithm": "ed25519",
            "signed_sha256": sha(message),
            "value": base64.urlsafe_b64encode(signature).decode("ascii").rstrip("="),
        }

    return sign


def procedural_verifier(public_key_path: str | Path, *, key_id: str) -> Verifier:
    """Return the verifier paired with :func:`procedural_signer`."""

    if SAFE_ID.fullmatch(key_id) is None:
        raise ProceduralMemoryError("playbook-signing-key-id-invalid")

    def verify(message: bytes, signature: Mapping[str, str]) -> bool:
        if (
            signature.get("key_id") != key_id
            or signature.get("algorithm") != "ed25519"
            or signature.get("signed_sha256") != sha(message)
        ):
            return False
        try:
            raw = base64.urlsafe_b64decode(str(signature.get("value")) + "==")
            public_key = _safe_regular(Path(public_key_path))
        except (OSError, ValueError):
            return False
        return ed25519_verify(
            public_key, b"memory-procedural-governance/v1\0" + message, raw,
        )

    return verify


def _canonical_hash(value: Mapping[str, Any], field: str) -> str:
    return sha(_without(value, field))


def _reviewer_ids(reviewers: Sequence[Mapping[str, Any]]) -> list[str]:
    result: list[str] = []
    for reviewer in reviewers:
        identity = reviewer.get("identity") if isinstance(reviewer, Mapping) else None
        if isinstance(identity, Mapping) and isinstance(identity.get("id"), str):
            result.append(identity["id"])
    return result


def _reviewer_roles(reviewers: Sequence[Mapping[str, Any]]) -> set[str]:
    return {
        str(item.get("role")) for item in reviewers
        if isinstance(item, Mapping) and isinstance(item.get("role"), str)
    }


def _validate_reviewer_set(
    reviewers: Sequence[Mapping[str, Any]], *, creator_id: str,
) -> None:
    ids = _reviewer_ids(reviewers)
    if (
        len(reviewers) != 3
        or len(ids) != 3
        or len(set(ids)) != 3
        or creator_id in ids
        or _reviewer_roles(reviewers) != {"evidence", "applicability", "security"}
    ):
        raise ProceduralMemoryError("playbook-independent-review-incomplete")
    for reviewer in reviewers:
        identity = reviewer.get("identity")
        if (
            not isinstance(identity, Mapping)
            or set(identity) != {"kind", "id"}
            or identity.get("kind") not in {"human", "service", "system"}
            or SAFE_ID.fullmatch(str(identity.get("id"))) is None
        ):
            raise ProceduralMemoryError("playbook-reviewer-identity-invalid")


def verify_candidate_hash(candidate: Mapping[str, Any]) -> None:
    if (
        not isinstance(candidate, Mapping)
        or candidate.get("schema") != "memory-playbook-candidate/v1"
        or candidate.get("candidate_sha256") != _canonical_hash(candidate, "candidate_sha256")
    ):
        raise ProceduralMemoryError("playbook-candidate-hash-invalid")
    errors = validate_contract(candidate)
    if errors:
        raise ProceduralMemoryError("playbook-candidate-invalid: " + "; ".join(errors[:12]))


def build_candidate(
    *, playbook: Mapping[str, Any], created_by: Mapping[str, str],
    policy: Mapping[str, Any], now: dt.datetime | None = None,
) -> dict[str, Any]:
    operations = playbook.get("steps") if isinstance(playbook, Mapping) else None
    if not isinstance(operations, list) or any(
        not isinstance(step, Mapping)
        or not isinstance(step.get("operation"), str)
        for step in operations
    ):
        raise ProceduralMemoryError("playbook-candidate-step-invalid")
    if any(INJECTION.search(text) for text in _text_values(playbook)):
        raise ProceduralMemoryError("playbook-candidate-injection-like-content")
    tools = playbook.get("permitted_tools")
    if not isinstance(tools, list) or not set(tools).issubset(PERMITTED_DETERMINISTIC_TOOLS):
        raise ProceduralMemoryError("playbook-candidate-tool-not-allowlisted")
    created_at = utc_now(now)
    seed = sha({
        "playbook": playbook, "created_by": created_by, "policy": policy,
        "created_at": created_at,
    })
    value: dict[str, Any] = {
        "schema": "memory-playbook-candidate/v1",
        "candidate_id": _memory_id("playbook-candidate", seed),
        "playbook": copy.deepcopy(dict(playbook)),
        "created_by": copy.deepcopy(dict(created_by)),
        "policy": copy.deepcopy(dict(policy)),
        "status": "candidate",
        "created_at": created_at,
        "candidate_sha256": "sha256:" + "0" * 64,
    }
    value["candidate_sha256"] = _canonical_hash(value, "candidate_sha256")
    verify_candidate_hash(value)
    return value


def build_review_attestation(
    candidate: Mapping[str, Any], *, cases: Sequence[Mapping[str, Any]], role: str,
    reviewer: Mapping[str, str], signer: Signer, now: dt.datetime | None = None,
) -> dict[str, Any]:
    """Sign one independent reviewer's approval of the exact candidate and replay bytes."""

    verify_candidate_hash(candidate)
    case_rows = [copy.deepcopy(dict(item)) for item in cases]
    if (
        role not in {"evidence", "applicability", "security"}
        or set(reviewer) != {"kind", "id"}
        or reviewer.get("kind") not in {"human", "service", "system"}
        or SAFE_ID.fullmatch(str(reviewer.get("id"))) is None
        or reviewer.get("id") == candidate.get("created_by", {}).get("id")
    ):
        raise ProceduralMemoryError("playbook-review-attestation-identity-invalid")
    body: dict[str, Any] = {
        "schema": "memory-playbook-review-attestation/v1",
        "role": role,
        "identity": copy.deepcopy(dict(reviewer)),
        "candidate_sha256": candidate["candidate_sha256"],
        "cases_sha256": sha(case_rows),
        "decision": "approved",
        "decided_at": utc_now(now),
        "attestation_sha256": "sha256:" + "0" * 64,
        "signature": {},
    }
    unsigned = _without(body, "attestation_sha256", "signature")
    body["attestation_sha256"] = sha(unsigned)
    message = canonical_json_bytes({**unsigned, "attestation_sha256": body["attestation_sha256"]})
    body["signature"] = dict(signer(message))
    if (
        set(body["signature"]) != {"key_id", "algorithm", "signed_sha256", "value"}
        or body["signature"].get("signed_sha256") != sha(message)
    ):
        raise ProceduralMemoryError("playbook-review-attestation-signer-invalid")
    return body


def verify_review_attestation(
    candidate: Mapping[str, Any], *, cases: Sequence[Mapping[str, Any]],
    attestation: Mapping[str, Any], verifier: Verifier,
) -> bool:
    expected = {
        "schema", "role", "identity", "candidate_sha256", "cases_sha256",
        "decision", "decided_at", "attestation_sha256", "signature",
    }
    return bool(
        set(attestation) == expected
        and attestation.get("schema") == "memory-playbook-review-attestation/v1"
        and attestation.get("candidate_sha256") == candidate.get("candidate_sha256")
        and attestation.get("cases_sha256") == sha([dict(item) for item in cases])
        and attestation.get("decision") == "approved"
        and verify_signed(attestation, hash_field="attestation_sha256", verifier=verifier)
    )


def _verified_reviewers(
    candidate: Mapping[str, Any], cases: Sequence[Mapping[str, Any]],
    attestations: Sequence[Mapping[str, Any]], verifier: Verifier,
) -> list[dict[str, Any]]:
    if len(attestations) != 3 or any(
        not verify_review_attestation(
            candidate, cases=cases, attestation=item, verifier=verifier,
        )
        for item in attestations
    ):
        raise ProceduralMemoryError("playbook-review-attestation-verification-failed")
    reviewers = [
        {"role": item["role"], "identity": copy.deepcopy(item["identity"])}
        for item in attestations
    ]
    key_ids = [str(item.get("signature", {}).get("key_id", "")) for item in attestations]
    if len(set(key_ids)) != 3:
        raise ProceduralMemoryError("playbook-review-keys-are-not-independent")
    _validate_reviewer_set(
        reviewers, creator_id=str(candidate.get("created_by", {}).get("id", "")),
    )
    return reviewers


def evaluate_candidate(
    candidate: Mapping[str, Any], *, cases: Sequence[Mapping[str, Any]],
    review_attestations: Sequence[Mapping[str, Any]], verifier: Verifier,
    metric_regressions: Sequence[str] = (),
    security_failures: Sequence[str] = (), now: dt.datetime | None = None,
) -> dict[str, Any]:
    verify_candidate_hash(candidate)
    case_rows = [copy.deepcopy(dict(item)) for item in cases]
    reviewers = _verified_reviewers(candidate, case_rows, review_attestations, verifier)
    expected_case_ids = set(candidate["playbook"]["validation_case_ids"])
    if {str(item.get("case_id")) for item in case_rows} != expected_case_ids:
        raise ProceduralMemoryError("playbook-evaluation-case-set-does-not-match-candidate")
    expected_counterexamples = set(candidate["playbook"]["counterexample_ids"])
    actual_counterexamples = {
        str(item.get("case_id")) for item in case_rows if item.get("kind") == "counterexample"
    }
    if actual_counterexamples != expected_counterexamples:
        raise ProceduralMemoryError("playbook-evaluation-counterexample-set-mismatch")
    origin_sources = {
        str(item.get("source_episode_id")) for item in case_rows if item.get("kind") == "origin"
    }
    if origin_sources != set(candidate["playbook"]["originating_episode_ids"]):
        raise ProceduralMemoryError("playbook-evaluation-origin-lineage-mismatch")
    evaluated_at = utc_now(now)
    try:
        evaluated_clock = dt.datetime.fromisoformat(evaluated_at.replace("Z", "+00:00"))
        review_clocks = [
            dt.datetime.fromisoformat(str(item["decided_at"]).replace("Z", "+00:00"))
            for item in review_attestations
        ]
    except (KeyError, TypeError, ValueError) as exc:
        raise ProceduralMemoryError("playbook-review-attestation-clock-invalid") from exc
    if any(clock > evaluated_clock for clock in review_clocks):
        raise ProceduralMemoryError("playbook-evaluation-predates-review-approval")
    seed = sha({
        "candidate_sha256": candidate["candidate_sha256"], "cases": case_rows,
        "reviewers": reviewers, "evaluated_at": evaluated_at,
    })
    value: dict[str, Any] = {
        "schema": "memory-playbook-evaluation/v1",
        "evaluation_id": _memory_id("playbook-evaluation", seed),
        "candidate_sha256": candidate["candidate_sha256"],
        "risk_class": candidate["playbook"]["risk_class"],
        "cases": case_rows,
        "reviewers": [copy.deepcopy(dict(item)) for item in reviewers],
        "review_attestations": [copy.deepcopy(dict(item)) for item in review_attestations],
        "metric_regressions": sorted(set(metric_regressions)),
        "security_failures": sorted(set(security_failures)),
        "passed": not metric_regressions and not security_failures and all(
            item.get("passed") is True
            and not any(item.get(field) is True for field in (
                "citation_error", "qualifier_loss", "temporal_error",
                "abstention_error", "serious_error",
            ))
            for item in case_rows
        ),
        "evaluated_at": evaluated_at,
        "evaluation_sha256": "sha256:" + "0" * 64,
    }
    value["evaluation_sha256"] = _canonical_hash(value, "evaluation_sha256")
    errors = validate_contract(value)
    if errors:
        raise ProceduralMemoryError("playbook-evaluation-invalid: " + "; ".join(errors[:12]))
    return value


def build_playbook(
    candidate: Mapping[str, Any], evaluation: Mapping[str, Any], *,
    owner: str, review_verifier: Verifier,
    version: int = 1, playbook_id: str | None = None,
    prior_version: Mapping[str, Any] | None = None,
    now: dt.datetime | None = None, expires_days: int = 180,
) -> dict[str, Any]:
    verify_candidate_hash(candidate)
    if evaluation.get("candidate_sha256") != candidate.get("candidate_sha256"):
        raise ProceduralMemoryError("playbook-evaluation-candidate-binding-invalid")
    evaluation_errors = validate_contract(evaluation)
    if evaluation_errors or evaluation.get("passed") is not True:
        raise ProceduralMemoryError("playbook-evaluation-does-not-authorize-activation")
    reviewers = evaluation.get("reviewers")
    attestations = evaluation.get("review_attestations")
    cases = evaluation.get("cases")
    if not isinstance(reviewers, list) or not isinstance(attestations, list) or not isinstance(cases, list):
        raise ProceduralMemoryError("playbook-evaluation-reviewers-invalid")
    verified_reviewers = _verified_reviewers(candidate, cases, attestations, review_verifier)
    if reviewers != verified_reviewers:
        raise ProceduralMemoryError("playbook-evaluation-reviewer-attestation-mismatch")
    _validate_reviewer_set(
        reviewers, creator_id=str(candidate.get("created_by", {}).get("id", "")),
    )
    if version == 1 and prior_version is not None:
        raise ProceduralMemoryError("playbook-first-version-cannot-supersede")
    if version > 1 and (playbook_id is None or prior_version is None):
        raise ProceduralMemoryError("playbook-supersession-requires-prior-version")
    activated_at = utc_now(now)
    activated = dt.datetime.fromisoformat(activated_at.replace("Z", "+00:00"))
    try:
        evaluated = dt.datetime.fromisoformat(
            str(evaluation["evaluated_at"]).replace("Z", "+00:00"),
        )
        created = dt.datetime.fromisoformat(
            str(candidate["created_at"]).replace("Z", "+00:00"),
        )
        if not created <= evaluated <= activated:
            raise ProceduralMemoryError("playbook-review-or-expiry-window-invalid")
    except ProceduralMemoryError:
        raise
    except (KeyError, TypeError, ValueError) as exc:
        raise ProceduralMemoryError("playbook-review-time-invalid") from exc
    if expires_days < 1 or expires_days > 365:
        raise ProceduralMemoryError("playbook-review-or-expiry-window-invalid")
    identity = playbook_id or _memory_id("playbook", candidate["candidate_sha256"])
    value: dict[str, Any] = {
        "schema": "memory-playbook/v1",
        "playbook_id": identity,
        "version": version,
        "playbook": copy.deepcopy(candidate["playbook"]),
        "source_candidate_sha256": candidate["candidate_sha256"],
        "policy": copy.deepcopy(candidate["policy"]),
        "status": "active",
        "status_reason": None,
        "expires_at": utc_now(activated + dt.timedelta(days=expires_days)),
        "prior_version": copy.deepcopy(prior_version),
        "verified_by": [copy.deepcopy(dict(item)) for item in reviewers],
        "evaluation_sha256": evaluation["evaluation_sha256"],
        "activated_at": activated_at,
        "playbook_sha256": "sha256:" + "0" * 64,
    }
    value["playbook_sha256"] = _canonical_hash(value, "playbook_sha256")
    errors = validate_contract(value)
    if errors:
        raise ProceduralMemoryError("active-playbook-invalid: " + "; ".join(errors[:12]))
    return value


def build_promotion_manifest(
    candidate: Mapping[str, Any], playbook: Mapping[str, Any],
    evaluation: Mapping[str, Any], *, author: Mapping[str, str], branch: str,
    pull_request: int, signer: Signer, review_verifier: Verifier,
    now: dt.datetime | None = None,
) -> dict[str, Any]:
    verify_candidate_hash(candidate)
    _verified_reviewers(
        candidate, evaluation.get("cases", []),
        evaluation.get("review_attestations", []), review_verifier,
    )
    if (
        PROMOTION_BRANCH.fullmatch(branch) is None
        or pull_request < 1
        or author.get("kind") != "service"
    ):
        raise ProceduralMemoryError("playbook-promotion-pr-or-author-invalid")
    created_at = utc_now(now)
    body: dict[str, Any] = {
        "schema": "memory-promotion-manifest/v1",
        "manifest_id": _memory_id(
            "promotion-manifest", f"{candidate['candidate_sha256']}|{pull_request}|{created_at}",
        ),
        "candidate_kind": "playbook",
        "candidate_sha256": candidate["candidate_sha256"],
        "target_schema": "memory-playbook/v1",
        "target_id": playbook["playbook_id"],
        "target_version": playbook["version"],
        "evaluation_sha256": evaluation["evaluation_sha256"],
        "reviewers": copy.deepcopy(evaluation["reviewers"]),
        "author": copy.deepcopy(dict(author)),
        "branch": branch,
        "pull_request": pull_request,
        "activation_content_sha256": playbook["playbook_sha256"],
        "created_at": created_at,
        "manifest_sha256": "sha256:" + "0" * 64,
        "signature": {},
    }
    unsigned = _without(body, "manifest_sha256", "signature")
    body["manifest_sha256"] = sha(unsigned)
    message = canonical_json_bytes({**unsigned, "manifest_sha256": body["manifest_sha256"]})
    body["signature"] = dict(signer(message))
    errors = validate_promotion_bundle(candidate, playbook, body, evaluation)
    if errors:
        raise ProceduralMemoryError("playbook-promotion-invalid: " + "; ".join(errors[:12]))
    return body


def playbook_prompt_files(root: Path, playbook: Mapping[str, Any]) -> list[Path]:
    applicability = playbook.get("playbook", {}).get("applicability", {})
    if not isinstance(applicability, Mapping):
        raise ProceduralMemoryError("playbook-applicability-must-be-object")
    agents = set(_json_string_list(applicability.get("agents"), field="playbook-agents"))
    modules = set(_json_string_list(applicability.get("modules"), field="playbook-modules"))
    selected: list[Path] = []
    for path in research_agent_files(root):
        relative = path.relative_to(root).as_posix()
        profile = parse_profile(path.read_text(encoding="utf-8"), path)
        agent_names = {
            path.stem, relative.removeprefix(".claude/agents/").removesuffix(".md"),
            "master-synthesizer" if path.name == "synthesizer.md" else "",
        }
        if not agents and not modules:
            selected.append(path)
        elif agents.intersection(agent_names) or str(profile["task"]).split(".", 1)[0] in modules:
            selected.append(path)
    if not selected:
        raise ProceduralMemoryError("playbook-applicability-matches-no-analytical-prompt")
    return selected


def _set_prompt_playbook_ref(path: Path, *, identity: str, version: int, active: bool) -> None:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if not lines or lines[0] != "---":
        raise ProceduralMemoryError("playbook-prompt-frontmatter-invalid")
    try:
        end = lines.index("---", 1)
    except ValueError as exc:
        raise ProceduralMemoryError("playbook-prompt-frontmatter-invalid") from exc
    key = "playbook_refs:"
    current_index = next(
        (index for index in range(1, end) if lines[index].startswith(key)), None,
    )
    refs: list[str] = []
    if current_index is not None:
        raw = lines[current_index][len(key):].strip()
        if not raw.startswith("[") or not raw.endswith("]"):
            raise ProceduralMemoryError("playbook-prompt-reference-shape-invalid")
        refs = [item.strip() for item in raw[1:-1].split(",") if item.strip()]
    refs = [item for item in refs if not item.startswith(identity + "@")]
    if active:
        refs.append(f"{identity}@{version}")
    refs = sorted(set(refs))
    if refs:
        replacement = f"{key} [{', '.join(refs)}]"
        if current_index is None:
            lines.insert(1, replacement)
        else:
            lines[current_index] = replacement
    elif current_index is not None:
        lines.pop(current_index)
    path.write_text("\n".join(lines) + ("\n" if text.endswith("\n") else ""), encoding="utf-8")


def _update_prompt_authority(root: Path, playbook: Mapping[str, Any], *, action: str) -> None:
    for path in playbook_prompt_files(root, playbook):
        _set_prompt_playbook_ref(
            path, identity=str(playbook["playbook_id"]), version=int(playbook["version"]),
            active=action == "promote",
        )


def _open_playbook_pull_request(
    candidate: Mapping[str, Any], playbook: Mapping[str, Any],
    evaluation: Mapping[str, Any], *, author: Mapping[str, str], branch: str,
    repository_root: str | Path, signer: Signer, review_verifier: Verifier,
    action: str, runner: CommandRunner = _command, now: dt.datetime | None = None,
) -> tuple[dict[str, Any], str]:
    """Open and ready a content-free playbook PR; never merge or push to main."""

    verify_candidate_hash(candidate)
    if action not in {"promote", "deprecate"} or PROMOTION_BRANCH.fullmatch(branch) is None:
        raise ProceduralMemoryError("playbook-promotion-branch-invalid")
    if action == "promote" and playbook.get("status") != "active":
        raise ProceduralMemoryError("playbook-promotion-requires-active-record")
    if action == "deprecate" and (
        playbook.get("status") != "deprecated"
        or playbook.get("status_reason") != "two-ordinary-failures"
    ):
        raise ProceduralMemoryError("playbook-deprecation-record-invalid")
    root = Path(repository_root).resolve()
    try:
        top_level_raw = runner(["git", "rev-parse", "--show-toplevel"], root).strip()
        if not top_level_raw or Path(top_level_raw).resolve() != root:
            raise ProceduralMemoryError("playbook-promotion-repository-root-invalid")
        with tempfile.TemporaryDirectory(prefix="memory-playbook-promotion-") as temporary:
            worktree = Path(temporary) / "worktree"
            added = False
            try:
                runner(["git", "worktree", "add", "-b", branch, str(worktree), "origin/main"], root)
                added = True
                pending = worktree / "frameworks/memory/activations/.pending" / (
                    candidate["candidate_sha256"].removeprefix("sha256:") + ".json"
                )
                pending.parent.mkdir(parents=True, exist_ok=True)
                pending.write_bytes(canonical_json_bytes({
                    "schema": "memory-promotion-bootstrap/v1",
                    "candidate_kind": "playbook",
                    "action": action,
                    "candidate_sha256": candidate["candidate_sha256"],
                    "activation_content_sha256": playbook["playbook_sha256"],
                    "branch": branch,
                }))
                runner(["git", "add", "--", str(pending.relative_to(worktree))], worktree)
                runner([
                    "git", "commit", "-m",
                    f"Authorize playbook {action} {candidate['candidate_id']}",
                ], worktree)
                runner(["git", "push", "-u", "origin", branch], worktree)
                pr_url = runner([
                    "gh", "pr", "create", "--draft", "--base", "main", "--head", branch,
                    "--title", f"{action.title()} procedural memory {candidate['candidate_id']}",
                    "--body", (
                        f"Automated, content-free playbook {action} commitment. "
                        "Canonical procedure content remains outside Git."
                    ),
                ], worktree)
                match = re.search(r"/pull/(?P<number>[1-9][0-9]*)/?$", pr_url)
                if match is None:
                    raise ProceduralMemoryError("playbook-promotion-pr-number-unresolved")
                manifest = build_promotion_manifest(
                    candidate, playbook, evaluation, author=author, branch=branch,
                    pull_request=int(match.group("number")), signer=signer,
                    review_verifier=review_verifier, now=now,
                )
                activation = worktree / "frameworks/memory/activations/playbook" / (
                    f"{manifest['manifest_id']}.json"
                )
                activation.parent.mkdir(parents=True, exist_ok=True)
                activation.write_bytes(canonical_json_bytes(manifest))
                pending.unlink()
                _update_prompt_authority(worktree, playbook, action=action)
                runner([
                    "git", "add", "--", "frameworks/memory/activations",
                    ".claude/agents",
                ], worktree)
                runner(["git", "commit", "-m", f"Bind playbook activation to PR #{match.group('number')}"], worktree)
                runner(["git", "push", "origin", branch], worktree)
                runner(["gh", "pr", "ready", match.group("number")], worktree)
                return manifest, pr_url
            finally:
                if added:
                    try:
                        runner(["git", "worktree", "remove", "--force", str(worktree)], root)
                    except Exception:
                        pass
    except (SemanticMemoryError, OSError) as exc:
        raise ProceduralMemoryError("playbook-promotion-command-failed") from exc


def open_promotion_pull_request(
    candidate: Mapping[str, Any], playbook: Mapping[str, Any],
    evaluation: Mapping[str, Any], *, author: Mapping[str, str], branch: str,
    repository_root: str | Path, signer: Signer, review_verifier: Verifier,
    runner: CommandRunner = _command, now: dt.datetime | None = None,
) -> tuple[dict[str, Any], str]:
    """Open the governed activation PR for an evaluated active playbook."""

    return _open_playbook_pull_request(
        candidate, playbook, evaluation, author=author, branch=branch,
        repository_root=repository_root, signer=signer,
        review_verifier=review_verifier, action="promote",
        runner=runner, now=now,
    )


def verify_merged_promotion(
    manifest: Mapping[str, Any], *, repository_root: str | Path,
    verifier: Verifier, runner: CommandRunner = _command,
) -> dict[str, str]:
    errors = validate_contract(manifest)
    if (
        errors
        or manifest.get("candidate_kind") != "playbook"
        or not verify_signed(manifest, hash_field="manifest_sha256", verifier=verifier)
    ):
        raise ProceduralMemoryError("playbook-promotion-manifest-invalid")
    root = Path(repository_root).resolve()
    try:
        value = json.loads(runner([
            "gh", "pr", "view", str(manifest["pull_request"]),
            "--json", "state,mergedAt,mergeCommit,headRefName,baseRefName",
        ], root))
        commit = value.get("mergeCommit") if isinstance(value, Mapping) else None
        if (
            not isinstance(value, Mapping)
            or value.get("state") != "MERGED"
            or not isinstance(value.get("mergedAt"), str)
            or value.get("headRefName") != manifest.get("branch")
            or value.get("baseRefName") != "main"
            or not isinstance(commit, Mapping)
            or re.fullmatch(r"[0-9a-f]{40}(?:[0-9a-f]{24})?", str(commit.get("oid"))) is None
        ):
            raise ProceduralMemoryError("playbook-promotion-pr-not-merged-to-main")
        relative = f"frameworks/memory/activations/playbook/{manifest['manifest_id']}.json"
        committed = json.loads(runner(["git", "show", f"{commit['oid']}:{relative}"], root))
        if canonical_json_bytes(committed) != canonical_json_bytes(manifest):
            raise ProceduralMemoryError("playbook-promotion-commitment-mismatch")
        runner(["git", "merge-base", "--is-ancestor", str(commit["oid"]), "origin/main"], root)
        return {"merged_at": value["mergedAt"], "merge_commit": commit["oid"]}
    except (SemanticMemoryError, json.JSONDecodeError, OSError) as exc:
        if isinstance(exc, ProceduralMemoryError):
            raise
        raise ProceduralMemoryError("playbook-promotion-verification-failed") from exc


def merged_promotion_verifier(
    *, repository_root: str | Path, verifier: Verifier,
    runner: CommandRunner = _command,
) -> Callable[[Mapping[str, Any], object | None], bool]:
    def verify(manifest: Mapping[str, Any], principal: object | None) -> bool:
        del principal
        try:
            verify_merged_promotion(
                manifest, repository_root=repository_root, verifier=verifier, runner=runner,
            )
        except (ProceduralMemoryError, ValueError, OSError):
            return False
        return True
    return verify


def _playbook_event(
    playbook: Mapping[str, Any], *, service_id: str, system_time: str,
    supersedes: Sequence[str], event_type: str, seed: str,
) -> dict[str, Any]:
    applicability = playbook["playbook"]["applicability"]
    subjects_list = [
        "entity:internal:memory-playbook-" + playbook["playbook_id"].rsplit("_", 1)[-1],
    ]
    issuer_ids = applicability.get("issuer_ids")
    listing_ids = applicability.get("listing_ids")
    subjects_list.extend(_json_string_list(issuer_ids, field="playbook-issuer-ids"))
    subjects_list.extend(_json_string_list(listing_ids, field="playbook-listing-ids"))
    subjects = sorted(set(subjects_list))
    origins = [
        item for item in playbook["playbook"]["originating_episode_ids"]
        if EVENT_RE.fullmatch(str(item))
    ]
    return {
        "schema": "memory-event/v1",
        "event_id": _event_id(seed),
        "event_type": event_type,
        "subject_ids": subjects,
        "valid_time": {
            "from": str(playbook["activated_at"])[:10],
            "to": str(playbook["expires_at"])[:10],
        },
        "system_time": system_time,
        "producer": {
            "kind": "system", "name": service_id, "runtime": "memory-procedural/v1",
            "model": None, "prompt_program_sha": None,
        },
        "run_id": _run_id(seed),
        "trace_id": _trace_id(seed),
        "payload": copy.deepcopy(dict(playbook)),
        "evidence_refs": [],
        "derived_from": origins,
        "supersedes": list(supersedes),
        "integrity": {"payload_sha256": canonical_sha256(playbook), "signature": None},
        "policy": copy.deepcopy(playbook["policy"]),
    }


def _write_request(
    event: Mapping[str, Any], *, operation: str, expected_head: str,
    manifest: Mapping[str, Any] | None = None,
    store_bindings: Sequence[Mapping[str, Any]] = (),
) -> dict[str, Any]:
    event_sha = sha(event)
    manifest_json = canonical_json_bytes(manifest).decode("utf-8") if manifest else None
    request = {
        "schema": "memory-controlled-write-request/v1",
        "request_id": _memory_id("write-request", event_sha),
        "idempotency_key": f"playbook:{operation}:{event_sha}",
        "expected_head": expected_head,
        "submitted_at": event["system_time"],
        "operation": operation,
        "event_sha256": event_sha,
        "event_canonical_json": canonical_json_bytes(event).decode("utf-8"),
        "store_bindings": [copy.deepcopy(dict(item)) for item in store_bindings],
        "shadow_feedback_sha256": None,
        "shadow_feedback_canonical_json": None,
        "promotion_manifest_sha256": sha(manifest) if manifest else None,
        "promotion_manifest_canonical_json": manifest_json,
    }
    errors = validate_write_request(request)
    if errors:
        raise ProceduralMemoryError("playbook-write-request-invalid: " + "; ".join(errors[:12]))
    return request


def build_activation_request(
    candidate: Mapping[str, Any], playbook: Mapping[str, Any],
    evaluation: Mapping[str, Any], manifest: Mapping[str, Any], *,
    expected_head: str, service_id: str, verifier: Verifier,
    prior_event: Mapping[str, Any] | None = None,
    store_bindings: Sequence[Mapping[str, Any]] = (), now: dt.datetime | None = None,
) -> tuple[dict[str, Any], dict[str, Any]]:
    errors = validate_promotion_bundle(candidate, playbook, manifest, evaluation)
    if errors or not verify_signed(manifest, hash_field="manifest_sha256", verifier=verifier):
        raise ProceduralMemoryError("playbook-activation-bundle-invalid")
    if not HASH_RE.fullmatch(expected_head) or SAFE_ID.fullmatch(service_id) is None:
        raise ProceduralMemoryError("playbook-activation-control-binding-invalid")
    supersedes: list[str] = []
    operation = "playbook-promotion"
    if prior_event is not None:
        prior = prior_event.get("payload") if isinstance(prior_event, Mapping) else None
        prior_ref = playbook.get("prior_version")
        if (
            prior_event.get("event_type") not in {"playbook.activated", "playbook.status-changed"}
            or not isinstance(prior, Mapping)
            or not isinstance(prior_ref, Mapping)
            or prior_ref.get("schema") != "memory-playbook/v1"
            or prior_ref.get("record_id") != prior.get("playbook_id")
            or prior_ref.get("content_sha256") != prior.get("playbook_sha256")
            or playbook.get("playbook_id") != prior.get("playbook_id")
            or playbook.get("version") != prior.get("version", 0) + 1
            or playbook.get("policy") != prior_event.get("policy")
        ):
            raise ProceduralMemoryError("playbook-supersession-lineage-invalid")
        supersedes = [str(prior_event["event_id"])]
        operation = "playbook-supersession"
    elif playbook.get("version") != 1 or playbook.get("prior_version") is not None:
        raise ProceduralMemoryError("playbook-supersession-target-required")
    system_time = utc_now(now)
    event = _playbook_event(
        playbook, service_id=service_id, system_time=system_time,
        supersedes=supersedes, event_type="playbook.activated",
        seed=manifest["manifest_sha256"],
    )
    return event, _write_request(
        event, operation=operation, expected_head=expected_head,
        manifest=manifest, store_bindings=store_bindings,
    )


def build_status_playbook(
    active: Mapping[str, Any], *, status: str, reason: str,
) -> dict[str, Any]:
    if (
        active.get("schema") != "memory-playbook/v1"
        or active.get("status") != "active"
        or status not in {"quarantined", "deprecated", "expired"}
    ):
        raise ProceduralMemoryError("playbook-status-transition-invalid")
    allowed_reason = {
        "quarantined": SERIOUS_INCIDENTS | {"manual-emergency"},
        "deprecated": {"two-ordinary-failures"},
        "expired": {"expired"},
    }[status]
    if reason not in allowed_reason:
        raise ProceduralMemoryError("playbook-status-reason-invalid")
    value = copy.deepcopy(dict(active))
    value["status"] = status
    value["status_reason"] = reason
    value["playbook_sha256"] = _canonical_hash(value, "playbook_sha256")
    errors = validate_contract(value)
    if errors:
        raise ProceduralMemoryError("playbook-status-record-invalid: " + "; ".join(errors[:12]))
    return value


def build_status_request(
    prior_event: Mapping[str, Any], status_playbook: Mapping[str, Any], *,
    expected_head: str, service_id: str,
    manifest: Mapping[str, Any] | None = None,
    store_bindings: Sequence[Mapping[str, Any]] = (), now: dt.datetime | None = None,
) -> tuple[dict[str, Any], dict[str, Any]]:
    prior = prior_event.get("payload") if isinstance(prior_event, Mapping) else None
    if (
        not isinstance(prior, Mapping)
        or prior.get("status") != "active"
        or prior.get("playbook_id") != status_playbook.get("playbook_id")
        or prior.get("version") != status_playbook.get("version")
        or prior.get("playbook") != status_playbook.get("playbook")
        or prior_event.get("policy") != status_playbook.get("policy")
    ):
        raise ProceduralMemoryError("playbook-status-target-invalid")
    status = status_playbook.get("status")
    operation = {
        "quarantined": "playbook-quarantine",
        "deprecated": "playbook-deprecation",
    }.get(status)
    if operation is None:
        raise ProceduralMemoryError("playbook-status-operation-unsupported")
    if (operation == "playbook-quarantine") is not (manifest is None):
        raise ProceduralMemoryError("playbook-status-manifest-boundary-invalid")
    system_time = utc_now(now)
    event = _playbook_event(
        status_playbook, service_id=service_id, system_time=system_time,
        supersedes=[str(prior_event["event_id"])], event_type="playbook.status-changed",
        seed=sha({"prior": prior_event["event_id"], "status": status, "time": system_time}),
    )
    return event, _write_request(
        event, operation=operation, expected_head=expected_head,
        manifest=manifest, store_bindings=store_bindings,
    )


def build_execution_receipt(
    playbook: Mapping[str, Any], *, run_id: str, task_id: str,
    packet: Mapping[str, Any], projection_digest: str,
    steps: Sequence[Mapping[str, Any]], status: str,
    deviation_codes: Sequence[str] = (), incident_codes: Sequence[str] = (),
    canonical_hash_verified_before: bool, canonical_hash_verified_after: bool,
    started_at: str, completed_at: str,
) -> dict[str, Any]:
    if playbook.get("schema") != "memory-playbook/v1" or playbook.get("status") != "active":
        raise ProceduralMemoryError("playbook-execution-requires-active-version")
    if packet.get("schema") != "memory-context-packet/v2":
        raise ProceduralMemoryError("playbook-execution-packet-invalid")
    value: dict[str, Any] = {
        "schema": "memory-playbook-execution/v1",
        "execution_id": _memory_id(
            "playbook-execution",
            sha({"run": run_id, "task": task_id, "playbook": playbook["playbook_sha256"]}),
        ),
        "run_id": run_id,
        "task_id": task_id,
        "packet_id": packet["context_packet_id"],
        "packet_sha256": packet["content_sha256"],
        "query_sha256": packet["query_sha256"],
        "projection_digest": projection_digest,
        "playbook_id": playbook["playbook_id"],
        "version": playbook["version"],
        "playbook_sha256": playbook["playbook_sha256"],
        "canonical_hash_verified_before": canonical_hash_verified_before,
        "canonical_hash_verified_after": canonical_hash_verified_after,
        "steps": [copy.deepcopy(dict(item)) for item in steps],
        "status": status,
        "deviation_codes": sorted(set(deviation_codes)),
        "incident_codes": sorted(set(incident_codes)),
        "started_at": started_at,
        "completed_at": completed_at,
        "execution_sha256": "sha256:" + "0" * 64,
    }
    value["execution_sha256"] = _canonical_hash(value, "execution_sha256")
    errors = validate_contract(value)
    if errors:
        raise ProceduralMemoryError("playbook-execution-invalid: " + "; ".join(errors[:12]))
    expected_steps = [item["step_id"] for item in playbook["playbook"]["steps"]]
    if [item.get("step_id") for item in value["steps"]] != expected_steps:
        raise ProceduralMemoryError("playbook-execution-step-order-or-coverage-invalid")
    return value


def verify_execution(
    execution: Mapping[str, Any], *, packet: Mapping[str, Any],
    active_event_before: Mapping[str, Any], active_event_after: Mapping[str, Any],
) -> None:
    errors = validate_contract(execution)
    before = active_event_before.get("payload") if isinstance(active_event_before, Mapping) else None
    after = active_event_after.get("payload") if isinstance(active_event_after, Mapping) else None
    if (
        errors
        or execution.get("execution_sha256") != _canonical_hash(execution, "execution_sha256")
        or execution.get("packet_id") != packet.get("context_packet_id")
        or execution.get("packet_sha256") != packet.get("content_sha256")
        or execution.get("query_sha256") != packet.get("query_sha256")
        or not isinstance(before, Mapping)
        or before.get("status") != "active"
        or before.get("playbook_sha256") != execution.get("playbook_sha256")
        or not isinstance(after, Mapping)
        or after.get("status") != "active"
        or after.get("playbook_sha256") != execution.get("playbook_sha256")
    ):
        raise ProceduralMemoryError("playbook-execution-attestation-invalid-or-stale")


def _valid_execution_rows(executions: Any) -> list[Mapping[str, Any]]:
    if not isinstance(executions, list):
        raise ProceduralMemoryError("playbook-executions-must-be-array")
    return [
        execution for execution in executions
        if isinstance(execution, Mapping) and not validate_contract(execution)
    ]


def failure_action(executions: Sequence[Mapping[str, Any]]) -> str:
    """Return the governed response for one playbook version's execution history."""

    valid = _valid_execution_rows(executions)
    identity: tuple[Any, Any, Any] | None = None
    for execution in valid:
        current = (
            execution.get("playbook_id"), execution.get("version"),
            execution.get("playbook_sha256"),
        )
        if identity is None:
            identity = current
        elif identity != current:
            raise ProceduralMemoryError("mixed-playbook-execution-cohort")
    if any(SERIOUS_INCIDENTS.intersection(_json_list(item.get("incident_codes"))) for item in valid):
        return "quarantine-immediately"
    ordinary = sum(
        item.get("status") in {"failed", "deviated", "abstained"}
        and "ordinary-failure" in _json_list(item.get("incident_codes"))
        for item in valid
    )
    return "open-deprecation-pr" if ordinary >= 2 else "retain-active"


def build_quarantine_request(
    active_event: Mapping[str, Any], executions: Sequence[Mapping[str, Any]], *,
    expected_head: str, service_id: str,
    store_bindings: Sequence[Mapping[str, Any]] = (), now: dt.datetime | None = None,
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    """Turn a serious execution incident into the dedicated-authority write request."""

    valid = _valid_execution_rows(executions)
    if failure_action(valid) != "quarantine-immediately":
        raise ProceduralMemoryError("playbook-quarantine-requires-serious-incident")
    active = active_event.get("payload") if isinstance(active_event, Mapping) else None
    if not isinstance(active, Mapping):
        raise ProceduralMemoryError("playbook-quarantine-active-event-invalid")
    reasons = sorted({
        code for execution in valid for code in _json_list(execution.get("incident_codes"))
        if code in SERIOUS_INCIDENTS
    })
    status_playbook = build_status_playbook(
        active, status="quarantined", reason=reasons[0],
    )
    event, request = build_status_request(
        active_event, status_playbook, expected_head=expected_head,
        service_id=service_id, store_bindings=store_bindings, now=now,
    )
    return status_playbook, event, request


def open_deprecation_pull_request(
    candidate: Mapping[str, Any], active_playbook: Mapping[str, Any],
    evaluation: Mapping[str, Any], executions: Sequence[Mapping[str, Any]], *,
    author: Mapping[str, str], branch: str, repository_root: str | Path,
    signer: Signer, review_verifier: Verifier, runner: CommandRunner = _command,
    now: dt.datetime | None = None,
) -> tuple[dict[str, Any], dict[str, Any], str]:
    """Open the mandatory review/deprecation PR after two ordinary failures."""

    if failure_action(executions) != "open-deprecation-pr":
        raise ProceduralMemoryError("playbook-deprecation-requires-two-ordinary-failures")
    deprecated = build_status_playbook(
        active_playbook, status="deprecated", reason="two-ordinary-failures",
    )
    manifest, url = _open_playbook_pull_request(
        candidate, deprecated, evaluation, author=author, branch=branch,
        repository_root=repository_root, signer=signer,
        review_verifier=review_verifier, action="deprecate",
        runner=runner, now=now,
    )
    return deprecated, manifest, url


def _applicability(
    *, agents: Sequence[str] = (), modules: Sequence[str] = (),
    metrics: Sequence[str] = (), source_types: Sequence[str] = (),
) -> dict[str, Any]:
    return {
        "agents": list(agents), "modules": list(modules), "issuer_ids": [],
        "listing_ids": [], "sectors": [], "jurisdictions": [],
        "accounting_standards": [], "metrics": list(metrics),
        "source_types": list(source_types),
    }


def _seed_core(
    *, key: str, owner: str, applicability: Mapping[str, Any],
    required_inputs: Sequence[str], steps: Sequence[Mapping[str, Any]],
    required_evidence: Sequence[str], expected_output: str,
    prohibited_shortcuts: Sequence[str], fallback: str,
    abstention: str, tools: Sequence[str], source_seed: str,
) -> dict[str, Any]:
    cases = [f"{key}-origin", f"{key}-held-out-a", f"{key}-held-out-b", f"{key}-counterexample"]
    return {
        "procedure_key": key,
        "required": True,
        "owner": owner,
        "risk_class": "mechanical",
        "applicability": copy.deepcopy(dict(applicability)),
        "required_inputs": list(required_inputs),
        "steps": [copy.deepcopy(dict(item)) for item in steps],
        "required_evidence": list(required_evidence),
        "expected_output": expected_output,
        "prohibited_shortcuts": list(prohibited_shortcuts),
        "fallback": fallback,
        "abstention_behavior": abstention,
        "permitted_tools": list(tools),
        "originating_episode_ids": [_memory_id("episode", source_seed)],
        "counterexample_ids": [cases[-1]],
        "validation_case_ids": cases,
        "measured_effect": {
            "metric": "seed-replay-pass-rate", "baseline": 0, "candidate": 0,
            "sample_size": 1, "serious_error_regression": False,
        },
    }


def seed_initial_candidates(
    *, created_by: Mapping[str, str], now: dt.datetime | None = None,
) -> list[dict[str, Any]]:
    """Seed four inert candidates from existing reviewed research procedures."""

    policy = {"classification": "internal", "retention": "permanent", "retain_until": None}
    definitions = [
        _seed_core(
            key="exact-listing-prior-miss-recheck", owner="research-methods",
            applicability=_applicability(agents=["master-synthesizer"]),
            required_inputs=["exact listing", "newest reviewed miss", "current evidence"],
            steps=[
                {"step_id": "resolve-listing", "operation": "Resolve issuer and exact listing before reading the miss.", "required": True, "tool_id": "memory.exact-listing-resolver", "evidence_required": False, "on_failure": "stop"},
                {"step_id": "recheck-miss", "operation": "Recheck the prior miss against current-run evidence and record the defense or absence of one.", "required": True, "tool_id": "research.prior-miss-check", "evidence_required": True, "on_failure": "abstain"},
            ],
            required_evidence=["current primary source for the prior miss"],
            expected_output="A current-evidence prior-miss defense or explicit unresolved result.",
            prohibited_shortcuts=["Treating the old episode as current evidence", "Using a ticker-only match"],
            fallback="Keep the miss unresolved and preserve the existing confidence/rating cap.",
            abstention="Stop synthesis if the exact listing or mandatory current check cannot be verified.",
            tools=["memory.exact-listing-resolver", "research.prior-miss-check"],
            source_seed=".claude/agents/master-synthesizer.md#prior-miss-defense",
        ),
        _seed_core(
            key="governance-dossier-delta-refresh", owner="management-governance",
            applicability=_applicability(
                modules=["management-governance"], metrics=["people-integrity-dossiers"],
            ),
            required_inputs=["prior frozen dossier", "current officers/directors", "fresh search window"],
            steps=[
                {"step_id": "verify-prior", "operation": "Verify the prior dossier identity and original source dates.", "required": True, "tool_id": "memory.exact-listing-resolver", "evidence_required": False, "on_failure": "fallback"},
                {"step_id": "delta-refresh", "operation": "Refresh volatile facts and sweep new people, role changes, and fresh adverse hits.", "required": True, "tool_id": "research.governance-delta", "evidence_required": True, "on_failure": "fallback"},
            ],
            required_evidence=["current governance filing", "dated current adverse-search evidence"],
            expected_output="A delta dossier that retains stable dated facts and cites every refreshed fact.",
            prohibited_shortcuts=["Silently carrying a volatile fact forward", "Replacing a full sweep when identity changed"],
            fallback="Run the full governance dossier procedure from current sources.",
            abstention="Mark the dossier incomplete if current primary governance evidence is unavailable.",
            tools=["memory.exact-listing-resolver", "research.governance-delta"],
            source_seed=".claude/agents/management-governance/07_people-integrity-dossiers.md#delta-refresh",
        ),
        _seed_core(
            key="filing-vendor-number-reconciliation", owner="earnings",
            applicability=_applicability(
                modules=["earnings"], metrics=["historical-financials"],
                source_types=["filing-reconciliation"],
            ),
            required_inputs=["filing value and locator", "vendor value and as-of date", "metric definition"],
            steps=[
                {"step_id": "resolve-spans", "operation": "Resolve exact filing and vendor evidence spans for the same metric and period.", "required": True, "tool_id": "memory.evidence-span-verifier", "evidence_required": True, "on_failure": "abstain"},
                {"step_id": "reconcile", "operation": "Reconcile definition, period, currency, units, and adjustments; prefer the filing when unresolved.", "required": True, "tool_id": "research.filing-reconciler", "evidence_required": True, "on_failure": "fallback"},
            ],
            required_evidence=["exact filing span", "exact vendor row or screenshot"],
            expected_output="A sourced reconciliation or conservative filing-led unresolved difference.",
            prohibited_shortcuts=["Citing a vendor value to a filing", "Averaging unexplained conflicting values"],
            fallback="Use the primary filing value and label the vendor difference unresolved.",
            abstention="Do not state the number if neither exact span resolves.",
            tools=["memory.evidence-span-verifier", "research.filing-reconciler"],
            source_seed="AGENTS.md#evidence-citation-standard",
        ),
        _seed_core(
            key="calibration-leading-error-defense", owner="research-calibration",
            applicability=_applicability(agents=["master-synthesizer"]),
            required_inputs=["latest valid calibration summary", "leading error taxonomy", "current analysis"],
            steps=[
                {"step_id": "read-calibration", "operation": "Read the pinned module, forecast, thesis, and leading-error calibration slices.", "required": True, "tool_id": "research.calibration-reader", "evidence_required": False, "on_failure": "stop"},
                {"step_id": "show-defense", "operation": "Show the current-run defense against the leading recurring error or state that none exists.", "required": True, "tool_id": "research.prior-miss-check", "evidence_required": True, "on_failure": "abstain"},
            ],
            required_evidence=["current evidence supporting the claimed defense"],
            expected_output="An explicit leading-error defense with current evidence or the existing flat haircut.",
            prohibited_shortcuts=["Using prior success to lift confidence", "Ignoring an applicable leading error"],
            fallback="Apply the existing flat calibration haircut without double counting.",
            abstention="Stop final Ideas admission if the mandatory calibration defense is missing.",
            tools=["research.calibration-reader", "research.prior-miss-check"],
            source_seed=".claude/commands/research/calibrate.md#leading-error-defense",
        ),
    ]
    return [
        build_candidate(playbook=item, created_by=created_by, policy=policy, now=now)
        for item in definitions
    ]


class ProceduralState:
    """Typed owner-only procedural queues backed by the shared encrypted state primitive."""

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        try:
            self._state = SemanticState(*args, **kwargs)
        except SemanticMemoryError as exc:
            raise ProceduralMemoryError(str(exc).replace("semantic", "procedural")) from exc

    def put_candidate(self, candidate: Mapping[str, Any]) -> Path:
        verify_candidate_hash(candidate)
        return self._state.put_record(
            "candidates/playbook", str(candidate["candidate_id"]), candidate,
            policy=candidate["policy"],
        )

    def put_record(
        self, category: str, name: str, value: Mapping[str, Any], *,
        policy: Mapping[str, Any],
    ) -> Path:
        """Persist a governed procedural artifact through the shared protected-state route."""

        return self._state.put_record(category, name, value, policy=policy)

    def put_evaluation(
        self, evaluation: Mapping[str, Any], *, policy: Mapping[str, Any],
    ) -> Path:
        errors = validate_contract(evaluation)
        if errors:
            raise ProceduralMemoryError("playbook-evaluation-invalid")
        return self._state.put_record(
            "evaluations/playbook", str(evaluation["evaluation_id"]), evaluation,
            policy=policy,
        )

    def put_execution(
        self, execution: Mapping[str, Any], *, policy: Mapping[str, Any],
    ) -> Path:
        errors = validate_contract(execution)
        if errors:
            raise ProceduralMemoryError("playbook-execution-invalid")
        return self._state.put_record(
            "executions/playbook", str(execution["execution_id"]), execution,
            policy=policy,
        )


__all__ = [
    "ProceduralMemoryError", "ProceduralState", "build_activation_request",
    "build_candidate", "build_execution_receipt", "build_playbook",
    "build_review_attestation",
    "build_promotion_manifest", "build_status_playbook", "build_status_request",
    "build_quarantine_request",
    "evaluate_candidate", "failure_action", "merged_promotion_verifier",
    "open_deprecation_pull_request", "open_promotion_pull_request",
    "playbook_prompt_files",
    "procedural_signer", "procedural_verifier",
    "seed_initial_candidates", "verify_candidate_hash",
    "verify_review_attestation",
    "verify_execution", "verify_merged_promotion",
]
