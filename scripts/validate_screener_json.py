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

Also validates every committed commodity/runs/<COMMODITY>/signal_evidence.json and binds its summary
back to decision_record.json. A run with incomplete evidence coverage can only publish `Research More`.

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
import hashlib
import json
import math
import os
import re
import sys

from commodity_decision_archive import ArchiveError, decision_id_for
from commodity_evidence_links import validate_horizon_evidence_links, validate_signal_projection
from commodity_forecast_contract import validate_decision_record as validate_dual_horizon_record
from data_need_contract import (
    DATA_NEED_PROMISE_RE as _DATA_NEED_GUARANTEE_RE,
    DATA_NEED_URL_RE as _DATA_NEED_URL_RE,
    check_live_orb_routes,
    text_leaves as _data_need_strings,
)

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


def _parse_rfc3339_datetime(value: str) -> datetime.datetime:
    """Parse RFC 3339 consistently on Python 3.9, which needs 3/6-digit fractions."""
    if not isinstance(value, str) or RFC3339_DATETIME_RE.fullmatch(value) is None:
        raise ValueError("date-time must include clock time and timezone")
    normalized = re.sub(
        r"\.(\d+)(?=(?:[Zz]|[+-]\d{2}:\d{2})$)",
        lambda match: "." + match.group(1)[:6].ljust(6, "0"),
        value,
    )
    parsed = datetime.datetime.fromisoformat(
        re.sub(r"[Zz]$", "+00:00", normalized).replace("t", "T")
    )
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise ValueError("date-time must include timezone")
    return parsed


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
                        _parse_rfc3339_datetime(doc)
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
    with open(schema_path, encoding="utf-8") as handle:
        schema = json.load(handle)
    with open(doc_path, encoding="utf-8") as handle:
        doc = json.load(handle)
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
COMMODITY_SIGNAL_SCHEMA = "frameworks/commodity/signal_evidence.schema.json"
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
# Error-taxonomy extension — the commodity-scoped twin of eval.py's AG_ERRTAX_DATE (2026-07-29). The
# commodity calibration gate above landed 2026-07-21, eight days BEFORE the research swarm gained its
# error-taxonomy trigger, and was never backported: scripts/commodity_calibrate.py has computed
# error_taxonomy_distribution (CLAUDE.md §20) since it shipped, but it was read back only in
# .claude/commands/commodity/calibrate.md step 3's human-facing narration ("the leading tag(s) if any
# count >= 2 ... never gated by the floor") — never by a gate that changes behavior on a live commodity
# run. Same "measured but never consumed" gap eval.py's AG_ERRTAX_DATE closed for research, ported here.
# Forward-looking: commodity decision_record.json dated before this date is not held to the two new
# schema fields (leading_error_categories_flagged, error_defense_evidence) that did not exist when it
# shipped, mirroring the AG_ERRTAX_DATE convention exactly.
COMMODITY_CALIBRATION_ERRTAX_DATE = "2026-08-10"
# Versioned decision-guidance contract. Legacy commodity records omit the discriminator and keep their
# v1 data_needs shape. Every fresh record from this date must explicitly emit v2, even when no need is
# active (`data_needs: []`), so absence can never mean either "checked and none" or "forgotten".
COMMODITY_DATA_NEEDS_V2_DATE = "2026-08-14"

def check_commodity_data_needs_v2(
    doc_or_path, *, enforce_live_roster=False, publication_date=None
) -> list[str]:
    """Semantic half of the commodity data-needs v2 contract.

    JSON Schema owns exact fields, enums, max-five, and 0–1 routing confidence. This gate owns rollout
    by decision date, exact priority order, unique need ids, URL prohibition, and language that falsely
    promises an investment-conviction lift. `enforce_live_roster` is creation-time only; archived replay
    leaves it false so later orb renames cannot rewrite history. Legacy records predating the rollout and
    omitting the discriminator remain valid.
    """
    if isinstance(doc_or_path, dict):
        doc = doc_or_path
    else:
        try:
            doc = json.load(open(doc_or_path, encoding="utf-8"))
        except Exception as exc:
            return [f"cannot parse decision record for data-needs v2 gate: {exc}"]
    if not isinstance(doc, dict):
        return ["decision record root is not an object"]

    decision_date = doc.get("decision_date")
    version = doc.get("data_needs_schema_version")
    post_gate = isinstance(decision_date, str) and decision_date >= COMMODITY_DATA_NEEDS_V2_DATE
    # Current/prearchive publication may update a singleton commodity folder while intentionally retaining
    # its original decision date. Only the creation-time caller supplies publication_date; frozen replay
    # remains governed by the historical record itself and never acquires today's rules retroactively.
    if publication_date is not None:
        try:
            publish_day = datetime.date.fromisoformat(publication_date)
        except (TypeError, ValueError):
            return [f"publication_date {publication_date!r} is not a real YYYY-MM-DD date"]
        post_gate = post_gate or publish_day.isoformat() >= COMMODITY_DATA_NEEDS_V2_DATE
    if post_gate and version != "2.0":
        return [
            f"decision_date {decision_date} is on/after {COMMODITY_DATA_NEEDS_V2_DATE} but "
            "data_needs_schema_version is not '2.0' — fresh records must distinguish a completed empty "
            "check (`data_needs: []`) from an omitted contract"
        ]
    if version != "2.0":
        return []

    needs = doc.get("data_needs")
    if not isinstance(needs, list):
        return ["data_needs_schema_version '2.0' requires data_needs to be an array (empty is valid)"]

    errs = []
    priorities = []
    need_ids = []
    try:
        decision_day = datetime.date.fromisoformat(decision_date)
    except (TypeError, ValueError):
        decision_day = None  # the JSON Schema emits the primary decision_date error
    for i, need in enumerate(needs):
        if not isinstance(need, dict):
            continue  # schema emits the precise type error
        priority = need.get("priority")
        if isinstance(priority, int) and not isinstance(priority, bool):
            priorities.append(priority)
        need_id = need.get("need_id")
        if isinstance(need_id, str):
            need_ids.append(need_id)
        forbidden = sorted(set(need) & {"cap_lifted", "entry_modules", "url", "source_url"})
        if forbidden:
            errs.append(f"data_needs[{i}] uses forbidden v2 field(s) {forbidden!r}")
        if "next_release" in need:
            try:
                next_day = datetime.date.fromisoformat(need.get("next_release"))
            except (TypeError, ValueError):
                next_day = None  # schema emits the precise format error
            if next_day is not None and decision_day is not None and next_day < decision_day:
                errs.append(
                    f"data_needs[{i}].next_release={need.get('next_release')!r} predates "
                    f"decision_date={decision_date!r}; a next release must be on or after the decision date"
                )
        for value_path, value in _data_need_strings(need, f"data_needs[{i}]"):
            if _DATA_NEED_URL_RE.search(value):
                errs.append(f"{value_path} contains a URL — v2 suggested_source is a source hint only")
            if _DATA_NEED_GUARANTEE_RE.search(value):
                errs.append(
                    f"{value_path} promises or quantifies a conviction/score/rating lift — describe the "
                    "two-sided decision impact conditionally; evidence may strengthen, weaken, or leave the call unchanged"
                )

    if len(need_ids) != len(set(need_ids)):
        errs.append("data_needs v2 need_id values must be unique within the record")
    if len(priorities) == len(needs):
        want = list(range(1, len(needs) + 1))
        if priorities != want:
            errs.append(
                f"data_needs v2 priorities are ordered {priorities!r}; array order must be exactly "
                f"{want!r} so data_needs[0] is priority 1 and the queue is contiguous"
            )
    if enforce_live_roster:
        errs.extend(check_live_orb_routes(doc, os.path.join(REPO, ".claude", "agents", "commodity")))
    return errs


def validate_commodity_prearchive(doc_path: str) -> list[str]:
    """Validate a mutable current record before the first immutable byte is written.

    This intentionally excludes archive-existence checks and mutable run projections. It enforces the
    full decision JSON Schema, frozen v2 semantics, and today's exact orb routing. Archived replay calls
    the same semantic function without `enforce_live_roster`, preserving point-in-time validity.
    """
    schema_path = os.path.join(REPO, "frameworks", "commodity", "decision_record.schema.json")
    return validate(schema_path, doc_path) + check_commodity_data_needs_v2(
        doc_path, enforce_live_roster=True, publication_date=datetime.date.today().isoformat()
    )


def _commodity_leading_error_categories(calibration_summary):
    """Categories in the as-of commodity calibration summary's error_taxonomy_distribution with count
    >= 2 — the same threshold commodity/calibrate.md's own human-facing narration already uses ("the
    leading tag(s) if any count >= 2"). Sorted for a deterministic violation message. Non-dict/non-numeric
    entries are ignored, never crash. Mirrors eval.py's _ag_leading_error_categories exactly."""
    dist = (calibration_summary or {}).get("error_taxonomy_distribution")
    if not isinstance(dist, dict):
        return []
    def _isnum(v):
        return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)
    return sorted(cat for cat, n in dist.items() if isinstance(cat, str) and _isnum(n) and n >= 2)
# Rollout date for check_commodity_scenario_math (CLAUDE.md §10, the commodity-scoped twin of eval.py
# check M). Same forward-looking convention as COMMODITY_CALIBRATION_GATE_DATE above: every commodity
# decision_record.json dated on/after this date must carry the scenario distribution its own expected
# return was derived from. The four runs committed before it (ALUMINIUM/COPPER/GOLD/WHEAT, dated
# 2026-07-02..07-18) predate the block entirely and are N/A — they are not retro-failed for missing
# something the synthesizer was, at the time, explicitly told NOT to write.
COMMODITY_SCENARIO_GATE_DATE = "2026-08-08"
COMMODITY_DUAL_HORIZON_GATE_DATE = "2026-08-10"
# §10 SPAN-check threshold — the commodity-scoped twin of eval.py's AT_MIN_BEST_PCT (check
# eval_at_scenario_span). Same value and rationale as the research-swarm check: a scenario set can sum to
# 100 and reconcile its expected return perfectly while still spanning nothing, if the bull case's
# benchmark move never clears an ordinary move. Applied to the BENCHMARK price move (price_target vs
# current_price) of the nonzero-probability bull case, not the raw roll-adjusted return_pct — see the
# span block in check_commodity_scenario_math for why the commodity schema needs those four refinements.
# Unconditional whenever scenarios[] is present, mirroring the conjunction sub-check below rather than
# COMMODITY_SCENARIO_GATE_DATE above: a record that ships a distribution is asserting it regardless of
# decision_date, so there is no pre-gate exemption for this sub-check (moot in practice — the four
# pre-gate commodity runs carry no scenarios[] at all, so neither check fires on them).
SCENARIO_SPAN_MIN_BEST_PCT = 5.0


