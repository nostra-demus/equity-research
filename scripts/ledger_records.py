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
  ]
}

A `superseded_by` record is DROPPED from the standing set (it is not a live call). `errata` are
applied on read by deterministic transforms keyed on `kind` (never inferred silently — the sidecar
DECLARES the correction; this module only executes it):
  • scale_fix   — a probability field recorded in (0,1] is multiplied by 100 (decimal→percent).
  • sign_fix    — downside_risk_pct is normalised to the positive-means-loss convention.
  • shape_fix   — a legacy list shape (kill_criteria strings, module_scores bare ints, red_flags
                  bare strings) is coerced to the canonical object shape.
  • math_reconcile / note_clear — documentation-only (no numeric transform); recorded for audit.

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
import glob
import json
import os
import re
import sys

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


# ── standing-set resolution ──────────────────────────────────────────────────────────────────────

def _load_record(run_dir):
    try:
        with open(os.path.join(run_dir, "decision_record.json"), "r", encoding="utf-8") as f:
            rec = json.load(f)
        return rec if isinstance(rec, dict) else None
    except (OSError, json.JSONDecodeError, ValueError):
        return None


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
        if superseded_target(corrections):
            continue  # superseded — not a standing call
        out.append({"run_root": run_dir.replace(os.sep, "/"), "record": apply_errata(record, corrections)})
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

    # wrong-schema sidecar ignored
    import tempfile
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, "corrections.json"), "w") as f:
            json.dump({"schema": "other/v9", "superseded_by": {"run_root": "x"}}, f)
        check(read_corrections(td) == {}, "wrong-schema sidecar ignored")

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
