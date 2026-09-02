#!/usr/bin/env python3
"""Supervisor-owned execution provenance for terminal research artifacts.

The cockpit projects canonical process-attempt rows into terminal artifacts before validation,
hashing, or publication. Cockpit publication passes those rows over stdin so a provider child cannot
forge, edit, delete, or race the provenance authority. Standalone maintenance callers may still use a
manifest path and the append helper for backward compatibility.
"""
from __future__ import annotations

import argparse
import fcntl
import json
import os
import stat
import sys
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


SCHEMA_VERSION = "1.0"
MANIFEST_BASENAME = ".execution-provenance.jsonl"
PROVIDER_MODES = {"single_provider", "mixed_provider", "partially_observed", "unknown"}
ATTRIBUTIONS = {"recorded", "configured"}
PROVIDERS = {"claude", "codex"}
PROVIDER_ROLLOUT_CUTOFF = "2026-08-21T00:00:00Z"
FORBIDDEN_KEYS = {
    "api_key", "apikey", "auth", "authorization", "access_token", "refresh_token",
    "token", "account", "account_id", "session", "session_id", "transcript",
    "prompt", "messages", "conversation",
}


class ProvenanceError(RuntimeError):
    """A manifest or artifact cannot be safely projected."""


def _non_empty(value: Any) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def _scopes(value: Any) -> list[str]:
    raw = value if isinstance(value, list) else [value]
    return sorted({_non_empty(item) for item in raw if _non_empty(item)})


