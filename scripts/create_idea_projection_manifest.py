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
from idea_run_root import parse_idea_run_root


REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA = "idea-projection-manifest/v1"
OUTPUT = "idea_projection_manifest.json"
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
    _, expected_ticker, expected_date = parse_idea_run_root(expected_root)
    if not isinstance(decision, dict) or decision.get("run_root") != expected_root:
        raise ValueError("decision_record identity does not match this run")
    if decision.get("ticker") != expected_ticker or decision.get("decision_date") != expected_date:
        raise ValueError("decision_record ticker or decision_date does not match its run folder")
    return expected_ticker


def validate_bound_audits(paths, expected_root, ticker):
    """Read and validate the exact audit set that may authorize a projection."""
    thesis_sha = file_digest(paths["final_thesis"])
    decision_sha = file_digest(paths["decision_record"])
    expected_thesis = expected_root + "/final_thesis.md"
    expected_decision = expected_root + "/decision_record.json"
    audits = {}
    for name in AUDIT_KINDS:
        try:
            audit = json.load(open(paths[name], encoding="utf-8"))
        except (OSError, TypeError, ValueError, json.JSONDecodeError) as exc:
            raise ValueError(f"{name} audit is not readable JSON") from exc
        if not isinstance(audit, dict) or audit.get("schema_version") != "1.0":
            raise ValueError(f"{name} audit does not use the canonical 1.0 schema")
        if audit.get("ticker") != ticker or audit.get("run_root") != expected_root:
            raise ValueError(f"{name} audit identity does not match this run")
        if audit.get("final_thesis_path") != expected_thesis or audit.get("decision_record_path") != expected_decision:
            raise ValueError(f"{name} audit does not name this run's exact thesis and decision record")
        if audit.get("final_thesis_sha256") != thesis_sha or audit.get("decision_record_sha256") != decision_sha:
            raise ValueError(f"{name} audit was not performed on the final pinned thesis and decision bytes")
        audits[name] = audit

    verification = audits["verification"]
    verification_verdict = verification.get("verdict")
    blocking = verification.get("blocking_findings")
    if (
        not _aware_timestamp(verification.get("verified_at"))
        or verification.get("verifier") != "verify-evidence"
        or verification_verdict not in {"Clean", "Minor issues", "Material issues", "Failed"}
        or not _finite_score(verification.get("integrity_score"))
        or not isinstance(blocking, list)
        or (verification_verdict in {"Clean", "Minor issues"} and len(blocking) != 0)
        or (verification_verdict in {"Material issues", "Failed"} and len(blocking) == 0)
    ):
        raise ValueError("verification audit conclusion is malformed")

    pre_mortem = audits["pre_mortem"]
    verdict = pre_mortem.get("verdict")
    survives = pre_mortem.get("survives")
    expected_survival = verdict in {"Survives", "Survives with haircut"}
    original_confidence = pre_mortem.get("original_confidence")
    confidence_haircut = pre_mortem.get("confidence_haircut")
    recommended_confidence = pre_mortem.get("recommended_confidence")
    if (
        not _aware_timestamp(pre_mortem.get("performed_at"))
        or pre_mortem.get("auditor") != "pre-mortem"
        or verdict not in PRE_MORTEM_VERDICTS
        or not isinstance(survives, bool)
        or survives is not expected_survival
        or not _finite_score(original_confidence)
        or not _finite_nonnegative(confidence_haircut)
        or not _finite_score(recommended_confidence)
        or abs(recommended_confidence - max(0, original_confidence - confidence_haircut)) > 0.05
        or not isinstance(pre_mortem.get("recommended_rating_cap"), str)
        or (not survives and not pre_mortem.get("recommended_rating_cap", "").strip())
    ):
        raise ValueError("pre_mortem audit conclusion is malformed or internally inconsistent")

    expectations = audits["expectations_gap"]
    quality = expectations.get("variant_perception_quality")
    exploitable = expectations.get("is_exploitable")
    if (
        not _aware_timestamp(expectations.get("performed_at"))
        or expectations.get("analyst") != "expectations-gap"
        or quality not in VARIANT_QUALITIES
        or not isinstance(exploitable, bool)
        or not _finite_score(expectations.get("edge_score"))
        or (quality in {"None", "Weak"} and exploitable)
        or (not exploitable and expectations.get("edge_score") >= 50)
    ):
        raise ValueError("expectations_gap audit conclusion is malformed or internally inconsistent")
    return audits


def validate_manifest_or_raise(value, run_abs, expected_root):
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
    expected_root, _, _ = parse_idea_run_root(run_root)
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
        print("usage: create_idea_projection_manifest.py <canonical research RUN_ROOT>", file=sys.stderr)
        return 2
    try:
        create(argv[0])
        return 0
    except (OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "error", "error": str(exc)}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
