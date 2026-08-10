#!/usr/bin/env python3
"""Point-in-time walk-forward validation gate for commodity statistical signals.

This is deliberately dependency-free. It does not discover trading signals or optimise
parameters. It audits a frozen candidate evaluation set and produces the only registry
that may promote a statistical SignalEvidence row from contextual to validated.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import math
import os
import random
import statistics
import sys
import tempfile
from pathlib import Path


MIN_OUTCOMES = 30
MIN_REGIMES = 3
FOLDS = 5
MIN_POSITIVE_FOLDS = 4
FDR_Q = 0.10
BOOTSTRAP_SAMPLES = 2000


def _parse_time(value: str) -> dt.datetime:
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(dt.timezone.utc)


def _canonical_bytes(value: object) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def _folds(rows: list[dict]) -> list[list[dict]]:
    return [rows[(len(rows) * i) // FOLDS:(len(rows) * (i + 1)) // FOLDS] for i in range(FOLDS)]


def _net_improvements(rows: list[dict]) -> list[float]:
    out = []
    for row in rows:
        realised = float(row["outcome_return_pct"])
        prediction = float(row["prediction"])
        naive = float(row.get("naive_prediction", 0.0))
        signal_cost = abs(float(row.get("signal_cost_pct", row.get("trading_cost_pct", 0.0))))
        naive_cost = abs(float(row.get("naive_cost_pct", 0.0)))
        if (not all(math.isfinite(value) for value in (realised, prediction, naive, signal_cost, naive_cost))
                or not -1 <= prediction <= 1 or not -1 <= naive <= 1):
            raise ValueError("predictions must be finite positions in [-1,1]; outcomes and costs must be finite")
        # Both alternatives pay their stated implementable cost. A signal does not get
        # credit merely because the naive baseline was compared before costs.
        out.append(prediction * realised - signal_cost - (naive * realised - naive_cost))
    return out


def _block_bootstrap(values: list[float], seed_text: str) -> tuple[float, float, float]:
    n = len(values)
    block = max(2, round(n ** (1 / 3)))
    rng = random.Random(int(hashlib.sha256(seed_text.encode()).hexdigest()[:16], 16))
    means = []
    for _ in range(BOOTSTRAP_SAMPLES):
        sample = []
        while len(sample) < n:
            start = rng.randrange(n)
            sample.extend(values[(start + j) % n] for j in range(block))
        means.append(statistics.fmean(sample[:n]))
    means.sort()
    lo = means[int(0.025 * (len(means) - 1))]
    hi = means[int(0.975 * (len(means) - 1))]
    p_one_sided = sum(value <= 0 for value in means) / len(means)
    return lo, hi, p_one_sided


def _non_overlapping(rows: list[dict]) -> bool:
    previous_end = None
    for row in rows:
        start = _parse_time(row["outcome_start"])
        end = _parse_time(row["outcome_end"])
        if end <= start or (previous_end is not None and start < previous_end):
            return False
        previous_end = end
    return True


def _point_in_time(rows: list[dict]) -> bool:
    for row in rows:
        decision = _parse_time(row["decision_time"])
        start = _parse_time(row["outcome_start"])
        retrieved = _parse_time(row["source_retrieved_at"])
        trained = _parse_time(row["trained_through"])
        if retrieved > decision or trained >= decision or decision > start or row.get("is_out_of_sample") is not True:
            return False
    return True


def _lookbacks_stable(candidate: dict) -> bool:
    variants = candidate.get("lookback_variants")
    if not isinstance(variants, list) or len(variants) < 3:
        return False
    expected = int(candidate.get("expected_sign", 1))
    days = set()
    for variant in variants:
        if not isinstance(variant, dict):
            return False
        lookback = variant.get("lookback_days")
        if isinstance(lookback, bool) or not isinstance(lookback, int) or lookback <= 0:
            return False
        days.add(lookback)
        rows = variant.get("observations")
        if not isinstance(rows, list):
            return False
        rows = sorted(rows, key=lambda row: _parse_time(row["outcome_start"]))
        if (len(rows) < MIN_OUTCOMES or not _non_overlapping(rows) or not _point_in_time(rows)
                or statistics.fmean(_net_improvements(rows)) <= 0):
            return False
        positive_folds = sum(
            bool(fold) and statistics.fmean(
                float(row["prediction"]) * float(row["outcome_return_pct"]) for row in fold
            ) * expected > 0
            for fold in _folds(rows)
        )
        if positive_folds < MIN_POSITIVE_FOLDS:
            return False
    return len(days) >= 3 and max(days) / min(days) <= 4


def evaluate_candidate(candidate: dict) -> dict:
    signal_id = str(candidate.get("signal_id", ""))
    rows = candidate.get("observations")
    if candidate.get("expected_sign") not in (-1, 1):
        raise ValueError(f"{signal_id or 'candidate'}: expected_sign must be -1 or 1")
    if not signal_id or not isinstance(rows, list):
        raise ValueError("each candidate needs signal_id and observations[]")
    rows = sorted(rows, key=lambda row: _parse_time(row["outcome_start"]))
    improvements = _net_improvements(rows) if rows else []
    positive_folds = 0
    expected = int(candidate.get("expected_sign", 1))
    for fold in _folds(rows):
        if fold and statistics.fmean(float(row["prediction"]) * float(row["outcome_return_pct"]) for row in fold) * expected > 0:
            positive_folds += 1
    if improvements:
        ci_low, ci_high, p_value = _block_bootstrap(improvements, signal_id)
        mean_improvement = statistics.fmean(improvements)
    else:
        ci_low = ci_high = mean_improvement = 0.0
        p_value = 1.0
    gates = {
        "point_in_time": bool(rows) and _point_in_time(rows),
        "three_regimes": len({str(row.get("regime", "")) for row in rows if row.get("regime")}) >= MIN_REGIMES,
        "thirty_non_overlapping_outcomes": len(rows) >= MIN_OUTCOMES and _non_overlapping(rows),
        "expected_sign_four_of_five_folds": positive_folds >= MIN_POSITIVE_FOLDS,
        "beats_cost_adjusted_naive": mean_improvement > 0,
        "positive_block_bootstrap_ci": ci_low > 0,
        "stable_lookbacks": _lookbacks_stable(candidate),
        "false_discovery_control": False,
    }
    return {
        "signal_id": signal_id,
        "status": "contextual",
        "gates": gates,
        "metrics": {
            "outcome_count": len(rows),
            "regime_count": len({str(row.get("regime", "")) for row in rows if row.get("regime")}),
            "positive_folds": positive_folds,
            "fold_count": FOLDS,
            "mean_net_improvement_pct": mean_improvement,
            "bootstrap_ci_95_pct": [ci_low, ci_high],
            "bootstrap_one_sided_p": p_value,
        },
    }


def apply_benjamini_hochberg(results: list[dict], q: float = FDR_Q) -> None:
    ranked = sorted(results, key=lambda row: (row["metrics"]["bootstrap_one_sided_p"], row["signal_id"]))
    passing_rank = 0
    total = len(ranked)
    for rank, row in enumerate(ranked, 1):
        if row["metrics"]["bootstrap_one_sided_p"] <= q * rank / max(total, 1):
            passing_rank = rank
    accepted = {row["signal_id"] for row in ranked[:passing_rank]}
    for row in results:
        row["gates"]["false_discovery_control"] = row["signal_id"] in accepted
        if all(row["gates"].values()):
            row["status"] = "validated"


def validate_document(document: dict) -> dict:
    if not isinstance(document, dict) or document.get("schema_version") != 1:
        raise ValueError("validation input must be an object with schema_version=1")
    candidates = document.get("candidates")
    if not isinstance(candidates, list):
        raise ValueError("validation input needs candidates[]")
    results = [evaluate_candidate(candidate) for candidate in candidates]
    if len({row["signal_id"] for row in results}) != len(results):
        raise ValueError("candidate signal_id values must be unique")
    apply_benjamini_hochberg(results)
    generated_at = document.get("generated_at") or dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    return {
        "schema_version": 1,
        "generated_at": generated_at,
        "input_sha256": hashlib.sha256(_canonical_bytes(document)).hexdigest(),
        "false_discovery_rate": FDR_Q,
        "requirements": {
            "minimum_regimes": MIN_REGIMES,
            "minimum_non_overlapping_outcomes": MIN_OUTCOMES,
            "positive_folds_required": MIN_POSITIVE_FOLDS,
            "fold_count": FOLDS,
            "bootstrap_samples": BOOTSTRAP_SAMPLES,
        },
        "results": sorted(results, key=lambda row: row["signal_id"]),
    }


def _atomic_write(path: Path, document: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = _canonical_bytes(document)
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
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args(argv)
    try:
        document = json.loads(args.input.read_text(encoding="utf-8"))
        result = validate_document(document)
        _atomic_write(args.output, result)
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        print(f"SIGNAL-VALIDATION-FAIL: {exc}", file=sys.stderr)
        return 1
    print(f"WROTE {args.output} ({len(result['results'])} candidate(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
