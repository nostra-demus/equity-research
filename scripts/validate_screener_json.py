#!/usr/bin/env python3
"""Dependency-free JSON Schema checker for the engine's tracked JSON contracts.

The schemas use a deliberate subset of JSON Schema: type, required, properties,
items, enum, const, numeric bounds, minItems/maxItems/uniqueItems, minLength/maxLength, pattern,
date/date-time format, strict additionalProperties, $ref, oneOf, and allOf with if/then/else. This covers
the screener, commodity, and 3–6 month idea-assessment schemas without a third-party package. The checker
covers exactly that
subset, so schema conformance can be asserted on machines without the jsonschema package
(the engine's verification step and the fixture check both call it).

Also validates the commodity swarm's decision_record.json against
frameworks/commodity/decision_record.schema.json for every committed
commodity/runs/<COMMODITY>/ (auto-discovered — no fixture list to maintain per commodity),
plus two structural cross-checks against the run's own upstream artifacts:
- `action` agrees with the dossier's own `## Routing` `Action:` line (the commodity-scoped
  twin of eval.py's I_decision_in_thesis check for the research swarm — the research swarm
  has no visibility into commodity/runs/, so this is the only place that catch is made).
- `action` respects the run's own `00_commodity-triage.md` Sufficiency Verdict, per
  MODULE_RULES.md §5 ("Research More is the honest default when a module came back
  Insufficient... never paper over a gap with false confidence") — the commodity-scoped
  twin of eval.py's Y_data_sufficiency_cap for the research swarm.

Also validates every committed commodity/runs/<COMMODITY>/reviews/*_decision_review*.json
against frameworks/commodity/decision_review.schema.json (auto-discovered, same convention),
cross-checking each review's commodity/original_decision_date/original_action against the
decision_record.json it reviews — the commodity-scoped twin of the anchor-consistency
discipline frameworks/DECISION_LEDGER.md §8 already requires of the research swarm's reviews.

Usage:
    python3 scripts/validate_screener_json.py <schema.json> <doc.json> [...more pairs]
    python3 scripts/validate_screener_json.py --fixture   # validate the committed fixture set
                                                           # + all commodity/runs/<COMMODITY>/
                                                           # + all commodity/runs/*/reviews/

Exit 0 = all valid; 1 = violations printed.
"""
from __future__ import annotations

import datetime
import glob
import json
import math
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TYPES = {
    "object": dict, "array": list, "string": str, "integer": int,
    "number": (int, float), "boolean": bool, "null": type(None),
}

# JSON Schema's date-time format follows RFC 3339: a full date, a clock time, and an explicit UTC offset.
# datetime.fromisoformat() alone is too permissive here: it accepts a bare YYYY-MM-DD as midnight and a
# timezone-less local timestamp, either of which makes freshness checks machine-dependent.
RFC3339_DATETIME_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2})$"
)


class Checker:
    def __init__(self, schema: dict):
        self.root = schema
        self.errors: list[str] = []

    def deref(self, node: dict) -> dict:
        ref = node.get("$ref")
        if not ref:
            return node
        cur = self.root
        for part in ref.lstrip("#/").split("/"):
            cur = cur[part]
        return cur

    def err(self, path: str, msg: str):
        self.errors.append(f"{path or '(root)'} — {msg}")

    def matches(self, node: dict, doc) -> bool:
        sub = Checker(self.root)
        sub.check(node, doc, "")
        return not sub.errors

    def check(self, node: dict, doc, path: str):
        node = self.deref(node)

        # Python's json parser accepts the non-standard literals NaN and +/-Infinity by default. They also
        # evade every ordinary bound comparison (NaN < minimum and NaN > maximum are both false), so reject
        # non-finite values before type or numeric-bound evaluation.
        if isinstance(doc, float) and not math.isfinite(doc):
            self.err(path, f"{doc!r} is not a finite JSON number")
            return

        if "oneOf" in node:
            matches = sum(1 for branch in node["oneOf"] if self.matches(branch, doc))
            if matches != 1:
                self.err(path, f"must match exactly one oneOf branch, matched {matches}")
                return

        t = node.get("type")
        if t is not None:
            types = t if isinstance(t, list) else [t]
            ok = any(
                (isinstance(doc, TYPES[x]) and not (x in ("integer", "number") and isinstance(doc, bool)))
                for x in types if x in TYPES
            )
            if not ok:
                self.err(path, f"expected type {t}, got {type(doc).__name__}")
                return

        if "const" in node and doc != node["const"]:
            self.err(path, f"must equal const {node['const']!r}, got {doc!r}")
        if "enum" in node and doc not in node["enum"]:
            self.err(path, f"{doc!r} not in enum {node['enum']!r}"[:200])

        if isinstance(doc, str):
            if "minLength" in node and len(doc) < node["minLength"]:
                self.err(path, f"shorter than minLength {node['minLength']}")
            if "maxLength" in node and len(doc) > node["maxLength"]:
                self.err(path, f"longer than maxLength {node['maxLength']}")
            if "pattern" in node and not re.search(node["pattern"], doc):
                self.err(path, f"{doc!r} does not match pattern {node['pattern']!r}")
            fmt = node.get("format")
            if fmt in ("date", "date-time"):
                try:
                    if fmt == "date":
                        datetime.date.fromisoformat(doc)
                    else:
                        if not RFC3339_DATETIME_RE.fullmatch(doc):
                            raise ValueError("date-time must include clock time and timezone")
                        parsed = datetime.datetime.fromisoformat(
                            re.sub(r"[Zz]$", "+00:00", doc).replace("t", "T")
                        )
                        if parsed.tzinfo is None or parsed.utcoffset() is None:
                            raise ValueError("date-time must include timezone")
                except (ValueError, TypeError):
                    self.err(path, f"{doc!r} is not a valid RFC 3339 {fmt}")

        if isinstance(doc, (int, float)) and not isinstance(doc, bool):
            if "minimum" in node and doc < node["minimum"]:
                self.err(path, f"{doc} < minimum {node['minimum']}")
            if "maximum" in node and doc > node["maximum"]:
                self.err(path, f"{doc} > maximum {node['maximum']}")
            if "exclusiveMinimum" in node and doc <= node["exclusiveMinimum"]:
                self.err(path, f"{doc} <= exclusiveMinimum {node['exclusiveMinimum']}")
            if "exclusiveMaximum" in node and doc >= node["exclusiveMaximum"]:
                self.err(path, f"{doc} >= exclusiveMaximum {node['exclusiveMaximum']}")

        if isinstance(doc, list):
            if "minItems" in node and len(doc) < node["minItems"]:
                self.err(path, f"fewer than minItems {node['minItems']}")
            if "maxItems" in node and len(doc) > node["maxItems"]:
                self.err(path, f"more than maxItems {node['maxItems']}")
            if node.get("uniqueItems") is True:
                try:
                    encoded = [json.dumps(v, sort_keys=True, separators=(",", ":"), allow_nan=False) for v in doc]
                except (TypeError, ValueError):
                    # The recursive item check reports the precise non-finite/type path; uniqueness cannot be
                    # evaluated safely until those values are valid JSON.
                    encoded = []
                if encoded and len(set(encoded)) != len(encoded):
                    self.err(path, "items must be unique")
            items = node.get("items")
            if items:
                for i, v in enumerate(doc):
                    self.check(items, v, f"{path}[{i}]")

        if isinstance(doc, dict):
            for req in node.get("required", []):
                if req not in doc:
                    self.err(path, f"missing required property {req!r}")
            props = node.get("properties", {})
            for k, v in doc.items():
                if k in props:
                    self.check(props[k], v, f"{path}.{k}" if path else k)
            ap = node.get("additionalProperties")
            if ap is False:
                extras = sorted(set(doc) - set(props))
                for key in extras:
                    self.err(f"{path}.{key}" if path else key, "additional property is not allowed")
            elif isinstance(ap, dict):
                for k, v in doc.items():
                    if k not in props:
                        self.check(ap, v, f"{path}.{k}" if path else k)

        for branch in node.get("allOf", []):
            branch = self.deref(branch)
            if "if" in branch:
                if self.matches(branch["if"], doc):
                    if "then" in branch:
                        self.check(branch["then"], doc, path)
                elif "else" in branch:
                    self.check(branch["else"], doc, path)
            else:
                self.check(branch, doc, path)