def commodity_decision_records() -> list[str]:
    """Every committed commodity/runs/<COMMODITY>/decision_record.json (repo-relative)."""
    return sorted(
        os.path.relpath(p, REPO)
        for p in glob.glob(os.path.join(REPO, "commodity", "runs", "*", "decision_record.json"))
    )


def commodity_archived_decision_records() -> list[str]:
    """Every immutable commodity decision snapshot (repo-relative)."""
    return sorted(
        os.path.relpath(path, REPO)
        for path in glob.glob(os.path.join(REPO, "commodity", "runs", "*", "decisions", "*", "decision_record.json"))
    )


def commodity_decision_reviews() -> list[str]:
    """Every committed commodity/runs/<COMMODITY>/reviews/*_decision_review*.json (repo-relative)."""
    return sorted(
        os.path.relpath(p, REPO)
        for p in glob.glob(os.path.join(REPO, "commodity", "runs", "*", "reviews", "*_decision_review*.json"))
    )


def commodity_signal_evidence() -> list[str]:
    """Every current or immutable archived commodity signal graph (repo-relative)."""
    return sorted(
        os.path.relpath(p, REPO)
        for p in glob.glob(os.path.join(REPO, "commodity", "runs", "**", "signal_evidence.json"), recursive=True)
    )


def check_commodity_dual_horizon(doc_path: str) -> list[str]:
    """Require the independent tactical/strategic contract for decisions from its rollout date."""
    try:
        record = json.load(open(doc_path, encoding="utf-8"))
    except Exception as error:
        return [f"could not parse for dual-horizon cross-check: {error}"]
    if not isinstance(record, dict):
        return ["commodity decision_record is not a JSON object"]
    decision_date = record.get("decision_date")
    if not isinstance(decision_date, str) or decision_date < COMMODITY_DUAL_HORIZON_GATE_DATE:
        return []
    return validate_dual_horizon_record(record)


def check_commodity_decision_archive(doc_path: str) -> list[str]:
    """Bind every post-rollout current projection to an identical immutable archived decision."""
    try:
        record = json.load(open(doc_path, encoding="utf-8"))
    except Exception as error:
        return [f"could not parse for decision-archive cross-check: {error}"]
    if not isinstance(record, dict):
        return ["commodity decision_record is not a JSON object"]
    decision_date = record.get("decision_date")
    if not isinstance(decision_date, str) or decision_date < COMMODITY_DUAL_HORIZON_GATE_DATE:
        return []
    decision_id = record.get("decision_id")
    if not isinstance(decision_id, str) or not decision_id:
        return ["post-rollout decision_record must carry an immutable decision_id"]
    try:
        derived = decision_id_for(record)
    except ArchiveError as error:
        return [f"decision_id cannot be derived: {error}"]
    if decision_id != derived:
        return [f"decision_id={decision_id!r} does not match content-derived ID {derived!r}"]
    archive_path = os.path.join(os.path.dirname(doc_path), "decisions", decision_id, "decision_record.json")
    if not os.path.isfile(archive_path):
        return [f"immutable decision archive is missing: {os.path.relpath(archive_path, REPO)}"]
    try:
        archived = json.load(open(archive_path, encoding="utf-8"))
    except Exception as error:
        return [f"immutable decision archive is unreadable: {error}"]
    if archived != record:
        return ["current decision projection differs from its immutable archived decision"]
    errors = []
    archive_graph_path = os.path.join(os.path.dirname(archive_path), "signal_evidence.json")
    if not os.path.isfile(archive_graph_path):
        errors.append("immutable decision archive is missing signal_evidence.json")
    else:
        try:
            archive_graph = json.load(open(archive_graph_path, encoding="utf-8"))
        except Exception as error:
            errors.append(f"archived signal_evidence.json is unreadable: {error}")
        else:
            errors.extend(check_commodity_signal_projection(archive_path))
            current_graph_path = os.path.join(os.path.dirname(doc_path), "signal_evidence.json")
            if os.path.isfile(current_graph_path):
                try:
                    current_graph_raw = open(current_graph_path, "rb").read()
                    current_graph = json.loads(current_graph_raw.decode("utf-8"))
                except Exception:
                    current_graph = None
                if current_graph is not None and current_graph_raw != open(archive_graph_path, "rb").read():
                    errors.append("current signal evidence graph differs from the current decision's archived graph")
    coverage_projection = record.get("required_series_coverage")
    if isinstance(coverage_projection, dict):
        archive_coverage_path = os.path.join(os.path.dirname(archive_path), "required_series_coverage.json")
        if not os.path.isfile(archive_coverage_path):
            errors.append("immutable decision archive is missing required_series_coverage.json")
        else:
            digest = "sha256:" + hashlib.sha256(open(archive_coverage_path, "rb").read()).hexdigest()
            if digest != coverage_projection.get("artifact_sha256"):
                errors.append("archived required-series coverage digest does not match the decision projection")
    return errors


def check_commodity_archived_snapshot(doc_path: str) -> list[str]:
    """Validate an old archive from its own frozen evidence, never the current run projection."""
    try:
        record = json.load(open(doc_path, encoding="utf-8"))
    except Exception as error:
        return [f"archived decision is unreadable: {error}"]
    if not isinstance(record, dict):
        return ["archived decision is not an object"]
    errors = []
    archive_id = os.path.basename(os.path.dirname(doc_path))
    if record.get("decision_id") != archive_id:
        errors.append("archived decision_id does not match its directory")
    try:
        derived = decision_id_for(record)
    except ArchiveError as error:
        errors.append(f"archived decision ID cannot be derived: {error}")
    else:
        if derived != archive_id:
            errors.append("archived decision ID does not match its content")
    graph_path = os.path.join(os.path.dirname(doc_path), "signal_evidence.json")
    if not os.path.isfile(graph_path):
        errors.append("archived signal_evidence.json is missing")
    else:
        try:
            graph = json.load(open(graph_path, encoding="utf-8"))
        except Exception as error:
            errors.append(f"archived signal evidence is unreadable: {error}")
        else:
            errors.extend(check_commodity_signal_projection(doc_path))
    projection = record.get("required_series_coverage")
    if isinstance(projection, dict):
        coverage_path = os.path.join(os.path.dirname(doc_path), "required_series_coverage.json")
        if not os.path.isfile(coverage_path):
            errors.append("archived required_series_coverage.json is missing")
        else:
            digest = "sha256:" + hashlib.sha256(open(coverage_path, "rb").read()).hexdigest()
            if digest != projection.get("artifact_sha256"):
                errors.append("archived required-series coverage digest mismatch")
    return errors


def _point_in_time_review_source_errors(source: object, label: str, target: object, review_day: object) -> list[str]:
    """Reject outcome inputs that use observations/publications beyond the graded cutoff."""
    if not isinstance(source, dict) or not isinstance(target, str) or not isinstance(review_day, str):
        return []  # Shape/type failures belong to the schema validator.
    try:
        target_date = datetime.date.fromisoformat(target)
        filed_date = datetime.date.fromisoformat(review_day)
        observation_date = datetime.date.fromisoformat(source["observation_as_of"])
        published = _parse_rfc3339_datetime(source["published_at"])
        retrieved = _parse_rfc3339_datetime(source["retrieved_at"])
    except (KeyError, AttributeError, TypeError, ValueError):
        return [f"{label} has invalid point-in-time dates or timestamps"]
    errors = []
    if observation_date > target_date:
        errors.append(f"{label}.observation_as_of cannot be after target_date")
    if published.date() > target_date:
        errors.append(f"{label}.published_at cannot be after target_date — later releases/revisions are not point-in-time outcomes")
    if retrieved.date() > filed_date:
        errors.append(f"{label}.retrieved_at cannot be after review_date")
    if retrieved < published:
        errors.append(f"{label}.retrieved_at cannot predate published_at")
    return errors


