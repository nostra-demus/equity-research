#!/usr/bin/env python3
"""Deterministic analytical caps shared by commodity research agents.

The research prompts decide what evidence belongs in each input. This helper owns only
the arithmetic boundary so an opacity cap cannot vary with prose or commodity family.
The capped value is confidence in a separately stated surplus/deficit direction. It is
never a bullishness, tightness, scarcity, or availability score.
"""
from __future__ import annotations

import argparse
import json
import math
from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class SupplyOpacity:
    level: str
    score_cap: int
    primary_coverage_pct: float | None
    estimate_dispersion_pct: float | None
    release_cycles_late: float | None
    reasons: tuple[str, ...]


def _finite_number(value: object, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{field} must be numeric")
    parsed = float(value)
    if not math.isfinite(parsed):
        raise ValueError(f"{field} must be finite")
    return parsed


def assess_supply_opacity(
    primary_coverage_pct: object | None,
    estimate_dispersion_pct: object | None,
    release_cycles_late: object | None,
) -> SupplyOpacity:
    """Classify opacity and return the non-negotiable supply-demand score cap.

    Missing audit inputs are high opacity: an agent cannot claim transparency without
    measuring coverage, dispersion and timeliness. Exact boundary values are inclusive
    on the safer side: 70% coverage, 15% dispersion and two late cycles are medium.
    """
    missing = []
    values: dict[str, float | None] = {}
    for field, raw in (
        ("primary_coverage_pct", primary_coverage_pct),
        ("estimate_dispersion_pct", estimate_dispersion_pct),
        ("release_cycles_late", release_cycles_late),
    ):
        if raw is None:
            missing.append(field)
            values[field] = None
        else:
            values[field] = _finite_number(raw, field)

    coverage = values["primary_coverage_pct"]
    dispersion = values["estimate_dispersion_pct"]
    cycles_late = values["release_cycles_late"]
    if coverage is not None and not 0 <= coverage <= 100:
        raise ValueError("primary_coverage_pct must be between 0 and 100")
    if dispersion is not None and dispersion < 0:
        raise ValueError("estimate_dispersion_pct cannot be negative")
    if cycles_late is not None and cycles_late < 0:
        raise ValueError("release_cycles_late cannot be negative")

    high_reasons = [f"missing {field}" for field in missing]
    if coverage is not None and coverage < 70:
        high_reasons.append("primary coverage below 70%")
    if dispersion is not None and dispersion > 15:
        high_reasons.append("estimate dispersion above 15%")
    if cycles_late is not None and cycles_late > 2:
        high_reasons.append("source more than two release cycles late")
    if high_reasons:
        return SupplyOpacity(
            "high", 45, coverage, dispersion, cycles_late, tuple(high_reasons)
        )

    medium_reasons = []
    if coverage < 90:
        medium_reasons.append("primary coverage below 90%")
    if dispersion >= 8:
        medium_reasons.append("estimate dispersion at least 8%")
    if cycles_late >= 1:
        medium_reasons.append("at least one release cycle late")
    if medium_reasons:
        return SupplyOpacity(
            "medium", 65, coverage, dispersion, cycles_late, tuple(medium_reasons)
        )
    return SupplyOpacity("low", 100, coverage, dispersion, cycles_late, ())


def capped_supply_demand_score(raw_score: object, opacity: SupplyOpacity) -> float:
    """Cap directional conviction; the balance sign remains a separate field."""
    score = _finite_number(raw_score, "raw_score")
    if not 0 <= score <= 100:
        raise ValueError("raw_score must be between 0 and 100")
    return min(score, float(opacity.score_cap))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--primary-coverage-pct", type=float)
    parser.add_argument("--estimate-dispersion-pct", type=float)
    parser.add_argument("--release-cycles-late", type=float)
    parser.add_argument("--raw-score", type=float)
    args = parser.parse_args()
    result = assess_supply_opacity(
        args.primary_coverage_pct,
        args.estimate_dispersion_pct,
        args.release_cycles_late,
    )
    payload = asdict(result)
    payload["reasons"] = list(result.reasons)
    if args.raw_score is not None:
        payload["raw_score"] = args.raw_score
        payload["capped_score"] = capped_supply_demand_score(args.raw_score, result)
    print(json.dumps(payload, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
