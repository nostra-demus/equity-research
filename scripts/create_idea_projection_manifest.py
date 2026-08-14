#!/usr/bin/env python3
"""Create the immutable post-audit token required by the 3–6 month idea projection.

The token is first-writer-wins for one dated research run.  It proves that the final projection happened
after the canonical integrity audits and pins the exact bytes it was allowed to read.  If any pinned file
changes later, validation fails and only a new dated run may create another admission.
"""
from __future__ import annotations

import datetime as dt
import fcntl
import glob
import hashlib
import json
import os
import re
import sys
import tempfile

from canonical_json import canonical_json, canonical_sha256


REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA = "idea-projection-manifest/v1"
OUTPUT = "idea_projection_manifest.json"
PAID_COMPLETION_ROLLOUT_DATE = "2026-08-14"
VERSIONED = {
    "verification": re.compile(r"^verification_report(?:_v(\d+))?\.json$"),
    "pre_mortem": re.compile(r"^pre_mortem(?:_v(\d+))?\.json$"),
    "expectations_gap": re.compile(r"^expectations_gap(?:_v(\d+))?\.json$"),
}
AUDIT_KINDS = ("verification", "pre_mortem", "expectations_gap")
PRE_MORTEM_VERDICTS = {
    "Survives",
    "Survives with haircut",
    "Does not survive — downgrade",
    "Thesis broken",
}
VARIANT_QUALITIES = {"None", "Weak", "Moderate", "Strong"}
AUDIT_SCHEMA_KEYS = {
    "verification": {
        "schema_version", "ticker", "run_root", "verified_at", "verifier",
        "final_thesis_path", "decision_record_path", "final_thesis_sha256",
        "decision_record_sha256", "claims_checked", "claim_checks", "math_checks",
        "anchor_checks", "integrity_score", "verdict", "blocking_findings", "notes",
    },
    "pre_mortem": {
        "schema_version", "ticker", "run_root", "performed_at", "auditor",
        "final_thesis_path", "decision_record_path", "final_thesis_sha256",
        "decision_record_sha256", "original_decision", "original_confidence",
        "adversarial_direction", "pre_mortem_narrative", "bear_case",
        "bull_case_steelman", "killer_risk", "kill_criteria_attack",
        "variant_perception_attack", "value_trap_check", "base_rate_check",
        "overconfidence_flags", "disconfirming_evidence_present",
        "what_would_change_the_call", "survives", "confidence_haircut",
        "recommended_confidence", "recommended_rating_cap", "verdict", "notes",
    },
    "expectations_gap": {
        "schema_version", "ticker", "run_root", "performed_at", "analyst",
        "final_thesis_path", "decision_record_path", "final_thesis_sha256",
        "decision_record_sha256", "current_price", "price_is_indicative",
        "consensus_expectations", "market_implied_expectations", "engine_view",
        "what_everyone_knows", "what_is_priced_in", "what_market_may_be_missing",
        "evidence_engine_is_different", "base_rate_check", "variant_perception_quality",
        "gap_direction", "gap_magnitude_pct", "gap_is_robust", "edge_score",
        "is_exploitable", "notes",
    },
}


def canonical(value):
    return canonical_json(value)


def digest(value):
    return canonical_sha256(value)


def file_digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def latest_exact(run_abs, kind):
    pattern = VERSIONED[kind]
    matches = []
    for path in glob.glob(os.path.join(run_abs, "*.json")):
        match = pattern.fullmatch(os.path.basename(path))
        if match:
            matches.append((int(match.group(1) or 1), os.path.basename(path), path))
    if not matches:
        raise ValueError(f"canonical {kind} audit is missing")
    matches.sort()
    highest = matches[-1][0]
    top = [row for row in matches if row[0] == highest]
    if len(top) != 1:
        raise ValueError(f"canonical {kind} audit version {highest} is ambiguous")
    return top[0][2]


def _aware_timestamp(value):
    if not isinstance(value, str):
        return None
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo is not None else None


def _finite_score(value):
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and value == value
        and value not in (float("inf"), float("-inf"))
        and 0 <= value <= 100
    )