def nonfinite_errors(doc, path: str = "") -> list[str]:
    """Reject non-standard JSON numeric literals anywhere, including under schema-unconstrained keys."""
    if isinstance(doc, float):
        return [] if math.isfinite(doc) else [f"{path or '(root)'} — {doc!r} is not a finite JSON number"]
    if isinstance(doc, list):
        return [
            error
            for index, value in enumerate(doc)
            for error in nonfinite_errors(value, f"{path}[{index}]")
        ]
    if isinstance(doc, dict):
        return [
            error
            for key, value in doc.items()
            for error in nonfinite_errors(value, f"{path}.{key}" if path else key)
        ]
    return []


def validate(schema_path: str, doc_path: str) -> list[str]:
    schema = json.load(open(schema_path, encoding="utf-8"))
    doc = json.load(open(doc_path, encoding="utf-8"))
    c = Checker(schema)
    c.check(schema, doc, "")
    # Checker catches finite-number defects on every schema-traversed number. This independent walk also
    # covers values hidden under an intentionally open/untyped portion of a schema.
    return nonfinite_errors(doc) + [error for error in c.errors if "is not a finite JSON number" not in error]


FIXTURE_PAIRS = [
    ("frameworks/ideas/idea-assessment.schema.json", "frameworks/ideas/fixtures/candidate.json"),
    ("frameworks/ideas/idea-assessment.schema.json", "frameworks/ideas/fixtures/rejected-candidate.json"),
    ("frameworks/ideas/idea-assessment.schema.json", "frameworks/ideas/fixtures/not-assessable.json"),
    ("frameworks/screener/intake.schema.json", "screener/runs/SIG-20260610-a3f2c81d/intake.json"),
    ("frameworks/screener/signal_payload.schema.json", "screener/runs/SIG-20260610-a3f2c81d/signal_payload.json"),
    ("frameworks/screener/thesis_record.schema.json", "screener/runs/SIG-20260610-a3f2c81d/thesis_record.json"),
    ("frameworks/screener/candidates.schema.json", "screener/runs/SIG-20260610-a3f2c81d/candidates.json"),
    ("frameworks/screener/board_index.schema.json", "screener/board/index.json"),
]

THESIS_INTEGRITY_SCHEMA = "frameworks/screener/thesis_integrity_review.schema.json"


def screener_integrity_reviews() -> list[str]:
    """Every committed screener/runs/<SIG>/thesis_integrity_review*.json (repo-relative) — the base file AND
    every append-only _vN re-review the module writes on a rerun. Globbed like commodity_decision_reviews so a
    malformed or anchor-inconsistent versioned review cannot land un-checked; a single hardcoded fixture row
    only ever saw the base file."""
    return sorted(
        os.path.relpath(p, REPO)
        for p in glob.glob(os.path.join(REPO, "screener", "runs", "*", "thesis_integrity_review*.json"))
    )


