#!/usr/bin/env python3
"""ledger_records.py — the single source of truth for the STANDING, corrected decision-record set.

WHY THIS EXISTS (frameworks/DECISION_LEDGER.md §4a — the append-only correction layer)
--------------------------------------------------------------------------------------
Decision records are IMMUTABLE (§4: "No hindsight edits … Never overwrite original decision
records"). But some committed records carry defects that would corrupt the calibration scoreboard
if read verbatim — a superseded/duplicated call (EMAAR 07-03 vs 07-10), decimal-fraction
probabilities that turn 60% into 0.6% in a Brier score (BG), an inconsistent downside sign. The
doctrine's only sanctioned correction path is an APPEND-ONLY sidecar (the §8 review record). This
module generalises that to record-level corrections: the frozen `decision_record.json` is never
touched; a sibling append-only `corrections.json` (schema below) records supersession + field
errata, and EVERY reader of the ledger resolves records THROUGH this module so the correction is
applied consistently — in the server (`ui/server/src/ledger-corrections.ts` mirrors this file's
rules), in `/research:track`, `/research:calibrate`, and `/research:size`.

corrections.json (schema "corrections/v1"), any subset of keys, all optional:
{
  "schema": "corrections/v1",
  "superseded_by": { "run_root": "analyses/EMAAR_2026-07-10", "reason": "...", "date": "2026-07-17" },
  "errata": [
    { "field": "forecast_ledger[].probability", "kind": "scale_fix",
      "reason": "recorded as decimal fractions; §6 requires the 0-100 scale",
      "evidence": "DECISION_LEDGER.md §6" },
    { "field": "downside_risk_pct", "kind": "sign_fix", "reason": "...", "evidence": "..." }
  ],
  "metadata_recovery": {
    "reason": "why publication metadata was missing", "evidence": "immutable runtime evidence",
    "post_review_confidence_score": 47, "confidence_haircut": 6,
    "execution_provenance": { "...": "canonical cockpit_runtime projection" },
    "runtime_evidence": { "source": "codex_task_runtime", "attempts": ["..."] }
  }
}

A `superseded_by` record is DROPPED from the standing set (it is not a live call). `errata` are
applied on read by deterministic transforms keyed on `kind` (never inferred silently — the sidecar
DECLARES the correction; this module only executes it):
  • scale_fix   — a probability field recorded in (0,1] is multiplied by 100 (decimal→percent).
  • sign_fix    — downside_risk_pct is normalised to the positive-means-loss convention.
  • shape_fix   — a legacy list shape (kill_criteria strings, module_scores bare ints, red_flags
                  bare strings) is coerced to the canonical object shape.
  • math_reconcile / note_clear — documentation-only (no numeric transform); recorded for audit.

TRUTH-INTEGRITY STATUS (each standing entry also carries `entry["integrity"]`)
--------------------------------------------------------------------------------------
`/research:verify-evidence` audits a run's citations/math/cross-module anchors and the `/research:full`
finish-gate stamps a `final_thesis.md` PROVISIONAL when that audit is missing or not Clean/Minor — but
until now nothing downstream ever READ that signal: `scripts/calibrate.py`'s hit-rate/Brier corpus and
`/research:track`'s calls-tracker dashboard both treated a PROVISIONAL (unverified, possibly-wrong)
run identically to a Clean-verified one. `resolve_integrity_status()` reads the SAME two signals the
finish-gate itself uses (the PROVISIONAL banner text, and the latest `verification_report*.json`
verdict) and returns one of three statuses, attached to every `load_standing_records()` entry as
`entry["integrity"]` so calibrate/track/size resolve it once, consistently, the same way corrections
and supersession already are:
  • "verified"    — a verification_report exists with verdict Clean/Minor issues, no PROVISIONAL banner.
  • "provisional" — the PROVISIONAL banner is present, OR a verification_report exists with any other
                     verdict (Material issues / Failed / blank-unreadable — fail-closed, mirroring the
                     finish-gate's own fail-closed rule). A caller doing skill-scoring math (Brier, hit
                     rate, cohort returns) MUST exclude these — the run itself is flagged possibly wrong.
  • "unaudited"   — neither signal is present: verify-evidence never ran on this run (most runs predate
                     the audit trio, or it was a standalone module run). This is NOT evidence of a defect
                     (CLAUDE.md §11 — an absent input is not the input's own failure) and must NOT be
                     treated the same as "provisional" by a caller.

CONTRACT (mirrors extract_pool.py / decision_surface.py):
  • Pure + importable; the CLI runs only under __main__.
  • Tolerant: a missing/malformed corrections.json is treated as "no corrections" — a correction
    can only ever be an explicit, well-formed sidecar; its absence never changes a record.
  • Deterministic: identical inputs → identical output (sorted, stable).
  • Never writes a decision record. Reads sidecars; returns normalised copies in memory only.

CLI:
  python3 scripts/ledger_records.py --standing-json [--root analyses]   # [{run_root, record}] JSON
  python3 scripts/ledger_records.py --record <run_root>                 # one normalised record JSON
  python3 scripts/ledger_records.py --selftest
"""

