#!/usr/bin/env python3
"""Compile commodity orb signal sidecars into one conservative evidence graph.

Ownership is discovered from agent frontmatter. No commodity, module, orb or family is
hardcoded here. Correlated rows are clustered so conviction counts independent drivers,
while every original row and every contradiction remains visible.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import statistics
import sys
import tempfile
from pathlib import Path


AGENT_GLOB = ".claude/agents/commodity/*/[0-9][0-9]_*.md"
CORRELATION_THRESHOLD = 0.70
MIN_CORRELATION_DAYS = 1095
MIN_WEEKLY_OBSERVATIONS = 150
CONVICTION_ROLES = {"driver", "confirmation"}
VALID_ROLES = CONVICTION_ROLES | {"risk", "catalyst", "context"}
VALID_HORIZONS = {"tactical", "strategic", "both"}
VALID_DIRECTIONS = {"bullish", "bearish", "neutral"}
VALID_KINDS = {"observational", "statistical"}
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9._-]*$")
FAMILY_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def _frontmatter(path: Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n") or "\n---\n" not in text[4:]:
        raise ValueError(f"{path}: missing YAML frontmatter")
    block = text[4:text.index("\n---\n", 4)]
    result: dict[str, object] = {}
    for line in block.splitlines():
        if not line or line[0].isspace() or ":" not in line:
            continue
        key, raw = line.split(":", 1)
        raw = raw.strip()
        if raw in {"true", "false"}:
            result[key] = raw == "true"
        elif raw.startswith("["):
            try:
                result[key] = json.loads(raw)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}: {key} must be an inline JSON array") from exc
        else:
            result[key] = raw.strip('"\'')
    return result


def discover_owners(repo_root: Path) -> tuple[dict[str, dict], dict[str, str]]:
    agents: dict[str, dict] = {}
    family_owner: dict[str, str] = {}
    for path in sorted(repo_root.glob(AGENT_GLOB)):
        meta = _frontmatter(path)
        if not meta.get("emits_signal_evidence", False):
            continue
        owner = str(meta.get("name", ""))
        families = meta.get("signal_families")
        if not owner or not isinstance(families, list) or not families:
            raise ValueError(f"{path}: emitting orb needs name and non-empty signal_families[]")
        module = path.parent.name
        output_stem = path.stem
        if owner in agents:
            raise ValueError(f"duplicate emitting owner_orb {owner}")
        agents[owner] = {"path": path, "module": module, "output_stem": output_stem, "families": families}
        for family in families:
            if not isinstance(family, str) or not FAMILY_RE.fullmatch(family):
                raise ValueError(f"{path}: invalid signal family {family!r}")
            prior = family_owner.get(family)
            if prior and prior != owner:
                raise ValueError(f"signal family {family!r} has two causal owners: {prior}, {owner}")
            family_owner[family] = owner
    return agents, family_owner


def _parse_time(value: str, field: str) -> dt.datetime:
    if not isinstance(value, str) or not value:
        raise ValueError(f"{field} must be an ISO-8601 timestamp")
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(f"{field} must be an ISO-8601 timestamp") from exc
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(dt.timezone.utc)


def _iso(value: dt.datetime) -> str:
    return value.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def _is_vintage_id(value: object) -> bool:
    return (isinstance(value, str) and len(value) == 71 and value.startswith("sha256:")
            and all(char in "0123456789abcdef" for char in value[7:]))


def _source_verified(source_ids: list[str], refs: object, resolver, cutoff: dt.datetime) -> bool:
    if not source_ids or not all(_is_vintage_id(value) for value in source_ids) or not isinstance(refs, list):
        return False
    referenced = []
    for ref in refs:
        if (not isinstance(ref, dict) or not _is_vintage_id(ref.get("vintage_id"))
                or not all(isinstance(ref.get(field), str) and ref[field]
                           for field in ("dataset_id", "series_id", "subject"))
                or not SLUG_RE.fullmatch(ref["dataset_id"])
                or not SLUG_RE.fullmatch(ref["series_id"])
                or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", ref["subject"])
                or not resolver(ref, cutoff)):
            return False
        referenced.append(ref["vintage_id"])
    return sorted(referenced) == sorted(source_ids) and len(referenced) == len(set(referenced))


def _source_id_admissible(value: str) -> bool:
    return (_is_vintage_id(value)
            or value.startswith(("unvintaged:", "missing:", "manual-unverified:")))


def _source_refs_have_sortable_ids(refs: object) -> bool:
    return (isinstance(refs, list)
            and all(isinstance(ref, dict) and isinstance(ref.get("vintage_id", ""), str)
                    for ref in refs))


def _load_validation_registry(path: Path) -> dict[str, dict]:
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return {}
    if not isinstance(document, dict) or document.get("schema_version") != 1:
        raise ValueError(f"{path}: invalid validation registry")
    results = document.get("results")
    if not isinstance(results, list):
        raise ValueError(f"{path}: results must be an array")
    if results:
        requirements = document.get("requirements")
        digest = document.get("input_sha256")
        if (not isinstance(digest, str) or not re.fullmatch(r"[0-9a-f]{64}", digest)
                or not document.get("generated_at") or not isinstance(requirements, dict)
                or float(document.get("false_discovery_rate", 1)) > 0.10
                or requirements.get("minimum_regimes", 0) < 3
                or requirements.get("minimum_non_overlapping_outcomes", 0) < 30
                or requirements.get("positive_folds_required", 0) < 4
                or requirements.get("fold_count") != 5
                or requirements.get("bootstrap_samples", 0) < 1000):
            raise ValueError(f"{path}: non-empty registry lacks the validator's hard requirement metadata")
    registry = {}
    for row in results:
        if not isinstance(row, dict) or not row.get("signal_id"):
            raise ValueError(f"{path}: invalid validation result")
        if row["signal_id"] in registry:
            raise ValueError(f"{path}: duplicate validation result {row['signal_id']}")
        registry[row["signal_id"]] = row
    return registry


def _statistically_validated(signal_id: str, validation_ref: object, registry: dict[str, dict]) -> bool:
    if validation_ref != signal_id:
        return False
    result = registry.get(signal_id)
    gates = result.get("gates") if isinstance(result, dict) else None
    required = {
        "point_in_time", "three_regimes", "thirty_non_overlapping_outcomes",
        "expected_sign_four_of_five_folds", "beats_cost_adjusted_naive",
        "positive_block_bootstrap_ci", "stable_lookbacks", "false_discovery_control",
    }
    metrics = result.get("metrics") if isinstance(result, dict) else None
    ci = metrics.get("bootstrap_ci_95_pct") if isinstance(metrics, dict) else None
    metrics_hold = bool(
        isinstance(metrics, dict)
        and metrics.get("outcome_count", 0) >= 30
        and metrics.get("regime_count", 0) >= 3
        and metrics.get("positive_folds", 0) >= 4
        and metrics.get("fold_count") == 5
        and metrics.get("mean_net_improvement_pct", 0) > 0
        and isinstance(ci, list) and len(ci) == 2 and ci[0] > 0
        and 0 <= metrics.get("bootstrap_one_sided_p", 1) <= 0.10
    )
    return bool(result and result.get("status") == "validated" and isinstance(gates, dict)
                and required.issubset(gates) and all(gates[name] is True for name in required)
                and metrics_hold)


def _validate_signal(raw: dict, owner: str, family_owner: dict[str, str],
                     registry: dict[str, dict], generated_at: dt.datetime, resolver) -> dict:
    if not isinstance(raw, dict):
        raise ValueError(f"{owner}: each signal must be an object")
    signal_id = raw.get("signal_id")
    family = raw.get("economic_cluster")
    role = raw.get("role")
    horizon = raw.get("horizon")
    direction = raw.get("direction")
    kind = raw.get("signal_kind")
    if not isinstance(signal_id, str) or not SLUG_RE.fullmatch(signal_id):
        raise ValueError(f"{owner}: invalid signal_id {signal_id!r}")
    if family_owner.get(family) != owner:
        raise ValueError(f"{signal_id}: economic_cluster {family!r} belongs to {family_owner.get(family)!r}, not {owner!r}")
    if role not in VALID_ROLES or horizon not in VALID_HORIZONS or direction not in VALID_DIRECTIONS or kind not in VALID_KINDS:
        raise ValueError(f"{signal_id}: invalid role/horizon/direction/signal_kind")
    strength = raw.get("strength")
    if isinstance(strength, bool) or not isinstance(strength, (int, float)) or not 0 <= float(strength) <= 1:
        raise ValueError(f"{signal_id}: strength must be between 0 and 1")
    as_of = _parse_time(raw.get("as_of"), f"{signal_id}.as_of")
    expiry_raw = raw.get("expiry")
    expiry = _parse_time(expiry_raw, f"{signal_id}.expiry") if expiry_raw is not None else None
    if expiry is not None and expiry < as_of:
        raise ValueError(f"{signal_id}: expiry precedes as_of")
    if as_of > generated_at:
        raise ValueError(f"{signal_id}: as_of is later than its evidence bundle generation time")
    source_ids = raw.get("source_vintage_ids")
    if (not isinstance(source_ids, list) or not source_ids
            or any(not isinstance(v, str) or not v or not _source_id_admissible(v) for v in source_ids)):
        raise ValueError(f"{signal_id}: source_vintage_ids must be a non-empty string array")
    if len(set(source_ids)) != len(source_ids):
        raise ValueError(f"{signal_id}: duplicate source_vintage_ids")
    source_refs = raw.get("source_vintage_refs", [])
    if not _source_refs_have_sortable_ids(source_refs):
        raise ValueError(
            f"{signal_id}: each source_vintage_ref must be an object with a string vintage_id"
        )
    source_ok = _source_verified(source_ids, source_refs, resolver, generated_at)
    expired = expiry is not None and expiry < generated_at
    validated = kind == "statistical" and _statistically_validated(signal_id, raw.get("validation_ref"), registry)
    if expired:
        status = "expired"
    elif not source_ok:
        status = "source_unverified"
    elif kind == "observational":
        status = "not_applicable"
    elif validated:
        status = "validated"
    else:
        status = "contextual"
    eligible = (not expired and source_ok and role in CONVICTION_ROLES
                and (kind == "observational" or validated))
    out = dict(raw)
    out.update({
        "owner_orb": owner,
        "strength": float(strength),
        "as_of": _iso(as_of),
        "expiry": _iso(expiry) if expiry else None,
        "source_vintage_ids": sorted(source_ids),
        "source_vintage_refs": sorted(source_refs, key=lambda row: row.get("vintage_id", "")),
        "validation_ref": raw.get("validation_ref"),
        "validation_status": status,
        "conviction_eligible": eligible,
        "contradicts": sorted(set(raw.get("contradicts") or [])),
    })
    return out


class _UnionFind:
    def __init__(self, values: list[str]):
        self.parent = {value: value for value in values}

    def find(self, value: str) -> str:
        while self.parent[value] != value:
            self.parent[value] = self.parent[self.parent[value]]
            value = self.parent[value]
        return value

    def union(self, left: str, right: str) -> None:
        a, b = self.find(left), self.find(right)
        if a != b:
            self.parent[max(a, b)] = min(a, b)


def _date(value: str) -> dt.date:
    return dt.date.fromisoformat(value)


def _eligible_correlation(edge: dict, resolver, cutoff: dt.datetime) -> bool:
    try:
        span = (_date(edge["window_end"]) - _date(edge["window_start"])).days
        corr = float(edge["correlation"])
        count = int(edge["observation_count"])
        sources = edge["source_vintage_ids"]
    except (KeyError, TypeError, ValueError):
        return False
    return (abs(corr) >= CORRELATION_THRESHOLD and span >= MIN_CORRELATION_DAYS
            and count >= MIN_WEEKLY_OBSERVATIONS and edge.get("frequency") == "weekly"
            and edge.get("method") == "pearson" and isinstance(sources, list)
            and _source_verified(sources, edge.get("source_vintage_refs"), resolver, cutoff))


def _validate_correlation(edge: dict, id_set: set[str], resolver, cutoff: dt.datetime) -> dict:
    if not isinstance(edge, dict):
        raise ValueError("correlation edge must be an object")
    required = {"signal_a", "signal_b", "correlation", "window_start", "window_end",
                "observation_count", "frequency", "method", "source_vintage_ids", "source_vintage_refs"}
    if not required.issubset(edge):
        raise ValueError(f"correlation edge missing {sorted(required - set(edge))}")
    a, b = edge["signal_a"], edge["signal_b"]
    if a not in id_set or b not in id_set or a == b:
        raise ValueError(f"correlation edge references unknown or identical signals: {a!r}, {b!r}")
    try:
        correlation = float(edge["correlation"])
        count = int(edge["observation_count"])
        start, end = _date(edge["window_start"]), _date(edge["window_end"])
    except (TypeError, ValueError) as exc:
        raise ValueError(f"invalid correlation edge for {a}, {b}") from exc
    source_ids = edge["source_vintage_ids"]
    source_refs = edge["source_vintage_refs"]
    if (not -1 <= correlation <= 1 or not dt.date.min <= start < end <= dt.date.max
            or count < 1 or edge["frequency"] != "weekly" or edge["method"] != "pearson"
            or not isinstance(source_ids, list) or not source_ids
            or any(not isinstance(value, str) or not value or not _source_id_admissible(value) for value in source_ids)
            or len(set(source_ids)) != len(source_ids)
            or not _source_refs_have_sortable_ids(source_refs)):
        raise ValueError(f"invalid correlation edge contract for {a}, {b}")
    normalized = dict(edge)
    normalized["correlation"] = correlation
    normalized["observation_count"] = count
    normalized["source_vintage_ids"] = sorted(source_ids)
    normalized["source_vintage_refs"] = sorted(source_refs, key=lambda row: row.get("vintage_id", ""))
    normalized["eligible_for_merge"] = _eligible_correlation(normalized, resolver, cutoff)
    return normalized


def _production_source_resolver(repo_root: Path):
    scripts_dir = repo_root / "scripts"
    if not (scripts_dir / "connector_vintages.py").is_file():
        raise ValueError("connector_vintages.py is required to resolve source-vintage references")
    added = str(scripts_dir) not in sys.path
    if added:
        sys.path.insert(0, str(scripts_dir))
    try:
        from connector_vintages import resolve_vintage_id
    finally:
        if added:
            sys.path.remove(str(scripts_dir))

    cache: dict[tuple[str, str, str, str, str], bool] = {}

    def resolve(ref: dict, cutoff: dt.datetime) -> bool:
        key = (ref["dataset_id"], ref["series_id"], ref["subject"], ref["vintage_id"], _iso(cutoff))
        if key in cache:
            return cache[key]
        result = resolve_vintage_id(
            str(repo_root / "data"), ref["series_id"], ref["subject"], ref["vintage_id"]
        )
        vintage = result.get("vintage") if isinstance(result, dict) else None
        if not isinstance(vintage, dict) or vintage.get("dataset_id") != ref["dataset_id"]:
            cache[key] = False
            return cache[key]
        try:
            retrieved = _parse_time(vintage.get("retrieved_at"), "vintage.retrieved_at")
        except ValueError:
            cache[key] = False
            return cache[key]
        cache[key] = retrieved <= cutoff
        return cache[key]

    return resolve


def compile_evidence(repo_root: Path, run_root: Path, registry_path: Path, source_resolver=None) -> dict:
    agents, family_owner = discover_owners(repo_root)
    registry = _load_validation_registry(registry_path)
    source_resolver = source_resolver or _production_source_resolver(repo_root)
    commodity = run_root.name.upper()
    raw_documents = []
    expected, emitted, missing = [], [], []
    coverage_issues: list[str] = []
    known_sidecars = set()
    active_modules = {
        path.parent.name
        for path in run_root.glob("*/[0-9][0-9]_*.md")
        if path.is_file()
    }
    for owner, info in sorted(agents.items()):
        report = run_root / info["module"] / f"{info['output_stem']}.md"
        sidecar = report.with_suffix(".signals.json")
        known_sidecars.add(sidecar.resolve())
        if info["module"] in active_modules:
            expected.append(owner)
            if report.is_file() and report.stat().st_size > 0 and sidecar.is_file():
                emitted.append(owner)
                try:
                    document = json.loads(sidecar.read_text(encoding="utf-8"))
                except json.JSONDecodeError as exc:
                    raise ValueError(f"{sidecar}: invalid JSON") from exc
                raw_documents.append((owner, sidecar, document))
            else:
                missing.append(owner)
    for sidecar in run_root.glob("*/*.signals.json"):
        if sidecar.resolve() not in known_sidecars:
            raise ValueError(f"{sidecar}: orphan signal sidecar has no emitting agent declaration")

    generated_times = []
    for owner, sidecar, document in raw_documents:
        if not isinstance(document, dict) or document.get("schema_version") != 1:
            raise ValueError(f"{sidecar}: needs schema_version=1")
        if document.get("commodity") != commodity or document.get("owner_orb") != owner:
            raise ValueError(f"{sidecar}: commodity/owner_orb does not match its path and declaration")
        generated_times.append(_parse_time(document.get("generated_at"), f"{sidecar}.generated_at"))
    # Empty/incomplete legacy runs still compile to an honest coverage object. Keep that
    # byte-reproducible instead of stamping wall-clock time into an evidence-free file.
    generated_at = max(generated_times) if generated_times else dt.datetime(1970, 1, 1, tzinfo=dt.timezone.utc)

    records = []
    correlations = []
    for owner, sidecar, document in raw_documents:
        signals = document.get("signals")
        if not isinstance(signals, list):
            raise ValueError(f"{sidecar}: signals must be an array")
        records.extend(_validate_signal(raw, owner, family_owner, registry, generated_at, source_resolver) for raw in signals)
        edges = document.get("correlation_edges", [])
        if not isinstance(edges, list):
            raise ValueError(f"{sidecar}: correlation_edges must be an array")
        correlations.extend(edges)
    records.sort(key=lambda row: row["signal_id"])
    ids = [row["signal_id"] for row in records]
    if len(set(ids)) != len(ids):
        raise ValueError("signal_id values must be unique across all orbs")
    id_set = set(ids)
    for row in records:
        unknown = set(row["contradicts"]) - id_set
        if unknown:
            coverage_issues.append(f"{row['signal_id']}: contradicts missing signal(s) {sorted(unknown)}")

    union = _UnionFind(ids)
    merge_reasons: dict[tuple[str, str], set[str]] = {}

    def merge(a: str, b: str, reason: str) -> None:
        if a == b:
            return
        union.union(a, b)
        merge_reasons.setdefault(tuple(sorted((a, b))), set()).add(reason)

    for row in records:
        for other in row["contradicts"]:
            if other in id_set:
                merge(row["signal_id"], other, "explicit_contradiction")

    by_family: dict[str, list[str]] = {}
    for row in records:
        by_family.setdefault(row["economic_cluster"], []).append(row["signal_id"])
    for family, members in by_family.items():
        for member in members[1:]:
            merge(members[0], member, f"economic_cluster:{family}")

    components: dict[str, set[str]] = {}
    for row in records:
        for field in ("numerator_series_id", "denominator_series_id"):
            value = row.get(field)
            if isinstance(value, str) and value:
                components.setdefault(value, set()).add(row["signal_id"])
    for series_id, members in components.items():
        ordered = sorted(members)
        for member in ordered[1:]:
            merge(ordered[0], member, f"shared_component:{series_id}")

    normalized_edges = []
    for edge in correlations:
        if isinstance(edge, dict) and (edge.get("signal_a") not in id_set or edge.get("signal_b") not in id_set):
            coverage_issues.append(
                f"correlation edge references missing signal(s): {edge.get('signal_a')!r}, {edge.get('signal_b')!r}"
            )
            continue
        normalized = _validate_correlation(edge, id_set, source_resolver, generated_at)
        a, b = normalized["signal_a"], normalized["signal_b"]
        normalized_edges.append(normalized)
        if normalized["eligible_for_merge"]:
            merge(a, b, f"abs_3y_weekly_correlation:{float(edge['correlation']):.3f}")

    grouped: dict[str, list[dict]] = {}
    for row in records:
        grouped.setdefault(union.find(row["signal_id"]), []).append(row)
    clusters = []
    for root, members in sorted(grouped.items()):
        member_ids = sorted(row["signal_id"] for row in members)
        directions = sorted({row["direction"] for row in members})
        explicit_conflict = any(set(row["contradicts"]) & set(member_ids) for row in members)
        contradiction = explicit_conflict or {"bullish", "bearish"}.issubset(directions)
        reasons = sorted(reason for pair, values in merge_reasons.items()
                         if set(pair).issubset(member_ids) for reason in values)
        clusters.append({
            "cluster_id": min(member_ids),
            "signal_ids": member_ids,
            "economic_clusters": sorted({row["economic_cluster"] for row in members}),
            "directions": directions,
            "contradiction": contradiction,
            "median_strength": statistics.median(row["strength"] for row in members),
            "conviction_eligible": not contradiction and any(row["conviction_eligible"] for row in members),
            "merge_reasons": reasons,
        })
    return {
        "schema_version": 1,
        "commodity": commodity,
        "generated_at": _iso(generated_at),
        "records": records,
        "clusters": clusters,
        "correlation_edges": sorted(normalized_edges, key=lambda row: (row["signal_a"], row["signal_b"])),
        "coverage": {
            "expected_for_completed_orbs": expected,
            "emitted": emitted,
            "missing": missing,
            "issues": sorted(coverage_issues),
            "complete": not missing and not coverage_issues,
        },
        "summary": {
            "raw_signal_count": len(records),
            "independent_cluster_count": len(clusters),
            "conviction_eligible_cluster_count": sum(row["conviction_eligible"] for row in clusters),
            "contradiction_count": sum(row["contradiction"] for row in clusters),
            "contextual_statistical_count": sum(row["signal_kind"] == "statistical" and not row["conviction_eligible"] for row in records),
        },
    }


def _atomic_write(path: Path, document: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = (json.dumps(document, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode()
    fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_name, path)
    finally:
        try:
            os.unlink(temp_name)
        except FileNotFoundError:
            pass


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("run_root", type=Path)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--validation-registry", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--check", action="store_true", help="validate and print summary without writing")
    args = parser.parse_args(argv)
    registry = args.validation_registry or args.repo_root / "frameworks/commodity/validated_signals.json"
    output = args.output or args.run_root / "signal_evidence.json"
    try:
        document = compile_evidence(args.repo_root.resolve(), args.run_root.resolve(), registry.resolve())
        if not args.check:
            _atomic_write(output, document)
    except (OSError, ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
        print(f"SIGNAL-EVIDENCE-FAIL: {exc}", file=sys.stderr)
        return 1
    summary = document["summary"]
    print("SIGNAL-EVIDENCE-OK: "
          f"{summary['raw_signal_count']} rows -> {summary['independent_cluster_count']} independent clusters; "
          f"{summary['conviction_eligible_cluster_count']} conviction-eligible; "
          f"coverage={'complete' if document['coverage']['complete'] else 'incomplete'}")
    if not args.check:
        print(f"WROTE {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