def check_thesis_integrity_anchors(doc_path: str) -> list[str]:
    """Cross-check a thesis_integrity_review.json against the thesis_record.json it reviews — the
    screener-scoped twin of check_commodity_review_anchors: thesis_id/signal_id must match, and the
    restated original_routing_outcome/original_final_score must match the LOCKED M0_6_6 block (this
    module never edits thesis_record.json, so a mismatch here is a transcription bug, not a real
    disagreement)."""
    run_dir = os.path.dirname(doc_path)
    thesis_path = os.path.join(run_dir, "thesis_record.json")
    if not os.path.exists(thesis_path):
        return [f"no thesis_record.json alongside {os.path.relpath(doc_path, REPO)} to cross-check against"]
    try:
        review = json.load(open(doc_path, encoding="utf-8"))
        thesis = json.load(open(thesis_path, encoding="utf-8"))
    except Exception as e:
        return [f"could not parse for cross-check: {e}"]
    # A valid-JSON document with the wrong root type (e.g. `[]`) must be reported as a FAIL, not crash
    # the whole --fixture/CI run with an AttributeError on `.get()`. Mirrors check_commodity_review_anchors.
    if not isinstance(review, dict) or not isinstance(thesis, dict):
        return ["thesis_integrity_review / thesis_record is not a JSON object"]
    errs = []
    meta = thesis.get("meta", {})
    if review.get("thesis_id") != meta.get("thesis_id"):
        errs.append(f"review thesis_id {review.get('thesis_id')!r} != thesis_record meta.thesis_id {meta.get('thesis_id')!r}")
    if review.get("signal_id") != meta.get("signal_id"):
        errs.append(f"review signal_id {review.get('signal_id')!r} != thesis_record meta.signal_id {meta.get('signal_id')!r}")
    m066 = thesis.get("M0_6_6", {})
    if review.get("original_routing_outcome") != m066.get("routing_outcome"):
        errs.append(f"review original_routing_outcome {review.get('original_routing_outcome')!r} != thesis_record M0_6_6.routing_outcome {m066.get('routing_outcome')!r}")
    if review.get("original_final_score") != m066.get("final_score"):
        errs.append(f"review original_final_score {review.get('original_final_score')!r} != thesis_record M0_6_6.final_score {m066.get('final_score')!r}")
    verdict = review.get("verdict")
    routing = review.get("routing")
    expected = {"Survives": "Proceed", "Survives with haircut": "Proceed",
                "Does not survive — downgrade": "watchlist_integrity_downgrade",
                "Thesis broken": "watchlist_integrity_broken"}.get(verdict)
    if expected and routing != expected:
        errs.append(f"verdict {verdict!r} requires routing {expected!r} per MODULE_RULES.md's binding table, got {routing!r}")
    # Binding finding→verdict invariant (MODULE_RULES.md: a fireproof kill switch — is_fireproof:true = the
    # M0_5 threshold could never fire before the M0_4 horizon, functionally unfalsifiable — is the module's
    # single most important hard failure and forces verdict "Thesis broken"). Enforce it independently of the
    # verdict→routing pair above: an internally inconsistent output (is_fireproof:true + verdict "Survives" +
    # routing "Proceed") satisfies the pair-check yet must NOT clear the gate to candidate-surfacing.
    if (review.get("falsification_attack") or {}).get("is_fireproof") is True and verdict != "Thesis broken":
        errs.append(
            f"falsification_attack.is_fireproof is true but verdict is {verdict!r}; MODULE_RULES.md's binding "
            f"table requires verdict 'Thesis broken' (routing 'watchlist_integrity_broken') for a fireproof kill switch"
        )
    # The SAME binding table gives a SECOND independent trigger for "Thesis broken": "or the load-bearing
    # claim fails the citation spot-check." citation_spot_check by construction holds only the 3-5 MOST
    # load-bearing numeric claims (MODULE_RULES.md "Attack discipline > Citation spot-check"), so any item
    # marked miscited/unsupported IS a load-bearing claim that failed — forcing verdict "Thesis broken"
    # (routing "watchlist_integrity_broken"). Enforced independently of the verdict→routing pair above: a
    # "Survives"/"Proceed" (or a mere "…downgrade") output with a failed citation satisfies the pair-check
    # yet must NOT clear the gate to candidate-surfacing. `unverified`/`inference-labeled` are disclosed-but-
    # -uncertain, not failed (the fixture carries both under "Survives with haircut"), so they never trip this.
    spot = review.get("citation_spot_check")
    failed = [c for c in spot if isinstance(c, dict) and c.get("status") in ("miscited", "unsupported")] \
        if isinstance(spot, list) else []
    if failed and verdict != "Thesis broken":
        claims = "; ".join(str(c.get("claim")) for c in failed)
        errs.append(
            f"citation_spot_check has {len(failed)} load-bearing claim(s) with status miscited/unsupported "
            f"({claims}) but verdict is {verdict!r}; MODULE_RULES.md's binding table requires verdict "
            f"'Thesis broken' (routing 'watchlist_integrity_broken') when a load-bearing claim fails the "
            f"citation spot-check"
        )
    return errs