def _finite_nonnegative(value):
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and value == value
        and value not in (float("inf"), float("-inf"))
        and value >= 0
    )


def validate_decision_identity(decision, expected_root):
    """Bind the decision record to the ticker and calendar date encoded by its run folder."""
    run_name = os.path.basename(expected_root)
    match = re.fullmatch(r"([-A-Z0-9.]{1,24})_(\d{4}-\d{2}-\d{2})", run_name)
    if not isinstance(decision, dict) or decision.get("run_root") != expected_root or not match:
        raise ValueError("decision_record identity does not match this run")
    expected_ticker, expected_date = match.groups()
    try:
        dt.date.fromisoformat(expected_date)
    except ValueError as exc:
        raise ValueError("decision_record run date is invalid") from exc
    if decision.get("ticker") != expected_ticker or decision.get("decision_date") != expected_date:
        raise ValueError("decision_record ticker or decision_date does not match its run folder")
    return expected_ticker


def require_paid_completion_authority(expected_root, run_abs, repo):
    """Require the journaled final pass when this run entered the diagnostic protocol.

    Positively dated pre-rollout runs without either seal retain their historical validator.  At or after
    the rollout date, absence is not legacy proof: a new full run writes the diagnostic seal before any
    audit Task, so neither a crash-time promoter nor a manual manifest call can mistake a no-seal or
    diagnostic trio for the paid final trio.
    """
    diagnostic_seal = os.path.join(run_abs, "diagnostic_audit_inputs.json")
    final_seal = os.path.join(run_abs, "final_audit_inputs.json")
    match = re.fullmatch(r"analyses/[^/]+_(\d{4}-\d{2}-\d{2})", expected_root)
    if not match:
        raise ValueError("projection run root has no canonical decision date")
    run_date = match.group(1)
    if (
        run_date < PAID_COMPLETION_ROLLOUT_DATE
        and not os.path.lexists(diagnostic_seal)
        and not os.path.lexists(final_seal)
    ):
        return None
    # Lazy import avoids a module-load cycle: research_paid_completion imports this module's canonical
    # audit validator, while manifest creation calls back only after both modules are fully defined.
    from research_paid_completion import require_projection_paid_completion

    try:
        return require_projection_paid_completion(expected_root, repo)
    except ValueError as exc:
        raise ValueError(
            "projection requires the exact diagnostic checkpoint, final-audit input seal, and "
            "receipt-valid final trio; diagnostic reports alone are not final authority: " + str(exc)
        ) from exc


