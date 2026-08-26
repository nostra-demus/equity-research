#!/usr/bin/env python3
"""Freeze one post-audit 3–6 month idea admission without rewriting the forecast.

The research assessment is an LLM-authored derivative. It is never an outcome cohort merely because it
exists. This gate runs after verification, pre-mortem, and expectations-gap checks and writes one
immutable per-run `idea_admission.json` that binds:

* the exact candidate bytes (canonical JSON digest),
* the standing/post-mortem decision fields,
* the deterministic market-evidence snapshot, and
* the integrity evidence available before the idea's tradable start.

Both admitted and not-admitted attempts are frozen. A late audit can therefore quarantine a prior
admission, but it cannot selectively backdate a winning forecast into the calibration cohort.
"""
from __future__ import annotations

import datetime as dt
import fcntl
import hashlib
import json
import math
import os
import re
import sys
import tempfile

from canonical_json import canonical_json, canonical_sha256
from create_idea_projection_manifest import validate_manifest_or_raise
from idea_run_root import parse_idea_run_root
from validate_screener_json import validate as validate_json_contract


REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA = "qualified-idea-admission/v1"
PUBLICATION_MARKER = ".requires_idea_publication"
CLEAN_VERDICTS = {"clean", "minor issues"}
ADMISSION_KEYS = {
    "schema_version", "admission_id", "status", "run_root", "frozen_at",
    "assessment", "assessment_sha256", "candidate", "candidate_sha256",
    "decision_authority", "decision_authority_sha256", "market_evidence_sha256",
    "market_evidence", "projection_manifest_sha256", "integrity_evidence",
    "integrity_evidence_sha256", "gaps", "admission_sha256",
}


def canonical(value):
    return canonical_json(value)


def digest(value):
    return canonical_sha256(value)


