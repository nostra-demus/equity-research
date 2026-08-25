#!/usr/bin/env python3
"""Content-free runtime metrics and readiness-report publication for research memory."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import math
from pathlib import Path
from typing import Any, Mapping, Sequence

try:
    from memory_operations import build_operational_readiness_report, load_json_read_only
    from memory_runtime import _atomic_private_write, _safe_directory, _safe_regular
except ImportError:  # pragma: no cover - package-style imports
    from scripts.memory_operations import build_operational_readiness_report, load_json_read_only
    from scripts.memory_runtime import _atomic_private_write, _safe_directory, _safe_regular


PERFORMANCE_SCHEMA = "memory-performance-observation/v1"
MAX_PACKETS = 100_000


class ObservabilityError(ValueError):
    """Runtime evidence cannot be measured or published safely."""


def _now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def _instant(value: str) -> dt.datetime:
    moment = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if moment.tzinfo is None:
        raise ObservabilityError("packet clock is not timezone-aware")
    return moment.astimezone(dt.timezone.utc)


def _formatted(value: dt.datetime) -> str:
    return value.astimezone(dt.timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def _p95(values: Sequence[int]) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    return float(ordered[max(0, math.ceil(len(ordered) * 0.95) - 1)])


def performance_observation(state_root: str | Path, *, evaluated_at: dt.datetime | None = None) -> dict[str, Any]:
    root = _safe_directory(Path(state_root), create=True)
    packet_root = root / "packet-cache"
    packets = sorted(packet_root.glob("*/*/packet.json")) if packet_root.is_dir() and not packet_root.is_symlink() else []
    if len(packets) > MAX_PACKETS:
        raise ObservabilityError("packet metric scan exceeds its fixed bound")
    compilation: list[int] = []
    clocks: list[dt.datetime] = []
    for path in packets:
        try:
            value = json.loads(_safe_regular(path))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            raise ObservabilityError("packet metric input is unreadable") from exc
        accounting = value.get("accounting") if isinstance(value, Mapping) else None
        if (
            not isinstance(value, Mapping) or value.get("schema") != "memory-context-packet/v2"
            or not isinstance(accounting, Mapping)
            or type(accounting.get("compile_milliseconds")) is not int
            or accounting["compile_milliseconds"] < 0
            or not isinstance(value.get("as_of_system_time"), str)
        ):
            raise ObservabilityError("packet metric input is invalid")
        compilation.append(accounting["compile_milliseconds"])
        clocks.append(_instant(value["as_of_system_time"]))
    evaluated = evaluated_at or _now()
    if evaluated.tzinfo is None:
        raise ObservabilityError("evaluation clock must be timezone-aware")
    evaluated = evaluated.astimezone(dt.timezone.utc)
    start = min(clocks) if clocks else evaluated
    if start > evaluated:
        raise ObservabilityError("packet metrics contain a future clock")
    # Packet compilation includes the immutable SQLite retrieval. Until the runtime publishes a narrower
    # span, using the same total for retrieval is conservative: it can fail an SLO but cannot fake a pass.
    total_p95 = _p95(compilation)
    return {
        "schema": PERFORMANCE_SCHEMA,
        "window_start": _formatted(start), "window_end": _formatted(evaluated),
        "issuer_query_count": len(compilation),
        "retrieval_p95_millis": total_p95,
        "context_compilation_p95_millis": total_p95,
    }


def publish_performance(state_root: str | Path, *, evaluated_at: dt.datetime | None = None) -> Path:
    root = _safe_directory(Path(state_root), create=True)
    value = performance_observation(root, evaluated_at=evaluated_at)
    path = root / "operations" / "performance-observation.json"
    _atomic_private_write(path, value)
    return path


def _optional(path: str | None) -> Mapping[str, Any] | None:
    return load_json_read_only(path) if path else None


def publish_readiness(
    *, state_root: str | Path, evaluated_at: str, phase0_baseline: str,
    phase0_candidate: str | None = None, phase3_synthetic: str | None = None,
    projection_doctor: str | None = None, store_doctor: str | None = None,
    controlled_write: str | None = None, performance: str | None = None,
    restore_drill: str | None = None, access_audit: str | None = None,
    schema_review: str | None = None, scale_comparisons: Sequence[str] = (),
) -> Path:
    root = _safe_directory(Path(state_root), create=True)
    report = build_operational_readiness_report(
        evaluated_at=evaluated_at,
        phase0_baseline_report=load_json_read_only(phase0_baseline),
        phase0_candidate_report=_optional(phase0_candidate),
        phase3_synthetic_report=_optional(phase3_synthetic),
        projection_doctor_report=_optional(projection_doctor),
        store_doctor_report=_optional(store_doctor),
        controlled_write_observation=_optional(controlled_write),
        performance_observation=_optional(performance),
        restore_drill_observation=_optional(restore_drill),
        access_audit_observation=_optional(access_audit),
        schema_review_observation=_optional(schema_review),
        scale_comparisons=[load_json_read_only(path) for path in scale_comparisons],
    )
    path = root / "operations" / "readiness-report.json"
    _atomic_private_write(path, report)
    return path


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="memory-observability", description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    collect = sub.add_parser("collect-performance")
    collect.add_argument("--state-root", required=True)
    collect.add_argument("--evaluated-at")
    report = sub.add_parser("publish-readiness")
    report.add_argument("--state-root", required=True)
    report.add_argument("--evaluated-at", required=True)
    report.add_argument("--phase0-baseline", required=True)
    for name in (
        "phase0-candidate", "phase3-synthetic", "projection-doctor", "store-doctor",
        "controlled-write", "performance", "restore-drill", "access-audit", "schema-review",
    ):
        report.add_argument(f"--{name}")
    report.add_argument("--scale-comparison", action="append", default=[])
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        if args.command == "collect-performance":
            evaluated = _instant(args.evaluated_at) if args.evaluated_at else None
            path = publish_performance(args.state_root, evaluated_at=evaluated)
        else:
            path = publish_readiness(
                state_root=args.state_root, evaluated_at=args.evaluated_at,
                phase0_baseline=args.phase0_baseline, phase0_candidate=args.phase0_candidate,
                phase3_synthetic=args.phase3_synthetic, projection_doctor=args.projection_doctor,
                store_doctor=args.store_doctor, controlled_write=args.controlled_write,
                performance=args.performance, restore_drill=args.restore_drill,
                access_audit=args.access_audit, schema_review=args.schema_review,
                scale_comparisons=args.scale_comparison,
            )
    except (ObservabilityError, OSError, TypeError, ValueError) as exc:
        print(json.dumps({"schema": "memory-observability-result/v1", "ok": False, "code": str(exc)}, sort_keys=True))
        return 4
    print(json.dumps({"schema": "memory-observability-result/v1", "ok": True, "path": str(path)}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


__all__ = [
    "ObservabilityError", "performance_observation", "publish_performance", "publish_readiness",
]