def validate_bound_audit(
    kind, path, expected_root, ticker, thesis_sha, decision_sha, *, require_canonical_fields=False
):
    """Validate one canonical audit against the exact terminal-pair bytes it read."""
    if kind not in AUDIT_KINDS:
        raise ValueError(f"unknown canonical audit kind {kind!r}")
    expected_thesis = expected_root + "/final_thesis.md"
    expected_decision = expected_root + "/decision_record.json"
    try:
        audit = json.load(open(path, encoding="utf-8"))
    except (OSError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise ValueError(f"{kind} audit is not readable JSON") from exc
    if not isinstance(audit, dict) or audit.get("schema_version") != "1.0":
        raise ValueError(f"{kind} audit does not use the canonical 1.0 schema")
    if require_canonical_fields and set(audit) != AUDIT_SCHEMA_KEYS[kind]:
        raise ValueError(f"{kind} audit fields do not match the canonical 1.0 schema")
    if audit.get("ticker") != ticker or audit.get("run_root") != expected_root:
        raise ValueError(f"{kind} audit identity does not match this run")
    if audit.get("final_thesis_path") != expected_thesis or audit.get("decision_record_path") != expected_decision:
        raise ValueError(f"{kind} audit does not name this run's exact thesis and decision record")
    if audit.get("final_thesis_sha256") != thesis_sha or audit.get("decision_record_sha256") != decision_sha:
        raise ValueError(f"{kind} audit was not performed on the final pinned thesis and decision bytes")

    if kind == "verification":
        verdict = audit.get("verdict")
        blocking = audit.get("blocking_findings")
        if (
            not _aware_timestamp(audit.get("verified_at"))
            or audit.get("verifier") != "verify-evidence"
            or verdict not in {"Clean", "Minor issues", "Material issues", "Failed"}
            or not _finite_score(audit.get("integrity_score"))
            or not isinstance(blocking, list)
            or (verdict in {"Clean", "Minor issues"} and len(blocking) != 0)
            or (verdict in {"Material issues", "Failed"} and len(blocking) == 0)
        ):
            raise ValueError("verification audit conclusion is malformed")
    elif kind == "pre_mortem":
        verdict = audit.get("verdict")
        survives = audit.get("survives")
        expected_survival = verdict in {"Survives", "Survives with haircut"}
        original_confidence = audit.get("original_confidence")
        confidence_haircut = audit.get("confidence_haircut")
        recommended_confidence = audit.get("recommended_confidence")
        if (
            not _aware_timestamp(audit.get("performed_at"))
            or audit.get("auditor") != "pre-mortem"
            or verdict not in PRE_MORTEM_VERDICTS
            or not isinstance(survives, bool)
            or survives is not expected_survival
            or not _finite_score(original_confidence)
            or not _finite_nonnegative(confidence_haircut)
            or not _finite_score(recommended_confidence)
            or abs(recommended_confidence - max(0, original_confidence - confidence_haircut)) > 0.05
            or not isinstance(audit.get("recommended_rating_cap"), str)
            or (not survives and not audit.get("recommended_rating_cap", "").strip())
        ):
            raise ValueError("pre_mortem audit conclusion is malformed or internally inconsistent")
    else:
        quality = audit.get("variant_perception_quality")
        exploitable = audit.get("is_exploitable")
        if (
            not _aware_timestamp(audit.get("performed_at"))
            or audit.get("analyst") != "expectations-gap"
            or quality not in VARIANT_QUALITIES
            or not isinstance(exploitable, bool)
            or not _finite_score(audit.get("edge_score"))
            or (quality in {"None", "Weak"} and exploitable)
            or (not exploitable and audit.get("edge_score") >= 50)
        ):
            raise ValueError("expectations_gap audit conclusion is malformed or internally inconsistent")
    return audit


def validate_bound_audits(paths, expected_root, ticker):
    """Read and validate the exact audit set that may authorize a projection."""
    thesis_sha = file_digest(paths["final_thesis"])
    decision_sha = file_digest(paths["decision_record"])
    return {
        name: validate_bound_audit(
            name, paths[name], expected_root, ticker, thesis_sha, decision_sha
        )
        for name in AUDIT_KINDS
    }


def validate_manifest_or_raise(value, run_abs, expected_root):
    repo = os.path.dirname(os.path.dirname(run_abs))
    require_paid_completion_authority(expected_root, run_abs, repo)
    if not isinstance(value, dict) or value.get("schema_version") != SCHEMA or value.get("run_root") != expected_root:
        raise ValueError("projection manifest identity or schema is invalid")
    payload = dict(value)
    recorded = payload.pop("manifest_sha256", None)
    if recorded != digest(payload):
        raise ValueError("projection manifest digest is invalid")
    artifacts = value.get("artifacts")
    if not isinstance(artifacts, dict) or set(artifacts) != {"final_thesis", "decision_record", "verification", "pre_mortem", "expectations_gap"}:
        raise ValueError("projection manifest artifact set is invalid")
    try:
        expected_paths = {
            "final_thesis": "final_thesis.md",
            "decision_record": "decision_record.json",
            "verification": os.path.basename(latest_exact(run_abs, "verification")),
            "pre_mortem": os.path.basename(latest_exact(run_abs, "pre_mortem")),
            "expectations_gap": os.path.basename(latest_exact(run_abs, "expectations_gap")),
        }
    except ValueError as exc:
        raise ValueError("projection manifest does not pin the latest canonical audits") from exc
    paths = {}
    for name, item in artifacts.items():
        if not isinstance(item, dict) or set(item) != {"path", "sha256"}:
            raise ValueError(f"projection manifest {name} reference is malformed")
        rel = item.get("path")
        if (not isinstance(rel, str) or os.path.basename(rel) != rel or
                not re.fullmatch(r"[A-Za-z0-9_.-]+", rel) or rel != expected_paths[name]):
            raise ValueError(f"projection manifest {name} path is invalid")
        path = os.path.join(run_abs, rel)
        if not os.path.isfile(path) or item.get("sha256") != file_digest(path):
            raise ValueError(f"projection manifest {name} bytes no longer match")
        paths[name] = path
    created = _aware_timestamp(value.get("created_at"))
    if not created:
        raise ValueError("projection manifest timestamp is invalid")
    try:
        decision = json.load(open(paths["decision_record"], encoding="utf-8"))
    except (OSError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise ValueError("projection manifest decision record is unreadable") from exc
    ticker = validate_decision_identity(decision, expected_root)
    return validate_bound_audits(paths, expected_root, ticker)


def validate_manifest(value, run_abs, expected_root):
    try:
        validate_manifest_or_raise(value, run_abs, expected_root)
        return True
    except (OSError, ValueError, TypeError, json.JSONDecodeError):
        return False


def atomic_write(path, value):
    fd, tmp = tempfile.mkstemp(prefix=".idea-projection-manifest-", suffix=".json", dir=os.path.dirname(path))
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


def create(run_root, repo=REPO):
    expected_root = run_root.replace(os.sep, "/").strip("/")
    if not re.fullmatch(r"analyses/[^/]+_\d{4}-\d{2}-\d{2}", expected_root):
        raise ValueError("RUN_ROOT must be one repo-relative analyses/<TICKER>_<YYYY-MM-DD> path")
    run_abs = os.path.realpath(os.path.join(repo, expected_root))
    analyses_abs = os.path.realpath(os.path.join(repo, "analyses"))
    if not run_abs.startswith(analyses_abs + os.sep) or not os.path.isdir(run_abs):
        raise ValueError("RUN_ROOT is missing or escapes analyses/")
    target = os.path.join(run_abs, OUTPUT)
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        if os.path.exists(target):
            existing = json.load(open(target, encoding="utf-8"))
            if not validate_manifest(existing, run_abs, expected_root):
                raise ValueError("existing idea_projection_manifest.json no longer matches its pinned artifacts")
            print(json.dumps({"status": "existing", "path": expected_root + "/" + OUTPUT, "manifest_sha256": existing["manifest_sha256"]}))
            return existing

        require_paid_completion_authority(expected_root, run_abs, repo)

        paths = {
            "final_thesis": os.path.join(run_abs, "final_thesis.md"),
            "decision_record": os.path.join(run_abs, "decision_record.json"),
            "verification": latest_exact(run_abs, "verification"),
            "pre_mortem": latest_exact(run_abs, "pre_mortem"),
            "expectations_gap": latest_exact(run_abs, "expectations_gap"),
        }
        for name, path in paths.items():
            if not os.path.isfile(path):
                raise ValueError(f"required post-audit artifact {name} is missing")
        try:
            decision = json.load(open(paths["decision_record"], encoding="utf-8"))
        except (OSError, TypeError, ValueError, json.JSONDecodeError) as exc:
            raise ValueError("decision artifact is not readable JSON") from exc
        ticker = validate_decision_identity(decision, expected_root)
        validate_bound_audits(paths, expected_root, ticker)
        payload = {
            "schema_version": SCHEMA,
            "run_root": expected_root,
            "created_at": dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z"),
            "artifacts": {
                name: {"path": os.path.basename(path), "sha256": file_digest(path)}
                for name, path in paths.items()
            },
        }
        payload["manifest_sha256"] = digest(payload)
        atomic_write(target, payload)
        print(json.dumps({"status": "created", "path": expected_root + "/" + OUTPUT, "manifest_sha256": payload["manifest_sha256"]}))
        return payload
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def main(argv):
    if len(argv) != 1:
        print("usage: create_idea_projection_manifest.py analyses/<TICKER>_<YYYY-MM-DD>", file=sys.stderr)
        return 2
    try:
        create(argv[0])
        return 0
    except (OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "error", "error": str(exc)}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