COMMODITY_SCHEMA = "frameworks/commodity/decision_record.schema.json"
COMMODITY_REVIEW_SCHEMA = "frameworks/commodity/decision_review.schema.json"
REVIEW_WINDOW_DAYS = {"30d": 30, "90d": 90, "180d": 180, "365d": 365}
COMMODITY_DOSSIER = "commodity-thesis/99_commodity-thesis-synthesis.md"
COMMODITY_TRIAGE = "market-structure/00_commodity-triage.md"
ROUTING_ACTION_RE = re.compile(r"##\s*Routing[\s\S]*?^Action:\s*(.+)$", re.MULTILINE)
TRIAGE_VERDICT_RE = re.compile(r"\*\*Verdict:\*\*\s*(Sufficient|Partial|Insufficient)\b")
# Rollout date for the commodity-scoped twin of eval.py check AG (frameworks/DECISION_LEDGER.md §18,
# scripts/commodity_calibrate.py). Forward-looking, mirroring AG_DATE/AI_DATE/AK_DATE's own convention
# (scripts/eval.py, scripts/headline_checks.py): every commodity decision_record.json dated on/after
# this date must carry a well-formed calibration_feedback object; the four runs committed before this
# date (ALUMINIUM/COPPER/GOLD/WHEAT, all dated 2026-07-02..07-18) genuinely predate the gate and are N/A.
COMMODITY_CALIBRATION_GATE_DATE = "2026-07-21"
CALIBRATION_STATUSES = {"not_available", "pre_data", "checked_no_action", "applied"}


def commodity_decision_records() -> list[str]:
    """Every committed commodity/runs/<COMMODITY>/decision_record.json (repo-relative)."""
    return sorted(
        os.path.relpath(p, REPO)
        for p in glob.glob(os.path.join(REPO, "commodity", "runs", "*", "decision_record.json"))
    )


def commodity_decision_reviews() -> list[str]:
    """Every committed commodity/runs/<COMMODITY>/reviews/*_decision_review*.json (repo-relative)."""
    return sorted(
        os.path.relpath(p, REPO)
        for p in glob.glob(os.path.join(REPO, "commodity", "runs", "*", "reviews", "*_decision_review*.json"))
    )


