#!/usr/bin/env python3
"""Dependency-neutral shared rules for versioned decision data needs.

Historical validation must not bind an immutable decision to today's mutable orb roster.  The pure text
rules below are safe to replay forever; `check_live_orb_routes` is intentionally a publication-time gate.
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
from typing import Any


DATA_NEED_URL_RE = re.compile(
    r"(?:\b[a-z][a-z0-9+.-]{1,31}://\S+|\bwww\.\S+|"
    r"\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{2,5})?(?:/[^\s]*)?|"
    r"\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+"
    r"[a-z]{2,63}(?::\d{2,5})?(?:/[^\s]*)?)",
    re.IGNORECASE,
)

_DECISION_LABEL = (
    r"(?:Strong\s+Buy|Buy|Hold|Trim|Avoid|Starter\s+Position\s+Only|Watchlist|Short\s+Candidate|"
    r"Pair\s+Trade(?:\s*/\s*Hedge\s+Required)?|Insufficient\s+Data(?:\s*[—-]\s*Refuse\s+To\s+Rate)?|"
    r"Research\s+More)"
)
_PROMISE_WORD = r"(?:guarantee(?:d|s|ing)?|assure(?:d|s|ing)?|ensure(?:d|s|ing)?|promis(?:e|es|ed|ing)|certainly)"
_INVESTMENT_CONFIDENCE = r"(?<!consumer\s)(?<!business\s)(?<!survey\s)confidence"
_INVESTMENT_MEASURE = r"(?:conviction|" + _INVESTMENT_CONFIDENCE + r"|score)"
_INVESTMENT_RATING = (
    r"(?<!credit\s)(?<!issuer\s)(?<!sovereign\s)(?<!bond\s)rating"
    r"(?![-\s](?:data|history|agency|feed|series|update|updates|coverage|methodology)\b)"
)
_INVESTMENT_UPGRADE = (
    r"(?<!api\s)(?<!feed\s)(?<!schema\s)(?<!system\s)(?<!service\s)(?<!software\s)(?<!connector\s)"
    r"(?:upgrade|downgrade)(?!\s+(?:to|of|for)\s+(?:the\s+)?"
    r"(?:api|feed|connector|dataset|schema|system|service|software)\b)"
)
_THESIS_OUTCOME = r"(?:thesis|investment\s+(?:case|thesis)|(?:bull|bear|base)\s+case)"
_RATING_THESIS = r"(?:" + _DECISION_LABEL + r")\s+thesis"
_DATA_CONTEXT = r"(?:field|data|series|schema|value|values|column|columns|history|feed|coverage|completeness|delivery)"
_INVESTMENT_RETURN_OUTCOME = (
    r"(?:(?:positive\s+)?returns?|upside|outperformance|alpha|rally|profits?|gains?|downside|price\s+target)"
    r"(?![-\s]" + _DATA_CONTEXT + r"\b)"
)
_OUTCOME_NOUN = (
    r"(?:conviction|" + _INVESTMENT_CONFIDENCE + r"|score|" + _INVESTMENT_RATING
    + r"|decision|action|call|conclusion|" + _INVESTMENT_UPGRADE + r"|"
    + _THESIS_OUTCOME + r"|" + _INVESTMENT_RETURN_OUTCOME + r"|" + _DECISION_LABEL + r")"
)
_EVIDENCE_SUBJECT = r"(?:(?:(?:supportive|adverse|new|additional)\s+)?(?:data|evidence|source|observation|series|filing|release|print|result)|this)"

# This rejects promises about the investment call while leaving domain statements alone. In particular,
# `OPEC production cap will increase` and generic `rating will improve` are not investment promises.
DATA_NEED_PROMISE_RE = re.compile(
    r"\b" + _PROMISE_WORD + r"\b[^.;\n]{0,80}\b" + _OUTCOME_NOUN + r"\b"
    r"|\b" + _OUTCOME_NOUN + r"\b[^.;\n]{0,80}\b" + _PROMISE_WORD + r"\b"
    r"|\b(?:conviction|confidence|rating|decision|action|" + _DECISION_LABEL + r")\s+"
    r"(?:is|becomes?|was\s+made)\s+certain\b"
    r"|\bmakes?\s+(?:the\s+)?(?:conviction|confidence|rating|decision|action|call|conclusion|"
    + _THESIS_OUTCOME + r"|" + _INVESTMENT_RETURN_OUTCOME + r")\s+certain\b"
    r"|\b" + _EVIDENCE_SUBJECT + r"\b[^.;\n]{0,50}\b"
    r"(?:raises?|increases?|improves?|lifts?|boosts?|strengthens?|enhances?|sharpens?|upgrades?|downgrades?)\s+(?:the\s+)?"
    r"(?:" + _INVESTMENT_MEASURE + r"|" + _INVESTMENT_RATING + r")\b"
    r"|\b" + _EVIDENCE_SUBJECT + r"\b[^.;\n]{0,50}\b(?:makes?|renders?)\s+(?:the\s+)?"
    r"(?:call|conclusion|decision|action|" + _THESIS_OUTCOME + r")\s+certain\b"
    r"|\b" + _EVIDENCE_SUBJECT + r"\b[^.;\n]{0,50}\bmakes?\s+(?:us\s+)?"
    r"(?:fully|completely|absolutely)\s+confident\b"
    r"|\b" + _EVIDENCE_SUBJECT + r"\b[^.;\n]{0,50}\b(?:removes?|eliminates?)\s+"
    r"(?:all|any)\s+(?:investment\s+)?(?:uncertainty|doubt)\b"
    r"|\b" + _EVIDENCE_SUBJECT + r"\b[^.;\n]{0,50}\b(?:would\s+)?leaves?\s+no\s+doubt\b"
    r"[^.;\n]{0,40}\b(?:call|conclusion|decision|action|rating|" + _THESIS_OUTCOME + r")\b"
    r"|\b" + _EVIDENCE_SUBJECT + r"\b[^.;\n]{0,50}\bmeans?\s+(?:that\s+)?there\s+(?:is|will\s+be)\s+"
    r"no\s+(?:downside|investment\s+risk|risk\s+of\s+loss)\b"
    r"|\b(?:proves?|confirms?|validates?|establishes?)\s+(?:an?\s+|the\s+)?(?:"
    + _THESIS_OUTCOME + r"|" + _RATING_THESIS + r"|" + _DECISION_LABEL + r")\b"
    r"|\b(?:locks?\s+in|forces?|compels?)\s+(?:an?\s+|the\s+)?(?:"
    + _INVESTMENT_UPGRADE + r"|" + _DECISION_LABEL + r")\b"
    r"|\b(?:automatically\s+)?makes?\s+(?:it|the\s+(?:decision|rating|action|call))\s+"
    r"(?:an?\s+)?" + _DECISION_LABEL + r"\b"
    r"|\bmeans?\s+(?:that\s+)?(?:we|investors?|the\s+(?:system|decision|rating|action))\s+must\s+"
    + _DECISION_LABEL + r"\b"
    r"|\b" + _EVIDENCE_SUBJECT + r"\b[^.;\n]{0,50}\b(?:gives?|provides?|creates?)\s+"
    r"(?:complete|full|absolute)\s+(?:" + _INVESTMENT_CONFIDENCE + r"|conviction|certainty)\b"
    r"|\b" + _EVIDENCE_SUBJECT + r"\b[^.;\n]{0,50}\b(?:implies?|provides?|gives?|creates?)\s+"
    r"(?:an?\s+)?(?:1(?:\.0+)?|100(?:\.0+)?)\s+(?:" + _INVESTMENT_CONFIDENCE + r"|conviction|certainty)\b"
    r"|\b(?:will|would|should|shall|must|is\s+expected\s+to|promis(?:e|es|ed|ing)\s+to)\s+"
    r"(?:automatically\s+)?(?:lift|raise|increase|boost|improve|add\s+to)\s+(?:the\s+)?"
    r"" + _INVESTMENT_MEASURE + r"\b"
    r"|\b" + _INVESTMENT_MEASURE + r"\s+(?:will|would|should|shall|must|is\s+expected\s+to)\s+"
    r"(?:automatically\s+)?(?:rise|increase|improve|lift)\b"
    r"|\b(?:will|would|should|shall|must|is\s+expected\s+to)\s+(?:automatically\s+)?"
    r"(?:upgrade|downgrade|change|move|set)\s+(?:the\s+)?(?:rating|decision|action)\s+"
    r"(?:from\s+" + _DECISION_LABEL + r"\s+)?to\s+" + _DECISION_LABEL + r"\b"
    r"|\b(?:lift|raise|increase|boost|improve|add\s+to)\s+(?:the\s+)?(?:" + _INVESTMENT_MEASURE + r"|rating)\s+"
    r"(?:by|to|from)\s*[+\-]?\d+(?:\.\d+)?\s*(?:%|percent|points?|pts?|bps?|bp)?\b"
    r"|\b(?:" + _INVESTMENT_MEASURE + r"|rating)\s+(?:rises?|increases?|improves?|lifts?|moves?|goes?)\s+"
    r"(?:from\s+[+\-]?\d+(?:\.\d+)?\s+(?:to\s+)?|(?:by|to)\s+)[+\-]?\d+(?:\.\d+)?\s*"
    r"(?:%|percent|points?|pts?|bps?|bp)?\b"
    r"|\b[+\-]?\d+(?:\.\d+)?[- ](?:point|pt|bp|percent(?:age)?[- ]point)s?\s+"
    r"(?:" + _INVESTMENT_MEASURE + r"|rating)\s+(?:lift|increase|boost|raise)\b"
    r"|\b[+\-]?\d+(?:\.\d+)?\s*(?:%|\bpercent\b)[^.;\n]{0,30}\b"
    r"(?:" + _INVESTMENT_CONFIDENCE + r"|conviction|certainty|confident|certain)\b(?!\s+(?:interval|level|band|bounds?)\b)"
    r"|\b(?:" + _INVESTMENT_CONFIDENCE + r"|conviction|certainty|confident|certain)\b(?!\s+(?:interval|level|band|bounds?)\b)[^.;\n]{0,30}"
    r"\b[+\-]?\d+(?:\.\d+)?\s*(?:%|\bpercent\b)",
    re.IGNORECASE,
)


def text_leaves(value: Any, path: str = ""):
    if isinstance(value, str):
        yield path, value
    elif isinstance(value, list):
        for index, item in enumerate(value):
            yield from text_leaves(item, f"{path}[{index}]")
    elif isinstance(value, dict):
        for key, item in value.items():
            child = f"{path}.{key}" if path else str(key)
            yield from text_leaves(item, child)


def discover_orb_roster(agents_root: str) -> dict[str, set[str]]:
    """Discover exact module/agent pairs using the same numbered-file/frontmatter convention as runtime."""
    roster: dict[str, set[str]] = {}
    for synthesis in sorted(glob.glob(os.path.join(agents_root, "*", "99_*-synthesis.md"))):
        module_dir = os.path.dirname(synthesis)
        module = os.path.basename(module_dir)
        agents: set[str] = set()
        for agent_file in sorted(glob.glob(os.path.join(module_dir, "[0-9][0-9]_*.md"))):
            try:
                raw = open(agent_file, encoding="utf-8").read()
            except OSError:
                continue
            frontmatter = raw.split("---", 2)[1] if raw.startswith("---") and raw.count("---") >= 2 else ""
            match = re.search(r"(?m)^name:\s*['\"]?([^'\"\n#]+?)['\"]?\s*$", frontmatter)
            name = match.group(1).strip() if match else os.path.basename(agent_file)[3:-3]
            if name:
                agents.add(name)
        roster[module] = agents
    return roster


def check_live_orb_routes(record: dict[str, Any], agents_root: str) -> list[str]:
    """Validate v2 routes against today's roster. Call only immediately before publication."""
    if record.get("data_needs_schema_version") != "2.0":
        return []
    needs = record.get("data_needs")
    if not isinstance(needs, list):
        return []  # the structural validator owns this error
    roster = discover_orb_roster(agents_root)
    if not roster:
        return [f"live data-needs route roster is empty or unreadable at {agents_root}"]
    errors: list[str] = []
    for i, need in enumerate(needs):
        if not isinstance(need, dict) or not isinstance(need.get("entry_orbs"), list):
            continue
        for j, orb in enumerate(need["entry_orbs"]):
            if not isinstance(orb, dict):
                continue
            module, agent = orb.get("module"), orb.get("agent")
            if isinstance(module, str) and isinstance(agent, str):
                if module not in roster or agent not in roster[module]:
                    errors.append(
                        f"data_needs[{i}].entry_orbs[{j}]={module!r}/{agent!r} is not an exact "
                        "module/agent pair in the live discovered roster"
                    )
    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate publication-time data-needs orb routes")
    parser.add_argument("--agents-root", required=True)
    parser.add_argument("records", nargs="+")
    args = parser.parse_args(argv)
    failed = False
    for record_path in args.records:
        try:
            record = json.load(open(record_path, encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            errors = [f"cannot read decision record: {error}"]
        else:
            errors = check_live_orb_routes(record, args.agents_root) if isinstance(record, dict) else ["record root is not an object"]
        if errors:
            failed = True
            print(f"DATA-NEEDS-ROUTE-FAIL {record_path}", file=sys.stderr)
            for error in errors:
                print(f"  - {error}", file=sys.stderr)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
