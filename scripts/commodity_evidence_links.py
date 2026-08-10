#!/usr/bin/env python3
"""Bind commodity horizon conclusions to clusters and source vintages in one evidence graph."""
from __future__ import annotations

from typing import Any


def validate_horizon_evidence_links(record: Any, graph: Any) -> list[str]:
    if not isinstance(record, dict) or not isinstance(graph, dict):
        return ["decision record and signal evidence graph must be objects"]
    errors: list[str] = []
    if graph.get("commodity") != record.get("commodity"):
        errors.append("signal evidence graph commodity does not match the decision")
    clusters = {
        cluster.get("cluster_id"): cluster for cluster in graph.get("clusters", [])
        if isinstance(cluster, dict) and isinstance(cluster.get("cluster_id"), str)
    }
    records = {
        row.get("signal_id"): row for row in graph.get("records", [])
        if isinstance(row, dict) and isinstance(row.get("signal_id"), str)
    }
    horizons = record.get("forecast_horizons")
    if not isinstance(horizons, dict):
        return errors
    for horizon_name in ("tactical", "strategic"):
        horizon = horizons.get(horizon_name)
        if not isinstance(horizon, dict) or horizon.get("status") != "assessable":
            continue
        for index, link in enumerate(horizon.get("evidence_links", [])):
            if not isinstance(link, dict):
                continue
            linked_clusters = link.get("cluster_ids") if isinstance(link.get("cluster_ids"), list) else []
            unknown = [cluster_id for cluster_id in linked_clusters if cluster_id not in clusters]
            if unknown:
                errors.append(f"forecast_horizons.{horizon_name}.evidence_links[{index}] names unknown cluster IDs {unknown!r}")
                continue
            allowed_vintages = set()
            for cluster_id in linked_clusters:
                for signal_id in clusters[cluster_id].get("signal_ids", []):
                    signal = records.get(signal_id)
                    if isinstance(signal, dict):
                        allowed_vintages.update(
                            value for value in signal.get("source_vintage_ids", [])
                            if isinstance(value, str) and value.startswith("sha256:")
                        )
            unbound = [
                vintage for vintage in link.get("source_vintage_ids", [])
                if vintage not in allowed_vintages
            ] if isinstance(link.get("source_vintage_ids"), list) else []
            if unbound:
                errors.append(
                    f"forecast_horizons.{horizon_name}.evidence_links[{index}] source vintages "
                    f"are not carried by the linked clusters: {unbound!r}"
                )
    return errors


def validate_signal_projection(record: Any, graph: Any, artifact_sha256: str) -> list[str]:
    """Bind the decision summary and abstention gate to the exact graph bytes."""
    if not isinstance(record, dict) or not isinstance(graph, dict):
        return ["decision record and signal evidence graph must be objects"]
    projection = record.get("signal_evidence")
    if not isinstance(projection, dict):
        return ["decision_record must project the run's signal_evidence summary"]
    summary = graph.get("summary") if isinstance(graph.get("summary"), dict) else {}
    coverage = graph.get("coverage") if isinstance(graph.get("coverage"), dict) else {}
    expected = {
        "path": "signal_evidence.json",
        "generated_at": graph.get("generated_at"),
        "artifact_sha256": artifact_sha256,
        "coverage_complete": coverage.get("complete"),
        "raw_signal_count": summary.get("raw_signal_count"),
        "independent_cluster_count": summary.get("independent_cluster_count"),
        "conviction_eligible_cluster_count": summary.get("conviction_eligible_cluster_count"),
        "contradiction_count": summary.get("contradiction_count"),
    }
    errors = [
        f"signal_evidence.{key} {projection.get(key)!r} != graph {value!r}"
        for key, value in expected.items() if projection.get(key) != value
    ]
    if graph.get("commodity") != record.get("commodity"):
        errors.append(f"signal graph commodity {graph.get('commodity')!r} != decision commodity {record.get('commodity')!r}")
    if coverage.get("complete") is not True and record.get("action") != "Research More":
        errors.append("incomplete SignalEvidence coverage requires action 'Research More'")
    if summary.get("conviction_eligible_cluster_count") == 0 and record.get("action") != "Research More":
        errors.append("zero conviction-eligible evidence clusters requires action 'Research More'")
    errors.extend(validate_horizon_evidence_links(record, graph))
    return errors