def check_commodity_review_anchors(doc_path: str) -> list[str]:
    """A review must not silently drift from the decision_record.json it reviews — the
    commodity-scoped twin of the anchor discipline frameworks/DECISION_LEDGER.md §8 already
    requires: the review's own commodity/original_decision_date/original_action must match
    the frozen record's commodity/decision_date/action exactly (the record is never edited,
    so any mismatch means the review was built against a different or since-corrected run).

    It also enforces the anchor/outcome integrity the learning loop depends on: original_confidence
    and reference_price must equal the frozen record's confidence and current_price (never
    re-derived); one risk_result per original key_risk, each copying its key_risk verbatim (not
    duplicated/fabricated); absolute_return_pct must equal the recomputed price return; both dates
    must be real calendar dates; the filename window token must match the review_window field; and
    a scheduled window must genuinely be that far out. Malformed inputs (a non-object JSON, a null
    date) report a graceful error instead of crashing."""
    reviews_dir = os.path.dirname(doc_path)
    run_dir = os.path.dirname(reviews_dir)
    record_path = os.path.join(run_dir, "decision_record.json")
    doc = json.load(open(doc_path, encoding="utf-8"))
    if not isinstance(doc, dict):
        return ["review document is not a JSON object"]
    if not os.path.exists(record_path):
        return [f"decision_record.json not found at {os.path.relpath(record_path, REPO)} — cannot cross-check anchors"]
    record = json.load(open(record_path, encoding="utf-8"))
    if not isinstance(record, dict):
        return [f"decision_record.json at {os.path.relpath(record_path, REPO)} is not a JSON object — cannot cross-check anchors"]
    errs = []
    if doc.get("commodity") != record.get("commodity"):
        errs.append(f"review commodity {doc.get('commodity')!r} != decision_record commodity {record.get('commodity')!r}")
    if doc.get("original_decision_date") != record.get("decision_date"):
        errs.append(f"review original_decision_date {doc.get('original_decision_date')!r} != decision_record decision_date {record.get('decision_date')!r}")
    if doc.get("original_action") != record.get("action"):
        errs.append(f"review original_action {doc.get('original_action')!r} != decision_record action {record.get('action')!r}")
    # original_confidence is copied verbatim from the frozen record's own confidence (required,
    # always-numeric there) — a silently-drifted copy would corrupt calibration's read on whether
    # high-confidence calls were actually calibrated. Number-only guard: the schema's own type check
    # already rejects a non-number, so this only fires on a genuine value mismatch.
    oc = doc.get("original_confidence")
    rc = record.get("confidence")
    if isinstance(oc, (int, float)) and not isinstance(oc, bool) \
            and isinstance(rc, (int, float)) and not isinstance(rc, bool) and oc != rc:
        errs.append(f"original_confidence {oc!r} != decision_record confidence {rc!r} (copied verbatim, never re-derived)")
    # review_date cannot predate the decision (None-safe: schema catches wrong/absent types)
    review_date = doc.get("review_date")
    original_date = doc.get("original_decision_date")
    if isinstance(review_date, str) and isinstance(original_date, str) and review_date < original_date:
        errs.append(f"review_date {review_date!r} predates original_decision_date {original_date!r}")
    # both dates must be REAL calendar dates, not just the schema's YYYY-MM-DD shape — "2026-99-99"
    # matches the regex but is a date the due/window/calibration math cannot use (§5: dates are real)
    for fld in ("review_date", "original_decision_date"):
        v = doc.get(fld)
        if isinstance(v, str):
            try:
                datetime.date.fromisoformat(v)
            except ValueError:
                errs.append(f"{fld} {v!r} is not a real calendar date (YYYY-MM-DD)")
    # reference_price is copied verbatim from the frozen current_price, never re-derived — a
    # fat-fingered anchor would corrupt every window's return, so cross-check it against the record
    ref = doc.get("reference_price")
    cur = record.get("current_price")
    if isinstance(ref, dict) and isinstance(cur, dict):
        for k in ("value", "currency", "unit", "as_of"):
            if k in cur and ref.get(k) != cur.get(k):
                errs.append(
                    f"reference_price.{k} {ref.get(k)!r} != decision_record current_price.{k} {cur.get(k)!r} "
                    f"(the anchor is copied verbatim from the frozen record, never re-derived)"
                )
    # absolute_return_pct is the field the calibration layer aggregates — it must equal the
    # recomputed (review_price − reference_price) / reference_price × 100 (review.md Step 5's exact
    # formula), never a hand-typed number, or a mis-keyed return silently corrupts the loop (§20 bad-math)
    rvp = doc.get("review_price")
    stored_ret = doc.get("absolute_return_pct")
    if isinstance(ref, dict) and isinstance(rvp, dict) and isinstance(stored_ret, (int, float)) \
            and not isinstance(stored_ret, bool):
        rvv, rfv = rvp.get("value"), ref.get("value")
        if isinstance(rvv, (int, float)) and not isinstance(rvv, bool) \
                and isinstance(rfv, (int, float)) and not isinstance(rfv, bool) and rfv != 0:
            computed = (rvv - rfv) / rfv * 100
            if abs(stored_ret - computed) > 0.05:
                errs.append(
                    f"absolute_return_pct {stored_ret} != recomputed {computed:.4f} from "
                    f"(review_price {rvv} − reference_price {rfv}) / {rfv} × 100 (§20 bad-math)"
                )
    # one risk_result per original key_risk — an empty array would skip the falsification checks
    # the review exists to run (each key_risk must be resolved materialized/not/partial/pending)
    rr = doc.get("risk_results")
    kr = record.get("key_risks")
    if isinstance(rr, list) and isinstance(kr, list):
        if len(rr) != len(kr):
            errs.append(
                f"risk_results has {len(rr)} entr{'y' if len(rr) == 1 else 'ies'} but decision_record key_risks "
                f"has {len(kr)} — the schema requires exactly one risk_result per key_risk"
            )
        else:
            # length alone lets duplicated/fabricated rows pass — each risk_result.risk must copy its
            # key_risk verbatim (schema: "one entry per key_risks[] item"), so the review actually tests
            # the risks that were meant to falsify the call, not re-labelled or duplicated placeholders
            # str-only (a missing/non-str risk is the schema's job to flag — never crash sorted() here)
            got = sorted(r.get("risk") for r in rr if isinstance(r, dict) and isinstance(r.get("risk"), str))
            want = sorted(k for k in kr if isinstance(k, str))
            if got != want:
                missing = [k for k in want if k not in got]
                extra = [g for g in got if g not in want]
                def _clip(xs):
                    return ", ".join(repr((x or "")[:60]) for x in xs[:2]) + ("…" if len(xs) > 2 else "")
                errs.append(
                    "risk_results risks do not match decision_record key_risks 1:1 "
                    f"(uncovered key_risks: [{_clip(missing)}]; fabricated/duplicated risk_results: [{_clip(extra)}]) — "
                    "each risk_result.risk must copy its key_risk verbatim"
                )
    # a scheduled window (30d/90d/180d/365d) must genuinely be that far out; an early file would
    # otherwise mark the real checkpoint as already reviewed — an early honest check-in is 'ad-hoc'
    window = doc.get("review_window")
    if isinstance(window, str) and window in REVIEW_WINDOW_DAYS \
            and isinstance(review_date, str) and isinstance(original_date, str):
        try:
            elapsed = (datetime.date.fromisoformat(review_date) - datetime.date.fromisoformat(original_date)).days
        except ValueError:
            elapsed = None
        if elapsed is not None and elapsed < REVIEW_WINDOW_DAYS[window]:
            errs.append(
                f"review_window {window!r} but only {elapsed}d elapsed since original_decision_date — "
                f"a scheduled window must be at least {REVIEW_WINDOW_DAYS[window]}d out; "
                f"record an early check as review_window 'ad-hoc'"
            )
    # the filename window token must match the review_window field. The due-scanner (review.md Step 3)
    # keys "already reviewed" on the FILENAME window, so a file named *_365d_* whose review_window is
    # 'ad-hoc' (or any other) would make it mask the real 365d checkpoint — the two must agree.
    base = os.path.basename(doc_path)
    fname_m = re.match(r"^\d{4}-\d{2}-\d{2}_(30d|90d|180d|365d|ad-hoc)_decision_review(?:_v\d+)?\.json$", base)
    if fname_m is None:
        errs.append(
            f"review filename {base!r} does not match <YYYY-MM-DD>_<window>_decision_review[_vN].json "
            f"— the due-scanner keys on this name"
        )
    elif isinstance(window, str) and fname_m.group(1) != window:
        errs.append(
            f"filename window {fname_m.group(1)!r} != review_window field {window!r} — they must match "
            f"so the due-scanner can't mistake this file for a different checkpoint"
        )
    return errs


def check_commodity_routing(doc_path: str) -> list[str]:
    """The commodity twin of eval.py's I_decision_in_thesis: decision_record.json's `action`
    must agree with the dossier's own `## Routing` / `Action:` line — a mismatch means the
    machine record and the human-readable verdict silently disagree."""
    run_dir = os.path.dirname(doc_path)
    dossier_path = os.path.join(run_dir, COMMODITY_DOSSIER)
    doc = json.load(open(doc_path, encoding="utf-8"))
    action = doc.get("action")
    if not os.path.exists(dossier_path):
        return [f"dossier not found at {os.path.relpath(dossier_path, REPO)} — cannot cross-check Routing"]
    dossier = open(dossier_path, encoding="utf-8").read()
    m = ROUTING_ACTION_RE.search(dossier)
    if not m:
        return ["dossier has no '## Routing' / 'Action:' block to cross-check"]
    routed_action = m.group(1).strip()
    if routed_action != action:
        return [f"decision_record action {action!r} != dossier Routing Action {routed_action!r}"]
    return []


