#!/usr/bin/env python3
"""Deterministic analytical-parity gate for two frozen provider run roots.

This tool performs no inference and does not read the network.  It compares the
terminal JSON decision artifacts from two isolated runs, emits a machine-readable
report, and fails closed when a material difference has not been adjudicated.

Exit codes:
  0  no material trigger, or every trigger is source-supported
  2  one or more material triggers are unclassified / need adjudication
  3  one or more triggers are classified as a provider defect
  4  invalid input, ambiguous artifact discovery, or malformed adjudication
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping

from provider_parity_freeze import (
    ADJUDICATION_SCHEMA_PATH,
    EXECUTION_RECEIPT_SCHEMA_PATH,
    FREEZE_SCHEMA_PATH,
    REPO_ROOT,
    RUN_BINDING_BASENAME,
    RUN_BINDING_SCHEMA_PATH,
    binding_payload,
    digest_file,
    digest_json,
    receipt_digest,
    snapshot_receipt,
    validate_against_schema,
    write_new_json,
)
from supervisor_publication import SupervisorPublicationError, post as supervisor_post


REPORT_SCHEMA_VERSION = "provider-analytical-parity/2.0"
ADJUDICATION_SCHEMA_VERSION = "provider-parity-adjudication/2.0"
FREEZE_SCHEMA_VERSION = "provider-parity-freeze/2.0"
EXECUTION_RECEIPT_SCHEMA_VERSION = "provider-parity-adjudication-execution/1.0"

EXIT_PASS = 0
EXIT_ADJUDICATION_REQUIRED = 2
EXIT_PROVIDER_DEFECT = 3
EXIT_INPUT_ERROR = 4

_DECISION_FILES = ("decision_record.json", "thesis_record.json")
_HIGH_SEVERITIES = {"critical", "high"}
_WS = re.compile(r"\s+")
_UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")


class ParityInputError(ValueError):
    """Raised when a frozen input or adjudication artifact is invalid."""


def _canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def _digest(value: Any) -> str:
    return "sha256:" + hashlib.sha256(_canonical_json(value).encode("utf-8")).hexdigest()


def _text_key(value: Any) -> str:
    if value is None:
        return ""
    return _WS.sub(" ", str(value).strip()).casefold()


def _number(value: Any) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    result = float(value)
    return result if math.isfinite(result) else None


def _path_get(record: Mapping[str, Any], *path: str) -> Any:
    value: Any = record
    for part in path:
        if not isinstance(value, Mapping) or part not in value:
            return None
        value = value[part]
    return value


def _first(record: Mapping[str, Any], paths: Iterable[tuple[str, ...]]) -> tuple[Any, str | None]:
    for path in paths:
        value = _path_get(record, *path)
        if value is not None:
            return value, ".".join(path)
    return None, None


def _read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise ParityInputError(f"cannot read {path}: {exc}") from exc
    except json.JSONDecodeError as exc:
        raise ParityInputError(f"malformed JSON in {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise ParityInputError(f"terminal artifact must be a JSON object: {path}")
    return value


def resolve_artifact(path_value: str | Path) -> Path:
    """Resolve a decision artifact, refusing ambiguous recursive discovery."""
    path = Path(path_value).expanduser()
    if path.is_symlink():
        raise ParityInputError(f"run root or terminal artifact must not be a symlink: {path}")
    try:
        mode = path.lstat().st_mode
    except OSError:
        raise ParityInputError(f"run root or decision artifact does not exist: {path}")
    if stat.S_ISREG(mode):
        resolved = path.resolve(strict=True)
        if resolved != path.absolute():
            raise ParityInputError(f"terminal artifact path traverses a symlink: {path}")
        return resolved
    if not stat.S_ISDIR(mode):
        raise ParityInputError(f"run root or terminal artifact is not a regular file/directory: {path}")
    root = path.resolve(strict=True)
    if root != path.absolute():
        raise ParityInputError(f"run root path traverses a symlink: {path}")

    for name in _DECISION_FILES:
        direct = root / name
        if direct.exists() or direct.is_symlink():
            if direct.is_symlink() or not stat.S_ISREG(direct.lstat().st_mode):
                raise ParityInputError(f"terminal artifact must be one non-symlink regular file: {direct}")
            return direct.resolve(strict=True)

    candidates: list[Path] = []
    def walk(directory: Path) -> None:
        with os.scandir(directory) as entries:
            for entry in sorted(entries, key=lambda item: item.name):
                child = directory / entry.name
                mode = entry.stat(follow_symlinks=False).st_mode
                if stat.S_ISLNK(mode):
                    if entry.name in _DECISION_FILES:
                        raise ParityInputError(f"terminal artifact must not be a symlink: {child}")
                    continue
                if stat.S_ISDIR(mode):
                    walk(child)
                elif stat.S_ISREG(mode) and entry.name in _DECISION_FILES:
                    candidates.append(child.resolve(strict=True))
    try:
        walk(root)
    except OSError as exc:
        raise ParityInputError(f"cannot discover terminal artifact below {root}: {exc}") from exc
    candidates = sorted(set(candidates), key=str)
    if not candidates:
        raise ParityInputError(f"no terminal decision artifact found below {path}")
    if len(candidates) != 1:
        listed = ", ".join(str(candidate) for candidate in candidates[:5])
        suffix = " ..." if len(candidates) > 5 else ""
        raise ParityInputError(
            f"ambiguous run root {path}: found {len(candidates)} terminal artifacts "
            f"({listed}{suffix}); pass an artifact path explicitly"
        )
    return candidates[0]


def _provider(record: Mapping[str, Any]) -> dict[str, Any]:
    provenance = record.get("execution_provenance")
    if not isinstance(provenance, Mapping):
        return {"provider": None, "model": None, "reasoning_level": None, "attempt_id": None,
                "profile_key": None, "provider_mode": "unknown"}
    author = provenance.get("decision_author")
    return {
        "provider": author.get("provider") if isinstance(author, Mapping) else None,
        "model": author.get("model") if isinstance(author, Mapping) else None,
        "reasoning_level": author.get("reasoning_level") if isinstance(author, Mapping) else None,
        "attempt_id": author.get("attempt_id") if isinstance(author, Mapping) else None,
        "profile_key": provenance.get("profile_key"),
        "provider_mode": provenance.get("provider_mode", "unknown"),
    }


def _scalar(record: Mapping[str, Any], name: str) -> dict[str, Any]:
    paths: dict[str, tuple[tuple[str, ...], ...]] = {
        "decision": (("decision",), ("action",), ("rating",), ("integrity_review", "routing"), ("meta", "status")),
        "rating_cap": (("rating_cap",), ("rating_cap_ceiling",), ("confidence_inputs", "rating_cap_ceiling")),
        "conviction": (("conviction",), ("post_review_confidence_score",), ("confidence_score",), ("confidence",)),
        "data_sufficiency": (("data_sufficiency_score",), ("confidence_inputs", "data_sufficiency"), ("data_sufficiency",)),
    }
    value, source = _first(record, paths[name])
    if name in {"conviction", "data_sufficiency"}:
        value = _number(value)
    return {"value": value, "source": source}


def _expected_returns(record: Mapping[str, Any]) -> dict[str, dict[str, Any]]:
    direct, source = _first(record, (("expected_return_pct",), ("expected_return",)))
    direct_number = _number(direct)
    if direct_number is not None:
        return {"overall": {"value": direct_number, "source": source}}

    result: dict[str, dict[str, Any]] = {}
    horizons = record.get("forecast_horizons")
    if isinstance(horizons, Mapping):
        for horizon in sorted(horizons, key=str):
            item = horizons[horizon]
            if not isinstance(item, Mapping):
                continue
            components = item.get("expected_return_components_pct")
            value = components.get("implementable_return_pct") if isinstance(components, Mapping) else None
            number = _number(value)
            if number is not None:
                result[str(horizon)] = {
                    "value": number,
                    "source": f"forecast_horizons.{horizon}.expected_return_components_pct.implementable_return_pct",
                }
    return result


def _scenario_rows(record: Mapping[str, Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []

    def add(items: Any, horizon: str | None) -> None:
        if not isinstance(items, list):
            return
        for item in items:
            if not isinstance(item, Mapping):
                continue
            row = {
                "horizon": horizon,
                "scenario_id": item.get("scenario_id") or item.get("id"),
                "label": item.get("label") or item.get("name"),
                "probability": item.get("probability", item.get("probability_pct")),
                "price_target": item.get("price_target", item.get("target")),
                "return_pct": item.get(
                    "return_pct",
                    item.get("implementable_return_pct", item.get("price_return_pct")),
                ),
            }
            rows.append(row)

    add(record.get("scenarios"), None)
    horizons = record.get("forecast_horizons")
    if isinstance(horizons, Mapping):
        for horizon in sorted(horizons, key=str):
            item = horizons[horizon]
            if isinstance(item, Mapping):
                add(item.get("scenarios"), str(horizon))
    return sorted(rows, key=_canonical_json)


def _flatten_numbers(value: Any, prefix: str = "") -> dict[str, float]:
    result: dict[str, float] = {}
    number = _number(value)
    if number is not None and prefix:
        result[prefix] = number
    elif isinstance(value, Mapping):
        for key in sorted(value, key=str):
            child = f"{prefix}.{key}" if prefix else str(key)
            result.update(_flatten_numbers(value[key], child))
    return result


def _red_flags(record: Mapping[str, Any]) -> list[dict[str, Any]]:
    raw = record.get("red_flags")
    if not isinstance(raw, list):
        return []
    result: list[dict[str, Any]] = []
    for item in raw:
        if isinstance(item, str):
            # Legacy strings carry no severity, so they cannot safely be promoted
            # into the Critical/High release gate.
            continue
        if not isinstance(item, Mapping):
            continue
        severity = _text_key(item.get("severity"))
        if severity not in _HIGH_SEVERITIES:
            continue
        identifier = item.get("id") or item.get("code") or item.get("flag_id")
        if _text_key(identifier) in {"", "n/a", "na", "none"}:
            identifier = None
        description = item.get("description") or item.get("name") or item.get("flag") or ""
        module = item.get("module") or item.get("owner_module")
        signature_basis = identifier if identifier else f"{module or ''}|{description}"
        result.append({
            "signature": f"{severity}|{_text_key(signature_basis)}",
            "severity": severity.title(),
            "id": identifier,
            "module": module,
            "description": description,
        })
    return sorted(result, key=lambda item: item["signature"])


def _variant_perception(record: Mapping[str, Any]) -> dict[str, Any]:
    fields = (
        "variant_perception_summary",
        "variant_perception",
        "what_everyone_knows",
        "what_is_priced_in",
        "what_market_may_be_missing",
        "edge_proof",
        "edge_score",
    )
    return {field: record[field] for field in fields if field in record}


def _canonical_collection(value: Any) -> Any:
    if isinstance(value, list):
        return sorted((_canonical_collection(item) for item in value), key=_canonical_json)
    if isinstance(value, Mapping):
        return {str(key): _canonical_collection(value[key]) for key in sorted(value, key=str)}
    return value


def _extract(record: Mapping[str, Any]) -> dict[str, Any]:
    killer_risk, killer_source = _first(record, (("killer_risk",), ("single_killer_risk",)))
    missing_data, missing_source = _first(record, (("missing_data",), ("data_needs",)))
    forecast_ledger, forecast_source = _first(record, (("forecast_ledger",), ("forecasts",)))
    return {
        "decision": _scalar(record, "decision"),
        "rating_cap": _scalar(record, "rating_cap"),
        "conviction": _scalar(record, "conviction"),
        "data_sufficiency": _scalar(record, "data_sufficiency"),
        "expected_returns_pct": _expected_returns(record),
        "scenarios": _scenario_rows(record),
        "module_scores": _flatten_numbers(record.get("module_scores", {})),
        "critical_high_red_flags": _red_flags(record),
        "killer_risk": {"value": _canonical_collection(killer_risk), "source": killer_source},
        "missing_data": {"value": _canonical_collection(missing_data), "source": missing_source},
        "variant_perception": _canonical_collection(_variant_perception(record)),
        "forecast_ledger": {
            "value": _canonical_collection(forecast_ledger if forecast_ledger is not None else []),
            "source": forecast_source,
        },
    }


def _present(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, Mapping)):
        return bool(value)
    return True


def _substantive_present(value: Any) -> bool:
    """Require at least one non-empty leaf, not merely a populated container shell."""
    if isinstance(value, Mapping):
        return any(_substantive_present(item) for item in value.values())
    if isinstance(value, list):
        return any(_substantive_present(item) for item in value)
    return _present(value)


def _analytical_blockers(
    record: Mapping[str, Any], extracted: Mapping[str, Any], label: str
) -> list[dict[str, Any]]:
    """Return non-adjudicatable output-contract and deterministic-math defects."""
    blockers: list[dict[str, Any]] = []

    def add(surface: str, message: str) -> None:
        blockers.append({
            "blocker_id": f"{label}:{surface}:{len(blockers) + 1}",
            "run": label,
            "surface": surface,
            "message": message,
        })

    for surface in ("decision", "rating_cap"):
        if not _present(extracted[surface]["value"]):
            add(surface, f"required analytical surface {surface} is missing or empty")
    for surface in ("conviction", "data_sufficiency"):
        value = extracted[surface]["value"]
        if value is None or not 0 <= value <= 100:
            add(surface, f"{surface} must be a finite score from 0 to 100")
    if not extracted["expected_returns_pct"]:
        add("expected_return", "at least one numeric expected-return surface is required")
    if not extracted["scenarios"]:
        add("scenarios", "at least one scenario row is required")
    if not extracted["module_scores"]:
        add("module_scores", "at least one numeric module score is required")
    raw_flags = record.get("red_flags")
    if not isinstance(raw_flags, list):
        add("critical_high_red_flags", "red_flags must be present as an array (empty is allowed)")
    elif any(not isinstance(item, Mapping) or not _present(item.get("severity")) for item in raw_flags):
        add("critical_high_red_flags", "every red-flag row must carry a severity so Critical/High flags are observable")
    if not _substantive_present(extracted["killer_risk"]["value"]):
        add("killer_risk", "killer risk is missing or empty")
    if extracted["missing_data"]["source"] is None or not isinstance(extracted["missing_data"]["value"], list):
        add("missing_data", "missing-data surface must be present as an array (empty is allowed)")
    if not _substantive_present(extracted["variant_perception"]):
        add("variant_perception", "variant-perception surface is missing or empty")
    ledger = extracted["forecast_ledger"]
    if (ledger["source"] is None or not isinstance(ledger["value"], list)
            or not _substantive_present(ledger["value"])):
        add("forecast_ledger", "forecast ledger must be present and contain at least one entry")

    entry, _ = _first(record, (("entry_price",), ("current_price",), ("spot_price",)))
    entry_price = _number(entry)
    if entry_price is None or entry_price <= 0:
        add("scenario_math", "positive entry/current/spot price is required for target-return math")
        return blockers
    # A Short Candidate reports positive return when the target falls below entry;
    # all other allowed decisions use the ordinary long-side price return.
    direction = -1.0 if _text_key(extracted["decision"]["value"]) == "short candidate" else 1.0

    groups: dict[str, list[Mapping[str, Any]]] = {}
    for row in extracted["scenarios"]:
        groups.setdefault(str(row.get("horizon") or "overall"), []).append(row)
    expected = extracted["expected_returns_pct"]
    for horizon, rows in sorted(groups.items()):
        probabilities: list[float] = []
        returns: list[float] = []
        targets: list[float] = []
        valid = True
        for index, row in enumerate(rows):
            probability = _number(row.get("probability"))
            target = _number(row.get("price_target"))
            scenario_return = _number(row.get("return_pct"))
            if probability is None or probability < 0:
                add("scenario_math", f"{horizon} scenario {index} has an invalid probability")
                valid = False
            if target is None or target < 0:
                add("scenario_math", f"{horizon} scenario {index} has no valid price target")
                valid = False
            if scenario_return is None:
                add("scenario_math", f"{horizon} scenario {index} has no numeric return")
                valid = False
            if probability is not None and probability >= 0:
                probabilities.append(probability)
            if target is not None and target >= 0:
                targets.append(target)
            if scenario_return is not None:
                returns.append(scenario_return)
            if target is not None and scenario_return is not None:
                implied = direction * (target / entry_price - 1.0) * 100.0
                if not math.isclose(scenario_return, implied, abs_tol=0.1, rel_tol=0.0):
                    add("scenario_math", f"{horizon} scenario {index} return does not reconcile to its price target")
                    valid = False
        if len(probabilities) != len(rows):
            continue
        probability_sum = sum(probabilities)
        scale = 100.0 if math.isclose(probability_sum, 100.0, abs_tol=0.01) else 1.0
        if not math.isclose(probability_sum, scale, abs_tol=0.01, rel_tol=0.0):
            add("scenario_math", f"{horizon} scenario probabilities sum to {probability_sum:g}, not 100%")
            valid = False
        declared = expected.get(horizon, {}).get("value")
        if declared is None:
            add("expected_return", f"{horizon} scenarios have no matching numeric expected return")
            valid = False
        if valid and len(returns) == len(rows) and len(targets) == len(rows):
            weights = [probability / scale for probability in probabilities]
            weighted_return = sum(weight * value for weight, value in zip(weights, returns))
            weighted_target = sum(weight * value for weight, value in zip(weights, targets))
            target_implied = direction * (weighted_target / entry_price - 1.0) * 100.0
            if not math.isclose(weighted_return, declared, abs_tol=0.1, rel_tol=0.0):
                add("scenario_math", f"{horizon} probability-weighted return {weighted_return:.4g}% does not equal declared {declared:.4g}%")
            if not math.isclose(target_implied, declared, abs_tol=0.1, rel_tol=0.0):
                add("scenario_math", f"{horizon} weighted target implies {target_implied:.4g}%, not declared {declared:.4g}%")
    for horizon in sorted(set(expected) - set(groups)):
        add("scenarios", f"expected-return horizon {horizon!r} has no scenarios")
    return blockers


def _record_summary(path: Path, record: Mapping[str, Any], label: str) -> dict[str, Any]:
    identity, _ = _first(record, (("ticker",), ("commodity",), ("meta", "thesis_id"), ("company_name",)))
    return {
        "label": label,
        "root": str(path.parent),
        "artifact": str(path),
        "artifact_file_sha256": digest_file(path),
        "record_digest": _digest(record),
        "identity": identity,
        "execution": _provider(record),
    }


def _required_text(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ParityInputError(f"freeze manifest {field} must be a non-empty string")
    return value.strip()


def _record_price_anchor(record: Mapping[str, Any]) -> tuple[float | None, Any, Any]:
    value, _ = _first(record, (("entry_price",), ("current_price",), ("spot_price",)))
    as_of, _ = _first(record, (
        ("entry_price_timestamp",), ("current_price_as_of",), ("spot_price_as_of",),
    ))
    currency, _ = _first(record, (("currency",), ("price_currency",)))
    return _number(value), as_of, currency


def _bound_path(manifest_path: Path, value: Any, field: str) -> Path:
    raw = _required_text(value, field)
    candidate = Path(raw).expanduser()
    if not candidate.is_absolute():
        candidate = manifest_path.parent / candidate
    if candidate.is_symlink():
        raise ParityInputError(f"{field} must not be a symlink")
    try:
        resolved = candidate.resolve(strict=True)
    except OSError as exc:
        raise ParityInputError(f"{field} cannot be resolved: {exc}") from exc
    if resolved != candidate.absolute():
        raise ParityInputError(f"{field} traverses a symlink")
    return resolved


SupervisorReceiptLoader = Callable[[Path], list[Mapping[str, Any]]]


def _repo_relative(path: Path) -> str | None:
    try:
        return path.resolve(strict=True).relative_to(REPO_ROOT.resolve(strict=True)).as_posix()
    except (OSError, ValueError):
        return None


def _committed_supervisor_rows(run_root: Path) -> list[Mapping[str, Any]]:
    """Read only committed supervisor receipts; worktree receipts are never authority."""
    relative_root = _repo_relative(run_root)
    if relative_root is None:
        raise ParityInputError(f"release run root is outside the repository: {run_root}")
    try:
        listed = subprocess.run(
            ["git", "ls-tree", "-r", "--name-only", "HEAD", "--", relative_root],
            cwd=REPO_ROOT, check=True, capture_output=True, text=True,
        ).stdout.splitlines()
    except (OSError, subprocess.CalledProcessError) as exc:
        raise ParityInputError(f"cannot enumerate committed supervisor receipts for {relative_root}") from exc
    paths = sorted(path for path in listed if path == f"{relative_root}/execution_provenance.receipt.json"
                   or path.endswith("/execution_provenance.receipt.json"))
    rows: list[Mapping[str, Any]] = []
    for relative in paths:
        try:
            raw = subprocess.run(["git", "show", f"HEAD:{relative}"], cwd=REPO_ROOT,
                                 check=True, capture_output=True, text=True).stdout
            receipt = json.loads(raw)
        except (OSError, subprocess.CalledProcessError, json.JSONDecodeError) as exc:
            raise ParityInputError(f"cannot read committed supervisor receipt {relative}") from exc
        if not isinstance(receipt, Mapping) or receipt.get("source") != "cockpit_supervisor" \
                or not isinstance(receipt.get("attempts"), list):
            continue
        for row in receipt["attempts"]:
            if isinstance(row, Mapping):
                rows.append({**row, "_committed_receipt_path": relative})
    if not rows:
        raise ParityInputError(f"no committed cockpit-supervisor execution receipt exists below {relative_root}")
    return rows


def _live_worktree_supervisor_rows(run_root: Path) -> list[Mapping[str, Any]]:
    """Provisional cockpit evidence; the live supervisor independently re-runs comparison from memory."""
    relative_root = _repo_relative(run_root)
    if relative_root is None:
        raise ParityInputError(f"release run root is outside the repository: {run_root}")
    rows: list[Mapping[str, Any]] = []
    for receipt_path in sorted(run_root.rglob("execution_provenance.receipt.json")):
        try:
            info = receipt_path.lstat()
            if receipt_path.is_symlink() or not stat.S_ISREG(info.st_mode) or receipt_path.resolve() != receipt_path.absolute():
                raise ParityInputError(f"live supervisor receipt is not a regular in-root file: {receipt_path}")
            receipt_path.resolve().relative_to(run_root.resolve())
            receipt = _read_json(receipt_path)
        except (OSError, ValueError) as exc:
            raise ParityInputError(f"cannot read live supervisor receipt {receipt_path}") from exc
        if not isinstance(receipt, Mapping) or receipt.get("source") != "cockpit_supervisor" \
                or not isinstance(receipt.get("attempts"), list):
            continue
        relative = receipt_path.relative_to(REPO_ROOT).as_posix()
        rows.extend({**row, "_committed_receipt_path": relative}
                    for row in receipt["attempts"] if isinstance(row, Mapping))
    if not rows:
        raise ParityInputError(f"no live cockpit-supervisor receipt exists below {relative_root}")
    return rows


def _contract_path(value: Any, field: str) -> Path:
    raw = _required_text(value, field)
    candidate = Path(raw).expanduser()
    if not candidate.is_absolute():
        candidate = REPO_ROOT / candidate
    if candidate.is_symlink():
        raise ParityInputError(f"{field} must not be a symlink")
    try:
        resolved = candidate.resolve(strict=True)
    except OSError as exc:
        raise ParityInputError(f"{field} cannot be resolved: {exc}") from exc
    if resolved != candidate.absolute():
        raise ParityInputError(f"{field} traverses a symlink")
    return resolved


def _supervisor_run_attestation(
    *, label: str, provider: str, run_root: Path, artifact_summary: Mapping[str, Any],
    row: Mapping[str, Any], binding_path: Path, manifest_path: Path, snapshot_root: Path,
    snapshot_sha256: str, price_anchor_sha256: str, freeze_receipt_sha256: str,
) -> dict[str, Any]:
    execution = artifact_summary["execution"]
    identity = {
        "attempt_id": execution.get("attempt_id"), "provider": provider,
        "model": execution.get("model"), "reasoning_level": execution.get("reasoning_level"),
        "profile_key": execution.get("profile_key"),
    }
    for key, expected in identity.items():
        if row.get(key) != expected:
            raise ParityInputError(f"{label} committed supervisor receipt {key} does not match the terminal record")
    if row.get("event") != "attempt_started" or row.get("attribution") != "recorded" \
            or row.get("decision_author") is not True:
        raise ParityInputError(f"{label} committed receipt row is not the recorded terminal decision attempt")
    prelaunch = row.get("parity_prelaunch")
    publication = row.get("parity_publication")
    if not isinstance(prelaunch, Mapping) or not isinstance(publication, Mapping):
        raise ParityInputError(f"{label} committed supervisor receipt lacks prelaunch/publication parity attestations")
    expected_run_root = _repo_relative(run_root) or str(run_root)
    expected_prelaunch = {
        "schema_version": "provider-parity-supervisor-binding/1.0",
        "binding_file_sha256": digest_file(binding_path),
        "freeze_receipt_file_sha256": digest_file(manifest_path),
        "freeze_receipt_sha256": freeze_receipt_sha256,
        "data_snapshot_sha256": snapshot_sha256,
        "snapshot_prelaunch_sha256": snapshot_sha256,
        "price_anchor_sha256": price_anchor_sha256,
        "label": label,
        "provider": provider,
        "run_root": expected_run_root,
        "profile_key": execution.get("profile_key"),
    }
    for key, expected in expected_prelaunch.items():
        if prelaunch.get(key) != expected:
            raise ParityInputError(f"{label} supervisor prelaunch attestation {key} does not match frozen inputs")
    if _contract_path(prelaunch.get("binding_path"), f"{label}.parity_prelaunch.binding_path") != binding_path:
        raise ParityInputError(f"{label} supervisor prelaunch binding path is not the selected binding")
    if _contract_path(prelaunch.get("freeze_receipt_path"), f"{label}.parity_prelaunch.freeze_receipt_path") != manifest_path:
        raise ParityInputError(f"{label} supervisor prelaunch freeze path is not the selected receipt")
    if _contract_path(prelaunch.get("snapshot_root"), f"{label}.parity_prelaunch.snapshot_root") != snapshot_root:
        raise ParityInputError(f"{label} supervisor prelaunch snapshot root is not the frozen snapshot")
    if prelaunch.get("snapshot_monitor_key") != prelaunch.get("freeze_receipt_sha256") \
            or not isinstance(prelaunch.get("snapshot_verified_at"), str) or not prelaunch["snapshot_verified_at"]:
        raise ParityInputError(f"{label} supervisor prelaunch snapshot monitor attestation is incomplete")
    supervisor_instance_id = prelaunch.get("supervisor_instance_id")
    pair_registration_id = prelaunch.get("pair_registration_id")
    if not isinstance(supervisor_instance_id, str) or not _UUID.fullmatch(supervisor_instance_id) \
            or not isinstance(pair_registration_id, str) or not _UUID.fullmatch(pair_registration_id):
        raise ParityInputError(f"{label} supervisor prelaunch pair registration identity is missing or invalid")
    if publication.get("schema_version") != "provider-parity-supervisor-publication/1.0" \
            or publication.get("supervisor_instance_id") != supervisor_instance_id \
            or publication.get("pair_registration_id") != pair_registration_id \
            or publication.get("snapshot_sha256") != snapshot_sha256 \
            or publication.get("freeze_receipt_sha256") != prelaunch.get("freeze_receipt_sha256") \
            or not isinstance(publication.get("verified_at"), str) or not publication["verified_at"]:
        raise ParityInputError(f"{label} supervisor publication snapshot attestation is incomplete or stale")
    return {
        "committed_receipt": row.get("_committed_receipt_path"),
        "attempt_id": row.get("attempt_id"),
        "prelaunch": dict(prelaunch),
        "publication": dict(publication),
    }


def _validate_prelaunch_freeze_manifest(
    manifest_value: str | Path,
    roots: tuple[Path, Path],
    paths: tuple[Path, Path],
    records: tuple[Mapping[str, Any], Mapping[str, Any]],
    summaries: tuple[Mapping[str, Any], Mapping[str, Any]],
    receipt_loader: SupervisorReceiptLoader,
) -> dict[str, Any]:
    """Re-hash the exact snapshot and prove both roots were bound before launch."""
    manifest_input = Path(manifest_value).expanduser()
    if manifest_input.is_symlink():
        raise ParityInputError("freeze receipt must not be a symlink")
    try:
        manifest_path = manifest_input.resolve(strict=True)
    except OSError as exc:
        raise ParityInputError(f"freeze receipt cannot be resolved: {exc}") from exc
    if manifest_path != manifest_input.absolute():
        raise ParityInputError("freeze receipt path traverses a symlink")
    value = _read_json(manifest_path)
    try:
        validate_against_schema(value, FREEZE_SCHEMA_PATH, label="freeze receipt")
    except ValueError as exc:
        raise ParityInputError(f"freeze receipt schema validation failed: {exc}") from exc
    if value.get("schema_version") != FREEZE_SCHEMA_VERSION:
        raise ParityInputError(f"freeze receipt schema_version must be {FREEZE_SCHEMA_VERSION}")
    if value.get("receipt_sha256") != receipt_digest(value):
        raise ParityInputError("freeze receipt self-digest does not match its content")

    snapshot = value["data_snapshot"]
    snapshot_root = _bound_path(manifest_path, snapshot["root"], "data_snapshot.root")
    try:
        live_snapshot = snapshot_receipt(snapshot_root, snapshot["frozen_at"])
    except ValueError as exc:
        raise ParityInputError(f"cannot re-hash frozen snapshot: {exc}") from exc
    expected_snapshot = {key: snapshot[key] for key in ("sha256", "file_count", "bytes", "frozen_at", "files")}
    if live_snapshot != expected_snapshot:
        expected_paths = {row["path"] for row in snapshot["files"]}
        actual_paths = {row["path"] for row in live_snapshot["files"]}
        message = "frozen snapshot exact file set changed" if expected_paths != actual_paths \
            else "one or more frozen snapshot files changed"
        raise ParityInputError(f"{message} after pre-launch binding")

    if roots[0] == roots[1] or roots[0] in roots[1].parents or roots[1] in roots[0].parents:
        raise ParityInputError("provider parity requires isolated, non-nested run roots")
    expected_rows = {
        "run_a": ("claude", roots[0], paths[0], records[0], summaries[0]),
        "run_b": ("codex", roots[1], paths[1], records[1], summaries[1]),
    }
    if {row["label"] for row in value["runs"]} != set(expected_rows):
        raise ParityInputError("freeze receipt must bind unique run_a and run_b rows")
    normalized: list[dict[str, Any]] = []
    for row in value["runs"]:
        label = row["label"]
        provider, selected_root, artifact, record, summary = expected_rows[label]
        if row["provider"] != provider:
            raise ParityInputError(f"{label} must bind provider {provider}")
        bound_root = _bound_path(manifest_path, row["run_root"], f"{label}.run_root")
        binding_path = _bound_path(manifest_path, row["binding"], f"{label}.binding")
        if bound_root != selected_root or binding_path != bound_root / RUN_BINDING_BASENAME:
            raise ParityInputError(f"{label} does not bind the selected isolated run root")
        try:
            artifact.relative_to(bound_root)
        except ValueError as exc:
            raise ParityInputError(f"{label} terminal artifact escapes its bound run root") from exc
        if artifact.is_symlink() or not stat.S_ISREG(artifact.lstat().st_mode) \
                or artifact != resolve_artifact(bound_root):
            raise ParityInputError(f"{label} selected terminal artifact is not inside its bound run root")
        binding = _read_json(binding_path)
        try:
            validate_against_schema(binding, RUN_BINDING_SCHEMA_PATH, label=f"{label} binding")
        except ValueError as exc:
            raise ParityInputError(f"{label} binding schema validation failed: {exc}") from exc
        if binding != binding_payload(value, {**row, "resolved_run_root": str(bound_root)}, manifest_path):
            raise ParityInputError(f"{label} run binding does not exactly match the frozen receipt")

        execution = summary["execution"]
        if execution.get("provider_mode") != "single_provider" or execution.get("provider") != provider:
            raise ParityInputError(f"{label} terminal provenance must be single-provider {provider}")
        for key, expected_key in (("model", "expected_model"), ("reasoning_level", "expected_reasoning_level"),
                                  ("profile_key", "expected_profile_key")):
            if execution.get(key) != row[expected_key]:
                raise ParityInputError(f"{label} terminal {key} does not match its pre-launch binding")
        candidates = [candidate for candidate in receipt_loader(bound_root)
                      if candidate.get("attempt_id") == execution.get("attempt_id")
                      and candidate.get("provider") == provider
                      and candidate.get("attribution") == "recorded"]
        if len(candidates) != 1:
            raise ParityInputError(f"{label} requires exactly one matching committed supervisor attempt")
        supervisor = _supervisor_run_attestation(
            label=label, provider=provider, run_root=bound_root, artifact_summary=summary,
            row=candidates[0], binding_path=binding_path, manifest_path=manifest_path,
            snapshot_root=snapshot_root, snapshot_sha256=snapshot["sha256"],
            price_anchor_sha256=digest_json(value["price_anchor"]),
            freeze_receipt_sha256=value["receipt_sha256"],
        )

        if _text_key(summary.get("identity")) != _text_key(value["subject"]):
            raise ParityInputError(f"{label} terminal identity does not match frozen subject")
        if record.get("decision_date") != value["decision_date"]:
            raise ParityInputError(f"{label} terminal decision date does not match frozen receipt")
        price, as_of, currency = _record_price_anchor(record)
        anchor = value["price_anchor"]
        if price is None or not math.isclose(price, anchor["value"], abs_tol=1e-9, rel_tol=0.0) \
                or _text_key(as_of) != _text_key(anchor["as_of"]) \
                or _text_key(currency) != _text_key(anchor["currency"]):
            raise ParityInputError(f"{label} terminal price anchor does not match frozen receipt")
        normalized.append({"label": label, "provider": provider, "run_root": str(bound_root),
            "binding": str(binding_path), "artifact": str(artifact), "record_digest": summary["record_digest"],
            "model": execution["model"], "reasoning_level": execution["reasoning_level"],
            "profile_key": execution["profile_key"], "attempt_id": execution["attempt_id"],
            "supervisor_attestation": supervisor})
    supervisor_pairs = [(item["supervisor_attestation"]["prelaunch"],
                         item["supervisor_attestation"]["publication"]) for item in normalized]
    for prelaunch, publication in supervisor_pairs:
        if prelaunch["freeze_receipt_sha256"] != value["receipt_sha256"] \
                or prelaunch["data_snapshot_sha256"] != snapshot["sha256"] \
                or prelaunch["snapshot_prelaunch_sha256"] != snapshot["sha256"] \
                or publication["snapshot_sha256"] != snapshot["sha256"]:
            raise ParityInputError("provider runs were not supervisor-attested against one unchanged snapshot")
    if len({prelaunch["supervisor_instance_id"] for prelaunch, _ in supervisor_pairs}) != 1 \
            or len({prelaunch["pair_registration_id"] for prelaunch, _ in supervisor_pairs}) != 1:
        raise ParityInputError("provider runs do not share one live supervisor pair registration")
    return {"schema_version": FREEZE_SCHEMA_VERSION, "manifest": str(manifest_path),
        "manifest_file_sha256": digest_file(manifest_path), "receipt_sha256": value["receipt_sha256"],
        "subject": value["subject"], "decision_date": value["decision_date"],
        "data_snapshot": {**expected_snapshot, "root": str(snapshot_root)},
        "price_anchor": {**value["price_anchor"], "digest": digest_json(value["price_anchor"])},
        "runs": sorted(normalized, key=lambda item: item["label"])}


def _value_comparison(a: Any, b: Any) -> dict[str, Any]:
    return {"run_a": a, "run_b": b, "match": _text_key(a) == _text_key(b)}


def _numeric_comparison(a: float | None, b: float | None) -> dict[str, Any]:
    delta = abs(a - b) if a is not None and b is not None else None
    return {"run_a": a, "run_b": b, "absolute_difference_points": delta}


def _trigger(trigger_id: str, kind: str, path: str, a: Any, b: Any, **extra: Any) -> dict[str, Any]:
    result = {"trigger_id": trigger_id, "kind": kind, "path": path, "run_a": a, "run_b": b}
    result.update(extra)
    return result


def _build_comparison(a: Mapping[str, Any], b: Mapping[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]], list[str]]:
    triggers: list[dict[str, Any]] = []
    warnings: list[str] = []

    decision = _value_comparison(a["decision"]["value"], b["decision"]["value"])
    if not decision["match"]:
        triggers.append(_trigger("decision", "decision_mismatch", "decision", decision["run_a"], decision["run_b"]))

    rating_cap = _value_comparison(a["rating_cap"]["value"], b["rating_cap"]["value"])
    if not rating_cap["match"]:
        triggers.append(_trigger("rating_cap", "rating_cap_mismatch", "rating_cap", rating_cap["run_a"], rating_cap["run_b"]))

    numeric_metrics: dict[str, dict[str, Any]] = {}
    for name, threshold in (("conviction", 10.0), ("data_sufficiency", 10.0)):
        av = a[name]["value"]
        bv = b[name]["value"]
        comparison = _numeric_comparison(av, bv)
        numeric_metrics[name] = comparison
        delta = comparison["absolute_difference_points"]
        if delta is not None and delta > threshold:
            triggers.append(_trigger(
                name,
                f"{name}_difference",
                name,
                av,
                bv,
                threshold_points=threshold,
                absolute_difference_points=delta,
            ))
        elif (av is None) != (bv is None):
            warnings.append(f"{name} is unavailable in one run; no numeric threshold can be applied")

    expected_comparisons: dict[str, dict[str, Any]] = {}
    expected_horizons = sorted(set(a["expected_returns_pct"]) | set(b["expected_returns_pct"]))
    for horizon in expected_horizons:
        av = a["expected_returns_pct"].get(horizon, {}).get("value")
        bv = b["expected_returns_pct"].get(horizon, {}).get("value")
        comparison = _numeric_comparison(av, bv)
        expected_comparisons[horizon] = comparison
        delta = comparison["absolute_difference_points"]
        if delta is not None and delta > 10.0:
            trigger_id = "expected_return" if horizon == "overall" else f"expected_return:{horizon}"
            triggers.append(_trigger(
                trigger_id,
                "expected_return_difference",
                f"expected_returns_pct.{horizon}",
                av,
                bv,
                threshold_points=10.0,
                absolute_difference_points=delta,
            ))
        elif (av is None) != (bv is None):
            warnings.append(f"expected return ({horizon}) is unavailable in one run; no numeric threshold can be applied")

    score_comparisons: dict[str, dict[str, Any]] = {}
    score_paths = sorted(set(a["module_scores"]) | set(b["module_scores"]))
    for path in score_paths:
        av = a["module_scores"].get(path)
        bv = b["module_scores"].get(path)
        comparison = _numeric_comparison(av, bv)
        score_comparisons[path] = comparison
        delta = comparison["absolute_difference_points"]
        if delta is not None and delta > 15.0:
            triggers.append(_trigger(
                f"module_score:{path}",
                "module_score_difference",
                f"module_scores.{path}",
                av,
                bv,
                threshold_points=15.0,
                absolute_difference_points=delta,
            ))
        elif (av is None) != (bv is None):
            warnings.append(f"module score {path} is unavailable in one run; no numeric threshold can be applied")

    flags_a = {item["signature"]: item for item in a["critical_high_red_flags"]}
    flags_b = {item["signature"]: item for item in b["critical_high_red_flags"]}
    only_a = [flags_a[key] for key in sorted(set(flags_a) - set(flags_b))]
    only_b = [flags_b[key] for key in sorted(set(flags_b) - set(flags_a))]
    flags_comparison = {"run_a": a["critical_high_red_flags"], "run_b": b["critical_high_red_flags"], "only_in_run_a": only_a, "only_in_run_b": only_b}
    if only_a or only_b:
        triggers.append(_trigger(
            "critical_high_red_flags",
            "critical_high_red_flag_mismatch",
            "critical_high_red_flags",
            only_a,
            only_b,
        ))

    substantive: dict[str, dict[str, Any]] = {}
    for name, left, right in (
        ("scenarios", a["scenarios"], b["scenarios"]),
        ("killer_risk", a["killer_risk"]["value"], b["killer_risk"]["value"]),
        ("missing_data", a["missing_data"]["value"], b["missing_data"]["value"]),
        ("variant_perception", a["variant_perception"], b["variant_perception"]),
        ("forecast_ledger", a["forecast_ledger"]["value"], b["forecast_ledger"]["value"]),
    ):
        match = _canonical_json(left) == _canonical_json(right)
        substantive[name] = {"run_a": left, "run_b": right, "match": match}
        if not match:
            triggers.append(_trigger(name, f"{name}_mismatch", name, left, right))

    comparison = {
        "decision": decision,
        "rating_cap": rating_cap,
        "conviction": numeric_metrics["conviction"],
        "data_sufficiency": numeric_metrics["data_sufficiency"],
        "expected_returns_pct": expected_comparisons,
        "scenarios": substantive["scenarios"],
        "module_scores": {"run_a": a["module_scores"], "run_b": b["module_scores"], "comparisons": score_comparisons},
        "critical_high_red_flags": flags_comparison,
        "killer_risk": substantive["killer_risk"],
        "missing_data": substantive["missing_data"],
        "variant_perception": substantive["variant_perception"],
        "forecast_ledger": substantive["forecast_ledger"],
    }
    return comparison, sorted(triggers, key=lambda item: item["trigger_id"]), sorted(set(warnings))



_JSON_POINTER = re.compile(r"^/(?:[^/~]|~[01])*(?:/(?:[^/~]|~[01])*)*$")
_LINE_LOCATOR = re.compile(r"^lines?\s+([1-9][0-9]*)(?:\s*[-–]\s*([1-9][0-9]*))?$", re.I)
_PAGE_LOCATOR = re.compile(r"^(?:page|p\.)\s*([1-9][0-9]*)$", re.I)
_SECTION_LOCATOR = re.compile(r"^(?:section|§)\s+(.+\S)$", re.I)
_FIELD_LOCATOR = re.compile(r"^field\s+([A-Za-z0-9_.-]+)$", re.I)
_TEXT_EXTENSIONS = {".md", ".txt", ".json", ".jsonl", ".csv", ".tsv", ".yaml", ".yml", ".html", ".htm", ".xml"}


def _resolve_evidence_path(base: Path, raw: Any, field: str) -> Path:
    value = _required_text(raw, field)
    candidate = Path(value).expanduser()
    if not candidate.is_absolute():
        candidate = base / candidate
    if candidate.is_symlink():
        raise ParityInputError(f"{field} must not be a symlink")
    try:
        path = candidate.resolve(strict=True)
    except OSError as exc:
        raise ParityInputError(f"{field} cannot be resolved: {exc}") from exc
    if not path.is_file():
        raise ParityInputError(f"{field} must identify one regular file")
    if path != candidate.absolute():
        raise ParityInputError(f"{field} traverses a symlink")
    return path


def _validate_locator(path: Path, locator: str) -> None:
    locator = locator.strip()
    if _JSON_POINTER.fullmatch(locator):
        try:
            value: Any = json.loads(path.read_text(encoding="utf-8"))
            for raw in locator.split("/")[1:]:
                part = raw.replace("~1", "/").replace("~0", "~")
                value = value[int(part)] if isinstance(value, list) else value[part]
        except (OSError, json.JSONDecodeError, KeyError, IndexError, ValueError, TypeError) as exc:
            raise ParityInputError(f"JSON-pointer evidence locator does not resolve in {path}: {locator}") from exc
        return
    line_match = _LINE_LOCATOR.fullmatch(locator)
    if line_match:
        if path.suffix.casefold() not in _TEXT_EXTENSIONS:
            raise ParityInputError(f"line locator is incompatible with {path}")
        try:
            count = len(path.read_text(encoding="utf-8").splitlines())
        except (OSError, UnicodeDecodeError) as exc:
            raise ParityInputError(f"line evidence locator cannot be checked in {path}") from exc
        start = int(line_match.group(1)); end = int(line_match.group(2) or start)
        if end < start or end > count:
            raise ParityInputError(f"line evidence locator is outside {path}: {locator}")
        return
    page_match = _PAGE_LOCATOR.fullmatch(locator)
    if page_match:
        try:
            raw = path.read_bytes()
        except OSError as exc:
            raise ParityInputError(f"page locator cannot read {path}") from exc
        if path.suffix.casefold() != ".pdf" or not raw.startswith(b"%PDF-"):
            raise ParityInputError(f"page locator is incompatible with non-PDF artifact {path}")
        pages = len(re.findall(rb"/Type\s*/Page(?!s)\b", raw))
        if pages < 1 or int(page_match.group(1)) > pages:
            raise ParityInputError(f"page evidence locator is outside or unresolvable in {path}: {locator}")
        return
    section_match = _SECTION_LOCATOR.fullmatch(locator)
    if section_match:
        if path.suffix.casefold() not in {".md", ".txt", ".html", ".htm"}:
            raise ParityInputError(f"section locator is incompatible with {path}")
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except (OSError, UnicodeDecodeError) as exc:
            raise ParityInputError(f"section locator cannot read {path}") from exc
        wanted = _text_key(section_match.group(1))
        headings = {
            _text_key(re.sub(
                r"</?h[1-6][^>]*>|</?section[^>]*>|^#{1,6}\s+", "", line,
                flags=re.I,
            ).strip())
            for line in lines
        }
        if wanted not in headings:
            raise ParityInputError(f"section evidence locator does not resolve in {path}: {locator}")
        return
    field_match = _FIELD_LOCATOR.fullmatch(locator)
    if field_match:
        if path.suffix.casefold() != ".json":
            raise ParityInputError(f"field locator is incompatible with non-JSON artifact {path}")
        try:
            value: Any = json.loads(path.read_text(encoding="utf-8"))
            for part in field_match.group(1).split("."):
                value = value[int(part)] if isinstance(value, list) else value[part]
        except (OSError, json.JSONDecodeError, KeyError, IndexError, ValueError, TypeError) as exc:
            raise ParityInputError(f"field evidence locator does not resolve in {path}: {locator}") from exc
        return
    raise ParityInputError(f"evidence locator is not exact: {locator!r}")


PublicationPost = Callable[[Mapping[str, Any]], Mapping[str, Any]]


def _supervisor_post(payload: Mapping[str, Any]) -> Mapping[str, Any]:
    if os.environ.get("NOSTRA_COCKPIT_RUN") != "1":
        raise ParityInputError("provider-parity attestation requires NOSTRA_COCKPIT_RUN=1")
    try:
        result = supervisor_post(payload, timeout=120)
    except SupervisorPublicationError as exc:
        raise ParityInputError(f"supervisor parity attestation request failed: {exc}") from exc
    return result


def _validate_execution_receipt(
    reference: Mapping[str, Any], adjudication_path: Path, comparison_id: str,
    comparison_artifact: Path, expected_comparison: Mapping[str, Any], frozen: Mapping[str, Any],
) -> tuple[dict[str, Any], Path, str]:
    receipt_path = _resolve_evidence_path(adjudication_path.parent, reference.get("path"), "execution_receipt.path")
    receipt_file_sha = digest_file(receipt_path)
    if receipt_file_sha != reference.get("sha256"):
        raise ParityInputError("adjudication execution receipt file hash does not match")
    receipt = _read_json(receipt_path)
    try:
        validate_against_schema(receipt, EXECUTION_RECEIPT_SCHEMA_PATH, label="execution receipt")
    except ValueError as exc:
        raise ParityInputError(f"execution receipt schema validation failed: {exc}") from exc
    if receipt.get("comparison_id") != comparison_id:
        raise ParityInputError("execution receipt comparison_id does not match")
    bound_comparison = _resolve_evidence_path(receipt_path.parent, receipt["comparison_artifact"]["path"], "comparison_artifact.path")
    if bound_comparison != comparison_artifact or digest_file(bound_comparison) != receipt["comparison_artifact"]["sha256"]:
        raise ParityInputError("execution receipt comparison artifact is missing, changed, or not selected")
    comparison_value = _read_json(bound_comparison)
    if comparison_value != expected_comparison:
        raise ParityInputError("bound initial comparison bytes do not represent the exact current trigger set")
    freeze_path = Path(frozen["manifest"])
    bound_freeze = _resolve_evidence_path(receipt_path.parent, receipt["freeze_receipt"]["path"], "freeze_receipt.path")
    if bound_freeze != freeze_path or digest_file(bound_freeze) != receipt["freeze_receipt"]["sha256"] \
            or frozen["receipt_sha256"] != receipt["freeze_receipt"]["receipt_sha256"]:
        raise ParityInputError("execution receipt freeze receipt is missing, changed, or not selected")
    return receipt, receipt_path, receipt_file_sha


def _load_bound_adjudication(
    path: str | Path, comparison_id: str, trigger_ids: set[str], *,
    comparison_artifact: str | Path | None, expected_comparison: Mapping[str, Any],
    frozen: Mapping[str, Any], summaries: tuple[Mapping[str, Any], Mapping[str, Any]],
    supervisor_post: PublicationPost,
) -> dict[str, dict[str, Any]]:
    adjudication_input = Path(path).expanduser()
    if adjudication_input.is_symlink():
        raise ParityInputError("adjudication must not be a symlink")
    adjudication_path = adjudication_input.resolve(strict=True)
    if adjudication_path != adjudication_input.absolute():
        raise ParityInputError("adjudication path traverses a symlink")
    value = _read_json(adjudication_path)
    try:
        validate_against_schema(value, ADJUDICATION_SCHEMA_PATH, label="adjudication")
    except ValueError as exc:
        raise ParityInputError(f"adjudication schema validation failed: {exc}") from exc
    if value.get("comparison_id") != comparison_id:
        raise ParityInputError("adjudication comparison_id does not match these frozen runs")
    if comparison_artifact is None:
        raise ParityInputError("adjudication requires the original --comparison-artifact")
    comparison_input = Path(comparison_artifact).expanduser()
    if comparison_input.is_symlink():
        raise ParityInputError("initial comparison must not be a symlink")
    selected_comparison = comparison_input.resolve(strict=True)
    if selected_comparison != comparison_input.absolute():
        raise ParityInputError("initial comparison path traverses a symlink")
    _, receipt_path, receipt_file_sha = _validate_execution_receipt(
        value["execution_receipt"], adjudication_path, comparison_id, selected_comparison,
        expected_comparison, frozen,
    )

    snapshot_root = Path(frozen["data_snapshot"]["root"])
    snapshot_files = {row["path"]: row["sha256"] for row in frozen["data_snapshot"]["files"]}
    allowed_exact = {Path(summary["artifact"]): summary["artifact_file_sha256"] for summary in summaries}
    allowed_exact[Path(frozen["manifest"])] = frozen["manifest_file_sha256"]
    allowed_exact[selected_comparison] = digest_file(selected_comparison)
    result: dict[str, dict[str, Any]] = {}
    for index, row in enumerate(value["trigger_adjudications"]):
        trigger_id = row["trigger_id"]
        if trigger_id not in trigger_ids:
            raise ParityInputError(f"unknown adjudication trigger_id: {trigger_id!r}")
        if trigger_id in result:
            raise ParityInputError(f"duplicate adjudication for trigger_id {trigger_id!r}")
        supports: set[str] = set()
        for evidence_index, evidence in enumerate(row["evidence"]):
            artifact = _resolve_evidence_path(adjudication_path.parent, evidence["artifact_path"],
                                              f"trigger_adjudications[{index}].evidence[{evidence_index}].artifact_path")
            expected_hash = allowed_exact.get(artifact)
            try:
                relative = artifact.relative_to(snapshot_root).as_posix()
            except ValueError:
                relative = None
            if relative is not None:
                expected_hash = snapshot_files.get(relative)
            if expected_hash is None:
                raise ParityInputError(f"evidence artifact is not frozen by the receipt or comparison: {artifact}")
            if evidence["artifact_sha256"] != expected_hash or digest_file(artifact) != expected_hash:
                raise ParityInputError(f"evidence artifact hash does not match frozen bytes: {artifact}")
            _validate_locator(artifact, evidence["locator"])
            supports.add(evidence["supports"])
        if row["classification"] == "source_supported_disagreement":
            if "both" not in supports and not {"run_a", "run_b"}.issubset(supports):
                raise ParityInputError(f"source-supported disagreement {trigger_id!r} needs evidence for both runs")
        else:
            defective = row["defective_run"]
            supported_runs = {"run_a", "run_b"} if "both" in supports else supports & {"run_a", "run_b"}
            required_runs = {"run_a", "run_b"} if defective == "both" else {defective}
            if not required_runs.issubset(supported_runs):
                raise ParityInputError(f"provider defect {trigger_id!r} lacks frozen evidence for {defective}")
        result[trigger_id] = dict(row)
    # The live capability is single-use. Consume it only after every local contract/evidence check passes
    # and the adjudication can actually release; a malformed or incomplete draft must not burn the operator's
    # one retry before it can be corrected into a separate create-only artifact.
    if set(result) == trigger_ids and all(
        row["classification"] == "source_supported_disagreement" for row in result.values()
    ):
        verified = supervisor_post({"phase": "verify-attestation", "receiptOutput": str(receipt_path)})
        if verified.get("phase") != "verify-attestation" \
                or Path(str(verified.get("receiptPath", ""))).resolve() != receipt_path \
                or verified.get("receiptSha256") != receipt_file_sha:
            raise ParityInputError("supervisor did not verify the exact adjudication execution receipt")
    return result


def issue_adjudication_execution_receipt(
    report: Mapping[str, Any], comparison_artifact: str | Path, freeze_manifest: str | Path,
    receipt_output: str | Path, template_output: str | Path, *,
    supervisor_post: PublicationPost = _supervisor_post,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Ask the live supervisor to attest the original comparison; never trust child provenance."""
    comparison = Path(comparison_artifact).expanduser().resolve(strict=True)
    freeze = Path(freeze_manifest).expanduser().resolve(strict=True)
    def new_output_path(value: str | Path, label: str) -> Path:
        candidate = Path(value).expanduser().absolute()
        if candidate.exists() or candidate.is_symlink():
            raise ParityInputError(f"{label} must be a new file")
        try:
            parent = candidate.parent.resolve(strict=True)
        except OSError as exc:
            raise ParityInputError(f"{label} parent must be an existing real directory") from exc
        if not parent.is_dir() or parent.is_symlink():
            raise ParityInputError(f"{label} parent must be an existing real directory")
        return parent / candidate.name

    receipt_path = new_output_path(receipt_output, "attestation receipt output")
    template_path = new_output_path(template_output, "adjudication template output")
    if _read_json(comparison) != report:
        raise ParityInputError("attestation comparison artifact is not the exact generated report")
    response = supervisor_post({"phase": "attest", "comparisonArtifact": str(comparison),
                                "freezeReceipt": str(freeze), "receiptOutput": str(receipt_path)})
    if response.get("phase") != "attest" or Path(str(response.get("receiptPath", ""))).resolve() != receipt_path:
        raise ParityInputError("supervisor attested a different receipt path")
    receipt = _read_json(receipt_path)
    try:
        validate_against_schema(receipt, EXECUTION_RECEIPT_SCHEMA_PATH, label="execution receipt")
    except ValueError as exc:
        raise ParityInputError(f"supervisor execution receipt schema validation failed: {exc}") from exc
    receipt_sha = digest_file(receipt_path)
    if response.get("receiptSha256") != receipt_sha or response.get("attempt") != receipt.get("attempt") \
            or receipt.get("comparison_id") != report.get("comparison_id"):
        raise ParityInputError("supervisor attestation response does not bind the issued receipt")
    template = {"schema_version": ADJUDICATION_SCHEMA_VERSION, "comparison_id": report["comparison_id"],
                "execution_receipt": {"path": str(receipt_path), "sha256": receipt_sha},
                "trigger_adjudications": []}
    validate_against_schema(template, ADJUDICATION_SCHEMA_PATH, label="adjudication template")
    write_new_json(template_path, template, mode=0o444)
    return receipt, template