def check_commodity_signal_projection(doc_path: str) -> list[str]:
    """Bind a decision's evidence counts and abstention gate to the compiled graph."""
    record = json.load(open(doc_path, encoding="utf-8"))
    if not isinstance(record, dict):
        return ["commodity decision_record is not a JSON object"]
    graph_path = os.path.join(os.path.dirname(doc_path), "signal_evidence.json")
    projection = record.get("signal_evidence")
    if not os.path.exists(graph_path):
        return ["decision references signal_evidence but signal_evidence.json is missing"] if projection is not None else []
    graph = json.load(open(graph_path, encoding="utf-8"))
    if not isinstance(graph, dict):
        return ["signal_evidence.json is not a JSON object"]
    if not isinstance(projection, dict):
        return ["decision_record must project the run's signal_evidence summary"]
    digest = "sha256:" + hashlib.sha256(open(graph_path, "rb").read()).hexdigest()
    return validate_signal_projection(record, graph, digest)


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
    doc = json.load(open(doc_path, encoding="utf-8"))
    if not isinstance(doc, dict):
        return ["review document is not a JSON object"]
    record_path = os.path.join(run_dir, "decision_record.json")
    if doc.get("schema_version") == "2.0" and isinstance(doc.get("decision_id"), str):
        record_path = os.path.join(run_dir, "decisions", doc["decision_id"], "decision_record.json")
    if not os.path.exists(record_path):
        return [f"immutable decision record not found at {os.path.relpath(record_path, REPO)} — cannot cross-check anchors"]
    record = json.load(open(record_path, encoding="utf-8"))
    if not isinstance(record, dict):
        return [f"decision_record.json at {os.path.relpath(record_path, REPO)} is not a JSON object — cannot cross-check anchors"]
    errs = []
    if doc.get("schema_version") == "2.0" and doc.get("decision_id") != record.get("decision_id"):
        errs.append(f"review decision_id {doc.get('decision_id')!r} != archived decision_id {record.get('decision_id')!r}")
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
    if doc.get("schema_version") == "2.0" and isinstance(ref, dict) and isinstance(rvp, dict):
        for field in ("currency", "unit"):
            if ref.get(field) != rvp.get(field):
                errs.append(
                    f"review_price.{field} {rvp.get(field)!r} != reference_price.{field} {ref.get(field)!r} "
                    "— returns cannot mix quote currencies or units"
                )
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
    if doc.get("schema_version") == "2.0":
        horizon_name = doc.get("forecast_horizon")
        horizon = record.get("forecast_horizons", {}).get(horizon_name) \
            if isinstance(record.get("forecast_horizons"), dict) and isinstance(horizon_name, str) else None
        if not isinstance(horizon, dict):
            errs.append(f"archived decision has no {horizon_name!r} forecast horizon")
        else:
            target_date = horizon.get("target_date")
            if doc.get("target_date") != target_date:
                errs.append(f"review target_date {doc.get('target_date')!r} != archived horizon target_date {target_date!r}")
            if doc.get("review_window") != horizon_name:
                errs.append("version 2.0 review_window must equal forecast_horizon")
            if doc.get("outcome_as_of") != target_date:
                errs.append("outcome_as_of must equal the archived forecast's exact target_date")
            if isinstance(rvp, dict) and isinstance(rvp.get("as_of"), str) and isinstance(target_date, str):
                try:
                    price_day = datetime.date.fromisoformat(rvp["as_of"])
                    target_day = datetime.date.fromisoformat(target_date)
                    lag = (target_day - price_day).days
                    if lag < 0 or lag > 4:
                        errs.append("review_price.as_of must be the latest official observation on/before target_date (maximum four-calendar-day market closure)")
                except ValueError:
                    errs.append("review_price.as_of and target_date must be real calendar dates")
            if isinstance(review_date, str) and isinstance(target_date, str) and review_date < target_date:
                errs.append("review_date cannot predate the archived forecast target_date")

            components = doc.get("realized_return_components_pct")
            component_sources = doc.get("realized_return_component_sources")
            component_names = (
                "price_return_pct", "roll_return_pct", "collateral_return_pct", "fees_pct", "fx_adjustment_pct",
            )
            if isinstance(component_sources, dict):
                for name in component_names:
                    errs.extend(_point_in_time_review_source_errors(
                        component_sources.get(name), f"realized_return_component_sources.{name}",
                        target_date, review_date,
                    ))
            errs.extend(_point_in_time_review_source_errors(
                doc.get("max_adverse_excursion_source"), "max_adverse_excursion_source",
                target_date, review_date,
            ))
            if isinstance(components, dict) and all(
                isinstance(components.get(name), (int, float)) and not isinstance(components.get(name), bool)
                for name in (*component_names, "implementable_return_pct")
            ):
                calculated = sum(float(components[name]) for name in component_names)
                if abs(float(components["implementable_return_pct"]) - calculated) > 0.05:
                    errs.append("realized implementable_return_pct does not equal price + roll + collateral + fees + FX")
                if isinstance(stored_ret, (int, float)) and not isinstance(stored_ret, bool) \
                        and abs(float(components["price_return_pct"]) - float(stored_ret)) > 0.05:
                    errs.append("realized price_return_pct must equal absolute_return_pct")

                scenarios = horizon.get("scenarios")
                scenario_rows = [row for row in scenarios if isinstance(row, dict)] if isinstance(scenarios, list) else []
                outcomes = [
                    (row.get("label"), float(row["implementable_return_pct"]))
                    for row in scenario_rows
                    if row.get("label") in {"bear", "base", "bull"}
                    and isinstance(row.get("implementable_return_pct"), (int, float))
                    and not isinstance(row.get("implementable_return_pct"), bool)
                ]
                if len(outcomes) == 3:
                    actual = float(components["implementable_return_pct"])
                    # Distance is the primary key; label order is a deterministic tie-break.
                    nearest = min(outcomes, key=lambda item: (abs(item[1] - actual), {"bear": 0, "base": 1, "bull": 2}[item[0]]))
                    if doc.get("scenario_outcome") != nearest[0]:
                        errs.append(f"scenario_outcome must be nearest archived scenario label {nearest[0]!r}")
                    lower, upper = min(value for _, value in outcomes), max(value for _, value in outcomes)
                    expected_miss = "below" if actual < lower else ("above" if actual > upper else "inside")
                    if doc.get("range_miss") != expected_miss:
                        errs.append(f"range_miss must be {expected_miss!r} from the archived scenario span")
                mae = doc.get("max_adverse_excursion_pct")
                if isinstance(mae, (int, float)) and not isinstance(mae, bool) and mae > min(0.0, actual) + 0.05:
                    errs.append("max_adverse_excursion_pct cannot be better than zero or the final implementable return")
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
    fname_m = re.match(r"^(\d{4}-\d{2}-\d{2})_(30d|90d|180d|365d|ad-hoc|tactical|strategic)_decision_review(?:_v\d+)?\.json$", base)
    if fname_m is None:
        errs.append(
            f"review filename {base!r} does not match <YYYY-MM-DD>_<window>_decision_review[_vN].json "
            f"— the due-scanner keys on this name"
        )
    else:
        if isinstance(review_date, str) and fname_m.group(1) != review_date:
            errs.append(f"filename date {fname_m.group(1)!r} != review_date field {review_date!r}")
        if isinstance(window, str) and fname_m.group(2) != window:
            errs.append(
                f"filename window {fname_m.group(2)!r} != review_window field {window!r} — they must match "
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


def check_commodity_scenario_math(doc_path: str) -> list[str]:
    """The commodity-scoped twin of eval.py check M — CLAUDE.md §10 arithmetic, re-derived rather than
    trusted. A commodity dossier states a bear-case price (the cost-curve orb's bear fair value, and
    key_levels.support), which is exactly the condition §10 attaches its requirements to; the record used
    to be exempted from them by its own schema, so a dossier could speak of "today's probability-weighted
    reality" while carrying no probabilities at all, and no forecast §19's ledger could ever grade.

    Re-derives, never trusts: probabilities sum to 100; expected_return_pct equals Sum(p x ret);
    downside_risk_pct equals the bear case's own return; the labels map onto a real bear/base/bull band;
    ids are unique; the bull case's benchmark move actually SPANS an ordinary move (the twin of eval.py
    check AT — a set can reconcile perfectly and still contain no case resembling what would happen); a
    conjunction of independent conditions carries a joint_probability_basis (the twin of check AV); and
    every case carries an observable falsifier. Sign-aware with a relative floor, mirroring check M — a
    small sign flip (+0.4 vs -0.4) is the failure an absolute tolerance lets through.

    Forward-looking: N/A for any decision_date before COMMODITY_SCENARIO_GATE_DATE, so the four runs
    committed before the gate (ALUMINIUM/COPPER/GOLD/WHEAT) stay green and are not retro-failed for
    missing a block the engine could not yet write."""
    try:
        doc = json.load(open(doc_path, encoding="utf-8"))
    except Exception as e:
        return [f"could not parse for cross-check: {e}"]
    # Same root-type guard as the other commodity cross-checks: these are §25 DATA commits that reach this
    # validator without passing CI, and main() runs cross-checks even after validate() failed.
    if not isinstance(doc, dict):
        return ["commodity decision_record is not a JSON object"]

    def isnum(v) -> bool:
        return isinstance(v, (int, float)) and not isinstance(v, bool)

    decision_date = doc.get("decision_date")
    post_gate = isinstance(decision_date, str) and decision_date >= COMMODITY_SCENARIO_GATE_DATE
    scen = doc.get("scenarios")
    errs: list[str] = []

    if not isinstance(scen, list) or not scen:
        if not post_gate:
            return []  # genuinely predates the gate — never a violation
        # A post-gate run that quantified a return MUST ship the distribution it was derived from;
        # one that quantified nothing is refusing to state a forecast, which §11/§24 allow.
        for fld in ("expected_return_pct", "downside_risk_pct", "risk_reward"):
            if doc.get(fld) is not None:
                errs.append(
                    f"{fld} is set but scenarios[] is missing/empty — the math cannot be re-derived "
                    f"(required for decision_date >= {COMMODITY_SCENARIO_GATE_DATE})"
                )
        return errs

    # ---- the distribution itself (checked whenever present, pre-gate records included: a record that
    # ---- ships scenarios[] is asserting this math regardless of its date)
    if not isnum(doc.get("scenario_horizon_days")):
        errs.append("scenarios[] present but scenario_horizon_days is missing/non-numeric — §10 requires a time window")

    ids = [s.get("scenario_id") for s in scen if isinstance(s, dict)]
    if len(set(ids)) != len(ids):
        errs.append(f"scenario_id values are not unique: {ids}")
    labels = [s.get("label") for s in scen if isinstance(s, dict)]
    for required in ("bear", "base", "bull"):
        if required not in labels:
            errs.append(f"no {required!r}-labelled scenario — the distribution must span the fair-value band it came from")

    try:
        probs = [float(s["probability"]) for s in scen]
        rets = [float(s["return_pct"]) for s in scen]
    except (KeyError, TypeError, ValueError) as e:
        return errs + [f"scenarios[] probability/return_pct missing or non-numeric ({e}) — cannot reconcile the math"]

    # §10 SPAN check (the commodity-scoped twin of eval.py check AT). This adapts the equity twin's bare
    # max(return_pct) to the commodity schema, which — unlike the equity records eval.py reads — separates
    # price_target (the BENCHMARK level) from return_pct (the ROLL-ADJUSTED position return) and whose
    # action verdicts are long-only. Four schema-driven refinements, each closing a way a bare max() lets
    # a non-spanning set through (raised by Codex on this PR, r3742531399/401/404 and r3742876382):
    #   (1) §10's "ordinary move of the current price" is a BENCHMARK move, so measure it from price_target
    #       vs current_price, NOT from the roll-adjusted return_pct — a contango carry that nets a real
    #       +5%+ benchmark move down below the threshold (or a backwardation that lifts a sub-5% benchmark
    #       move above it) is exactly the divergence the schema separates these two fields for.
    #   (2) the spanning case must be the BULL-labelled upside case, not whichever case holds the highest
    #       number: a mislabeled base with a larger move cannot discharge the bull's own §10 obligation.
    #       (eval.py can use max() because equity returns are position-signed and shorts exist; commodity
    #       verdicts are long-only and label maps to price direction, so the bull IS the upside case.)
    #   (3) the spanning case must carry NONZERO probability: a 0%-probability bull (schema allows
    #       probability minimum 0) places no mass on the upside, so the distribution still excludes it.
    #   (4) an unusable benchmark anchor is REJECTED, never silently swapped for the roll-adjusted metric
    #       (Codex r3742876382): current_price.value is a bare {"type":"number"} with no positive minimum,
    #       so a schema-valid record can carry value 0 or negative, for which the benchmark % move is
    #       undefined (0 divides) or economically meaningless (negative base). The old code fell back to
    #       return_pct there — the very roll-adjusted metric refinement (1) exists to keep OUT of the span
    #       — and the downstream return↔target reconciliation also skips a non-positive price ("and px"),
    #       so such a record passed every scenario check. Since the schema REQUIRES both current_price.value
    #       and each scenario's price_target, a benchmark move is always derivable for a valid record; the
    #       only way it is not is an unusable anchor, which is a defect to surface, not a metric to switch.
    # This is the failure mode CLAUDE.md §10 names ("a bull case the stock can clear on one ordinary
    # earnings print was never a bull case"); nothing ported even the bare check to the commodity swarm
    # when check_commodity_scenario_math was added.
    cur_span = doc.get("current_price")
    cur_val = cur_span.get("value") if isinstance(cur_span, dict) else None
    usable_anchor = isnum(cur_val) and cur_val > 0  # a benchmark % move needs a positive base to divide by
    bull_moves = []        # benchmark price move (%) of each nonzero-probability bull-labelled case
    bull_with_mass = False  # did any bull-labelled case carry real (nonzero) probability?
    for s in scen:
        if not isinstance(s, dict) or s.get("label") != "bull":
            continue
        if not (isnum(s.get("probability")) and s["probability"] > 0):
            continue  # zero-mass bull — the upside it claims to span carries no probability
        bull_with_mass = True
        tgt = s.get("price_target")
        if isnum(tgt) and usable_anchor:
            bull_moves.append((tgt - cur_val) / cur_val * 100.0)  # the benchmark move §10 measures
        # else: no usable benchmark move for this case — do NOT silently substitute the roll-adjusted
        # return_pct (refinement 4); the unusable-anchor branch below reports it once for the whole set.
    if "bull" in labels and not bull_with_mass:
        errs.append(
            "scenario set does not SPAN: every bull-labelled case carries zero probability, so the "
            "distribution assigns no mass to the upside and excludes one side of reality (CLAUDE.md §10 "
            "span check). Give the bull case real probability before computing the expected return."
        )
    elif bull_with_mass and not bull_moves:
        errs.append(
            f"scenario span is NOT ASSESSABLE: a bull case carries real probability but its benchmark "
            f"move cannot be derived — current_price.value={cur_val!r} is not a usable positive number, "
            f"or the bull case has no numeric price_target. §10's 'ordinary move of the current price' is "
            f"a benchmark move; the roll-adjusted return_pct is a different metric and must not be silently "
            f"substituted (CLAUDE.md §10 span check). Provide a positive current_price.value and a numeric "
            f"price_target before computing the expected return."
        )
    elif bull_moves:
        best_move = max(bull_moves)
        if best_move < SCENARIO_SPAN_MIN_BEST_PCT:
            errs.append(
                f"scenario set does not SPAN: the bull case's benchmark move is only {best_move:+.1f}%, "
                f"inside an ordinary move (<{SCENARIO_SPAN_MIN_BEST_PCT}%) for a liquidly-traded commodity "
                f"benchmark. No case in the set contains a real upside outcome, so the probability-weighted "
                f"return averages over a distribution that excludes one side of reality (CLAUDE.md §10 span "
                f"check). Widen the cases before computing the expected return."
            )

    psum = sum(probs)
    if abs(psum - 100) > 0.5:
        errs.append(f"scenario probabilities sum to {round(psum, 2)}, not 100 (§10)")

    calc_er = sum(p / 100.0 * r for p, r in zip(probs, rets))
    er = doc.get("expected_return_pct")
    if isnum(er):
        # Sign-aware AND relative-floor, exactly as eval.py check M: an absolute-only tolerance lets a
        # small-magnitude sign flip through, which is the error that most changes the call.
        signflip = abs(er) > 0.25 and abs(calc_er) > 0.25 and (er > 0) != (calc_er > 0)
        if abs(er - calc_er) > max(1.0, abs(calc_er) * 0.05) or signflip:
            errs.append(f"expected_return_pct={er} != Sum(p*ret)={round(calc_er, 2)} (§10 must reconcile)")
    elif post_gate:
        errs.append("scenarios[] present but expected_return_pct is missing/non-numeric — §10 requires the reconciled expected return")

    # downside_risk_pct is the BEAR case's own return, not a separately-authored number: two independent
    # statements of the same downside are two chances to disagree (§20 bad-math).
    bear_rets = [float(s["return_pct"]) for s in scen if isinstance(s, dict) and s.get("label") == "bear"]
    dr = doc.get("downside_risk_pct")
    if isnum(dr) and bear_rets and abs(dr - min(bear_rets)) > max(1.0, abs(min(bear_rets)) * 0.05):
        errs.append(f"downside_risk_pct={dr} != the bear scenario's return_pct={min(bear_rets)}")

    # risk_reward re-derived, never trusted — the same "a hand-typed number will not survive" contract the
    # expected_return / downside checks above already enforce, extended to the third leg of §10's triple.
    # The schema allows EITHER convention (expected_return/|downside|, OR the bull/bear return ratio), so a
    # value matching either is accepted; one matching neither is a hand-typed ratio that does not reconcile
    # with its own distribution. Sign-aware with the same relative floor as eval.py check M's rr subcheck.
    rr = doc.get("risk_reward")
    if isnum(rr) and bear_rets:
        bear = min(bear_rets)
        conv = []  # (name, value) for each derivable convention
        if bear != 0:
            conv.append(("expected_return/|downside|", calc_er / abs(bear)))
        if rets and min(rets) != 0:
            conv.append(("bull/bear", max(rets) / abs(min(rets))))

        def _rr_matches(c: float) -> bool:
            signflip = abs(rr) > 0.25 and abs(c) > 0.25 and (rr > 0) != (c > 0)
            return abs(rr - c) <= max(0.15, abs(c) * 0.12) and not signflip

        if conv and not any(_rr_matches(c) for _, c in conv):
            named = " nor ".join(f"{n}={round(c, 2)}" for n, c in conv)
            errs.append(f"risk_reward={rr} reconciles with neither §10 convention ({named}) — a hand-typed ratio")

    # §10 requires the full triple be STATED post-gate wherever a bear case exists (the same requirement the
    # expected_return_pct check above enforces, applied to the downside and the risk/reward): "risk/reward is
    # stated where a bear-case price exists", and the commodity dossier's bear fair value always is one. A
    # distribution that quantifies the mean but omits the downside/ratio is an incomplete forecast, not a
    # refusal to forecast (that escape hatch lives in the empty-scenarios branch above).
    if post_gate and bear_rets:
        if not isnum(dr):
            errs.append("scenarios[] present but downside_risk_pct is missing/non-numeric — §10 requires the stated downside where a bear case exists")
        if not isnum(rr):
            errs.append("scenarios[] present but risk_reward is missing/non-numeric — §10 requires risk/reward be stated where a bear-case price exists")

    # price_target must be present and numeric on ALL cases or none — a partial set silently skips the
    # strongest independent anchor (check M's own review fix).
    tgts = [s.get("price_target") for s in scen if isinstance(s, dict)]
    if any(t is not None for t in tgts) and not all(isnum(t) for t in tgts):
        errs.append("price_target present on some scenarios but not all numeric — cannot reconcile targets")

    # Cross-check each return against its own target and the record's own current price: the return and
    # the level are two views of one forecast, and a mismatch means one of them is wrong.
    cur = doc.get("current_price")
    px = cur.get("value") if isinstance(cur, dict) else None
    if isnum(px) and px and all(isnum(t) for t in tgts):
        for s, t in zip(scen, tgts):
            implied = (t - px) / px * 100.0
            stated = float(s["return_pct"])
            if abs(stated - implied) > max(1.5, abs(implied) * 0.05):
                errs.append(
                    f"scenario {s.get('scenario_id')!r}: return_pct={stated} disagrees with its own "
                    f"price_target {t} vs current_price {px} (implies {round(implied, 2)}%)"
                )

    # §10 falsification trigger + §8 conjunction honesty, per case.
    for s in scen:
        if not isinstance(s, dict):
            errs.append("scenarios[] contains a non-object entry")
            continue
        sid = s.get("scenario_id")
        if not (isinstance(s.get("invalidated_if"), str) and s["invalidated_if"].strip()):
            errs.append(f"scenario {sid!r} has no invalidated_if — §10 requires a falsification trigger per forecast")
        conds = s.get("conditions")
        if isinstance(conds, list) and len(conds) > 1:
            jpb = s.get("joint_probability_basis")
            if not (isinstance(jpb, str) and jpb.strip()):
                errs.append(
                    f"scenario {sid!r} joins {len(conds)} conditions but has no joint_probability_basis — "
                    "a conjunction is less likely than its parts and must say why it was priced as one"
                )
    return errs


def check_commodity_calibration_gate(doc_path: str) -> list[str]:
    """The commodity-scoped twin of eval.py's check AG (frameworks/DECISION_LEDGER.md §18): verifies
    99_commodity-thesis-synthesis.md did not silently skip reading back scripts/commodity_calibrate.py's
    own output — the exact same false-confidence hole check AG closed for the research swarm, now closed
    here before it can ever ship (unlike AI/AK, which the research swarm discovered only after a defect
    had already shipped). Forward-looking: N/A for any decision_date before COMMODITY_CALIBRATION_GATE_DATE.

    On/after COMMODITY_CALIBRATION_ERRTAX_DATE this also enforces the error-taxonomy trigger (the
    commodity-scoped twin of eval.py's AG_ERRTAX_DATE extension): every leading error_taxonomy_distribution
    category (count >= 2) in the as-of summary must carry a traceable, non-trivial defense in
    error_defense_evidence, or the admitted literal "no defense evidence found" — in which case it must
    also appear in leading_error_categories_flagged, which independently justifies status=='applied'
    alongside (never additive to) the original hit-rate trigger.

    This is a presence/consistency check, not a re-derivation of hit rates or a judgment on whether a
    written defense is TRUE — it cannot judge WHICH commodity slice or error category should have been
    flagged, only that the gate ran and recorded a status/shape consistent with what the as-of summary
    itself made possible."""
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
    errtax_gate = decision_date >= COMMODITY_CALIBRATION_ERRTAX_DATE
    # error_taxonomy_distribution is a flat, always-honest tally at ANY N (commodity/calibrate.md's own
    # narration: "never gated by the floor") — unlike the hit-rate slice, a Pre-data verdict does not
    # excuse skipping the error-taxonomy check once it has rolled out.
    lec = _commodity_leading_error_categories(summary) if errtax_gate else []
    if summary is None:
        expected = "not_available"
    elif verdict.startswith("Pre-data") and not lec:
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
    lecf = cf.get("leading_error_categories_flagged")
    ede = cf.get("error_defense_evidence")
    if status == "applied":
        hp, fs = cf.get("haircut_points"), cf.get("flagged_slices")
        # The haircut is a single FIXED constant, never "any positive number": decision_record.schema.json
        # pins haircut_points to "the fixed constant (8)" and 99_commodity-thesis-synthesis.md step 4 to
        # "a single fixed 8-point confidence haircut … never additive". Accepting any hp>0 let a malformed
        # record keep up to seven points of confidence while claiming 'applied' (Codex r3746510840 — P2);
        # this mirrors eval.py check AG's identical `hp==8` guard for the research-swarm twin.
        if not (isinstance(hp, (int, float)) and not isinstance(hp, bool) and hp == 8):
            errs.append(f"status='applied' but haircut_points={hp!r} is not the fixed 8-point constant "
                        f"(decision_record.schema.json: 'the fixed constant (8)'; synthesis step 4: 'a single fixed "
                        f"8-point confidence haircut … never additive' — mirrors eval.py check AG's hp==8)")
        if errtax_gate:
            fs_ok = isinstance(fs, list) and len(fs) > 0
            # A flagged category is only a traceable trigger if it names one the as-of summary's OWN
            # error_taxonomy_distribution is actually leading (count >= 2) right now — an unrelated or
            # stale entry must not grant a free pass (mirrors eval.py check AG's identical guard).
            lecf_str = [x for x in lecf if isinstance(x, str)] if isinstance(lecf, list) else []
            lecf_ok = any(x in lec for x in lecf_str)
            if not (fs_ok or lecf_ok):
                errs.append(f"status='applied' but neither flagged_slices={fs!r} nor "
                            f"leading_error_categories_flagged={lecf!r} is a non-empty/traceable list — the "
                            f"haircut must be traceable to a flagged commodity slice or a leading error-taxonomy category")
        elif not (isinstance(fs, list) and len(fs) > 0):
            errs.append(f"status='applied' but flagged_slices={fs!r} is empty/not a list")
    elif status in ("not_available", "pre_data", "checked_no_action"):
        # The schema pins haircut_points to "0 unless status=='applied'": a haircut only ever accompanies
        # an applied flag, so any non-zero value on a non-applied status is a malformed record silently
        # claiming a phantom haircut (Codex r3746510840 — the fixed-haircut twin of the applied hp==8 check).
        hp = cf.get("haircut_points")
        if not (isinstance(hp, (int, float)) and not isinstance(hp, bool) and hp == 0):
            errs.append(f"status={status!r} but haircut_points={hp!r} is not 0 — the schema pins "
                        f"haircut_points to '0 unless status==\"applied\"'")
    if status == "checked_no_action":
        fs = cf.get("flagged_slices")
        if isinstance(fs, list) and len(fs) > 0:
            errs.append(f"status='checked_no_action' but flagged_slices={fs!r} is non-empty")
        if errtax_gate and isinstance(lecf, list) and len(lecf) > 0:
            errs.append(f"status='checked_no_action' but leading_error_categories_flagged={lecf!r} is non-empty")
    if errtax_gate:
        # PRESENCE, on EVERY status (Gemini r3746502179 / Codex r3746510842 — P2). The synthesis record
        # shape (99_commodity-thesis-synthesis.md step 4 + decision_record.schema.json) carries
        # leading_error_categories_flagged and error_defense_evidence UNCONDITIONALLY once the extension is
        # live — {}/[] at minimum even for pre_data/not_available. Enforcing both present regardless of
        # status is what keeps a completed error-taxonomy check distinguishable from one silently skipped:
        # an absent field would otherwise pass identically to a present-and-empty one, and an 'applied'
        # record flagged via flagged_slices could omit the flagged-category list entirely. Real synthesizer
        # output always emits both keys, so this rejects only malformed records, never a clean run.
        if not isinstance(lecf, list):
            errs.append(f"on/after {COMMODITY_CALIBRATION_ERRTAX_DATE} calibration_feedback.leading_error_categories_flagged={lecf!r} "
                        f"is missing/not a list — the error-taxonomy trigger must prove it ran on every status by recording a "
                        f"list ([] when nothing flagged; a clean check must be distinguishable from a silently skipped one)")
        if not isinstance(ede, dict):
            errs.append(f"on/after {COMMODITY_CALIBRATION_ERRTAX_DATE} calibration_feedback.error_defense_evidence={ede!r} "
                        f"is missing/not an object — every run must record a defense-evidence object on every status "
                        f"(empty '{{}}' when no category is currently leading) to prove the error-taxonomy trigger ran")
        # Standalone structural validation of leading_error_categories_flagged — runs whenever the field
        # is present as a list at all, catching malformed values inside 'applied' too.
        if isinstance(lecf, list):
            non_str = [x for x in lecf if not isinstance(x, str)]
            if non_str:
                errs.append(f"leading_error_categories_flagged contains non-string entr{'y' if len(non_str)==1 else 'ies'} "
                            f"{non_str!r} — every flagged category must be a string naming an error_taxonomy_distribution key")
            bogus = [x for x in lecf if isinstance(x, str) and x not in lec]
            if bogus:
                errs.append(f"leading_error_categories_flagged includes {bogus!r} which "
                            f"{'is' if len(bogus)==1 else 'are'} not among the as-of summary's actual leading "
                            f"categories {lec!r} (count >= 2) — a flagged category must be one currently leading, "
                            f"not an unrelated or stale one")
        # Per-category defense consistency — only leading categories (count >= 2) need an entry, so this
        # only does real work for checked/applied (pre_data/not_available carry an empty `lec`). Runs
        # whenever error_defense_evidence is a dict, independent of status.
        if isinstance(ede, dict) and lec:
            flagged_set = set(x for x in lecf if isinstance(x, str)) if isinstance(lecf, list) else set()
            for cat in lec:
                val = ede.get(cat)
                val_s = val.strip().lower() if isinstance(val, str) else None
                admits_none = (val_s == "no defense evidence found")
                if cat in flagged_set:
                    if not admits_none:
                        errs.append(f"leading_error_categories_flagged includes {cat!r} but "
                                    f"error_defense_evidence[{cat!r}]={val!r} is not the literal 'no defense "
                                    f"evidence found' — a flagged category must admit it has no defense, not "
                                    f"carry a contradicting claim of one")
                else:
                    if val is None:
                        errs.append(f"leading error-taxonomy category {cat!r} (count >= 2) has no entry in "
                                    f"error_defense_evidence and is not in leading_error_categories_flagged — "
                                    f"the check must be provably run on every leading category")
                    elif admits_none:
                        errs.append(f"error_defense_evidence[{cat!r}]='no defense evidence found' but {cat!r} "
                                    f"is not in leading_error_categories_flagged — an admitted-no-defense "
                                    f"category must be flagged, not silently passed")
                    elif not (isinstance(val, str) and len(val.strip()) >= 20):
                        errs.append(f"error_defense_evidence[{cat!r}]={val!r} is not a concrete, non-trivial "
                                    f"defense statement (>= 20 chars) — a vague or empty entry is "
                                    f"indistinguishable from no defense and must be flagged instead")
    return errs


def _selftest_scenario_math() -> int:
    """Fixture-free truth table for check_commodity_scenario_math (CLAUDE.md §10). Same reason
    _selftest_calibration_gate exists: --fixture only sees the four committed PRE-gate commodity runs,
    which are all N/A, so every branch that actually enforces the math would ship untested and a future
    edit could silently disable it while CI stayed green. Expected values are pinned to §10 itself
    (probabilities sum to 100; expected return = Sum(p x ret); risk/reward stated where a bear price
    exists; a time window and a falsification trigger per forecast) — NOT to the checker's behaviour."""
    import tempfile

    failures = []

    def run(name, doc, want_accept):
        with tempfile.TemporaryDirectory() as d:
            dp = os.path.join(d, "rec.json")
            json.dump(doc, open(dp, "w"))
            errs = check_commodity_scenario_math(dp)
        if (len(errs) == 0) != want_accept:
            failures.append(f"{name} (want_accept={want_accept}, errs={errs[:2]})")

    GATE = COMMODITY_SCENARIO_GATE_DATE
    pre = (datetime.date.fromisoformat(GATE) - datetime.timedelta(days=1)).isoformat()
    post = (datetime.date.fromisoformat(GATE) + datetime.timedelta(days=4)).isoformat()

    def sc(sid, label, p, ret, tgt, **kw):
        b = {"scenario_id": sid, "label": label, "probability": p, "return_pct": ret,
             "price_target": tgt, "conditions": [f"{label} case holds"], "source": "cost-curve orb",
             "joint_probability_basis": None, "invalidated_if": f"{label} tripwire is observed"}
        b.update(kw)
        return b

    # price 100 -> targets 70/110/140 imply -30 / +10 / +40
    GOOD = [sc("bear-x", "bear", 25, -30.0, 70.0), sc("base-x", "base", 50, 10.0, 110.0), sc("bull-x", "bull", 25, 40.0, 140.0)]
    # E[r] = .25*-30 + .50*10 + .25*40 = -7.5 + 5 + 10 = 7.5
    def rec(**kw):
        b = {"swarm": "commodity", "commodity": "GOLD", "decision_date": post, "action": "Hold",
             "confidence": 50, "current_price": {"value": 100.0, "currency": "USD", "unit": "t", "as_of": post},
             "scenario_horizon_days": 120, "scenarios": [dict(s) for s in GOOD],
             "expected_return_pct": 7.5, "downside_risk_pct": -30.0, "risk_reward": 0.25}
        b.update(kw)
        return b

    # ---- forward-looking N/A + malformed root ----
    run("pre-gate record with no scenarios -> N/A", {"decision_date": pre, "action": "Hold"}, True)
    run("pre-gate record with a quantified return but no scenarios -> still N/A",
        {"decision_date": pre, "expected_return_pct": 12.0}, True)
    run("post-gate record with NO quantified return -> allowed (refusing to forecast is valid, §11/§24)",
        {"decision_date": post, "action": "Research More"}, True)
    run("post-gate record quantifying a return with no scenarios[] -> FAIL",
        {"decision_date": post, "expected_return_pct": 12.0}, False)
    run("non-object root -> reported, never crashes", [], False)

    # ---- the arithmetic ----
    run("well-formed distribution -> accept", rec(), True)
    run("probabilities that do not sum to 100 -> FAIL",
        rec(scenarios=[sc("bear-x", "bear", 25, -30.0, 70.0), sc("base-x", "base", 50, 10.0, 110.0), sc("bull-x", "bull", 40, 40.0, 140.0)]), False)
    run("expected_return_pct disagreeing with Sum(p*ret) -> FAIL", rec(expected_return_pct=18.0), False)
    run("expected_return_pct within tolerance -> accept", rec(expected_return_pct=7.9), True)
    # The failure an absolute-only tolerance lets through, and the one that most changes the call: the
    # distribution says the trade loses (-0.4) and the headline says it wins (+0.4). The gap is 0.8pp, so
    # a plain 1.0pp tolerance accepts it; only the sign-aware arm catches it.
    run("small-magnitude SIGN FLIP -> FAIL",
        rec(scenarios=[sc("bear-x", "bear", 50, -2.0, 98.0), sc("base-x", "base", 30, 1.0, 101.0), sc("bull-x", "bull", 20, 1.5, 101.5)],
            expected_return_pct=0.4, downside_risk_pct=-2.0), False)
    run("downside_risk_pct that is not the bear case's own return -> FAIL", rec(downside_risk_pct=-12.0), False)
    run("return_pct disagreeing with its own price_target -> FAIL",
        rec(scenarios=[sc("bear-x", "bear", 25, -30.0, 70.0), sc("base-x", "base", 50, 10.0, 155.0), sc("bull-x", "bull", 25, 40.0, 140.0)]), False)
    run("price_target on some scenarios but not all -> FAIL",
        rec(scenarios=[sc("bear-x", "bear", 25, -30.0, 70.0), sc("base-x", "base", 50, 10.0, None), sc("bull-x", "bull", 25, 40.0, 140.0)]), False)

    # ---- §10 structure ----
    run("missing scenario_horizon_days -> FAIL (no time window)", rec(scenario_horizon_days=None), False)
    run("a case with no invalidated_if -> FAIL (no falsification trigger)",
        rec(scenarios=[sc("bear-x", "bear", 25, -30.0, 70.0), sc("base-x", "base", 50, 10.0, 110.0), sc("bull-x", "bull", 25, 40.0, 140.0, invalidated_if="  ")]), False)
    run("duplicate scenario_id -> FAIL",
        rec(scenarios=[sc("dup", "bear", 25, -30.0, 70.0), sc("dup", "base", 50, 10.0, 110.0), sc("bull-x", "bull", 25, 40.0, 140.0)]), False)
    run("no bull case -> FAIL (the distribution must span the band)",
        rec(scenarios=[sc("bear-x", "bear", 25, -30.0, 70.0), sc("base-x", "base", 50, 10.0, 110.0), sc("base-y", "base", 25, 40.0, 140.0)]), False)
    # The GOLD-miss shape (CLAUDE.md §10): a set that reconciles perfectly (probabilities sum to 100,
    # expected_return_pct = Sum(p*ret), risk_reward re-derives) but whose best case never clears an
    # ordinary move. Every other §10 leg is deliberately clean here so this isolates the SPAN check alone.
    run("bull case inside an ordinary move -> FAIL (§10 span)",
        rec(scenarios=[sc("bear-x", "bear", 25, -3.0, 97.0), sc("base-x", "base", 50, 1.0, 101.0), sc("bull-x", "bull", 25, 3.0, 103.0)],
            expected_return_pct=0.5, downside_risk_pct=-3.0, risk_reward=0.167), False)
    # §10 span, refinement (2) — Codex r3742531399: a mislabeled BASE with a larger move than the bull
    # must not discharge the bull's own span obligation. Here base is +10% but the labelled bull is only
    # +3% (inside an ordinary move); a bare max(return_pct) accepts this (base rescues it), the bull's own
    # benchmark move rejects it. Every other §10 leg reconciles (E[r]=.25*-5+.5*10+.25*3=4.5).
    run("bull inside an ordinary move but base carries a larger move -> FAIL (§10 span, not rescued by max)",
        rec(scenarios=[sc("bear-x", "bear", 25, -5.0, 95.0), sc("base-x", "base", 50, 10.0, 110.0), sc("bull-x", "bull", 25, 3.0, 103.0)],
            expected_return_pct=4.5, downside_risk_pct=-5.0, risk_reward=0.9), False)
    # §10 span, refinement (3) — Codex r3742531401: a +40% bull carrying ZERO probability places no mass
    # on the upside, so the distribution still excludes it. A bare max(return_pct) accepts this (40>=5);
    # requiring the spanning case to carry probability rejects it. E[r]=0*40+.6*2+.4*-10=-2.8, rr=bull/bear=4.0.
    run("bull at +40% but with zero probability -> FAIL (§10 span, no mass on the upside)",
        rec(scenarios=[sc("bear-x", "bear", 40, -10.0, 90.0), sc("base-x", "base", 60, 2.0, 102.0), sc("bull-x", "bull", 0, 40.0, 140.0)],
            expected_return_pct=-2.8, downside_risk_pct=-10.0, risk_reward=4.0), False)
    # §10 span, refinement (1) — Codex r3742531404, backwardation false-PASS: return_pct is roll-adjusted,
    # so a bull whose BENCHMARK move is only +4.5% (target 104.5, inside an ordinary move) can carry a
    # +5.5% roll-adjusted return. The 1.0pt gap clears the existing return/target tolerance (max(1.5,..)),
    # so a bare max(return_pct)=5.5 accepts it; the benchmark move (+4.5%) rejects it. E[r]=.30*-4+.45*1+.25*5.5=0.625.
    run("bull's roll-adjusted return clears 5% but its benchmark move does not -> FAIL (§10 span, measured on the benchmark)",
        rec(scenarios=[sc("bear-x", "bear", 30, -4.0, 96.0), sc("base-x", "base", 45, 1.0, 101.0), sc("bull-x", "bull", 25, 5.5, 104.5)],
            expected_return_pct=0.625, downside_risk_pct=-4.0, risk_reward=0.156), False)
    # §10 span, refinement (1) — the contango false-FAIL the same fix removes: a bull whose BENCHMARK move
    # is +6% (target 106, a real move that DOES span) nets to a +4.7% roll-adjusted return after contango.
    # A bare max(return_pct)=4.7 wrongly REJECTS a genuinely spanning set; the benchmark move (+6%) accepts
    # it. E[r]=.25*-6+.5*1+.25*4.7=0.175. Confirms the fix does not just tighten — it corrects both signs.
    run("bull's benchmark move spans (+6%) though contango nets its return to +4.7% -> ACCEPT (§10 span, measured on the benchmark)",
        rec(scenarios=[sc("bear-x", "bear", 25, -6.0, 94.0), sc("base-x", "base", 50, 1.0, 101.0), sc("bull-x", "bull", 25, 4.7, 106.0)],
            expected_return_pct=0.175, downside_risk_pct=-6.0, risk_reward=0.03), True)
    # §10 span, refinement (4) — Codex r3742876382: an UNUSABLE benchmark anchor must be rejected, not
    # silently swapped for the roll-adjusted return_pct. current_price.value is a bare number with no
    # positive minimum, so value 0 is schema-legal; the benchmark % move (t-0)/0 is undefined, and the
    # downstream return↔target reconciliation also skips a non-positive price ("and px"), so the old
    # return_pct fallback let a +40% roll-adjusted bull pass every check. Here every other §10 leg
    # reconciles (E[r]=.40*-10+.35*2+.25*40=6.7, downside=bear -10, rr=6.7/10=0.67); only the anchor is
    # broken. Old code: cur_val>0 is False -> fallback max(return_pct)=40 >= 5 -> ACCEPTS (the bug). New
    # code: no derivable benchmark move for a bull with mass -> "span NOT ASSESSABLE" -> REJECTS.
    # (A negative current_price.value is caught by the same cur_val>0 guard; it is not a separate red-on-
    # old case because the negative-price return↔target reconciliation already rejects it on old code too.)
    run("bull with mass but current_price.value is 0 (unusable anchor) -> FAIL (§10 span, not assessable)",
        rec(current_price={"value": 0.0, "currency": "USD", "unit": "t", "as_of": post},
            scenarios=[sc("bear-x", "bear", 40, -10.0, 90.0), sc("base-x", "base", 35, 2.0, 102.0), sc("bull-x", "bull", 25, 40.0, 1.0)],
            expected_return_pct=6.7, downside_risk_pct=-10.0, risk_reward=0.67), False)
    run("conjunction of independent conditions with no joint_probability_basis -> FAIL",
        rec(scenarios=[sc("bear-x", "bear", 25, -30.0, 70.0), sc("base-x", "base", 50, 10.0, 110.0),
                       sc("bull-x", "bull", 25, 40.0, 140.0, conditions=["real yields fall below 1.5%", "ETF flows turn positive 3 weeks running"])]), False)
    run("the same conjunction WITH a basis -> accept",
        rec(scenarios=[sc("bear-x", "bear", 25, -30.0, 70.0), sc("base-x", "base", 50, 10.0, 110.0),
                       sc("bull-x", "bull", 25, 40.0, 140.0, conditions=["real yields fall below 1.5%", "ETF flows turn positive 3 weeks running"],
                          joint_probability_basis="Both follow from one Fed pivot; they are not independent draws.")]), True)
    # A pre-gate record that VOLUNTARILY ships scenarios[] is asserting the math and is held to it.
    run("pre-gate record that ships a BROKEN distribution -> still FAIL (shipping it is asserting it)",
        rec(decision_date=pre, expected_return_pct=18.0), False)

    # ---- §10's third leg: risk_reward re-derived, and the full triple required post-gate ----
    # rec()'s risk_reward is 0.25 = expected_return(7.5)/|downside(30)|. A value matching neither §10
    # convention (0.25 = expected_return/|downside|, 1.33 = bull/bear 40/30) is a hand-typed ratio and
    # must NOT survive — the exact hole that let risk_reward drift from its own distribution.
    run("hand-typed risk_reward matching neither §10 convention -> FAIL", rec(risk_reward=99.0), False)
    # The schema permits the bull/bear ratio as the alternate convention — a record stating it that way
    # must still be accepted, so the re-derivation is convention-tolerant, not over-strict.
    run("risk_reward stated as the bull/bear ratio (the schema's other convention) -> accept", rec(risk_reward=1.33), True)
    # §10 requires risk/reward be STATED where a bear case exists; a post-gate distribution may not quantify
    # the mean and leave the downside or the ratio blank (mirrors the expected_return_pct requirement).
    run("post-gate scenarios present but risk_reward omitted -> FAIL", rec(risk_reward=None), False)
    run("post-gate scenarios present but downside_risk_pct omitted -> FAIL", rec(downside_risk_pct=None), False)

    if failures:
        for f in failures:
            print(f"SELFTEST FAIL — {f}")
        return 1
    print("SELFTEST OK — check_commodity_scenario_math truth table (30 branches) matches the §10 contract")
    return 0


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

    On/after COMMODITY_CALIBRATION_ERRTAX_DATE it also pins the error-taxonomy trigger (leading
    error_taxonomy_distribution categories, error_defense_evidence, leading_error_categories_flagged) —
    same reason: --fixture's four pre-gate runs predate both extensions, so these branches would ship
    untested by CI without this table.
    """
    import tempfile

    global REPO
    old_repo = REPO
    failures = []
    # Counted, never hand-written: a literal in the summary line drifts the moment a branch is added
    # (it read "38" while the table held 32, then again while it held 39), which quietly turns the one
    # number a reviewer checks into the least trustworthy thing printed.
    executed = 0

    def run(name, doc, want_accept, summaries=None):
        nonlocal executed
        executed += 1
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
    post = (datetime.date.fromisoformat(GATE) + datetime.timedelta(days=4)).isoformat()  # >= gate, < errtax gate
    post_errtax = (datetime.date.fromisoformat(COMMODITY_CALIBRATION_ERRTAX_DATE) + datetime.timedelta(days=2)).isoformat()  # >= errtax gate

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

    # ── Error-taxonomy extension (COMMODITY_CALIBRATION_ERRTAX_DATE) ──
    DEF_REAL = "the supply-security synthesis names the specific policy check that guards against this exact miss recurring"
    real_hitflag_defended = {f"{pre}_calibration_summary.json": {
        "verdict": "12 decisive resolved calls · hit-rate 55%.",
        "calibration_by_commodity": {"GOLD": {"hit_rate": 0.3, "n": 6}},  # flags GOLD (hit-rate trigger)
        "error_taxonomy_distribution": {"bad base rate": 3, "timing error": 1}}}  # only "bad base rate" leads
    real_no_hitflag = {f"{pre}_calibration_summary.json": {
        "verdict": "12 decisive resolved calls · hit-rate 55%.",
        "calibration_by_commodity": {"GOLD": {"hit_rate": 0.6, "n": 6}},  # does NOT flag GOLD
        "error_taxonomy_distribution": {"bad base rate": 3, "timing error": 1}}}
    real_no_errtax_lead = {f"{pre}_calibration_summary.json": {
        "verdict": "12 decisive resolved calls · hit-rate 55%.",
        "calibration_by_commodity": {"GOLD": {"hit_rate": 0.6, "n": 6}},
        "error_taxonomy_distribution": {"timing error": 1}}}  # no category >= 2
    predata_no_lead = {f"{pre}_calibration_summary.json": {
        "verdict": "Pre-data — 3 of 10 decisive resolved calls needed.",
        "calibration_by_commodity": {}, "error_taxonomy_distribution": {"timing error": 1}}}
    predata_with_lead = {f"{pre}_calibration_summary.json": {
        "verdict": "Pre-data — 3 of 10 decisive resolved calls needed.",
        "calibration_by_commodity": {}, "error_taxonomy_distribution": {"bad base rate": 2}}}

    def rec_e(**kw):
        return rec(decision_date=post_errtax, **kw)

    # Backward compatibility: before COMMODITY_CALIBRATION_ERRTAX_DATE, the two new fields may be
    # entirely absent and the original hit-rate-only contract still governs (already exercised above via
    # `post`/`real`/`predata`, which never set the new fields — this just makes the intent explicit).
    run("pre-errtax date, applied via hit-rate trigger only, no errtax fields -> accept",
        rec(calibration_feedback=cf(status="applied", haircut_points=8, flagged_slices=["GOLD"], source_summary="s")), True, real)

    # Errtax trigger fires ALONGSIDE a fired hit-rate trigger: GOLD flagged (fs non-empty) AND a leading
    # category exists but is genuinely (>=20 char) defended — not flagged. status='applied' is traceable
    # via flagged_slices alone; error_defense_evidence for the leading category must still be present+real.
    run("errtax: hit-rate flags GOLD, leading category genuinely defended -> accept",
        rec_e(calibration_feedback=cf(status="applied", haircut_points=8, flagged_slices=["GOLD"],
                                       leading_error_categories_flagged=[],
                                       error_defense_evidence={"bad base rate": DEF_REAL}, source_summary="s")),
        True, real_hitflag_defended)

    # Errtax trigger fires ALONE (hit-rate does not flag GOLD): an admitted "no defense evidence found"
    # for the leading category must independently justify status='applied' even with flagged_slices=[].
    run("errtax: hit-rate clean, leading category admits no defense -> applied via errtax alone -> accept",
        rec_e(calibration_feedback=cf(status="applied", haircut_points=8, flagged_slices=[],
                                       leading_error_categories_flagged=["bad base rate"],
                                       error_defense_evidence={"bad base rate": "no defense evidence found", "timing error": DEF_REAL},
                                       source_summary="s")),
        True, real_no_hitflag)
    run("errtax: same as above but forgot to flag the admitted-no-defense category -> reject",
        rec_e(calibration_feedback=cf(status="applied", haircut_points=8, flagged_slices=[],
                                       leading_error_categories_flagged=[],
                                       error_defense_evidence={"bad base rate": "no defense evidence found", "timing error": DEF_REAL},
                                       source_summary="s")),
        False, real_no_hitflag)

    # checked_no_action: no leading category at all -> leading_error_categories_flagged=[] + ede={} accept.
    run("errtax: checked_no_action, no leading category -> accept",
        rec_e(calibration_feedback=cf(status="checked_no_action", leading_error_categories_flagged=[],
                                       error_defense_evidence={}, source_summary="s")),
        True, real_no_errtax_lead)
    # PRESENCE, not just emptiness: an absent leading_error_categories_flagged must not pass identically
    # to a present-and-empty one (the field itself is the proof the trigger ran).
    run("errtax: checked_no_action, leading_error_categories_flagged absent -> reject",
        rec_e(calibration_feedback=cf(status="checked_no_action", error_defense_evidence={}, source_summary="s")),
        False, real_no_errtax_lead)
    run("errtax: checked_no_action, leading_error_categories_flagged non-empty -> reject",
        rec_e(calibration_feedback=cf(status="checked_no_action", leading_error_categories_flagged=["bad base rate"],
                                       error_defense_evidence={"bad base rate": "no defense evidence found"}, source_summary="s")),
        False, real_no_hitflag)

    # Pre-data-but-errtax-active: a leading category exists even though the overall verdict is Pre-data,
    # so status must NOT stay 'pre_data' — it must resolve via the errtax trigger like any other check.
    # Post-extension the record shape carries both fields on EVERY status ({}/[]), including pre_data.
    run("errtax: Pre-data verdict, no leading category, fields present -> pre_data accept",
        rec_e(calibration_feedback=cf(status="pre_data", leading_error_categories_flagged=[],
                                       error_defense_evidence={}, source_summary="s")), True, predata_no_lead)
    # PRESENCE on pre_data too (Codex r3746510842): a post-gate pre_data record that omits both new fields
    # is a silently-skipped error-taxonomy check, indistinguishable from one that ran and found nothing.
    run("errtax: Pre-data verdict, errtax fields entirely absent -> reject",
        rec_e(calibration_feedback=cf(status="pre_data", source_summary="s")), False, predata_no_lead)
    run("errtax: Pre-data verdict WITH leading category, status still 'pre_data' -> reject",
        rec_e(calibration_feedback=cf(status="pre_data", source_summary="s")), False, predata_with_lead)
    run("errtax: Pre-data verdict WITH leading category, genuinely defended, checked_no_action -> accept",
        rec_e(calibration_feedback=cf(status="checked_no_action", leading_error_categories_flagged=[],
                                       error_defense_evidence={"bad base rate": DEF_REAL}, source_summary="s")),
        True, predata_with_lead)

    # Structural validation of leading_error_categories_flagged, independent of status. This fixture MUST
    # isolate the non-string element check (Codex r3746510846 — P2): a 'checked_no_action' record with a
    # non-empty list is already rejected by the "must be empty" rule, so it would stay red even if the
    # element-type check were deleted. Use status='applied' with a SEPARATE valid flagged_slices trigger
    # (GOLD, flagged by hit-rate) and a well-formed error_defense_evidence for the leading category, so the
    # ONLY thing that can reject this record is the non-string entry in leading_error_categories_flagged.
    run("errtax: applied (traceable via flagged_slices), leading_error_categories_flagged has a non-string entry -> reject",
        rec_e(calibration_feedback=cf(status="applied", haircut_points=8, flagged_slices=["GOLD"],
                                       leading_error_categories_flagged=[{"category": "bad base rate"}],
                                       error_defense_evidence={"bad base rate": DEF_REAL}, source_summary="s")),
        False, real_hitflag_defended)
    run("errtax: leading_error_categories_flagged names a category that is not actually leading -> reject",
        rec_e(calibration_feedback=cf(status="applied", haircut_points=8, flagged_slices=[],
                                       leading_error_categories_flagged=["timing error"],  # count=1, not leading
                                       error_defense_evidence={"bad base rate": DEF_REAL, "timing error": "no defense evidence found"},
                                       source_summary="s")),
        False, real_hitflag_defended)
    # The case above rejects on the 'applied' traceability rule (flagged_slices=[] AND no traceable
    # category), so it never reaches the standalone bogus-entry check. Isolate that check: make 'applied'
    # already traceable via a non-empty flagged_slices, and pair one genuinely leading category with a
    # fabricated one. Only the standalone rule can object here — without this branch, deleting it entirely
    # leaves the truth table green.
    run("errtax: applied traceable via flagged_slices, but a fabricated category rides along -> reject",
        rec_e(calibration_feedback=cf(status="applied", haircut_points=8, flagged_slices=["GOLD"],
                                       leading_error_categories_flagged=["bad base rate", "invented category"],
                                       error_defense_evidence={"bad base rate": "no defense evidence found"},
                                       source_summary="s")),
        False, real_hitflag_defended)

    # error_defense_evidence presence + consistency.
    run("errtax: error_defense_evidence entirely missing while a leading category exists -> reject",
        rec_e(calibration_feedback=cf(status="checked_no_action", leading_error_categories_flagged=[], source_summary="s")),
        False, real_hitflag_defended)
    run("errtax: leading category has no error_defense_evidence entry at all -> reject",
        rec_e(calibration_feedback=cf(status="checked_no_action", leading_error_categories_flagged=[],
                                       error_defense_evidence={"timing error": DEF_REAL}, source_summary="s")),
        False, real_hitflag_defended)
    run("errtax: defense text under 20 chars -> reject (indistinguishable from no defense)",
        rec_e(calibration_feedback=cf(status="checked_no_action", leading_error_categories_flagged=[],
                                       error_defense_evidence={"bad base rate": "fixed it"}, source_summary="s")),
        False, real_hitflag_defended)
    run("errtax: category admits no defense but is not in leading_error_categories_flagged -> reject",
        rec_e(calibration_feedback=cf(status="checked_no_action", leading_error_categories_flagged=[],
                                       error_defense_evidence={"bad base rate": "no defense evidence found"}, source_summary="s")),
        False, real_hitflag_defended)

    # PRESENCE on 'applied' too (Gemini r3746502179 / Codex r3746510842): an applied record traceable via
    # flagged_slices that OMITS leading_error_categories_flagged silently passed before this fix — the
    # error-taxonomy check is indistinguishable from one never run. ede is present here, so ONLY the
    # missing leading_error_categories_flagged can reject it.
    run("errtax: applied via flagged_slices but leading_error_categories_flagged absent -> reject",
        rec_e(calibration_feedback=cf(status="applied", haircut_points=8, flagged_slices=["GOLD"],
                                       error_defense_evidence={"bad base rate": DEF_REAL}, source_summary="s")),
        False, real_hitflag_defended)

    # Fixed 8-point haircut (Codex r3746510840): 'applied' must carry EXACTLY 8, not any positive number.
    # haircut_points=5 passed the old `hp>0` check while keeping three points of confidence — now rejected.
    run("errtax: applied with haircut_points=5 (positive but not the fixed 8) -> reject",
        rec_e(calibration_feedback=cf(status="applied", haircut_points=5, flagged_slices=["GOLD"],
                                       leading_error_categories_flagged=[],
                                       error_defense_evidence={"bad base rate": DEF_REAL}, source_summary="s")),
        False, real_hitflag_defended)
    # ...and a non-applied status must carry haircut_points==0 (schema: "0 unless status=='applied'").
    run("errtax: checked_no_action with a non-zero haircut_points -> reject",
        rec_e(calibration_feedback=cf(status="checked_no_action", haircut_points=3, leading_error_categories_flagged=[],
                                       error_defense_evidence={}, source_summary="s")),
        False, real_no_errtax_lead)

    # not_available on/after the errtax gate still carries the two fields ({}/[]) — contract: "no calibration
    # summary exists at all: status='not_available' … error_defense_evidence = {}". Present -> accept; absent -> reject.
    run("errtax: not_available (no as-of summary), fields present -> accept",
        rec_e(calibration_feedback=cf(status="not_available", leading_error_categories_flagged=[],
                                       error_defense_evidence={})), True)
    run("errtax: not_available (no as-of summary), errtax fields absent -> reject",
        rec_e(calibration_feedback=cf(status="not_available")), False)

    if failures:
        print("SELFTEST FAIL (calibration gate):")
        for f in failures:
            print(f"   - {f}")
        return 1
    print(f"SELFTEST OK — check_commodity_calibration_gate truth table ({executed} branches) matches the §18 contract")
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
    if len(argv) in (3, 4) and argv[1] == "--commodity-prearchive":
        frozen_only = len(argv) == 4 and argv[2] == "--frozen-only"
        if len(argv) == 4 and not frozen_only:
            print(__doc__)
            return 2
        doc_path = argv[-1]
        if frozen_only:
            schema_path = os.path.join(REPO, "frameworks", "commodity", "decision_record.schema.json")
            errors = validate(schema_path, doc_path) + check_commodity_data_needs_v2(
                doc_path, enforce_live_roster=False
            )
        else:
            errors = validate_commodity_prearchive(doc_path)
        if errors:
            print("COMMODITY-PREARCHIVE: FAIL")
            for error in errors[:20]:
                print(f"   - {error}")
            return 1
        print("COMMODITY-PREARCHIVE: PASS")
        return 0
    if len(argv) >= 2 and argv[1] == "--selftest":
        calibration_result = _selftest_calibration_gate()
        scenario_result = _selftest_scenario_math()
        primitive_result = _selftest_schema_primitives()
        return 1 if calibration_result or scenario_result or primitive_result else 0
    if len(argv) >= 2 and argv[1] == "--fixture":
        pairs = [(os.path.join(REPO, s), os.path.join(REPO, d)) for s, d in FIXTURE_PAIRS]
        pairs += [(os.path.join(REPO, THESIS_INTEGRITY_SCHEMA), os.path.join(REPO, d)) for d in screener_integrity_reviews()]
        pairs += [(os.path.join(REPO, COMMODITY_SCHEMA), os.path.join(REPO, d)) for d in commodity_decision_records()]
        pairs += [(os.path.join(REPO, COMMODITY_SCHEMA), os.path.join(REPO, d)) for d in commodity_archived_decision_records()]
        pairs += [(os.path.join(REPO, COMMODITY_REVIEW_SCHEMA), os.path.join(REPO, d)) for d in commodity_decision_reviews()]
        pairs += [(os.path.join(REPO, COMMODITY_SIGNAL_SCHEMA), os.path.join(REPO, d)) for d in commodity_signal_evidence()]
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
            if f"{os.sep}decisions{os.sep}" in os.path.abspath(doc_p):
                # An old immutable snapshot is validated only against evidence frozen beside it.
                # Run-level routing, current coverage and current signal projection are intentionally
                # excluded: applying today's mutable artifacts would break point-in-time replay.
                errs = (
                    errs
                    + check_commodity_data_needs_v2(doc_p)
                    + check_commodity_dual_horizon(doc_p)
                    + check_commodity_archived_snapshot(doc_p)
                )
            else:
                errs = (
                    errs
                    + check_commodity_routing(doc_p)
                    + check_commodity_data_sufficiency(doc_p)
                    + check_commodity_calibration_gate(doc_p)
                    + check_commodity_data_needs_v2(doc_p)
                    + check_commodity_scenario_math(doc_p)
                    + check_commodity_dual_horizon(doc_p)
                    + check_commodity_decision_archive(doc_p)
                    + check_commodity_signal_projection(doc_p)
                )
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