def check_commodity_data_sufficiency(doc_path: str) -> list[str]:
    """MODULE_RULES.md §5, mechanically enforced: an `Insufficient` triage verdict must land
    on action `Research More`, and a `Partial` verdict (one lens's primary source unreachable)
    must not be strong enough to justify `Buy` — the commodity-scoped twin of eval.py's
    Y_data_sufficiency_cap (CLAUDE.md §11: do not let false confidence paper over a data gap)."""
    run_dir = os.path.dirname(doc_path)
    triage_path = os.path.join(run_dir, COMMODITY_TRIAGE)
    doc = json.load(open(doc_path, encoding="utf-8"))
    action = doc.get("action")
    if not os.path.exists(triage_path):
        return [f"triage not found at {os.path.relpath(triage_path, REPO)} — cannot cross-check data sufficiency"]
    triage = open(triage_path, encoding="utf-8").read()
    m = TRIAGE_VERDICT_RE.search(triage)
    if not m:
        return ["triage has no '**Verdict:** Sufficient/Partial/Insufficient' line to cross-check"]
    verdict = m.group(1)
    if verdict == "Insufficient" and action != "Research More":
        return [f"triage verdict 'Insufficient' but decision_record action={action!r} != 'Research More' (MODULE_RULES.md §5)"]
    if verdict == "Partial" and action == "Buy":
        return ["triage verdict 'Partial' (a lens's primary source unreachable) cannot support "
                 "action='Buy' (MODULE_RULES.md §5 / CLAUDE.md §11 — no forced conviction on incomplete data)"]
    return []


def _commodity_calib_summary_asof(decision_date: str):
    """Latest commodity/performance/<DATE>_calibration_summary.json dated on/before decision_date
    (a synthesis run can only act on calibration history that existed when it ran), or None if none
    qualifies. Ties broken by filename so a `_v2` correction wins — mirrors scripts/eval.py's own
    _calib_summary_asof exactly, pointed at the commodity swarm's performance directory."""
    if not isinstance(decision_date, str):
        return None
    try:
        datetime.date.fromisoformat(decision_date)
    except ValueError:
        return None
    best, best_date = None, None
    for p in sorted(glob.glob(os.path.join(REPO, "commodity", "performance", "*_calibration_summary.json"))):
        m = re.match(r"(\d{4}-\d{2}-\d{2})_calibration_summary", os.path.basename(p))
        if not m:
            continue
        fdate = m.group(1)
        if fdate > decision_date:
            continue
        if best_date is None or fdate > best_date or (fdate == best_date and os.path.basename(p) > os.path.basename(best)):
            best, best_date = p, fdate
    if best is None:
        return None
    try:
        return json.load(open(best, encoding="utf-8"))
    except Exception:
        return None


def check_commodity_calibration_gate(doc_path: str) -> list[str]:
    """The commodity-scoped twin of eval.py's check AG (frameworks/DECISION_LEDGER.md §18): verifies
    99_commodity-thesis-synthesis.md did not silently skip reading back scripts/commodity_calibrate.py's
    own output — the exact same false-confidence hole check AG closed for the research swarm, now closed
    here before it can ever ship (unlike AI/AK, which the research swarm discovered only after a defect
    had already shipped). Forward-looking: N/A for any decision_date before COMMODITY_CALIBRATION_GATE_DATE.

    This is a presence/consistency check, not a re-derivation of hit rates — it cannot judge WHICH
    commodity slice should have been flagged, only that the gate ran and recorded a status consistent
    with what the as-of summary's own verdict made possible."""
    try:
        doc = json.load(open(doc_path, encoding="utf-8"))
    except Exception as e:
        return [f"could not parse for cross-check: {e}"]
    # A valid-JSON document with the wrong root type (e.g. `[]`) must be reported as a FAIL, not crash the
    # whole --fixture/CI run with an AttributeError on `.get()`. Mirrors check_commodity_review_anchors /
    # check_thesis_integrity_anchors, which already guard this. It matters here specifically: commodity
    # decision records are §25 DATA commits that go straight to main WITHOUT passing CI, so a malformed one
    # reaches this validator unscreened — and main() runs these cross-checks even when validate() already
    # failed, so an unguarded .get() takes the entire run down instead of reporting the defect.
    if not isinstance(doc, dict):
        return ["commodity decision_record is not a JSON object"]
    decision_date = doc.get("decision_date")
    if not (isinstance(decision_date, str) and decision_date >= COMMODITY_CALIBRATION_GATE_DATE):
        return []  # forward-looking; pre-gate runs N/A (never a violation)
    summary = _commodity_calib_summary_asof(decision_date)
    verdict = (summary or {}).get("verdict") or ""
    if summary is None:
        expected = "not_available"
    elif verdict.startswith("Pre-data"):
        expected = "pre_data"
    else:
        expected = "checked"  # covers checked_no_action / applied — this script can't judge which is correct
    cf = doc.get("calibration_feedback")
    if not isinstance(cf, dict):
        return [f"decision_date {decision_date} >= gate date {COMMODITY_CALIBRATION_GATE_DATE} and as-of "
                f"calibration_summary={'present (verdict=' + repr(verdict) + ')' if summary is not None else 'absent'} "
                f"but decision_record.json has no calibration_feedback object — the Phase 6 calibration-"
                f"feedback gate (DECISION_LEDGER.md §18, commodity twin) was silently skipped"]
    errs = []
    status = cf.get("status")
    if status not in CALIBRATION_STATUSES:
        errs.append(f"calibration_feedback.status={status!r} is not one of {sorted(CALIBRATION_STATUSES)}")
    elif expected == "not_available" and status != "not_available":
        errs.append(f"no as-of calibration_summary.json exists (decision_date={decision_date}) but status={status!r} (expected 'not_available')")
    elif expected == "pre_data" and status != "pre_data":
        errs.append(f"as-of calibration_summary verdict={verdict!r} is Pre-data but status={status!r} (expected 'pre_data')")
    elif expected == "checked" and status not in ("checked_no_action", "applied"):
        errs.append(f"as-of calibration_summary has real signal (verdict={verdict!r}) but status={status!r} (expected 'checked_no_action' or 'applied')")
    if status == "applied":
        hp, fs = cf.get("haircut_points"), cf.get("flagged_slices")
        if not (isinstance(hp, (int, float)) and not isinstance(hp, bool) and hp > 0):
            errs.append(f"status='applied' but haircut_points={hp!r} is not a positive number")
        if not (isinstance(fs, list) and len(fs) > 0):
            errs.append(f"status='applied' but flagged_slices={fs!r} is empty/not a list")
    if status == "checked_no_action":
        fs = cf.get("flagged_slices")
        if isinstance(fs, list) and len(fs) > 0:
            errs.append(f"status='checked_no_action' but flagged_slices={fs!r} is non-empty")
    return errs