def _assemble_report(
    *, comparison_id: str, comparison: Mapping[str, Any], triggers: list[dict[str, Any]],
    blockers: list[dict[str, Any]], warnings: list[str], frozen_inputs: Mapping[str, Any] | None,
    summaries: tuple[Mapping[str, Any], Mapping[str, Any]],
    adjudications: Mapping[str, Mapping[str, Any]],
) -> tuple[dict[str, Any], int]:
    annotated: list[dict[str, Any]] = []
    unclassified: list[str] = []
    defects: list[str] = []
    for trigger in triggers:
        item = dict(trigger)
        adjudication = adjudications.get(trigger["trigger_id"])
        item["adjudication"] = adjudication
        annotated.append(item)
        if adjudication is None:
            unclassified.append(trigger["trigger_id"])
        elif adjudication["classification"] == "provider_defect":
            defects.append(trigger["trigger_id"])
    if blockers:
        exit_code, result = EXIT_PROVIDER_DEFECT, "deterministic_provider_defect"
    elif defects:
        exit_code, result = EXIT_PROVIDER_DEFECT, "provider_defect"
    elif unclassified:
        exit_code, result = EXIT_ADJUDICATION_REQUIRED, "adjudication_required"
    elif triggers:
        exit_code, result = EXIT_PASS, "source_supported_disagreements"
    else:
        exit_code, result = EXIT_PASS, "no_material_differences"
    report = {
        "schema_version": REPORT_SCHEMA_VERSION, "comparison_id": comparison_id,
        "gate_status": "pass" if exit_code == EXIT_PASS else "fail", "result": result,
        "exit_code": exit_code, "gate_scope": "release" if frozen_inputs else "analytical_diagnostic_only",
        "release_gate_eligible": frozen_inputs is not None, "frozen_inputs": frozen_inputs,
        "thresholds": {
            "conviction_difference_points": {"operator": ">", "value": 10.0},
            "data_sufficiency_difference_points": {"operator": ">", "value": 10.0},
            "expected_return_difference_percentage_points": {"operator": ">", "value": 10.0},
            "module_score_difference_points": {"operator": ">", "value": 15.0},
        },
        "runs": list(summaries), "comparison": comparison, "deterministic_blockers": blockers,
        "material_triggers": annotated, "unclassified_trigger_ids": unclassified,
        "provider_defect_trigger_ids": defects,
        "adjudication_contract": {
            "schema_version": ADJUDICATION_SCHEMA_VERSION, "comparison_id": comparison_id,
            "required_trigger_ids": [item["trigger_id"] for item in triggers],
            "allowed_classifications": ["source_supported_disagreement", "provider_defect"],
            "every_classification_requires_structured_evidence": True,
            "provider_defect_requires_defect_class": True,
            "deterministic_blockers_are_not_adjudicatable": True,
            "supervisor_execution_attestation_required": True,
            "evidence_requires_frozen_path_sha256_and_resolvable_locator": True,
        },
        "warnings": warnings,
    }
    return report, exit_code


