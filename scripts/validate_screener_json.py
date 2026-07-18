#!/usr/bin/env python3
"""Dependency-free JSON Schema checker for the screener and commodity swarms' schemas
(draft-07 subset).

The schemas use a deliberate subset of JSON Schema: type, required, properties,
items, enum, const, minimum/maximum, minItems/maxItems, minLength/maxLength, pattern,
$ref (#/definitions/...), and allOf with if/then/else. This validator covers exactly that
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

import glob
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TYPES = {
    "object": dict, "array": list, "string": str, "integer": int,
    "number": (int, float), "boolean": bool, "null": type(None),
}


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

        if isinstance(doc, (int, float)) and not isinstance(doc, bool):
            if "minimum" in node and doc < node["minimum"]:
                self.err(path, f"{doc} < minimum {node['minimum']}")
            if "maximum" in node and doc > node["maximum"]:
                self.err(path, f"{doc} > maximum {node['maximum']}")

        if isinstance(doc, list):
            if "minItems" in node and len(doc) < node["minItems"]:
                self.err(path, f"fewer than minItems {node['minItems']}")
            if "maxItems" in node and len(doc) > node["maxItems"]:
                self.err(path, f"more than maxItems {node['maxItems']}")
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
            if isinstance(ap, dict):
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


def validate(schema_path: str, doc_path: str) -> list[str]:
    schema = json.load(open(schema_path, encoding="utf-8"))
    doc = json.load(open(doc_path, encoding="utf-8"))
    c = Checker(schema)
    c.check(schema, doc, "")
    return c.errors


FIXTURE_PAIRS = [
    ("frameworks/screener/intake.schema.json", "screener/runs/SIG-20260610-a3f2c81d/intake.json"),
    ("frameworks/screener/signal_payload.schema.json", "screener/runs/SIG-20260610-a3f2c81d/signal_payload.json"),
    ("frameworks/screener/thesis_record.schema.json", "screener/runs/SIG-20260610-a3f2c81d/thesis_record.json"),
    ("frameworks/screener/candidates.schema.json", "screener/runs/SIG-20260610-a3f2c81d/candidates.json"),
    ("frameworks/screener/board_index.schema.json", "screener/board/index.json"),
]

COMMODITY_SCHEMA = "frameworks/commodity/decision_record.schema.json"
COMMODITY_REVIEW_SCHEMA = "frameworks/commodity/decision_review.schema.json"
REVIEW_WINDOW_DAYS = {"30d": 30, "90d": 90, "180d": 180, "365d": 365}
COMMODITY_DOSSIER = "commodity-thesis/99_commodity-thesis-synthesis.md"
COMMODITY_TRIAGE = "market-structure/00_commodity-triage.md"
ROUTING_ACTION_RE = re.compile(r"##\s*Routing[\s\S]*?^Action:\s*(.+)$", re.MULTILINE)
TRIAGE_VERDICT_RE = re.compile(r"\*\*Verdict:\*\*\s*(Sufficient|Partial|Insufficient)\b")


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

    It also enforces the anchor/outcome integrity the learning loop depends on: reference_price
    must equal the frozen current_price (never re-derived), one risk_result per original key_risk,
    and a scheduled window must genuinely be that far out. Malformed inputs (a non-object JSON, a
    null date) report a graceful error instead of crashing the validator."""
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
    # review_date cannot predate the decision (None-safe: schema catches wrong/absent types)
    review_date = doc.get("review_date")
    original_date = doc.get("original_decision_date")
    if isinstance(review_date, str) and isinstance(original_date, str) and review_date < original_date:
        errs.append(f"review_date {review_date!r} predates original_decision_date {original_date!r}")
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
    # one risk_result per original key_risk — an empty array would skip the falsification checks
    # the review exists to run (each key_risk must be resolved materialized/not/partial/pending)
    rr = doc.get("risk_results")
    kr = record.get("key_risks")
    if isinstance(rr, list) and isinstance(kr, list) and len(rr) != len(kr):
        errs.append(
            f"risk_results has {len(rr)} entr{'y' if len(rr) == 1 else 'ies'} but decision_record key_risks "
            f"has {len(kr)} — the schema requires exactly one risk_result per key_risk"
        )
    # a scheduled window (30d/90d/180d/365d) must genuinely be that far out; an early file would
    # otherwise mark the real checkpoint as already reviewed — an early honest check-in is 'ad-hoc'
    window = doc.get("review_window")
    if isinstance(window, str) and window in REVIEW_WINDOW_DAYS \
            and isinstance(review_date, str) and isinstance(original_date, str):
        try:
            import datetime
            elapsed = (datetime.date.fromisoformat(review_date) - datetime.date.fromisoformat(original_date)).days
        except ValueError:
            elapsed = None
        if elapsed is not None and elapsed < REVIEW_WINDOW_DAYS[window]:
            errs.append(
                f"review_window {window!r} but only {elapsed}d elapsed since original_decision_date — "
                f"a scheduled window must be at least {REVIEW_WINDOW_DAYS[window]}d out; "
                f"record an early check as review_window 'ad-hoc'"
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


def main(argv: list[str]) -> int:
    if len(argv) >= 2 and argv[1] == "--fixture":
        pairs = [(os.path.join(REPO, s), os.path.join(REPO, d)) for s, d in FIXTURE_PAIRS]
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
            errs = errs + check_commodity_routing(doc_p) + check_commodity_data_sufficiency(doc_p)
        if os.path.abspath(schema_p) == os.path.abspath(os.path.join(REPO, COMMODITY_REVIEW_SCHEMA)):
            errs = errs + check_commodity_review_anchors(doc_p)
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