def _selftest_calibration_gate() -> int:
    """Fixture-free truth table for check_commodity_calibration_gate — mirrors
    scripts/commodity_calibrate.py's own --selftest discipline. The --fixture run only exercises the
    four committed pre-gate commodity runs (all N/A, decision_date < COMMODITY_CALIBRATION_GATE_DATE),
    so the gate's *post-gate* branches — the entire reason the gate exists — ship untested by CI: a
    future edit could break them while --fixture stays green (the exact "green proves nothing" trap
    frameworks/DECISION_LEDGER.md §18's regression-protection clause exists to close). This pins every
    branch. Expected values are pinned to the §18 status↔as-of-summary consistency contract and to
    frameworks/commodity/decision_record.schema.json's calibration_feedback enum
    (statuses {not_available, pre_data, checked_no_action, applied}; haircut_points>0 and non-empty
    flagged_slices only when status=='applied') — NOT to the gate's current behaviour.
    """
    import tempfile

    global REPO
    old_repo = REPO
    failures = []

    def run(name, doc, want_accept, summaries=None):
        # want_accept=True  -> §18 says this record is consistent, gate must return [] (accept)
        # want_accept=False -> §18/schema says it's a violation, gate must return a non-empty error list
        with tempfile.TemporaryDirectory() as d:
            globals()["REPO"] = d
            try:
                if summaries:
                    perf = os.path.join(d, "commodity", "performance")
                    os.makedirs(perf, exist_ok=True)
                    for fn, obj in summaries.items():
                        json.dump(obj, open(os.path.join(perf, fn), "w"))
                dp = os.path.join(d, "rec.json")
                json.dump(doc, open(dp, "w"))
                errs = check_commodity_calibration_gate(dp)
            finally:
                globals()["REPO"] = old_repo
        if (len(errs) == 0) != want_accept:
            failures.append(f"{name} (want_accept={want_accept}, errs={errs[:1]})")

    GATE = COMMODITY_CALIBRATION_GATE_DATE
    pre = (datetime.date.fromisoformat(GATE) - datetime.timedelta(days=1)).isoformat()   # < gate -> N/A
    post = (datetime.date.fromisoformat(GATE) + datetime.timedelta(days=4)).isoformat()  # >= gate

    def rec(**kw):
        b = {"swarm": "commodity", "commodity": "GOLD", "decision_date": post, "action": "Hold", "confidence": 50}
        b.update(kw)
        return b

    def cf(**kw):
        b = {"source_summary": None, "status": "not_available", "haircut_points": 0, "flagged_slices": [], "rationale": "x"}
        b.update(kw)
        return b

    real = {f"{pre}_calibration_summary.json": {"verdict": "12 decisive resolved calls · hit-rate 55%.",
                                                "calibration_by_commodity": {"GOLD": {"hit_rate": 0.3, "n": 6}}}}
    predata = {f"{pre}_calibration_summary.json": {"verdict": "Pre-data — 3 of 10 decisive resolved calls needed.",
                                                   "calibration_by_commodity": {}}}

    # forward-looking N/A + malformed-root guard (§18: pre-gate runs are never a violation; a §25 DATA
    # record reaches this validator unscreened, so a wrong root type must FAIL, not crash the run)
    run("pre-gate date, no cf -> N/A accept", rec(decision_date=pre), True)
    run("non-dict root -> reject", [], False)
    # post-gate presence: cf must exist and be an object (§18: the gate cannot be silently skipped)
    run("post-gate, no cf -> reject", rec(), False)
    run("post-gate, cf not a dict -> reject", rec(calibration_feedback="nope"), False, real)
    # status must be one of the schema's four legal literals
    run("post-gate, invalid status -> reject", rec(calibration_feedback=cf(status="bogus")), False, real)
    # expected==not_available (no as-of summary exists)
    run("no summary, not_available -> accept", rec(calibration_feedback=cf()), True)
    run("no summary, applied -> reject", rec(calibration_feedback=cf(status="applied", haircut_points=8, flagged_slices=["GOLD"])), False)
    # expected==pre_data (as-of summary verdict starts 'Pre-data')
    run("Pre-data summary, pre_data -> accept", rec(calibration_feedback=cf(status="pre_data", source_summary="s")), True, predata)
    run("Pre-data summary, checked_no_action -> reject", rec(calibration_feedback=cf(status="checked_no_action", source_summary="s")), False, predata)
    # expected==checked (as-of summary has real signal) -> checked_no_action OR applied
    run("real summary, checked_no_action -> accept", rec(calibration_feedback=cf(status="checked_no_action", source_summary="s")), True, real)
    run("real summary, applied(8,[GOLD]) -> accept", rec(calibration_feedback=cf(status="applied", haircut_points=8, flagged_slices=["GOLD"], source_summary="s")), True, real)
    run("real summary, not_available -> reject", rec(calibration_feedback=cf(status="not_available")), False, real)
    # applied well-formedness (schema: haircut_points>0, flagged_slices non-empty; bool is not a number)
    run("applied, haircut_points=0 -> reject", rec(calibration_feedback=cf(status="applied", haircut_points=0, flagged_slices=["GOLD"], source_summary="s")), False, real)
    run("applied, flagged_slices=[] -> reject", rec(calibration_feedback=cf(status="applied", haircut_points=8, flagged_slices=[], source_summary="s")), False, real)
    run("applied, haircut_points=True(bool) -> reject", rec(calibration_feedback=cf(status="applied", haircut_points=True, flagged_slices=["GOLD"], source_summary="s")), False, real)
    # checked_no_action must carry no flagged slices (a flag implies a haircut => 'applied')
    run("checked_no_action, flagged non-empty -> reject", rec(calibration_feedback=cf(status="checked_no_action", flagged_slices=["GOLD"], source_summary="s")), False, real)

    if failures:
        print("SELFTEST FAIL (calibration gate):")
        for f in failures:
            print(f"   - {f}")
        return 1
    print("SELFTEST OK — check_commodity_calibration_gate truth table (16 branches) matches the §18 contract")
    return 0