def read_json(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def timestamp(value):
    if not isinstance(value, str) or not (value.endswith("Z") or "+" in value[10:] or "-" in value[10:]):
        return None
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed if parsed.tzinfo is not None else None
    except ValueError:
        return None


def text(value):
    return value.strip() if isinstance(value, str) and value.strip() else None


def finite_score(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) and 0 <= value <= 100


def normalized_flags(record):
    raw = record.get("red_flags")
    if not isinstance(raw, list):
        return None
    out = []
    for flag in raw:
        if not isinstance(flag, dict):
            return None
        item = {"id": text(flag.get("id")), "severity": flag.get("severity"), "description": text(flag.get("description"))}
        if not item["id"] or item["severity"] not in ("Critical", "High", "Medium", "Low") or not item["description"]:
            return None
        out.append(item)
    return sorted(out, key=lambda row: (row["id"], row["severity"], row["description"]))


def normalized_scenarios(record):
    raw = record.get("scenarios")
    horizon = record.get("scenario_horizon_days")
    if (not isinstance(horizon, int) or isinstance(horizon, bool) or horizon <= 0 or
            not isinstance(raw, list) or not 3 <= len(raw) <= 7):
        return None, None
    out = []
    for row in raw:
        if not isinstance(row, dict):
            return None, None
        item = {
            "scenario_id": text(row.get("scenario_id")),
            "label": text(row.get("label")),
            "probability_pct": row.get("probability"),
            "source_price_target": row.get("price_target"),
            "conditions": row.get("conditions"),
            "source": text(row.get("source")),
            "joint_probability_basis": row.get("joint_probability_basis"),
        }
        if (not item["scenario_id"] or not item["label"] or not item["source"] or
                not isinstance(item["probability_pct"], (int, float)) or isinstance(item["probability_pct"], bool) or
                not math.isfinite(item["probability_pct"]) or item["probability_pct"] <= 0 or
                not isinstance(item["source_price_target"], (int, float)) or isinstance(item["source_price_target"], bool) or
                not math.isfinite(item["source_price_target"]) or item["source_price_target"] <= 0 or
                not isinstance(item["conditions"], list) or not item["conditions"] or
                not all(text(value) for value in item["conditions"]) or
                not (item["joint_probability_basis"] is None or text(item["joint_probability_basis"]))):
            return None, None
        item["conditions"] = [value.strip() for value in item["conditions"]]
        item["joint_probability_basis"] = text(item["joint_probability_basis"])
        out.append(item)
    if (len({row["scenario_id"] for row in out}) != len(out) or
            len({row["label"] for row in out}) != len(out) or
            abs(sum(row["probability_pct"] for row in out) - 100) > 0.05):
        return None, None
    return horizon, sorted(out, key=lambda row: row["scenario_id"])


def normalized_forecast(record, forecast_id):
    rows = record.get("forecast_ledger")
    if not text(forecast_id) or not isinstance(rows, list):
        return None
    matches = [row for row in rows if isinstance(row, dict) and row.get("forecast_id") == forecast_id]
    if len(matches) != 1:
        return None
    row = matches[0]
    required_text = (
        "forecast_id", "prediction", "window_start", "window_end", "status_as_of", "source_citation",
        "metric", "threshold", "confirmation_trigger", "falsification_trigger",
        "stock_bullish_trigger", "stock_bearish_trigger",
    )
    item = {key: text(row.get(key)) for key in required_text}
    steps = row.get("causal_steps")
    if (not all(item.values()) or not isinstance(steps, list) or len(steps) < 2 or
            not all(text(value) for value in steps) or row.get("status") != "open"):
        return None
    if not all(timestamp(item[key]) for key in ("window_start", "window_end", "status_as_of")):
        return None
    item["causal_steps"] = [value.strip() for value in steps]
    return item


def decision_authority(record, expected_root, candidate, audits):
    original = text(record.get("decision"))
    post = text(record.get("post_mortem_decision"))
    decision = post or original
    flags = normalized_flags(record)
    confidence = record.get("confidence_inputs") if isinstance(record.get("confidence_inputs"), dict) else {}
    ceiling = confidence.get("rating_cap_ceiling")
    cap_ceiling = ceiling if isinstance(ceiling, (int, float)) and not isinstance(ceiling, bool) and math.isfinite(ceiling) else None
    rating_cap = text(record.get("rating_cap"))
    textual_cap = bool(rating_cap and not rating_cap.lower().startswith(("none", "no binding", "not binding")))
    decision_cap_required = bool(
        cap_ceiling is not None
        or confidence.get("critical_governance_unresolved") is True
        or (post is not None and original is not None and post != original)
        or textual_cap
    )
    pre_mortem = audits.get("pre_mortem") if isinstance(audits, dict) else {}
    expectations = audits.get("expectations_gap") if isinstance(audits, dict) else {}
    pre_verdict = text(pre_mortem.get("verdict")) if isinstance(pre_mortem, dict) else None
    pre_survives = pre_mortem.get("survives") if isinstance(pre_mortem, dict) else None
    pre_cap = text(pre_mortem.get("recommended_rating_cap")) if isinstance(pre_mortem, dict) else None
    expectations_quality = text(expectations.get("variant_perception_quality")) if isinstance(expectations, dict) else None
    expectations_exploitable = expectations.get("is_exploitable") if isinstance(expectations, dict) else None
    expectations_edge = expectations.get("edge_score") if isinstance(expectations, dict) else None
    audit_cap_reasons = []
    if pre_survives is not True or pre_cap:
        reason = f"pre-mortem audit: {pre_verdict or 'did not survive'}"
        if pre_cap:
            reason += f" ({pre_cap})"
        audit_cap_reasons.append(reason)
    if expectations_exploitable is not True or expectations_quality not in {"Moderate", "Strong"}:
        audit_cap_reasons.append(
            "expectations-gap audit found no proven exploitable edge "
            f"(quality={expectations_quality or 'missing'}, is_exploitable={str(expectations_exploitable).lower()})"
        )
    reasons = ([rating_cap] if decision_cap_required and rating_cap else []) + audit_cap_reasons
    hard_cap_required = decision_cap_required or bool(audit_cap_reasons)
    normalized_edge = min(record.get("edge_score"), expectations_edge) if (
        finite_score(record.get("edge_score")) and finite_score(expectations_edge)
    ) else record.get("edge_score")
    catalyst = candidate.get("catalyst") if isinstance(candidate.get("catalyst"), dict) else {}
    scenario_horizon, scenarios = normalized_scenarios(record)
    selected_forecast = normalized_forecast(record, catalyst.get("forecast_id"))
    bridge = record.get("idea_valuation_bridge") if isinstance(record.get("idea_valuation_bridge"), dict) else None
    authority = {
        "run_root": text(record.get("run_root")),
        "decision_date": text(record.get("decision_date")),
        "ticker": text(record.get("ticker")),
        "company": text(record.get("company_name")),
        "exchange": text(record.get("exchange")),
        "currency": text(record.get("currency")),
        "decision": decision,
        "data_sufficiency_score": record.get("data_sufficiency_score"),
        "edge_score": normalized_edge,
        "edge_proof": text(record.get("edge_proof")),
        "hard_cap_required": hard_cap_required,
        "rating_cap_reason": "; ".join(reasons) if reasons else None,
        "red_flags": flags,
        "scenario_horizon_days": scenario_horizon,
        "scenarios": scenarios,
        "idea_valuation_bridge": bridge,
        "selected_forecast": selected_forecast,
        "post_audit": {
            "pre_mortem": {
                "verdict": pre_verdict,
                "survives": pre_survives,
                "recommended_confidence": pre_mortem.get("recommended_confidence") if isinstance(pre_mortem, dict) else None,
                "recommended_rating_cap": pre_cap,
            },
            "expectations_gap": {
                "variant_perception_quality": expectations_quality,
                "is_exploitable": expectations_exploitable,
                "edge_score": expectations_edge,
            },
        },
    }
    gaps = []
    if authority["run_root"] != expected_root:
        gaps.append("decision_record.run_root does not match this run")
    _, _, run_date = parse_idea_run_root(expected_root)
    if authority["decision_date"] != run_date or candidate.get("decision_date") != run_date:
        gaps.append("decision_record, candidate, and run-folder decision dates do not reconcile")
    if not all(authority[key] for key in ("ticker", "company", "exchange", "currency", "decision", "edge_proof")):
        gaps.append("decision_record is missing an authoritative identity, decision, or edge proof")
    if not finite_score(authority["data_sufficiency_score"]) or not finite_score(authority["edge_score"]):
        gaps.append("decision_record scores are missing or outside 0-100")
    if flags is None:
        gaps.append("decision_record.red_flags is missing or malformed")
    if decision_cap_required and not rating_cap:
        gaps.append("a binding decision-record cap has no explicit reason")
    if scenario_horizon is None or scenarios is None:
        gaps.append("decision_record scenarios lack stable ids, sources, conditions, a valid distribution, or scenario_horizon_days")
    if selected_forecast is None:
        gaps.append("candidate catalyst does not reference one open, machine-resolvable forecast_ledger row")
    if bridge is None:
        gaps.append("decision_record.idea_valuation_bridge is missing")
    return authority, gaps


def integrity_evidence(run_abs, expected_root, manifest, expected_ticker):
    thesis_path = os.path.join(run_abs, "final_thesis.md")
    gaps = []
    verdict = None
    report_sha = None
    verification_ref = (manifest.get("artifacts") or {}).get("verification") or {}
    report_path = os.path.join(run_abs, str(verification_ref.get("path") or ""))
    try:
        report_raw = open(report_path, "rb").read()
        report_sha = hashlib.sha256(report_raw).hexdigest()
        report = json.loads(report_raw)
        verdict = text(report.get("verdict"))
        if (report.get("ticker") != expected_ticker or report.get("run_root") != expected_root or
                report.get("final_thesis_path") != expected_root + "/final_thesis.md" or
                report.get("decision_record_path") != expected_root + "/decision_record.json" or
                report_sha != verification_ref.get("sha256")):
            gaps.append("the pinned verification report identity or digest does not match this run")
    except (OSError, ValueError, TypeError):
        gaps.append("the pinned verification report is unreadable")
    if not verdict or verdict.lower() not in CLEAN_VERDICTS:
        gaps.append("the run did not have a clean pre-admission verification verdict")
    thesis_sha = None
    try:
        thesis_raw = open(thesis_path, "rb").read()
        thesis_sha = hashlib.sha256(thesis_raw).hexdigest()
        thesis_ref = (manifest.get("artifacts") or {}).get("final_thesis") or {}
        if thesis_sha != thesis_ref.get("sha256"):
            gaps.append("final_thesis.md no longer matches the post-audit projection manifest")
        opening = next((line.strip() for line in thesis_raw[:4096].decode("utf-8", "replace").splitlines() if line.strip()), "")
        if opening.upper().startswith("> ⚠️ **PROVISIONAL —") or opening.upper().startswith("> **PROVISIONAL —"):
            gaps.append("the final thesis carried a PROVISIONAL integrity banner at admission")
    except OSError:
        gaps.append("final_thesis.md is missing")
    evidence = {
        "status": "verified" if not gaps else "provisional",
        "verification_verdict": verdict,
        "verification_report_sha256": report_sha,
        "final_thesis_sha256": thesis_sha,
    }
    return evidence, gaps


def exact_market_match(candidate, snapshot, manifest):
    gaps = []
    evidence = snapshot.get("evidence") if isinstance(snapshot, dict) else None
    expected_digest = snapshot.get("evidence_sha256") if isinstance(snapshot, dict) else None
    captured = timestamp(snapshot.get("captured_at")) if isinstance(snapshot, dict) else None
    created = timestamp(candidate.get("created_at"))
    manifest_created = timestamp(manifest.get("created_at")) if isinstance(manifest, dict) else None
    if snapshot.get("schema_version") != "idea-market-evidence-snapshot/v1" or not isinstance(evidence, dict):
        return ["idea_market_evidence.json is not a canonical evidence snapshot"]
    if (snapshot.get("projection_manifest_sha256") != manifest.get("manifest_sha256") or
            candidate.get("projection_manifest_sha256") != manifest.get("manifest_sha256")):
        gaps.append("candidate and market evidence do not reference the exact post-audit projection manifest")
    if not manifest_created or not captured or not created or manifest_created > captured or captured > created:
        gaps.append("timestamps must order post-audit manifest <= market capture <= candidate creation")
    actual_digest = digest(evidence)
    if expected_digest != actual_digest or candidate.get("market_evidence_sha256") != actual_digest:
        gaps.append("candidate market-evidence digest does not match the canonical snapshot")
    if evidence.get("schema_version") != "idea-market-evidence/v1" or evidence.get("available") is not True or evidence.get("gaps") != []:
        gaps.append("canonical market evidence is unavailable or carries unresolved gaps")
    instrument = candidate.get("instrument") if isinstance(candidate.get("instrument"), dict) else {}
    evidence_instrument = evidence.get("instrument") if isinstance(evidence.get("instrument"), dict) else {}
    for key in ("ticker", "exchange", "currency"):
        if instrument.get(key) != evidence_instrument.get(key):
            gaps.append(f"candidate instrument.{key} does not match canonical market evidence")
    if instrument.get("asset_type") != "equity" or evidence_instrument.get("asset_type", evidence_instrument.get("kind")) != "equity":
        gaps.append("canonical market evidence does not identify an equity")
    for key in ("quote", "liquidity", "market_risk"):
        if candidate.get(key) != evidence.get(key):
            gaps.append(f"candidate {key} does not exactly match canonical market evidence")
    return gaps


def research_match(candidate, authority):
    gaps = []
    instrument = candidate.get("instrument") if isinstance(candidate.get("instrument"), dict) else {}
    research = candidate.get("research") if isinstance(candidate.get("research"), dict) else {}
    for key in ("ticker", "company", "exchange", "currency"):
        if instrument.get(key) != authority.get(key):
            gaps.append(f"candidate instrument.{key} does not match decision_record")
    for key in ("decision", "data_sufficiency_score", "edge_score", "edge_proof"):
        if research.get(key) != authority.get(key):
            gaps.append(f"candidate research.{key} does not match the standing decision_record")
    candidate_flags = research.get("unresolved_red_flags")
    if not isinstance(candidate_flags, list):
        gaps.append("candidate unresolved red flags are missing")
    else:
        covered = {(f.get("id"), f.get("severity"), f.get("description")) for f in candidate_flags if isinstance(f, dict)}
        for flag in authority.get("red_flags") or []:
            if (flag["id"], flag["severity"], flag["description"]) not in covered:
                gaps.append(f"candidate omitted authoritative red flag {flag['id']}")
    if research.get("hard_cap_active") is not authority.get("hard_cap_required"):
        gaps.append("candidate hard-cap state does not match the post-audit decision authority")
    if research.get("hard_cap_reason") != authority.get("rating_cap_reason"):
        gaps.append("candidate hard-cap reason does not match the post-audit decision authority")

    candidate_scenarios = candidate.get("scenarios") if isinstance(candidate.get("scenarios"), list) else []
    normalized_candidate = []
    for row in candidate_scenarios:
        if not isinstance(row, dict):
            continue
        normalized_candidate.append({
            "scenario_id": row.get("scenario_id"), "label": row.get("label"),
            "probability_pct": row.get("probability_pct"), "source_price_target": row.get("source_price_target"),
            "conditions": row.get("conditions"), "source": row.get("source"),
            "joint_probability_basis": row.get("joint_probability_basis"),
        })
    normalized_candidate.sort(key=lambda row: str(row.get("scenario_id")))
    if normalized_candidate != (authority.get("scenarios") or []):
        gaps.append("candidate scenarios do not exactly match the decision-record ids, probabilities, source targets, conditions, and sources")
    bridge = candidate.get("valuation_bridge") if isinstance(candidate.get("valuation_bridge"), dict) else None
    if bridge != authority.get("idea_valuation_bridge") or (bridge and bridge.get("source_horizon_days") != authority.get("scenario_horizon_days")):
        gaps.append("candidate valuation bridge does not exactly match the decision-record bridge and source horizon")

    forecast = authority.get("selected_forecast") or {}
    catalyst = candidate.get("catalyst") if isinstance(candidate.get("catalyst"), dict) else {}
    falsifier = candidate.get("falsifier") if isinstance(candidate.get("falsifier"), dict) else {}
    expected_catalyst = {
        "forecast_id": forecast.get("forecast_id"), "name": forecast.get("prediction"),
        "window_start": forecast.get("window_start"), "window_end": forecast.get("window_end"),
        "source": forecast.get("source_citation"), "status_at_admission": "scheduled_unresolved",
        "status_as_of": forecast.get("status_as_of"), "causal_steps": forecast.get("causal_steps"),
        "bullish_trigger": forecast.get("stock_bullish_trigger"),
        "bearish_trigger": forecast.get("stock_bearish_trigger"),
    }
    if catalyst != expected_catalyst:
        gaps.append("candidate catalyst does not exactly match its selected decision-record forecast")
    expected_falsifier = {
        "condition": forecast.get("falsification_trigger"), "metric": forecast.get("metric"),
        "threshold": forecast.get("threshold"), "deadline": forecast.get("window_end"),
        "source": forecast.get("source_citation"),
    }
    if falsifier != expected_falsifier:
        gaps.append("candidate falsifier does not exactly match its selected decision-record forecast")
    return gaps


def atomic_write(path, value):
    fd, tmp = tempfile.mkstemp(prefix=".idea-admission-", suffix=".json", dir=os.path.dirname(path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(value, handle, ensure_ascii=False, indent=2, allow_nan=False)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp, path)
        tmp = None
        dfd = os.open(os.path.dirname(path), os.O_RDONLY)
        try:
            os.fsync(dfd)
        finally:
            os.close(dfd)
    finally:
        if tmp and os.path.exists(tmp):
            os.unlink(tmp)


def clear_publication_marker(run_abs):
    """Release the launcher's completion gate only after a valid immutable admission exists."""
    marker = os.path.join(run_abs, PUBLICATION_MARKER)
    try:
        os.unlink(marker)
    except FileNotFoundError:
        return
    # Windows cannot open/fsync directories. The immutable admission file was fsynced before this unlink.
    if os.name != "nt":
        dfd = os.open(run_abs, os.O_RDONLY)
        try:
            os.fsync(dfd)
        finally:
            os.close(dfd)


def existing_is_valid(value, expected_root):
    if (not isinstance(value, dict) or set(value) != ADMISSION_KEYS or
            value.get("schema_version") != SCHEMA or value.get("run_root") != expected_root):
        return False
    assessment = value.get("assessment")
    if not isinstance(assessment, dict) or value.get("assessment_sha256") != digest(assessment):
        return False
    payload = dict(value)
    recorded = payload.pop("admission_sha256", None)
    if recorded != digest(payload) or not timestamp(value.get("frozen_at")):
        return False
    state = value.get("status")
    gaps = value.get("gaps")
    if state == "not_applicable":
        frozen = timestamp(value.get("frozen_at"))
        created = timestamp(assessment.get("created_at"))
        manifest_sha = value.get("projection_manifest_sha256")
        return bool(
            assessment.get("status") == "not_assessable"
            and assessment.get("run_root") == expected_root
            and assessment.get("candidate") is None
            and frozen and created and created <= frozen
            and isinstance(manifest_sha, str) and re.fullmatch(r"[a-f0-9]{64}", manifest_sha)
            and isinstance(gaps, list)
            and len(gaps) > 0
            and gaps == assessment.get("gaps")
            and all(value.get(key) is None for key in (
                "candidate", "candidate_sha256", "decision_authority", "decision_authority_sha256",
                "integrity_evidence", "integrity_evidence_sha256", "market_evidence",
                "market_evidence_sha256",
            ))
        )
    candidate = value.get("candidate")
    authority = value.get("decision_authority")
    integrity = value.get("integrity_evidence")
    market_evidence = value.get("market_evidence")
    if not all(isinstance(item, dict) for item in (candidate, authority, integrity, market_evidence)):
        return False
    frozen = timestamp(value.get("frozen_at"))
    created = timestamp(candidate.get("created_at"))
    horizon_start = timestamp((candidate.get("horizon") or {}).get("start"))
    catalyst_start = timestamp((candidate.get("catalyst") or {}).get("window_start"))
    _, _, run_date = parse_idea_run_root(expected_root)
    return bool(
        value.get("candidate_sha256") == digest(candidate)
        and assessment.get("status") == "candidate"
        and assessment.get("run_root") == expected_root
        and assessment.get("candidate") == candidate
        and value.get("decision_authority_sha256") == digest(authority)
        and value.get("integrity_evidence_sha256") == digest(integrity)
        and value.get("market_evidence_sha256") == candidate.get("market_evidence_sha256") == digest(market_evidence)
        and value.get("projection_manifest_sha256") == candidate.get("projection_manifest_sha256")
        and candidate.get("decision_date") == authority.get("decision_date") == run_date
        and frozen and created and horizon_start and catalyst_start and created <= frozen <= horizon_start and frozen <= catalyst_start
        and ((state == "admitted" and gaps == [] and integrity.get("status") == "verified")
             or (state == "not_admitted" and isinstance(gaps, list) and len(gaps) > 0))
    )


def _freeze_locked(expected_root, run_abs, output, repo):
    if os.path.exists(output):
        existing = read_json(output)
        if not existing_is_valid(existing, expected_root):
            raise ValueError("existing idea_admission.json failed its immutable digest/state contract and will not be overwritten")
        assessment_path = os.path.join(run_abs, "idea_3_6m.json")
        schema_path = os.path.join(REPO, "frameworks", "ideas", "idea-assessment.schema.json")
        validation_errors = validate_json_contract(schema_path, assessment_path)
        if validation_errors:
            raise ValueError("sealed run's current assessment no longer passes schema validation")
        assessment = read_json(assessment_path)
        if digest(assessment) != existing.get("assessment_sha256"):
            raise ValueError("sealed run's current assessment no longer matches the frozen admission")
        manifest = read_json(os.path.join(run_abs, "idea_projection_manifest.json"))
        audits = validate_manifest_or_raise(manifest, run_abs, expected_root)
        if manifest.get("manifest_sha256") != existing.get("projection_manifest_sha256"):
            raise ValueError("sealed run's current projection manifest no longer matches the frozen admission")
        if existing.get("status") == "not_applicable":
            decision = read_json(os.path.join(run_abs, "decision_record.json"))
            created = timestamp(assessment.get("created_at"))
            manifest_created = timestamp(manifest.get("created_at"))
            frozen = timestamp(existing.get("frozen_at"))
            if (assessment.get("ticker") != decision.get("ticker") or
                    assessment.get("company") != text(decision.get("company_name")) or
                    not manifest_created or not created or not frozen or not (manifest_created <= created <= frozen)):
                raise ValueError("sealed not-applicable assessment no longer matches the manifest decision or publication order")
        else:
            candidate = assessment.get("candidate")
            decision = read_json(os.path.join(run_abs, "decision_record.json"))
            authority, authority_gaps = decision_authority(decision, expected_root, candidate, audits)
            if authority_gaps or digest(authority) != existing.get("decision_authority_sha256"):
                raise ValueError("sealed run's current decision authority no longer matches the frozen admission")
            market = read_json(os.path.join(run_abs, "idea_market_evidence.json"))
            market_gaps = exact_market_match(candidate, market, manifest)
            if market_gaps or digest(market.get("evidence")) != existing.get("market_evidence_sha256"):
                raise ValueError("sealed run's current market evidence no longer matches the frozen admission")
        clear_publication_marker(run_abs)
        print(json.dumps({
            "status": existing.get("status"),
            "path": expected_root + "/idea_admission.json",
            "idempotent": True,
        }))
        return 3 if existing.get("status") == "not_admitted" else 0

    assessment_path = os.path.join(run_abs, "idea_3_6m.json")
    schema_path = os.path.join(REPO, "frameworks", "ideas", "idea-assessment.schema.json")
    validation_errors = validate_json_contract(schema_path, assessment_path)
    if validation_errors:
        raise ValueError("final idea assessment failed schema validation: " + "; ".join(validation_errors[:5]))
    assessment = read_json(assessment_path)
    manifest = read_json(os.path.join(run_abs, "idea_projection_manifest.json"))
    audits = validate_manifest_or_raise(manifest, run_abs, expected_root)
    if assessment.get("status") != "candidate" or not isinstance(assessment.get("candidate"), dict):
        frozen_at = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
        assessment_sha = digest(assessment)
        gaps = assessment.get("gaps") if isinstance(assessment.get("gaps"), list) else ["assessment is not a candidate"]
        decision = read_json(os.path.join(run_abs, "decision_record.json"))
        created = timestamp(assessment.get("created_at"))
        manifest_created = timestamp(manifest.get("created_at"))
        frozen_time = timestamp(frozen_at)
        if (assessment.get("status") != "not_assessable" or assessment.get("candidate") is not None or
                assessment.get("run_root") != expected_root or assessment.get("ticker") != decision.get("ticker") or
                assessment.get("company") != text(decision.get("company_name")) or
                not manifest_created or not created or not frozen_time or not (manifest_created <= created <= frozen_time)):
            raise ValueError("not-assessable assessment does not reconcile to the valid sealed run and publication order")
        payload = {
            "schema_version": SCHEMA,
            "admission_id": f"{assessment.get('assessment_id', 'unknown')}|{assessment_sha[:16]}",
            "status": "not_applicable",
            "run_root": expected_root,
            "frozen_at": frozen_at,
            "assessment": assessment,
            "assessment_sha256": assessment_sha,
            "candidate": None,
            "candidate_sha256": None,
            "decision_authority": None,
            "decision_authority_sha256": None,
            "market_evidence_sha256": None,
            "market_evidence": None,
            "projection_manifest_sha256": manifest.get("manifest_sha256"),
            "integrity_evidence": None,
            "integrity_evidence_sha256": None,
            "gaps": gaps,
        }
        payload["admission_sha256"] = digest(payload)
        atomic_write(output, payload)
        clear_publication_marker(run_abs)
        print(json.dumps({
            "status": "not_applicable",
            "path": expected_root + "/idea_admission.json",
            "admission_sha256": payload["admission_sha256"],
            "gaps": gaps,
        }))
        return 0
    candidate = assessment["candidate"]
    decision = read_json(os.path.join(run_abs, "decision_record.json"))
    market = read_json(os.path.join(run_abs, "idea_market_evidence.json"))
    authority, gaps = decision_authority(decision, expected_root, candidate, audits)
    if (assessment.get("run_root") != expected_root or assessment.get("created_at") != candidate.get("created_at") or
            assessment.get("ticker") != (candidate.get("instrument") or {}).get("ticker") or
            assessment.get("company") != (candidate.get("instrument") or {}).get("company")):
        gaps.append("assessment wrapper does not exactly reconcile to its candidate and run")
    gaps.extend(research_match(candidate, authority))
    gaps.extend(exact_market_match(candidate, market, manifest))
    integrity, integrity_gaps = integrity_evidence(
        run_abs, expected_root, manifest, (candidate.get("instrument") or {}).get("ticker")
    )
    gaps.extend(integrity_gaps)

    frozen_at = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    frozen_time = timestamp(frozen_at)
    start = timestamp((candidate.get("horizon") or {}).get("start"))
    catalyst_start = timestamp((candidate.get("catalyst") or {}).get("window_start"))
    created = timestamp(candidate.get("created_at"))
    manifest_created = timestamp(manifest.get("created_at"))
    _, _, run_date_text = parse_idea_run_root(expected_root)
    try:
        run_day_start = dt.datetime.combine(dt.date.fromisoformat(run_date_text), dt.time(), tzinfo=dt.timezone.utc)
    except ValueError:
        run_day_start = None
    run_day_min = run_day_start - dt.timedelta(hours=14) if run_day_start else None
    run_day_max = run_day_start + dt.timedelta(days=1, hours=14) if run_day_start else None
    if (not frozen_time or not created or not manifest_created or not run_day_min or not run_day_max or
            not (run_day_min <= manifest_created <= created <= frozen_time <= run_day_max)):
        gaps.append("manifest, candidate, and admission times must belong to the explicit dated run in publication order")
    if not frozen_time or not start or not created or start < frozen_time or start < created:
        gaps.append("the tradable horizon start must be at or after candidate creation and final admission")
    if not catalyst_start or catalyst_start < frozen_time:
        gaps.append("the catalyst was not proven scheduled and unresolved after final admission")

    authority_sha = digest(authority)
    candidate_sha = digest(candidate)
    integrity_sha = digest(integrity)
    payload = {
        "schema_version": SCHEMA,
        "admission_id": f"{candidate.get('idea_id', 'unknown')}|{candidate_sha[:16]}",
        "status": "admitted" if not gaps else "not_admitted",
        "run_root": expected_root,
        "frozen_at": frozen_at,
        "assessment": assessment,
        "assessment_sha256": digest(assessment),
        "candidate": candidate,
        "candidate_sha256": candidate_sha,
        "decision_authority": authority,
        "decision_authority_sha256": authority_sha,
        "market_evidence_sha256": candidate.get("market_evidence_sha256"),
        "market_evidence": market.get("evidence") if isinstance(market, dict) else None,
        "projection_manifest_sha256": manifest.get("manifest_sha256"),
        "integrity_evidence": integrity,
        "integrity_evidence_sha256": integrity_sha,
        "gaps": sorted(set(gaps)),
    }
    payload["admission_sha256"] = digest(payload)
    atomic_write(output, payload)
    clear_publication_marker(run_abs)
    print(json.dumps({
        "status": payload["status"],
        "path": expected_root + "/idea_admission.json",
        "admission_sha256": payload["admission_sha256"],
        "gaps": payload["gaps"],
    }))
    return 0 if payload["status"] == "admitted" else 3


def freeze(run_root, repo=REPO):
    expected_root, _, _ = parse_idea_run_root(run_root)
    run_abs = os.path.realpath(os.path.join(repo, expected_root))
    analyses_abs = os.path.realpath(os.path.join(repo, "analyses"))
    if not run_abs.startswith(analyses_abs + os.sep) or not os.path.isdir(run_abs):
        raise ValueError("RUN_ROOT is missing or escapes analyses/")
    output = os.path.join(run_abs, "idea_admission.json")
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        return _freeze_locked(expected_root, run_abs, output, repo)
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def main(argv):
    if len(argv) != 1:
        print("usage: freeze_idea_admission.py <canonical research RUN_ROOT>", file=sys.stderr)
        return 2
    try:
        return freeze(argv[0])
    except (OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "error", "error": str(exc)}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