def _reject_sensitive(value: Any, path: str = "manifest") -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            normalized = str(key).strip().lower().replace("-", "_")
            if normalized in FORBIDDEN_KEYS or normalized.endswith("_token"):
                raise ProvenanceError(f"{path} contains forbidden sensitive field {key!r}")
            _reject_sensitive(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            _reject_sensitive(child, f"{path}[{index}]")


def validate_attempt(raw: Any, line_number: int | None = None) -> dict[str, Any]:
    where = f"manifest line {line_number}" if line_number is not None else "attempt"
    if not isinstance(raw, dict):
        raise ProvenanceError(f"{where} must be a JSON object")
    _reject_sensitive(raw, where)
    if raw.get("schema_version") != SCHEMA_VERSION:
        raise ProvenanceError(f"{where} schema_version must be {SCHEMA_VERSION!r}")
    attempt_id = _non_empty(raw.get("attempt_id"))
    provider = _non_empty(raw.get("provider"))
    attribution = _non_empty(raw.get("attribution")) or "recorded"
    if not attempt_id:
        raise ProvenanceError(f"{where} has no attempt_id")
    try:
        parsed_attempt_id = uuid.UUID(attempt_id)
    except (ValueError, AttributeError):
        raise ProvenanceError(f"{where} attempt_id must be a UUID") from None
    if str(parsed_attempt_id) != attempt_id.lower():
        raise ProvenanceError(f"{where} attempt_id must use canonical UUID spelling")
    if provider not in PROVIDERS:
        raise ProvenanceError(f"{where} provider must be claude or codex")
    if attribution not in ATTRIBUTIONS:
        raise ProvenanceError(f"{where} attribution must be recorded or configured")
    model = _non_empty(raw.get("model"))
    reasoning = _non_empty(raw.get("reasoning_level"))
    artifacts = raw.get("decision_artifacts", [])
    if artifacts is None:
        artifacts = []
    if not isinstance(artifacts, list) or any(not _non_empty(item) for item in artifacts):
        raise ProvenanceError(f"{where} decision_artifacts must be non-empty path strings")
    artifacts_optional = raw.get("decision_artifacts_optional", False)
    if not isinstance(artifacts_optional, bool):
        raise ProvenanceError(f"{where} decision_artifacts_optional must be boolean")
    out = dict(raw)
    out.update({
        "attempt_id": str(parsed_attempt_id),
        "provider": provider,
        "model": model,
        "reasoning_level": reasoning,
        "attribution": attribution,
        "scope": _scopes(raw.get("scope")),
        "decision_artifacts": [str(item).strip() for item in artifacts],
        "decision_artifacts_optional": artifacts_optional,
    })
    return out


def read_manifest(path: Path) -> list[dict[str, Any]]:
    try:
        lines = (sys.stdin.read() if str(path) == "-" else path.read_text(encoding="utf-8")).splitlines()
    except FileNotFoundError:
        raise ProvenanceError(f"missing runtime provenance manifest: {path}") from None
    except OSError as error:
        raise ProvenanceError(f"cannot read runtime provenance manifest: {error}") from error
    attempts: list[dict[str, Any]] = []
    for number, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            raw = json.loads(line)
        except json.JSONDecodeError as error:
            raise ProvenanceError(f"manifest line {number} is not valid JSON: {error}") from error
        attempts.append(validate_attempt(raw, number))
    if not attempts:
        raise ProvenanceError(f"runtime provenance manifest is empty: {path}")
    return attempts


def append_attempt(path: Path, attempt: dict[str, Any]) -> None:
    clean = validate_attempt(attempt)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(clean, sort_keys=True, separators=(",", ":"), ensure_ascii=False,
                         allow_nan=False) + "\n"
    flags = os.O_WRONLY | os.O_CREAT | os.O_APPEND
    fd = os.open(path, flags, 0o600)
    try:
        with os.fdopen(fd, "a", encoding="utf-8", closefd=False) as handle:
            fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
            fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
    finally:
        os.close(fd)


def _profile_key(attempt: dict[str, Any]) -> str:
    explicit = _non_empty(attempt.get("profile_key"))
    if explicit:
        return explicit
    model = attempt.get("model") or "unknown-model"
    reasoning = attempt.get("reasoning_level") or "unknown-reasoning"
    return f"{attempt['provider']}|{model}:{reasoning}"


def _is_decision_author(attempt: dict[str, Any]) -> bool:
    return attempt.get("decision_author") is True or _non_empty(attempt.get("role")) == "terminal_adjudicator"


def project(attempts: Iterable[dict[str, Any]]) -> dict[str, Any]:
    rows = [validate_attempt(item) for item in attempts]
    if not rows:
        raise ProvenanceError("cannot project an empty attempt list")

    authors = [row for row in rows if _is_decision_author(row)]
    if not authors:
        raise ProvenanceError("terminal artifact has no runtime-marked decision author")
    author = authors[-1]
    if author["attribution"] != "recorded" or not author.get("model") or not author.get("reasoning_level"):
        raise ProvenanceError(
            "terminal decision author must be runtime-recorded with model and reasoning_level")

    providers = {row["provider"] for row in rows}
    incomplete = any(not row.get("model") or not row.get("reasoning_level")
                     or row.get("prior_unobserved") is True for row in rows)
    # A retained cross-provider continuation is mixed even when one contributor is only partially
    # observed. Calling it merely "partial" would erase the most decision-relevant fact.
    if len(providers) > 1:
        provider_mode = "mixed_provider"
    elif incomplete:
        provider_mode = "partially_observed"
    elif len(providers) == 1:
        provider_mode = "single_provider"
    else:
        provider_mode = "unknown"
    if provider_mode not in PROVIDER_MODES:  # defensive tripwire if the derivation changes
        raise ProvenanceError(f"unsupported provider mode: {provider_mode}")

    contributors: dict[tuple[str, str | None, str | None, str], dict[str, Any]] = {}
    for row in rows:
        key = (row["provider"], row.get("model"), row.get("reasoning_level"), row["attribution"])
        contributor = contributors.setdefault(key, {
            "provider": row["provider"],
            "model": row.get("model"),
            "reasoning_level": row.get("reasoning_level"),
            "attribution": row["attribution"],
            "scopes": [],
        })
        contributor["scopes"] = sorted(set(contributor["scopes"]) | set(row["scope"]))

    cli_versions: dict[str, str] = {}
    for row in rows:
        version = _non_empty(row.get("cli_version"))
        if version:
            prior = cli_versions.get(row["provider"])
            if prior is not None and prior != version:
                cli_versions[row["provider"]] = "mixed"
            else:
                cli_versions[row["provider"]] = version

    profiles = sorted({_profile_key(row) for row in rows})
    profile_key = profiles[0] if len(profiles) == 1 else "mixed|" + "+".join(profiles)
    return {
        "schema_version": SCHEMA_VERSION,
        "source": "cockpit_runtime",
        "coverage": "cockpit_top_level_processes",
        "provider_mode": provider_mode,
        "profile_key": profile_key,
        "decision_author": {
            "attempt_id": author["attempt_id"],
            "provider": author["provider"],
            "model": author.get("model"),
            "reasoning_level": author.get("reasoning_level"),
            "attribution": author["attribution"],
        },
        "contributors": sorted(contributors.values(), key=lambda item: (
            item["provider"], item.get("model") or "", item.get("reasoning_level") or "",
            item["attribution"],
        )),
        "cli_versions": dict(sorted(cli_versions.items())),
    }


def _atomic_write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = stat.S_IMODE(path.stat().st_mode) if path.exists() else 0o644
    fd, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=str(path.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(value, handle, ensure_ascii=False, indent=2, allow_nan=False)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temporary, mode)
        os.replace(temporary, path)
    except Exception:
        try:
            os.unlink(temporary)
        except OSError:
            pass
        raise


def prior_projections(attempts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Valid projections of strict manifest prefixes, for an explicit continuation/resume.

    A prior publication may already carry the exact projection of the attempts known at that time.
    Appending a new attempt is allowed to evolve that stamp (including to ``mixed_provider``); an
    arbitrary model-authored or hand-edited object is still rejected.
    """
    out: list[dict[str, Any]] = []
    for end in range(1, len(attempts)):
        try:
            value = project(attempts[:end])
        except ProvenanceError:
            continue
        if value not in out:
            out.append(value)
    return out


def stamp_artifact(path: Path, provenance: dict[str, Any],
                   acceptable_prior: Iterable[dict[str, Any]] = ()) -> bool:
    try:
        record = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise ProvenanceError(f"missing terminal artifact: {path}") from None
    except (OSError, json.JSONDecodeError) as error:
        raise ProvenanceError(f"cannot read terminal artifact {path}: {error}") from error
    if not isinstance(record, dict):
        raise ProvenanceError(f"terminal artifact is not a JSON object: {path}")
    current = record.get("execution_provenance")
    if current is not None and current != provenance and current not in acceptable_prior:
        raise ProvenanceError(f"artifact provenance disagrees with runtime manifest: {path}")
    if current == provenance:
        return False
    record["execution_provenance"] = provenance
    try:
        _atomic_write_json(path, record)
    except (OSError, TypeError, ValueError) as error:
        raise ProvenanceError(f"cannot stamp terminal artifact {path}: {error}") from error
    return True


def verify_artifact(path: Path, provenance: dict[str, Any]) -> None:
    try:
        record = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ProvenanceError(f"cannot verify terminal artifact {path}: {error}") from error
    if not isinstance(record, dict) or record.get("execution_provenance") != provenance:
        raise ProvenanceError(f"artifact provenance is absent or disagrees with runtime manifest: {path}")


def validate_projection(value: Any, label: str = "execution_provenance") -> dict[str, Any]:
    """Validate persisted provenance without trusting a child-supplied attempt manifest."""
    if not isinstance(value, dict):
        raise ProvenanceError(f"{label} must be a JSON object")
    _reject_sensitive(value, label)
    if value.get("schema_version") != SCHEMA_VERSION or value.get("source") != "cockpit_runtime":
        raise ProvenanceError(f"{label} is not a cockpit runtime v{SCHEMA_VERSION} projection")
    if value.get("coverage") != "cockpit_top_level_processes":
        raise ProvenanceError(f"{label} has unsupported coverage")
    if value.get("provider_mode") not in PROVIDER_MODES or not _non_empty(value.get("profile_key")):
        raise ProvenanceError(f"{label} has invalid provider/profile metadata")
    author = value.get("decision_author")
    if not isinstance(author, dict) or author.get("provider") not in PROVIDERS \
            or author.get("attribution") != "recorded" \
            or not _non_empty(author.get("model")) or not _non_empty(author.get("reasoning_level")):
        raise ProvenanceError(f"{label} has no recorded decision author profile")
    attempt_id = _non_empty(author.get("attempt_id"))
    try:
        parsed_attempt_id = uuid.UUID(attempt_id or "")
    except (ValueError, AttributeError):
        raise ProvenanceError(f"{label} decision author attempt_id must be a UUID") from None
    if str(parsed_attempt_id) != attempt_id.lower():
        raise ProvenanceError(f"{label} decision author attempt_id is not canonical")
    contributors = value.get("contributors")
    if not isinstance(contributors, list) or not contributors:
        raise ProvenanceError(f"{label} has no contributors")
    providers: set[str] = set()
    incomplete = False
    author_present = False
    for index, contributor in enumerate(contributors):
        if not isinstance(contributor, dict) or contributor.get("provider") not in PROVIDERS \
                or contributor.get("attribution") not in ATTRIBUTIONS:
            raise ProvenanceError(f"{label}.contributors[{index}] is invalid")
        scopes = contributor.get("scopes")
        if not isinstance(scopes, list) or any(not _non_empty(item) for item in scopes):
            raise ProvenanceError(f"{label}.contributors[{index}].scopes is invalid")
        providers.add(contributor["provider"])
        incomplete = incomplete or not _non_empty(contributor.get("model")) \
            or not _non_empty(contributor.get("reasoning_level"))
        author_present = author_present or all(
            contributor.get(key) == author.get(key)
            for key in ("provider", "model", "reasoning_level", "attribution")
        )
    if not author_present:
        raise ProvenanceError(f"{label} decision author is absent from contributors")
    mode = value.get("provider_mode")
    valid_modes = {"mixed_provider"} if len(providers) > 1 else \
        {"partially_observed"} if incomplete else {"single_provider", "partially_observed"}
    # `prior_unobserved` is manifest-only and intentionally is not copied into contributors, so a
    # fully populated partial projection cannot be distinguished from a single-provider projection
    # when the terminal artifact is audited later. Accept both conservative labels in that case.
    if mode not in valid_modes:
        raise ProvenanceError(f"{label} provider_mode disagrees with contributors")
    versions = value.get("cli_versions")
    if not isinstance(versions, dict) or any(key not in PROVIDERS or not _non_empty(item)
                                             for key, item in versions.items()):
        raise ProvenanceError(f"{label} cli_versions is invalid")
    return value


def _record_timestamp(record: dict[str, Any], path: Path) -> datetime:
    raw = record.get("decision_date")
    if not raw and isinstance(record.get("meta"), dict):
        raw = record["meta"].get("created_at")
    if not raw:
        import re
        match = re.search(r"_(\d{4}-\d{2}-\d{2})(?:/|$)", path.as_posix())
        if match:
            raw = match.group(1)
        else:
            match = re.search(r"(?:SIG-|THS-SIG-)(\d{4})(\d{2})(\d{2})", path.as_posix())
            raw = f"{match.group(1)}-{match.group(2)}-{match.group(3)}" if match else None
    if not isinstance(raw, str) or not raw.strip():
        raise ProvenanceError(f"terminal record has no immutable decision timestamp: {path}")
    text = raw.strip()
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        raise ProvenanceError(f"terminal record has invalid decision timestamp {text!r}: {path}") from None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _terminal_record_patterns(repo: Path) -> tuple[str, ...]:
    """Mirror SWARM.md terminal-artifact discovery without importing the TypeScript server."""
    patterns = {"analyses/*/decision_record.json"}  # synthetic research default manifest
    manifests = sorted((repo / ".claude" / "agents").glob("*/SWARM.md"))
    ids: set[str] = set()

    def scalar(value: str) -> str:
        text = value.strip()
        if len(text) >= 2 and text[0] == text[-1] and text[0] in {'"', "'"}:
            return text[1:-1]
        return text

    def frontmatter(text: str, label: Path) -> dict[str, Any]:
        sections = text.split("---", 2)
        if len(sections) < 3:
            raise ProvenanceError(f"swarm manifest has no front matter: {label}")
        lines = sections[1].splitlines()
        values: dict[str, Any] = {}
        index = 0
        while index < len(lines):
            line = lines[index]
            if not line or line[0].isspace() or ":" not in line:
                index += 1
                continue
            key, raw = line.split(":", 1)
            key, raw = key.strip(), raw.strip()
            if raw.startswith("["):
                import ast
                try:
                    parsed = ast.literal_eval(raw)
                except (SyntaxError, ValueError):
                    inner = raw[1:-1].strip() if raw.endswith("]") else ""
                    if not inner:
                        parsed = []
                    else:
                        parsed = [scalar(item) for item in inner.split(",")]
                values[key] = parsed
            elif raw:
                values[key] = scalar(raw.split(" #", 1)[0])
            else:
                items: list[str] = []
                cursor = index + 1
                while cursor < len(lines) and (not lines[cursor] or lines[cursor][0].isspace()):
                    stripped = lines[cursor].strip()
                    if stripped.startswith("-"):
                        items.append(scalar(stripped[1:].strip().split(" #", 1)[0]))
                    cursor += 1
                if items:
                    values[key] = items
                index = cursor - 1
            index += 1
        return values

    for manifest in manifests:
        label = manifest.relative_to(repo)
        data = frontmatter(manifest.read_text(encoding="utf-8"), label)
        swarm_id = data.get("id") or manifest.parent.name
        if not isinstance(swarm_id, str) or not swarm_id or swarm_id == "research" or swarm_id in ids:
            raise ProvenanceError(f"swarm manifest has duplicate/reserved id: {label}")
        ids.add(swarm_id)
        template = data.get("run_root_template")
        if not isinstance(template, str) or not template:
            raise ProvenanceError(f"swarm manifest has no run_root_template: {label}")
        prefix = template.split("{", 1)[0].rstrip("/")
        runs_root = data.get("runs_root") or str(Path(prefix).parent).replace("\\", "/")
        placeholder = data.get("placeholder") or "SIG_ID"
        marker = "{" + str(placeholder) + "}"
        safe_values = [template, runs_root]
        if (any(not isinstance(item, str) or Path(item).is_absolute() or ".." in Path(item).parts
                or "\\" in item for item in safe_values)
                or template.count(marker) != 1 or "{" in template.replace(marker, "")
                or template == runs_root or not template.startswith(runs_root.rstrip("/") + "/")):
            raise ProvenanceError(f"swarm manifest has unsafe run root contract: {label}")
        artifacts = data.get("decision_artifacts", [])
        if not isinstance(artifacts, list) or (artifacts and any(not isinstance(item, str) for item in artifacts)):
            raise ProvenanceError(f"swarm manifest has malformed decision_artifacts: {label}")
        run_glob = template.replace(marker, "*")
        for artifact in artifacts:
            if (Path(artifact).is_absolute() or ".." in Path(artifact).parts or "\\" in artifact
                    or not artifact.endswith(".json")):
                raise ProvenanceError(f"swarm manifest has unsafe decision artifact: {label}")
            patterns.add(f"{run_glob}/{artifact}")
            # Content-addressed swarms may retain immutable terminal copies under decisions/<id>/.
            patterns.add(f"{run_glob}/decisions/*/{artifact}")
        ledger_root = data.get("ledger_root")
        if ledger_root:
            if Path(ledger_root).is_absolute() or ".." in Path(ledger_root).parts or "\\" in ledger_root:
                raise ProvenanceError(f"swarm manifest has unsafe ledger_root: {label}")
            patterns.add(f"{ledger_root}/theses/*.json")
    return tuple(sorted(patterns))


def _append_only_recovered_projection(artifact: Path) -> dict[str, Any] | None:
    """Read an explicitly recovered projection without rewriting a frozen terminal record."""
    sidecar = artifact.parent / "corrections.json"
    try:
        corrections = json.loads(sidecar.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    recovery = corrections.get("metadata_recovery") if isinstance(corrections, dict) \
        and corrections.get("schema") == "corrections/v1" else None
    if not isinstance(recovery, dict) or not all(
        _non_empty(recovery.get(key)) for key in ("reason", "evidence")
    ):
        return None
    projection = validate_projection(recovery.get("execution_provenance"),
                                     f"{sidecar}:metadata_recovery.execution_provenance")
    runtime = recovery.get("runtime_evidence")
    attempts = runtime.get("attempts") if isinstance(runtime, dict) \
        and runtime.get("source") == "codex_task_runtime" else None
    if not isinstance(attempts, list) or not attempts:
        raise ProvenanceError(f"{sidecar}: metadata recovery has no runtime attempts")
    clean_attempts = [validate_attempt(attempt, index) for index, attempt in enumerate(attempts, 1)]
    author_id = projection["decision_author"]["attempt_id"]
    if not any(row["attempt_id"] == author_id and row["attribution"] == "recorded"
               for row in clean_attempts):
        raise ProvenanceError(f"{sidecar}: metadata recovery does not contain the recorded decision attempt")
    return projection


def audit_repository(repo_root: Path, cutoff: str = PROVIDER_ROLLOUT_CUTOFF) -> dict[str, int]:
    """Gate new terminal records and byte-freeze the explicit pre-rollout legacy inventory."""
    repo = repo_root.resolve()
    try:
        boundary = datetime.fromisoformat(cutoff.replace("Z", "+00:00")).astimezone(timezone.utc)
    except ValueError:
        raise ProvenanceError(f"invalid rollout cutoff: {cutoff!r}") from None
    inventory_path = repo / "frameworks" / "execution_provenance_legacy_inventory.json"
    try:
        inventory = json.loads(inventory_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ProvenanceError(f"legacy provenance inventory is unreadable: {error}") from error
    if not isinstance(inventory, dict) or inventory.get("schema_version") != "1.1" \
            or inventory.get("rollout_cutoff") != cutoff \
            or not isinstance(inventory.get("records"), dict) \
            or not isinstance(inventory.get("mutable_legacy_projections"), dict):
        raise ProvenanceError("legacy provenance inventory contract/cutoff is invalid")
    legacy_records = inventory["records"]
    legacy_projections = inventory["mutable_legacy_projections"]
    if any(
        not isinstance(path_text, str)
        or not path_text
        or Path(path_text).is_absolute()
        or ".." in Path(path_text).parts
        or "\\" in path_text
        or Path(path_text).as_posix() != path_text
        or not isinstance(digest, str)
        or not digest.startswith("sha256:")
        or len(digest) != 71
        for path_text, digest in legacy_records.items()
    ):
        raise ProvenanceError("legacy provenance inventory contains an invalid digest")
    archive_targets: set[str] = set()
    for projection_path, projection in legacy_projections.items():
        if not isinstance(projection_path, str) or not isinstance(projection, dict) \
                or set(projection) != {"archive", "sha256"}:
            raise ProvenanceError("legacy provenance inventory contains an invalid mutable projection")
        digest = projection.get("sha256")
        archive = projection.get("archive")
        parts = Path(projection_path).parts
        if len(parts) != 4 or parts[:2] != ("commodity", "runs") \
                or parts[-1] != "decision_record.json":
            raise ProvenanceError("legacy mutable projection is not a commodity current projection")
        expected_archive = (
            "frameworks/execution_provenance_legacy_snapshots/commodity/"
            f"{parts[2]}/decision_record.json"
        )
        if archive != expected_archive \
                or archive not in legacy_records or legacy_records[archive] != digest:
            raise ProvenanceError("legacy mutable projection has no matching immutable archive")
        archive_targets.add(archive)
    patterns = _terminal_record_patterns(repo)
    terminal_paths = {path for pattern in patterns for path in repo.glob(pattern)}
    terminal_discovered = {path.relative_to(repo).as_posix() for path in terminal_paths}
    inventory_only = set(legacy_records) - terminal_discovered
    if inventory_only != archive_targets:
        unexpected = sorted(inventory_only.symmetric_difference(archive_targets))
        raise ProvenanceError(
            f"legacy provenance inventory has missing/stale entries: {unexpected[0]}"
        )
    stale = sorted(set(legacy_projections) - terminal_discovered)
    if stale:
        raise ProvenanceError(f"legacy provenance inventory has missing/stale entries: {stale[0]}")
    paths = sorted(terminal_paths | {repo / Path(path_text) for path_text in archive_targets})
    counts = {"records": 0, "legacy": 0, "required": 0, "commodity_hashed": 0}
    for artifact in paths:
        relative = artifact.relative_to(repo)
        try:
            info = artifact.lstat()
        except OSError as error:
            raise ProvenanceError(f"terminal record is missing: {relative}: {error}") from error
        if not stat.S_ISREG(info.st_mode) or artifact.is_symlink() or artifact.resolve() != artifact:
            raise ProvenanceError(f"terminal record must be a regular non-symlink file: {relative}")
        try:
            record = json.loads(artifact.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise ProvenanceError(f"terminal record is unreadable: {relative}: {error}") from error
        if not isinstance(record, dict):
            raise ProvenanceError(f"terminal record is not an object: {relative}")
        counts["records"] += 1
        # The date remains a validated/reporting field, but never authorizes a provenance exemption: a
        # new model-authored file can claim any old date. Only the checked-in exact path+bytes inventory
        # proves a record existed before rollout.
        _record_timestamp(record, relative)
        relative_text = relative.as_posix()
        actual_digest = "sha256:" + __import__("hashlib").sha256(artifact.read_bytes()).hexdigest()
        legacy_digest = legacy_records.get(relative_text)
        projection_digest = (legacy_projections.get(relative_text) or {}).get("sha256")
        persisted = record.get("execution_provenance")
        if persisted is None:
            persisted = _append_only_recovered_projection(artifact)
        if legacy_digest is not None:
            if actual_digest != legacy_digest:
                raise ProvenanceError(f"inventoried legacy terminal record changed after rollout: {relative}")
            counts["legacy"] += 1
            if persisted is not None:
                validate_projection(persisted, f"{relative}:execution_provenance")
            continue
        # A content-addressed commodity keeps a mutable top-level UI projection. Preserve its pre-rollout
        # bytes in the immutable archive named by the inventory, count the projection as legacy only while
        # it still matches those bytes, and require the full modern provenance/hash contract as soon as a
        # new decision replaces it. Treating the current projection itself as immutable blocked every
        # legitimate post-rollout commodity refresh even though the new immutable archive was present.
        if projection_digest is not None and actual_digest == projection_digest:
            # The legacy exemption holds only while the commodity has never been refreshed. Once a
            # modern decision has been archived under this run's decisions/ directory, the mutable
            # top-level projection must carry that modern decision; reverting it to the pre-rollout
            # legacy bytes would leave the cockpit and snapshot builder reading a stale decision while
            # a newer immutable archive exists, and the audit would otherwise wave it through as legacy.
            archive_dir = artifact.parent / "decisions"
            if archive_dir.is_dir() and any(archive_dir.glob("*/decision_record.json")):
                raise ProvenanceError(
                    f"legacy commodity projection reverted to pre-rollout bytes after a modern archive exists: {relative}")
            counts["legacy"] += 1
            if persisted is not None:
                validate_projection(persisted, f"{relative}:execution_provenance")
            continue
        counts["required"] += 1
        validate_projection(persisted, f"{relative}:execution_provenance")
        parts = relative.parts
        if len(parts) >= 4 and parts[:2] == ("commodity", "runs"):
            from commodity_decision_archive import decision_id_for
            decision_id = _non_empty(record.get("decision_id"))
            expected = decision_id_for(record)
            if decision_id != expected:
                raise ProvenanceError(f"commodity decision id does not hash the stamped record: {relative}")
            without_provenance = dict(record)
            without_provenance.pop("execution_provenance", None)
            if decision_id_for(without_provenance) == decision_id:
                raise ProvenanceError(f"commodity decision hash does not participate in provenance: {relative}")
            if "decisions" in parts:
                index = parts.index("decisions")
                if index + 1 >= len(parts) or parts[index + 1] != decision_id:
                    raise ProvenanceError(f"commodity archive directory disagrees with decision id: {relative}")
            elif projection_digest is not None:
                archive = artifact.parent / "decisions" / decision_id / "decision_record.json"
                try:
                    archive_matches = archive.read_bytes() == artifact.read_bytes()
                except OSError:
                    archive_matches = False
                if not archive_matches:
                    raise ProvenanceError(
                        f"updated legacy commodity projection has no matching immutable archive: {relative}")
            counts["commodity_hashed"] += 1
    return counts


def _resolve_under(base: Path, value: str) -> Path:
    candidate = Path(value)
    candidate = candidate if candidate.is_absolute() else base / candidate
    resolved_base = base.resolve()
    resolved = candidate.resolve()
    if resolved != resolved_base and resolved_base not in resolved.parents:
        raise ProvenanceError(f"decision artifact escapes its run root: {value}")
    return resolved


def _repo_root(start: Path) -> Path:
    for candidate in (start, *start.parents):
        if (candidate / ".git").exists():
            return candidate.resolve()
    raise ProvenanceError(f"cannot resolve repository root from {start}")


def _resolve_repo_artifact(run_root: Path, value: str, repo_root: Path | None = None) -> Path:
    repo = repo_root.resolve() if repo_root is not None else _repo_root(run_root)
    resolved = (repo / value).resolve()
    if resolved != repo and repo not in resolved.parents:
        raise ProvenanceError(f"repository decision artifact escapes the repository: {value}")
    if ".git" in resolved.relative_to(repo).parts:
        raise ProvenanceError(f"repository decision artifact targets git internals: {value}")
    return resolved


def discover_artifacts(manifest: Path, attempts: list[dict[str, Any]], explicit: list[str],
                       repo_explicit: list[str] | None = None,
                       repo_root: Path | None = None) -> list[Path]:
    run_root = manifest.resolve().parent
    artifacts: list[Path] = []
    # Explicit publication-hook targets are always required. Manifest targets belong only to the newest
    # runtime-recorded top-level process: older rows describe already-published decisions retained in the
    # same run root. Letting those older rows nominate files here would restamp an old verdict when a later
    # standalone module merely commits new evidence, before any terminal adjudicator consumes it.
    for value in explicit:
        resolved = _resolve_under(run_root, value)
        if resolved not in artifacts:
            artifacts.append(resolved)
    current = next(
        (row for row in reversed(attempts) if row.get("attribution") == "recorded"),
        attempts[-1] if attempts else None,
    )
    if current:
        optional = current.get("decision_artifacts_optional") is True
        for value in current.get("decision_artifacts", []):
            resolved = _resolve_under(run_root, value)
            if optional and not resolved.is_file():
                continue
            if resolved not in artifacts:
                artifacts.append(resolved)
    for value in repo_explicit or []:
        resolved = _resolve_repo_artifact(run_root, value, repo_root)
        if resolved not in artifacts:
            artifacts.append(resolved)
    return artifacts


def _attempt_from_args(args: argparse.Namespace) -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "event": args.event,
        "attempt_id": args.attempt_id,
        "provider": args.provider,
        "model": args.model,
        "reasoning_level": args.reasoning_level,
        "attribution": args.attribution,
        "scope": args.scope,
        "role": args.role,
        "decision_author": args.decision_author,
        "profile_key": args.profile_key,
        "cli_version": args.cli_version,
        "decision_artifacts": args.decision_artifact,
        "decision_artifacts_optional": args.decision_artifacts_optional,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)

    add = commands.add_parser("append", help="append one runtime attempt")
    add.add_argument("--manifest", type=Path, required=True)
    add.add_argument("--attempt-id", required=True)
    add.add_argument("--provider", required=True)
    add.add_argument("--model")
    add.add_argument("--reasoning-level")
    add.add_argument("--attribution", choices=sorted(ATTRIBUTIONS), default="recorded")
    add.add_argument("--scope", action="append", default=[])
    add.add_argument("--role")
    add.add_argument("--decision-author", action="store_true")
    add.add_argument("--profile-key")
    add.add_argument("--cli-version")
    add.add_argument("--decision-artifact", action="append", default=[])
    add.add_argument("--decision-artifacts-optional", action="store_true")
    add.add_argument("--event", default="attempt_started")

    for name in ("stamp", "verify"):
        command = commands.add_parser(name, help=f"{name} terminal artifacts from a runtime manifest")
        command.add_argument("--manifest", type=Path, required=True)
        command.add_argument("--artifact", action="append", default=[])
        command.add_argument("--repo-artifact", action="append", default=[])
        command.add_argument("--repo-root", type=Path)
        command.add_argument("--allow-no-artifacts", action="store_true")

    show = commands.add_parser("project", help="print the deterministic projection")
    show.add_argument("--manifest", type=Path, required=True)

    audit = commands.add_parser("audit-repository", help="gate post-rollout committed terminal records")
    audit.add_argument("--repo-root", type=Path, default=Path.cwd())
    audit.add_argument("--cutoff", default=PROVIDER_ROLLOUT_CUTOFF)

    args = parser.parse_args(argv)
    try:
        if args.command == "append":
            append_attempt(args.manifest, _attempt_from_args(args))
            print(f"PROVENANCE-APPENDED: {args.manifest}")
            return 0
        if args.command == "audit-repository":
            counts = audit_repository(args.repo_root, args.cutoff)
            print("PROVENANCE-AUDIT: " + " ".join(f"{key}={value}" for key, value in counts.items()))
            return 0
        attempts = read_manifest(args.manifest)
        if args.command == "project":
            provenance = project(attempts)
            print(json.dumps(provenance, ensure_ascii=False, indent=2, sort_keys=True))
            return 0
        artifacts = discover_artifacts(
            args.manifest, attempts, args.artifact, args.repo_artifact, args.repo_root)
        if not artifacts:
            if not args.allow_no_artifacts:
                raise ProvenanceError("runtime manifest has no terminal decision artifacts")
            print(f"PROVENANCE-{args.command.upper()}: artifacts=0 changed=0")
            return 0
        provenance = project(attempts)
        priors = prior_projections(attempts)
        changed = 0
        for artifact in artifacts:
            if args.command == "stamp":
                changed += int(stamp_artifact(artifact, provenance, priors))
            else:
                verify_artifact(artifact, provenance)
        print(f"PROVENANCE-{args.command.upper()}: artifacts={len(artifacts)} changed={changed}")
        return 0
    except ProvenanceError as error:
        print(f"PROVENANCE-FAIL: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