def _selftest_schema_primitives() -> int:
    """Pin finite-number and timezone-bearing date-time behavior that Python does not enforce by default."""
    schema = {
        "type": "object",
        "additionalProperties": True,
        "required": ["at", "value"],
        "properties": {
            "at": {"type": "string", "format": "date-time"},
            "value": {"type": "number"},
        },
    }
    cases = [
        ("UTC date-time", {"at": "2026-08-03T10:15:20Z", "value": 1.0}, True),
        ("offset date-time", {"at": "2026-08-03T10:15:20.125+05:30", "value": 1.0}, True),
        ("date-only is not date-time", {"at": "2026-08-03", "value": 1.0}, False),
        ("timezone-less is not date-time", {"at": "2026-08-03T10:15:20", "value": 1.0}, False),
        ("impossible date-time", {"at": "2026-02-30T10:15:20Z", "value": 1.0}, False),
        ("NaN is not JSON number", {"at": "2026-08-03T10:15:20Z", "value": float("nan")}, False),
        ("infinity is not JSON number", {"at": "2026-08-03T10:15:20Z", "value": float("inf")}, False),
        ("untyped nested NaN is rejected", {"at": "2026-08-03T10:15:20Z", "value": 1.0, "open": {"x": float("nan")}}, False),
    ]
    failures = []
    for name, doc, want_accept in cases:
        checker = Checker(schema)
        checker.check(schema, doc, "")
        errors = nonfinite_errors(doc) + checker.errors
        if (len(errors) == 0) != want_accept:
            failures.append(f"{name} (want_accept={want_accept}, errors={errors[:1]})")
    if failures:
        print("SELFTEST FAIL (schema primitives):")
        for failure in failures:
            print(f"   - {failure}")
        return 1
    print("SELFTEST OK — finite numbers and timezone-bearing RFC 3339 date-times are enforced")
    return 0


def main(argv: list[str]) -> int:
    if len(argv) >= 2 and argv[1] == "--selftest":
        calibration_result = _selftest_calibration_gate()
        primitive_result = _selftest_schema_primitives()
        return 1 if calibration_result or primitive_result else 0
    if len(argv) >= 2 and argv[1] == "--fixture":
        pairs = [(os.path.join(REPO, s), os.path.join(REPO, d)) for s, d in FIXTURE_PAIRS]
        pairs += [(os.path.join(REPO, THESIS_INTEGRITY_SCHEMA), os.path.join(REPO, d)) for d in screener_integrity_reviews()]
        pairs += [(os.path.join(REPO, COMMODITY_SCHEMA), os.path.join(REPO, d)) for d in commodity_decision_records()]
        pairs += [(os.path.join(REPO, COMMODITY_REVIEW_SCHEMA), os.path.join(REPO, d)) for d in commodity_decision_reviews()]
    elif len(argv) >= 3 and len(argv) % 2 == 1:
        pairs = list(zip(argv[1::2], argv[2::2]))
    else:
        print(__doc__)
        return 2
    bad = 0
    for schema_p, doc_p in pairs:
        errs = validate(schema_p, doc_p)
        rel = os.path.relpath(doc_p, REPO)
        if os.path.abspath(schema_p) == os.path.abspath(os.path.join(REPO, COMMODITY_SCHEMA)):
            errs = errs + check_commodity_routing(doc_p) + check_commodity_data_sufficiency(doc_p) + check_commodity_calibration_gate(doc_p)
        if os.path.abspath(schema_p) == os.path.abspath(os.path.join(REPO, COMMODITY_REVIEW_SCHEMA)):
            errs = errs + check_commodity_review_anchors(doc_p)
        if os.path.abspath(schema_p) == os.path.abspath(os.path.join(REPO, THESIS_INTEGRITY_SCHEMA)):
            errs = errs + check_thesis_integrity_anchors(doc_p)
        if errs:
            bad += 1
            print(f"FAIL {rel}")
            for e in errs[:10]:
                print(f"   - {e}")
        else:
            print(f"OK   {rel}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