def compare_run_roots(
    run_a: str | Path,
    run_b: str | Path,
    *,
    label_a: str = "run_a",
    label_b: str = "run_b",
    adjudication_path: str | Path | None = None,
    comparison_artifact_path: str | Path | None = None,
    freeze_manifest_path: str | Path | None = None,
    require_freeze_manifest: bool = False,
    supervisor_receipt_loader: SupervisorReceiptLoader = _committed_supervisor_rows,
    supervisor_post: PublicationPost = _supervisor_post,
) -> tuple[dict[str, Any], int]:
    path_a = resolve_artifact(run_a)
    path_b = resolve_artifact(run_b)
    input_a, input_b = Path(run_a).expanduser(), Path(run_b).expanduser()
    root_a = input_a.resolve() if input_a.is_dir() else path_a.parent.resolve()
    root_b = input_b.resolve() if input_b.is_dir() else path_b.parent.resolve()
    record_a = _read_json(path_a)
    record_b = _read_json(path_b)
    extracted_a = _extract(record_a)
    extracted_b = _extract(record_b)
    blockers = _analytical_blockers(record_a, extracted_a, "run_a") + _analytical_blockers(record_b, extracted_b, "run_b")
    comparison, triggers, warnings = _build_comparison(extracted_a, extracted_b)
    summary_a = _record_summary(path_a, record_a, label_a)
    summary_b = _record_summary(path_b, record_b, label_b)
    if require_freeze_manifest and freeze_manifest_path is None:
        raise ParityInputError(
            "release-gate mode requires --freeze-manifest; an unbound JSON comparison cannot enable Codex"
        )
    frozen_inputs = _validate_prelaunch_freeze_manifest(
        freeze_manifest_path,
        (root_a, root_b),
        (path_a, path_b),
        (record_a, record_b),
        (summary_a, summary_b),
        supervisor_receipt_loader,
    ) if freeze_manifest_path is not None else None
    comparison_id = _digest({
        "schema_version": REPORT_SCHEMA_VERSION,
        "record_digests": [summary_a["record_digest"], summary_b["record_digest"]],
        "freeze_receipt_sha256": frozen_inputs["receipt_sha256"] if frozen_inputs else None,
        "material_triggers": triggers,
        "deterministic_blockers": blockers,
    })

    initial_report, initial_code = _assemble_report(
        comparison_id=comparison_id, comparison=comparison, triggers=triggers, blockers=blockers,
        warnings=warnings, frozen_inputs=frozen_inputs, summaries=(summary_a, summary_b), adjudications={},
    )
    if adjudication_path is None:
        return initial_report, initial_code
    if adjudication_path is not None:
        if frozen_inputs is None:
            raise ParityInputError("adjudication is release-only and requires a validated freeze receipt")
        adjudications = _load_bound_adjudication(
            adjudication_path, comparison_id, {item["trigger_id"] for item in triggers},
            comparison_artifact=comparison_artifact_path, expected_comparison=initial_report,
            frozen=frozen_inputs, summaries=(summary_a, summary_b), supervisor_post=supervisor_post,
        )
    return _assemble_report(
        comparison_id=comparison_id, comparison=comparison, triggers=triggers, blockers=blockers,
        warnings=warnings, frozen_inputs=frozen_inputs, summaries=(summary_a, summary_b),
        adjudications=adjudications,
    )


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run_a", help="first isolated run root or terminal JSON artifact")
    parser.add_argument("run_b", help="second isolated run root or terminal JSON artifact")
    parser.add_argument("--label-a", default="run_a", help="display label for the first run")
    parser.add_argument("--label-b", default="run_b", help="display label for the second run")
    parser.add_argument("--adjudication", help="separate evidence-adjudication JSON artifact")
    parser.add_argument(
        "--comparison-artifact",
        help="immutable initial comparison JSON bound by the adjudication execution receipt",
    )
    parser.add_argument(
        "--freeze-manifest",
        help="runtime-external receipt binding isolated Claude/Codex roots to one data/date/price snapshot",
    )
    parser.add_argument(
        "--release-gate",
        action="store_true",
        help="fail unless --freeze-manifest proves the full paired-canary input contract",
    )
    parser.add_argument(
        "--live-supervisor-receipts",
        action="store_true",
        help="cockpit-only provisional worktree receipts; the live supervisor re-runs with private rows before attesting",
    )
    parser.add_argument("--output", help="write the JSON report here instead of stdout")
    parser.add_argument(
        "--issue-adjudication-receipt",
        help="after writing an adjudication-required comparison, issue a runtime-derived receipt here",
    )
    parser.add_argument(
        "--adjudication-template",
        help="write a schema-valid empty adjudication template (requires --issue-adjudication-receipt)",
    )
    parser.add_argument("--pretty", action="store_true", help="indent the JSON report")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    if args.live_supervisor_receipts and (os.environ.get("NOSTRA_COCKPIT_RUN") != "1"
            or not os.environ.get("NOSTRA_PUBLICATION_ENDPOINT") or not os.environ.get("NOSTRA_PUBLICATION_TOKEN")):
        sys.stderr.write("compare-provider-runs: --live-supervisor-receipts requires a live cockpit capability\n")
        return EXIT_INPUT_ERROR
    try:
        report, exit_code = compare_run_roots(
            args.run_a,
            args.run_b,
            label_a=args.label_a,
            label_b=args.label_b,
            adjudication_path=args.adjudication,
            comparison_artifact_path=args.comparison_artifact,
            freeze_manifest_path=args.freeze_manifest,
            require_freeze_manifest=args.release_gate,
            supervisor_receipt_loader=_live_worktree_supervisor_rows if args.live_supervisor_receipts else _committed_supervisor_rows,
        )
    except ParityInputError as exc:
        report = {
            "schema_version": REPORT_SCHEMA_VERSION,
            "gate_status": "fail",
            "result": "input_error",
            "exit_code": EXIT_INPUT_ERROR,
            "error": str(exc),
        }
        exit_code = EXIT_INPUT_ERROR

    rendered = json.dumps(
        report,
        ensure_ascii=False,
        sort_keys=True,
        indent=2 if args.pretty else None,
        separators=None if args.pretty else (",", ":"),
    ) + "\n"
    issue_requested = args.issue_adjudication_receipt is not None or args.adjudication_template is not None
    if issue_requested and (not args.issue_adjudication_receipt or not args.adjudication_template):
        sys.stderr.write("compare-provider-runs: receipt and adjudication-template outputs must be supplied together\n")
        return EXIT_INPUT_ERROR
    if issue_requested and (not args.output or not args.freeze_manifest or not args.release_gate or args.adjudication):
        sys.stderr.write("compare-provider-runs: receipt issuance requires initial --release-gate, --freeze-manifest, and --output without --adjudication\n")
        return EXIT_INPUT_ERROR
    if args.output:
        output = Path(args.output).expanduser()
        if args.release_gate:
            try:
                write_new_json(output.absolute(), report, mode=0o444)
            except ValueError as exc:
                sys.stderr.write(f"compare-provider-runs: {exc}\n")
                return EXIT_INPUT_ERROR
        else:
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(rendered, encoding="utf-8")
    else:
        sys.stdout.write(rendered)
    if issue_requested:
        if exit_code not in {EXIT_PASS, EXIT_ADJUDICATION_REQUIRED} or report.get("deterministic_blockers"):
            sys.stderr.write("compare-provider-runs: execution receipts require a deterministic-pass or adjudicatable comparison\n")
            return exit_code
        try:
            receipt, _template = issue_adjudication_execution_receipt(
                report, args.output, args.freeze_manifest,
                args.issue_adjudication_receipt, args.adjudication_template,
            )
            # A no-difference pass has no adjudicator Task, so consume the live capability here. This keeps
            # the apparently easiest release outcome from trusting a child-editable worktree receipt.
            if exit_code == EXIT_PASS:
                receipt_path = Path(args.issue_adjudication_receipt).expanduser().resolve(strict=True)
                verified = _supervisor_post({"phase": "verify-attestation", "receiptOutput": str(receipt_path)})
                if verified.get("phase") != "verify-attestation" \
                        or Path(str(verified.get("receiptPath", ""))).resolve() != receipt_path \
                        or verified.get("receiptSha256") != digest_file(receipt_path):
                    raise ParityInputError("supervisor did not verify the no-difference execution receipt")
        except (ParityInputError, ValueError, OSError) as exc:
            sys.stderr.write(f"compare-provider-runs: cannot issue adjudication receipt: {exc}\n")
            return EXIT_INPUT_ERROR
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