import copy
import datetime
import glob
import json
import os
import re
import sys

from execution_provenance import (
    PROVIDER_ROLLOUT_CUTOFF,
    ProvenanceError,
    validate_attempt,
    validate_projection,
)

CORRECTIONS_SCHEMA = "corrections/v1"
_RUN_DIR_RE = re.compile(r"_\d{4}-\d{2}-\d{2}$")


# ── sidecar IO ─────────────────────────────────────────────────────────────────────────────────

def read_corrections(run_dir):
    """The parsed, schema-checked corrections sidecar for a run dir, or {} when absent/invalid.
    Absence NEVER changes a record (fail toward the frozen original)."""
    path = os.path.join(run_dir, "corrections.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError, ValueError):
        return {}
    if not isinstance(data, dict) or data.get("schema") != CORRECTIONS_SCHEMA:
        return {}
    return data


def superseded_target(corrections):
    """The run_root this record is superseded by (a non-empty string), else None."""
    sup = corrections.get("superseded_by")
    if isinstance(sup, dict):
        rr = sup.get("run_root")
        if isinstance(rr, str) and rr.strip():
            return rr.strip()
    return None


# ── errata transforms (deterministic, keyed on `kind`) ───────────────────────────────────────────

def _walk_probability_fields(field, record):
    """Yield (container, key) pairs the field-path points at, for probability edits.
    Supports 'forecast_ledger[].probability', 'scenarios[].probability', and a bare top-level key."""
    if field == "forecast_ledger[].probability":
        for entry in record.get("forecast_ledger", []) or []:
            if isinstance(entry, dict) and "probability" in entry:
                yield entry, "probability"
    elif field == "scenarios[].probability":
        for entry in record.get("scenarios", []) or []:
            if isinstance(entry, dict) and "probability" in entry:
                yield entry, "probability"
    elif "[]" not in field and field in record:
        yield record, field


def _apply_scale_fix(record, field):
    # a probability in (0,1] was recorded as a decimal fraction; restore the 0-100 scale
    for container, key in _walk_probability_fields(field, record):
        v = container[key]
        if isinstance(v, (int, float)) and not isinstance(v, bool) and 0 < v <= 1:
            container[key] = round(v * 100, 6)


def _apply_sign_fix(record, field):
    # normalise a loss magnitude to the positive-means-loss convention
    if field in record and isinstance(record[field], (int, float)) and not isinstance(record[field], bool):
        record[field] = abs(record[field])


def _canon_kill_criterion(item):
    if isinstance(item, dict):
        return item
    return {"condition": str(item), "what_it_means": None, "monitor_via": None}


def _canon_red_flag(item):
    if isinstance(item, dict):
        return {"id": item.get("id"), "severity": item.get("severity"),
                "module": item.get("module"), "description": item.get("description") or item.get("trigger")}
    return {"id": None, "severity": None, "module": None, "description": str(item)}


def _apply_shape_fix(record, field):
    if field == "kill_criteria" and isinstance(record.get("kill_criteria"), list):
        record["kill_criteria"] = [_canon_kill_criterion(x) for x in record["kill_criteria"]]
    elif field == "red_flags" and isinstance(record.get("red_flags"), list):
        record["red_flags"] = [_canon_red_flag(x) for x in record["red_flags"]]
    elif field == "module_scores" and isinstance(record.get("module_scores"), dict):
        record["module_scores"] = {
            k: (v if isinstance(v, dict) else {"score": v, "verdict": None})
            for k, v in record["module_scores"].items()
        }


def _valid_metadata_recovery(record, corrections):
    """Validate an append-only recovery for fields omitted at publication."""
    if not isinstance(record, dict):
        return None
    value = corrections.get("metadata_recovery")
    if not isinstance(value, dict) or not all(
        isinstance(value.get(key), str) and value[key].strip() for key in ("reason", "evidence")
    ):
        return None
    post, haircut, raw = (value.get("post_review_confidence_score"),
                          value.get("confidence_haircut"), record.get("confidence_score"))
    if not all(isinstance(item, (int, float)) and not isinstance(item, bool) for item in (post, haircut, raw)) \
            or not (0 <= post <= 100 and haircut >= 0 and abs((raw - post) - haircut) <= 1e-6):
        return None
    try:
        projection = validate_projection(value.get("execution_provenance"),
                                         "metadata_recovery.execution_provenance")
        runtime = value.get("runtime_evidence")
        attempts = runtime.get("attempts") if isinstance(runtime, dict) \
            and runtime.get("source") == "codex_task_runtime" else None
        if not isinstance(attempts, list) or not attempts:
            return None
        clean_attempts = [validate_attempt(attempt, index) for index, attempt in enumerate(attempts, 1)]
        author_id = projection["decision_author"]["attempt_id"]
        if not any(row["attempt_id"] == author_id and row["attribution"] == "recorded"
                   for row in clean_attempts):
            return None
    except (KeyError, ProvenanceError):
        return None
    return value


_TRANSFORMS = {
    "scale_fix": _apply_scale_fix,
    "sign_fix": _apply_sign_fix,
    "shape_fix": _apply_shape_fix,
    "math_reconcile": None,  # documentation-only (JSON is already correct; the erratum records the prose defect)
    "note_clear": None,      # documentation-only
}


def apply_errata(record, corrections):
    """Return a NORMALISED COPY of `record` with the sidecar's errata applied, plus a provenance
    list of what was applied. The original dict is never mutated. Unknown `kind`s are ignored
    (recorded as 'unknown-kind') — a future kind must never silently corrupt an old reader."""
    out = copy.deepcopy(record)
    applied = []
    recovery = _valid_metadata_recovery(record, corrections)
    if recovery is not None and all(
        key not in out for key in ("execution_provenance", "post_review_confidence_score", "confidence_haircut")
    ):
        for key in ("execution_provenance", "post_review_confidence_score", "confidence_haircut"):
            out[key] = copy.deepcopy(recovery[key])
        applied.append({"field": "publication_metadata", "kind": "metadata_recovery", "status": "applied"})
    for erratum in corrections.get("errata", []) or []:
        if not isinstance(erratum, dict):
            continue
        kind = erratum.get("kind")
        field = erratum.get("field", "")
        fn = _TRANSFORMS.get(kind, "MISSING")
        if fn == "MISSING":
            applied.append({"field": field, "kind": kind, "status": "unknown-kind"})
            continue
        if fn is not None and isinstance(field, str):
            fn(out, field)
        applied.append({"field": field, "kind": kind, "status": "applied" if fn is not None else "recorded"})
    if applied:
        out["_corrections_applied"] = applied
    return out


# ── truth-integrity status (verify-evidence + finish-gate PROVISIONAL banner) ──────────────────────

_PROVISIONAL_MARK = "PROVISIONAL — the automated finish-gate"
_CLEAN_VERDICTS = ("Clean", "Minor issues")
_VERIFY_REPORT_RE = re.compile(r"verification_report(_v\d+)?")
_VERIFY_REPORT_VERSION_RE = re.compile(r"_v(\d+)\.json$")


def _report_version(path):
    m = _VERIFY_REPORT_VERSION_RE.search(path)
    return int(m.group(1)) if m else 1


def resolve_integrity_status(run_dir):
    """Truth-integrity status for one run — see the module docstring. Tolerant: a missing/unreadable
    final_thesis.md or verification_report never raises; each just resolves to its honest default."""
    banner = False
    try:
        # errors="replace" — the banner check only tests for an ASCII substring, so a non-UTF-8 byte
        # anywhere in the file (a mis-encoded translated filing, a stray control byte) must NOT raise.
        # UnicodeDecodeError is a ValueError, NOT an OSError, so a strict decode here would escape the
        # `except OSError` and abort load_standing_records() for the WHOLE ledger — breaking calibrate,
        # track, and size — in flat contradiction of this function's "never raises" contract.
        with open(os.path.join(run_dir, "final_thesis.md"), "r", encoding="utf-8", errors="replace") as f:
            head = f.read(2000)
        banner = _PROVISIONAL_MARK in head
    except OSError:
        pass

    verdict, score, report_file = None, None, None
    reports = sorted(
        (p for p in glob.glob(os.path.join(run_dir, "verification_report*.json"))
         if _VERIFY_REPORT_RE.fullmatch(os.path.basename(p)[:-5])),
        key=_report_version,
    )
    if reports:
        report_file = reports[-1]
        try:
            with open(report_file, "r", encoding="utf-8") as f:
                v = json.load(f)
            if isinstance(v, dict):
                verdict = v.get("verdict") or None
                score = v.get("integrity_score")
        except (OSError, json.JSONDecodeError, ValueError):
            verdict = None  # unreadable report — fail closed below, exactly like the finish-gate

    if banner:
        status = "provisional"
    elif reports:
        # Strip before comparing — full.md's own finish-gate does `(v.get("verdict") or "").strip()`
        # before testing against the same clean-verdict set (full.md ~line 697). A trailing/leading
        # space ("Minor issues ") is incidental whitespace, not a different verdict: without stripping
        # here, that run would pass the finish gate as clean (banner cleared) yet this resolver would
        # mark it provisional — the two readers of the SAME report disagreeing on the SAME run. `verdict`
        # itself is returned un-stripped (display-only field); only the classification test is normalized.
        v_norm = verdict.strip() if isinstance(verdict, str) else verdict
        status = "verified" if v_norm in _CLEAN_VERDICTS else "provisional"
    else:
        status = "unaudited"

    return {
        "status": status,
        "verdict": verdict,
        "integrity_score": score if isinstance(score, (int, float)) and not isinstance(score, bool) else None,
        "banner": banner,
        "report_file": os.path.basename(report_file) if report_file else None,
    }


# ── standing-set resolution ──────────────────────────────────────────────────────────────────────

def _load_record(run_dir):
    try:
        with open(os.path.join(run_dir, "decision_record.json"), "r", encoding="utf-8") as f:
            rec = json.load(f)
        return rec if isinstance(rec, dict) else None
    except (OSError, json.JSONDecodeError, ValueError):
        return None


def supersession_target_violations(source_run_dir, target_run_dir):
    """Fail-closed authority check shared by standing readers and the evaluator."""
    source_abs, target_abs = os.path.abspath(source_run_dir), os.path.abspath(target_run_dir)
    if os.path.dirname(source_abs) != os.path.dirname(target_abs):
        return ["supersession target is not a sibling run folder"]
    required = ("decision_record.json", "final_thesis.md", "memo.md", "audit_dossier.md")
    missing = [name for name in required if not os.path.isfile(os.path.join(target_run_dir, name))]
    if missing:
        return [f"missing terminal artifact(s): {', '.join(missing)}"]
    for name in ("final_thesis.md", "memo.md", "audit_dossier.md"):
        if os.path.getsize(os.path.join(target_run_dir, name)) <= 1024:
            return [f"incomplete terminal artifact {name!r}"]
    source = _load_record(source_run_dir)
    raw_target = _load_record(target_run_dir)
    if source is None or raw_target is None:
        return ["source or target decision_record.json is unreadable"]
    target = apply_errata(raw_target, read_corrections(target_run_dir))
    expected_thesis = os.path.abspath(os.path.join(target_run_dir, "final_thesis.md"))
    if os.path.abspath(str(target.get("run_root") or "")) != os.path.abspath(target_run_dir):
        return ["decision_record.run_root does not match the supersession target"]
    if os.path.abspath(str(target.get("final_thesis_path") or "")) != expected_thesis:
        return ["decision_record.final_thesis_path does not name the target thesis"]
    if not (isinstance(source.get("ticker"), str) and source["ticker"]
            and source["ticker"] == target.get("ticker")):
        return ["supersession target ticker does not match the source ticker"]
    try:
        source_date = datetime.date.fromisoformat(source.get("decision_date"))
        target_date = datetime.date.fromisoformat(target.get("decision_date"))
    except (TypeError, ValueError):
        return ["source or target decision_date is invalid"]
    if target_date <= source_date:
        return ["supersession target decision_date is not newer than the source"]
    rollout_date = datetime.date.fromisoformat(PROVIDER_ROLLOUT_CUTOFF[:10])
    if target_date >= rollout_date:
        try:
            validate_projection(target.get("execution_provenance"), "replacement execution_provenance")
        except ProvenanceError as error:
            return [f"replacement execution provenance is invalid: {error}"]
    return []


def load_standing_records(analyses_root="analyses"):
    """The STANDING, corrected decision-record set: one entry per committed run folder that carries
    a parseable decision record AND is NOT superseded, with errata applied. Returns a list of
    {run_root, record} sorted by run_root (stable). A superseded run is dropped entirely — it is a
    corrected-away duplicate, not a live call. This is the exact set the tracker / calibrate / size
    must iterate (replacing their raw globs), so a corrected board is consistent everywhere."""
    out = []
    for rec_path in sorted(glob.glob(os.path.join(analyses_root, "*", "decision_record.json"))):
        run_dir = os.path.dirname(rec_path)
        if not _RUN_DIR_RE.search(os.path.basename(run_dir)):
            continue  # only <TICKER>_<YYYY-MM-DD> folders
        record = _load_record(run_dir)
        if record is None:
            continue
        corrections = read_corrections(run_dir)
        target = superseded_target(corrections)
        if target and not supersession_target_violations(run_dir, target):
            continue  # superseded by a validated newer publication — not a standing call
        out.append({"run_root": run_dir.replace(os.sep, "/"), "record": apply_errata(record, corrections),
                     "integrity": resolve_integrity_status(run_dir)})
    return sorted(out, key=lambda e: e["run_root"])


def load_one(run_root):
    """The errata-normalised record for ONE run root (regardless of supersession), or None."""
    record = _load_record(run_root)
    if record is None:
        return None
    return apply_errata(record, read_corrections(run_root))


# ── selftest ─────────────────────────────────────────────────────────────────────────────────────

def selftest():
    ok = True

    def check(cond, msg):
        nonlocal ok
        if not cond:
            ok = False
            print(f"[ledger_records] SELFTEST FAIL: {msg}")

    # scale_fix: decimal probabilities restored to 0-100; already-percent left alone
    rec = {"forecast_ledger": [{"probability": 0.60}, {"probability": 0.55}, {"probability": 70}]}
    corr = {"schema": CORRECTIONS_SCHEMA, "errata": [
        {"field": "forecast_ledger[].probability", "kind": "scale_fix", "reason": "x", "evidence": "y"}]}
    got = apply_errata(rec, corr)
    check([e["probability"] for e in got["forecast_ledger"]] == [60, 55, 70], "scale_fix decimal→percent")
    check(rec["forecast_ledger"][0]["probability"] == 0.60, "original record not mutated")
    # bare top-level probability field + prototype-name kinds (TS-parity: both must behave identically)
    check(apply_errata({"probability": 0.6}, {"schema": CORRECTIONS_SCHEMA,
          "errata": [{"field": "probability", "kind": "scale_fix"}]})["probability"] == 60, "scale_fix bare field")
    for kind in ("__proto__", "hasOwnProperty", "toString", "constructor"):
        check(apply_errata({"x": 1}, {"schema": CORRECTIONS_SCHEMA, "errata": [{"field": "x", "kind": kind}]})
              ["_corrections_applied"][0]["status"] == "unknown-kind", f"prototype-name kind {kind} is unknown")

    # sign_fix: loss magnitude normalised to positive
    check(apply_errata({"downside_risk_pct": -31.1},
                       {"schema": CORRECTIONS_SCHEMA, "errata": [{"field": "downside_risk_pct", "kind": "sign_fix"}]})
          ["downside_risk_pct"] == 31.1, "sign_fix negative→positive")

    # bool is a subclass of int in Python, but the TS mirror uses `typeof v === 'number'` which excludes
    # booleans. A boolean field must therefore be left UNTOUCHED by both transforms (TS-parity, gemini finding).
    bp = apply_errata({"probability": True},
                      {"schema": CORRECTIONS_SCHEMA, "errata": [{"field": "probability", "kind": "scale_fix"}]})
    check(bp["probability"] is True, "scale_fix leaves a boolean untouched (not scaled to 100) — TS parity")
    bs = apply_errata({"downside_risk_pct": True},
                      {"schema": CORRECTIONS_SCHEMA, "errata": [{"field": "downside_risk_pct", "kind": "sign_fix"}]})
    check(bs["downside_risk_pct"] is True, "sign_fix leaves a boolean untouched (not abs→1) — TS parity")

    # shape_fix: legacy shapes coerced
    sf = apply_errata(
        {"kill_criteria": ["a plain string criterion"], "module_scores": {"earnings": 67},
         "red_flags": ["a bare flag"]},
        {"schema": CORRECTIONS_SCHEMA, "errata": [
            {"field": "kill_criteria", "kind": "shape_fix"},
            {"field": "module_scores", "kind": "shape_fix"},
            {"field": "red_flags", "kind": "shape_fix"}]})
    check(sf["kill_criteria"][0]["condition"] == "a plain string criterion", "shape_fix kill_criteria")
    check(sf["module_scores"]["earnings"] == {"score": 67, "verdict": None}, "shape_fix module_scores")
    check(sf["red_flags"][0]["description"] == "a bare flag", "shape_fix red_flags")

    # documentation-only kinds record but don't transform
    mr = apply_errata({"expected_return_pct": -4.4},
                      {"schema": CORRECTIONS_SCHEMA, "errata": [{"field": "headline", "kind": "math_reconcile"}]})
    check(mr["expected_return_pct"] == -4.4 and mr["_corrections_applied"][0]["status"] == "recorded",
          "math_reconcile records, no transform")

    # unknown kind is ignored, never crashes
    uk = apply_errata({"x": 1}, {"schema": CORRECTIONS_SCHEMA, "errata": [{"field": "x", "kind": "future_kind"}]})
    check(uk["_corrections_applied"][0]["status"] == "unknown-kind", "unknown kind recorded, not applied")

    # supersession detection + tolerant sidecar reading
    check(superseded_target({"superseded_by": {"run_root": "analyses/EMAAR_2026-07-10"}}) == "analyses/EMAAR_2026-07-10",
          "superseded_target reads target")
    check(superseded_target({}) is None, "no supersession → None")
    check(read_corrections("/nonexistent/path/xyz") == {}, "missing sidecar → {}")

    # append-only metadata recovery: validates evidence, never rewrites/overrides frozen fields
    attempt = {"schema_version": "1.0", "event": "attempt_started",
               "attempt_id": "01a05e44-5728-7c00-9710-6f570eabfd10", "provider": "codex",
               "model": "gpt-test", "reasoning_level": "max", "attribution": "recorded",
               "scope": ["synthesizer"], "decision_artifacts": ["decision_record.json"],
               "decision_artifacts_optional": False}
    projection = {"schema_version": "1.0", "source": "cockpit_runtime",
                  "coverage": "cockpit_top_level_processes", "provider_mode": "partially_observed",
                  "profile_key": "codex|gpt-test:max", "decision_author": {
                      "attempt_id": attempt["attempt_id"], "provider": "codex", "model": "gpt-test",
                      "reasoning_level": "max", "attribution": "recorded"},
                  "contributors": [{"provider": "codex", "model": "gpt-test", "reasoning_level": "max",
                                    "attribution": "recorded", "scopes": ["synthesizer"]}],
                  "cli_versions": {}}
    recovery = {"reason": "omitted", "evidence": "runtime transcript", "post_review_confidence_score": 47,
                "confidence_haircut": 6, "execution_provenance": projection,
                "runtime_evidence": {"source": "codex_task_runtime", "attempts": [attempt]}}
    frozen = {"confidence_score": 53}
    recovered = apply_errata(frozen, {"schema": CORRECTIONS_SCHEMA, "metadata_recovery": recovery})
    check(recovered["post_review_confidence_score"] == 47
          and recovered["execution_provenance"] == projection and "execution_provenance" not in frozen,
          "metadata recovery overlays a validated projection without mutating the frozen record")
    check(_valid_metadata_recovery(None, {"metadata_recovery": recovery}) is None,
          "metadata recovery rejects a non-object record without crashing")
    existing = apply_errata({**frozen, "post_review_confidence_score": 50},
                            {"schema": CORRECTIONS_SCHEMA, "metadata_recovery": recovery})
    check(existing["post_review_confidence_score"] == 50,
          "metadata recovery never overrides an existing published field")

    # wrong-schema sidecar ignored
    import tempfile
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, "corrections.json"), "w") as f:
            json.dump({"schema": "other/v9", "superseded_by": {"run_root": "x"}}, f)
        check(read_corrections(td) == {}, "wrong-schema sidecar ignored")

    # standing readers drop a source only for a complete same-ticker newer replacement
    with tempfile.TemporaryDirectory() as td:
        source_run = os.path.join(td, "TICK_2026-08-31")
        target_run = os.path.join(td, "TICK_2026-09-01")
        os.makedirs(source_run); os.makedirs(target_run)
        json.dump({"ticker": "TICK", "decision_date": "2026-08-31", "confidence_score": 52},
                  open(os.path.join(source_run, "decision_record.json"), "w"))
        json.dump({"schema": CORRECTIONS_SCHEMA, "superseded_by": {"run_root": target_run}},
                  open(os.path.join(source_run, "corrections.json"), "w"))
        json.dump({"ticker": "TICK", "decision_date": "2026-09-01", "confidence_score": 53,
                   "run_root": target_run, "final_thesis_path": os.path.join(target_run, "final_thesis.md"),
                   "execution_provenance": projection},
                  open(os.path.join(target_run, "decision_record.json"), "w"))
        for name in ("final_thesis.md", "memo.md", "audit_dossier.md"):
            open(os.path.join(target_run, name), "w").write("x" * 1025)
        standing = load_standing_records(td)
        check([row["record"]["decision_date"] for row in standing] == ["2026-09-01"],
              "complete same-ticker newer replacement retires the source")
        target_record = json.load(open(os.path.join(target_run, "decision_record.json")))
        target_record["run_root"] = os.path.relpath(target_run)
        target_record["final_thesis_path"] = os.path.relpath(os.path.join(target_run, "final_thesis.md"))
        json.dump(target_record, open(os.path.join(target_run, "decision_record.json"), "w"))
        check(not supersession_target_violations(source_run, target_run),
              "equivalent relative and absolute target paths validate consistently")
        target_record["ticker"] = "OTHER"
        json.dump(target_record, open(os.path.join(target_run, "decision_record.json"), "w"))
        standing = load_standing_records(td)
        check(len(standing) == 2, "wrong-ticker replacement fails closed and preserves the source")

    # resolve_integrity_status: no final_thesis.md, no verification_report → "unaudited", never a crash
    with tempfile.TemporaryDirectory() as td:
        r = resolve_integrity_status(td)
        check(r == {"status": "unaudited", "verdict": None, "integrity_score": None,
                     "banner": False, "report_file": None}, f"unaudited run resolves cleanly, got {r}")

    # resolve_integrity_status: Clean verification_report, no banner → "verified"
    with tempfile.TemporaryDirectory() as td:
        open(os.path.join(td, "final_thesis.md"), "w").write("# TICKER — Investment Dossier\n\nbody\n")
        json.dump({"verdict": "Clean", "integrity_score": 96},
                  open(os.path.join(td, "verification_report.json"), "w"))
        r = resolve_integrity_status(td)
        check(r["status"] == "verified" and r["integrity_score"] == 96, f"Clean report → verified, got {r}")

    # resolve_integrity_status: Material issues verdict, no banner (defensive path) → "provisional"
    with tempfile.TemporaryDirectory() as td:
        open(os.path.join(td, "final_thesis.md"), "w").write("# TICKER — Investment Dossier\n\nbody\n")
        json.dump({"verdict": "Material issues", "integrity_score": 55},
                  open(os.path.join(td, "verification_report.json"), "w"))
        r = resolve_integrity_status(td)
        check(r["status"] == "provisional", f"Material issues verdict → provisional (fail-closed), got {r}")

    # resolve_integrity_status: finish-gate PROVISIONAL banner wins even over a Clean report (banner is a
    # superset signal — 10B.1 can stamp PROVISIONAL for a math/edge break independent of verify-evidence)
    with tempfile.TemporaryDirectory() as td:
        open(os.path.join(td, "final_thesis.md"), "w").write(
            "> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was "
            "committed UNVERIFIED.**\n> scenario math broken\n\n# TICKER — Investment Dossier\n")
        json.dump({"verdict": "Clean", "integrity_score": 100},
                  open(os.path.join(td, "verification_report.json"), "w"))
        r = resolve_integrity_status(td)
        check(r["status"] == "provisional" and r["banner"] is True,
              f"PROVISIONAL banner overrides a Clean verify-evidence verdict, got {r}")

    # resolve_integrity_status: versioned reports — the LATEST version's verdict wins (_v2 over _v1, _v10 over _v2)
    with tempfile.TemporaryDirectory() as td:
        open(os.path.join(td, "final_thesis.md"), "w").write("# TICKER — Investment Dossier\n")
        json.dump({"verdict": "Material issues"}, open(os.path.join(td, "verification_report.json"), "w"))
        json.dump({"verdict": "Clean"}, open(os.path.join(td, "verification_report_v2.json"), "w"))
        r = resolve_integrity_status(td)
        check(r["status"] == "verified" and r["report_file"] == "verification_report_v2.json",
              f"latest report VERSION (not lexical order) wins, got {r}")

    # resolve_integrity_status: a verdict with incidental surrounding whitespace ("Minor issues ") must be
    # classified the SAME as the finish gate (full.md ~line 697 does `(v.get("verdict") or "").strip()`
    # before comparing) — i.e. "verified", not "provisional". Before this fix the untrimmed value failed
    # the `in _CLEAN_VERDICTS` tuple membership test and the run was wrongly marked provisional even though
    # the finish gate itself would have cleared its banner for the identical report.
    with tempfile.TemporaryDirectory() as td:
        open(os.path.join(td, "final_thesis.md"), "w").write("# TICKER — Investment Dossier\n")
        json.dump({"verdict": "Minor issues ", "integrity_score": 88},
                  open(os.path.join(td, "verification_report.json"), "w"))
        r = resolve_integrity_status(td)
        check(r["status"] == "verified",
              f"trailing-whitespace verdict ('Minor issues ') classifies as verified, matching the "
              f"finish gate's own stripped comparison, got {r}")
    with tempfile.TemporaryDirectory() as td:
        open(os.path.join(td, "final_thesis.md"), "w").write("# TICKER — Investment Dossier\n")
        json.dump({"verdict": "  Clean\n", "integrity_score": 91},
                  open(os.path.join(td, "verification_report.json"), "w"))
        r = resolve_integrity_status(td)
        check(r["status"] == "verified",
              f"leading/trailing whitespace + newline around 'Clean' still classifies as verified, got {r}")

    # load_standing_records attaches integrity per entry (live wiring, not just the unit fn)
    with tempfile.TemporaryDirectory() as td:
        run = os.path.join(td, "TICK_2026-07-30")
        os.makedirs(run)
        json.dump({"ticker": "TICK", "decision": "Buy", "decision_date": "2026-07-30"},
                  open(os.path.join(run, "decision_record.json"), "w"))
        json.dump({"verdict": "Clean", "integrity_score": 90},
                  open(os.path.join(run, "verification_report.json"), "w"))
        standing = load_standing_records(td)
        check(len(standing) == 1 and standing[0]["integrity"]["status"] == "verified",
              f"load_standing_records wires integrity onto each entry, got {standing}")

    # resolve_integrity_status: a non-UTF-8 byte in final_thesis.md must NOT raise (UnicodeDecodeError is a
    # ValueError, not an OSError — a strict decode would escape `except OSError` and abort the WHOLE ledger
    # read, breaking calibrate/track/size, contradicting the "never raises" contract). Expected value pinned
    # to this module's CONTRACT ("Tolerant: ... never raises") + the resolve_integrity_status docstring.
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, "final_thesis.md"), "wb") as f:
            f.write(b"# TICKER \xff\xfe Dossier\nbody\n")
        r = resolve_integrity_status(td)  # must not raise
        check(r["status"] == "unaudited" and r["banner"] is False,
              f"non-UTF-8 final_thesis.md resolves without raising, got {r}")

    # …and the PROVISIONAL banner is still detected even when surrounded by non-UTF-8 bytes.
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, "final_thesis.md"), "wb") as f:
            f.write(b"\xff> PROVISIONAL \xe2\x80\x94 the automated finish-gate found an integrity issue\xfe\n")
        r = resolve_integrity_status(td)
        check(r["status"] == "provisional" and r["banner"] is True,
              f"banner still detected under non-UTF-8 noise, got {r}")

    # …and load_standing_records survives a run whose final_thesis.md is non-UTF-8 (whole-ledger contract).
    with tempfile.TemporaryDirectory() as td:
        run = os.path.join(td, "TICK_2026-07-30")
        os.makedirs(run)
        json.dump({"ticker": "TICK", "decision": "Buy", "decision_date": "2026-07-30"},
                  open(os.path.join(run, "decision_record.json"), "w"))
        with open(os.path.join(run, "final_thesis.md"), "wb") as f:
            f.write(b"\xff\xfe bad bytes\n")
        standing = load_standing_records(td)  # must not raise
        check(len(standing) == 1 and standing[0]["integrity"]["status"] == "unaudited",
              f"load_standing_records tolerates non-UTF-8 final_thesis.md, got {standing}")

    print("[ledger_records] selftest", "PASS" if ok else "FAIL")
    return ok


def main(argv):
    if "--selftest" in argv:
        return 0 if selftest() else 1
    root = "analyses"
    if "--root" in argv:
        root = argv[argv.index("--root") + 1]
    if "--record" in argv:
        rr = argv[argv.index("--record") + 1]
        rec = load_one(rr)
        print(json.dumps(rec, indent=2, sort_keys=True) if rec is not None else "null")
        return 0
    if "--standing-json" in argv:
        print(json.dumps(load_standing_records(root), indent=2, sort_keys=True))
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
