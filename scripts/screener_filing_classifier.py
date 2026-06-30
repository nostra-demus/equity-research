#!/usr/bin/env python3
"""Deterministically classify a signal's regulatory-filing type and derate routine filings.

Routine listed-company filings — board-meeting notices "to consider results", trading-window
closure notices for designated persons, generic procedural exchange compliance disclosures, and
plain results-date intimations — carry no real valuation-moving information, but the signal-gate
module's Step 10 base/novelty terms are agent-discretionary (signal-gate/MODULE_RULES.md Step 10),
so a routine notice that happens to mention "financial results" can pick up a generous ad-hoc base
PLUS a large first-seen novelty bonus and land near 80. This script is kept as deterministic code
(not LLM judgment) so every derate is explainable from a matched pattern, never vibes (CLAUDE.md
§12) — the same justification scripts/screener_rescore.py uses for the conviction-loop math.

It does NOT touch the existing Step 10 arithmetic (base + novelty - penalties + overrides). It is
a SEPARATE, SURGICAL step that runs AFTER Step 10 produces its score and caps the final number when
the filing is classified as routine and no override keyword fired. This keeps the ten-step gauntlet
exactly ten steps (MODULE_RULES.md line 7) — see signal-gate/MODULE_RULES.md "Filing-Type
Classification & Derating" section for the binding rules this script implements.

Two operations:

  classify  — read an intake.json, return filing_type + override_hit + rationale (JSON to stdout)
  derate    — given filing_type, the Step-10 score, and override_hit, return the (possibly capped)
              final score + a human-readable explanation (JSON to stdout)

Usage:
    python3 scripts/screener_filing_classifier.py classify <path/to/intake.json>
    python3 scripts/screener_filing_classifier.py derate --filing-type <type> --score <0-100> [--override-hit]
    python3 scripts/screener_filing_classifier.py selftest

Exit 0 = ok (classify/derate) or all selftest cases passed; 1 = selftest failure; 2 = usage/IO error.
"""
from __future__ import annotations

import argparse
import json
import re
import sys

FILING_TYPES = [
    "routine_board_meeting",
    "trading_window_closure",
    "financial_results_notice",
    "procedural_exchange_filing",
    "material_exchange_filing",
    "unknown_filing",
]

# Final-score ceiling applied ONLY when no override keyword fired. None = no ceiling (pass through).
CEILINGS = {
    "trading_window_closure": 30,
    "procedural_exchange_filing": 30,
    "routine_board_meeting": 50,
    "financial_results_notice": 50,
    "material_exchange_filing": None,
    "unknown_filing": None,
}

# ---- routine-pattern regexes (case-insensitive; matched against normalized headline+body) ----
# Each tuple: (filing_type, compiled-pattern-list). ANY pattern in the list matching = a hit for
# that type. Order matters: trading_window_closure and procedural checked before the broader
# financial_results_notice / routine_board_meeting so a closure notice that also says "results"
# (very common phrasing: "trading window will remain closed until the financial results are
# declared") classifies as trading_window_closure, not financial_results_notice.
ROUTINE_PATTERNS = [
    ("trading_window_closure", [
        re.compile(r"trading window.{0,40}(closure|closed|close)", re.I),
        re.compile(r"closure of trading window", re.I),
        re.compile(r"window.{0,20}closure.{0,20}designated person", re.I),
        re.compile(r"black[\s-]?out period", re.I),
        re.compile(r"restricted trading period", re.I),
    ]),
    ("procedural_exchange_filing", [
        re.compile(r"compliance certificate", re.I),
        re.compile(r"intimation under regulation \d+", re.I),
        re.compile(r"newspaper publication", re.I),
        re.compile(r"disclosure under regulation \d+", re.I),
        re.compile(r"reg(ulation)?\s*30\b.{0,30}sebi", re.I),
        re.compile(r"shareholding pattern", re.I),
        re.compile(r"certificate under regulation", re.I),
        re.compile(r"book closure(?!.{0,30}(default|fraud|investigation))", re.I),
        re.compile(r"record date for the purpose of", re.I),
        re.compile(r"newspaper advertisement", re.I),
        re.compile(r"investor complaint(s)? status", re.I),
        re.compile(r"\bxbrl\b filing", re.I),
        re.compile(r"corporate action.{0,20}intimation", re.I),
    ]),
    ("routine_board_meeting", [
        re.compile(r"board meeting.{0,60}(to consider|scheduled|intimation)", re.I),
        re.compile(r"intimation of board meeting", re.I),
        re.compile(r"notice of board meeting", re.I),
        re.compile(r"meeting of the board of directors.{0,60}(will be held|is scheduled|to consider)", re.I),
    ]),
    ("financial_results_notice", [
        re.compile(r"date of.{0,15}(financial )?results", re.I),
        re.compile(r"results date intimation", re.I),
        re.compile(r"intimation.{0,30}(un)?audited financial results", re.I),
        re.compile(r"financial results.{0,30}(will be declared|to be announced|on \d)", re.I),
        re.compile(r"\bresults calendar\b", re.I),
    ]),
]

# A routine_board_meeting headline that ALSO matches financial_results_notice patterns is
# common ("Board meeting ... to consider financial results") — when BOTH route hit, prefer
# routine_board_meeting (more specific procedural act; the "results" mention is the AGENDA
# ITEM of a meeting notice, not a results announcement itself).
ROUTINE_PRIORITY = ["trading_window_closure", "procedural_exchange_filing",
                     "routine_board_meeting", "financial_results_notice"]

# Each tuple: (override_tag, compiled-pattern-list). ANY match anywhere in the text = override_hit
# = True regardless of which routine pattern also matched (override always wins — see classify()).
OVERRIDE_PATTERNS = [
    ("resignation_key_management", [
        re.compile(r"\bresign(s|ed|ation)\b.{0,40}\b(ceo|cfo|chief executive|chief financial|managing director|md\b|chairman|whole[\s-]?time director|company secretary|compliance officer|auditor)\b", re.I),
        re.compile(r"\b(ceo|cfo|chief executive|chief financial|managing director|chairman)\b.{0,40}\bresign", re.I),
        re.compile(r"cessation of (directorship|office) of\b.{0,40}\b(ceo|cfo|md|chairman|managing director)", re.I),
    ]),
    ("fraud_investigation", [
        re.compile(r"\bfraud\b", re.I),
        re.compile(r"\b(regulatory|sebi|sec|enforcement)\s+investigation\b", re.I),
        re.compile(r"\bshow[\s-]cause notice\b", re.I),
        re.compile(r"\bsearch and seizure\b", re.I),
        re.compile(r"\b(cbi|ed|sfio)\s+(raid|probe|investigation)", re.I),
    ]),
    ("mna", [
        re.compile(r"\bacqui(re|res|sition|sitions)\b", re.I),
        re.compile(r"\bdivest(s|iture|ed)?\b", re.I),
        re.compile(r"\bmerger\b", re.I),
        re.compile(r"\bdisposal of\b.{0,30}\b(stake|business|undertaking|unit)\b", re.I),
        re.compile(r"\bdemerger\b", re.I),
        re.compile(r"\bslump sale\b", re.I),
    ]),
    ("guidance_change", [
        re.compile(r"\b(revis|updat|chang|cut|rais|low|narrow|widen)(e|es|ed|ing)\b.{0,25}\bguidance\b", re.I),
        re.compile(r"\bguidance\b.{0,25}\b(revis|updat|chang|cut|withdraw)", re.I),
        re.compile(r"\bwithdraws? (its )?guidance\b", re.I),
    ]),
    ("profit_warning", [
        re.compile(r"\bprofit warning\b", re.I),
        re.compile(r"\bexpected (net )?loss\b", re.I),
        re.compile(r"\bearnings warning\b", re.I),
        re.compile(r"\bshortfall in (revenue|profit|earnings)\b", re.I),
        re.compile(r"\bmaterial (adverse|negative) impact on (its )?(financial|profit|earnings)", re.I),
    ]),
    ("capital_raise", [
        re.compile(r"\b(qip|rights issue|preferential allotment|follow[\s-]on (public )?offer|fpo)\b", re.I),
        re.compile(r"\bcapital raise\b", re.I),
        re.compile(r"\braising (capital|funds)\b.{0,30}\b(crore|million|billion|\$|₹)", re.I),
        re.compile(r"\bissue of (equity|debentures|warrants|ncds?)\b.{0,40}\b(to raise|approv)", re.I),
    ]),
    ("debt_default", [
        re.compile(r"\bdefault(s|ed|ing)?\b.{0,30}\b(loan|debt|interest|principal|bond|debenture|ncd)\b", re.I),
        re.compile(r"\bdebt default\b", re.I),
        re.compile(r"\bmissed (interest|principal) payment\b", re.I),
        re.compile(r"\b(downgrade|rating action)\b.{0,30}\b(crisil|icra|care|moody|s&p|fitch|india ratings)\b", re.I),
    ]),
    ("litigation", [
        re.compile(r"\blawsuit\b", re.I),
        re.compile(r"\blitigation\b", re.I),
        re.compile(r"\bcourt (order|ruling|judgment)\b", re.I),
        re.compile(r"\b(sued|sues|suit filed)\b", re.I),
        re.compile(r"\barbitration award\b", re.I),
    ]),
    ("auditor_issue", [
        re.compile(r"\bauditor\b.{0,30}\b(resign|qualif|adverse opinion|disclaimer)", re.I),
        re.compile(r"\bqualified (audit )?opinion\b", re.I),
        re.compile(r"\bgoing concern\b", re.I),
        re.compile(r"\baccounting (irregularit|discrepanc)", re.I),
    ]),
    ("material_order", [
        re.compile(r"\border win\b", re.I),
        re.compile(r"\bwins? (a |an )?(order|contract)\b.{0,40}\b(crore|million|billion|\$|₹)", re.I),
        re.compile(r"\border (loss|cancellation|termination)\b", re.I),
        re.compile(r"\bcontract (terminat|cancel)", re.I),
        re.compile(r"\blargest[\s-]ever order\b", re.I),
    ]),
    ("capital_action_financial_relevance", [
        re.compile(r"\bbuyback\b.{0,40}\b(crore|million|billion|\$|₹|per share)", re.I),
        re.compile(r"\b(special|interim|final) dividend\b.{0,40}\b(per share|₹|\$)", re.I),
        re.compile(r"\bstock split\b.{0,30}\b(ratio|\d+:\d+|\d+ for \d+)", re.I),
        re.compile(r"\bbonus (issue|shares)\b.{0,30}\b(ratio|\d+:\d+)", re.I),
    ]),
]


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip().lower()


def classify(headline: str, body_text: str = "") -> dict:
    """Pure, deterministic. Returns:
      {"filing_type": str, "override_hit": bool, "override_categories": [str],
       "matched_routine_pattern": str|None, "rationale": str}
    Abstains to "unknown_filing" (no ceiling applied) when nothing matches — a safe default that
    never suppresses a filing type the classifier doesn't recognize (mirrors CLAUDE.md §1: refuse
    to invent confidence rather than force a guess)."""
    text = normalize(f"{headline or ''} . {body_text or ''}")

    override_categories = [tag for tag, pats in OVERRIDE_PATTERNS if any(p.search(text) for p in pats)]
    override_hit = bool(override_categories)

    routine_hits = {}
    for ftype, pats in ROUTINE_PATTERNS:
        for p in pats:
            m = p.search(text)
            if m:
                routine_hits[ftype] = m.group(0)
                break

    if override_hit:
        # Override always wins, even wrapped in routine-sounding language (user requirement #3-5).
        matched = next((routine_hits[f] for f in ROUTINE_PRIORITY if f in routine_hits), None)
        rationale = (
            f"Override keyword(s) {', '.join(override_categories)} matched — classified "
            f"material_exchange_filing regardless of routine wrapper text"
            + (f" (also matched routine pattern '{matched}', overridden)" if matched else "")
            + ". No ceiling applied."
        )
        return {
            "filing_type": "material_exchange_filing",
            "override_hit": True,
            "override_categories": override_categories,
            "matched_routine_pattern": matched,
            "rationale": rationale,
        }

    for ftype in ROUTINE_PRIORITY:
        if ftype in routine_hits:
            return {
                "filing_type": ftype,
                "override_hit": False,
                "override_categories": [],
                "matched_routine_pattern": routine_hits[ftype],
                "rationale": f"Matched routine pattern '{routine_hits[ftype]}' for filing_type={ftype}.",
            }

    return {
        "filing_type": "unknown_filing",
        "override_hit": False,
        "override_categories": [],
        "matched_routine_pattern": None,
        "rationale": "No routine pattern and no override keyword matched — abstaining to unknown_filing (no ceiling applied).",
    }


def derate(score: int, filing_type: str, override_hit: bool = False) -> dict:
    """Pure, deterministic. Caps the FINAL Step-10 score (post base+novelty-penalties+overrides) —
    never touches the additive formula itself. Returns:
      {"final_score": int, "ceiling_applied": int|None, "capped": bool, "explanation": str}"""
    score = max(0, min(100, int(score)))
    if override_hit or filing_type in ("material_exchange_filing", "unknown_filing"):
        return {
            "final_score": score, "ceiling_applied": None, "capped": False,
            "explanation": (
                f"No derate ceiling applied — filing_type={filing_type}"
                + (" (override keyword hit)" if override_hit else " (not classified as routine)")
                + f". Score {score}/100 stands as computed in Step 10."
            ),
        }
    ceiling = CEILINGS.get(filing_type)
    if ceiling is None:
        return {
            "final_score": score, "ceiling_applied": None, "capped": False,
            "explanation": f"filing_type={filing_type} carries no ceiling. Score {score}/100 stands.",
        }
    if score <= ceiling:
        return {
            "final_score": score, "ceiling_applied": ceiling, "capped": False,
            "explanation": (
                f"filing_type={filing_type} ceiling={ceiling} — Step-10 score {score} already at or "
                f"below the ceiling, no change."
            ),
        }
    return {
        "final_score": ceiling, "ceiling_applied": ceiling, "capped": True,
        "explanation": (
            f"Routine-filing derate: filing_type={filing_type} is procedural with no unusual language "
            f"or direct financial impact detected, so it is capped at {ceiling}/100 "
            f"(was {score}/100 before derating, per signal-gate/MODULE_RULES.md "
            f"\"Filing-Type Classification & Derating\")."
        ),
    }


def run_selftest() -> int:
    bad = 0

    # ---- classify() cases: (headline, body_text, expected_filing_type, expected_override_hit) ----
    classify_cases = [
        # 1. Mandatory — board meeting to consider results, no override language anywhere.
        ("Board meeting on 6 August to consider financial results", "",
         "routine_board_meeting", False),
        # 2. Mandatory — trading window closure for designated persons.
        ("Trading window closure for designated persons", "",
         "trading_window_closure", False),
        # 3. Mandatory — CFO resignation must override despite no routine wrapper.
        ("Company announces resignation of CFO", "",
         "material_exchange_filing", True),
        # 4. Mandatory — profit warning must override.
        ("Company announces profit warning / expected loss", "",
         "material_exchange_filing", True),
        # 5. Mandatory — material M&A must override.
        ("Company announces acquisition/disposal", "",
         "material_exchange_filing", True),
        # 6. Unknown/unmatched headline — abstain, no false routine label.
        ("Company hosts annual sustainability townhall for employees", "",
         "unknown_filing", False),
        # 7. procedural_exchange_filing example — SEBI Reg compliance-certificate style.
        ("Compliance Certificate under Regulation 7(3) of SEBI (LODR) Regulations, 2015", "",
         "procedural_exchange_filing", False),
        # 8. Routine board-meeting headline with an override keyword embedded mid-sentence —
        #    proves override-lifting works even wrapped in routine phrasing (not just bare headlines).
        ("Board meeting on 14 August to consider financial results and the resignation of the CFO", "",
         "material_exchange_filing", True),
        # 9. Borderline/ambiguous — results-date intimation phrased without "board meeting", should
        #    land on financial_results_notice via the dedicated pattern, not be misread as board_meeting.
        ("Intimation of date of un-audited financial results for the quarter ended June 2026", "",
         "financial_results_notice", False),
        # 10. Real already-scored ledger example — non-regression: the Norben AGM exchange filing
        #     (SIG-20260616-eae0b41e). AGM notice text is not in any of the 4 routine buckets (it is
        #     an AGM notice, not board-meeting/closure/procedural/results) and carries no override
        #     keyword, so it must abstain to unknown_filing (no ceiling) — its committed score (36)
        #     already sits under every ceiling, so an unknown_filing no-op leaves it untouched.
        ("Norben Tea & Exports Limited", "Norben Tea & Exports Limited has filed a document with the BSE/NSE exchanges.",
         "unknown_filing", False),
        # 11. Real already-scored ledger example — non-regression: HKEX profit-warning filing
        #     (SIG-20260628-2c8cfc21) must hit the profit_warning override despite being an
        #     "exchange_announcement" input_nature like the routine cases.
        ("MODERN INNO DT (02322): PROFIT WARNING", "Modern Inno DT has issued a profit warning.",
         "material_exchange_filing", True),
        # 12. Robustness — debt default override.
        ("Company defaults on interest payment due on its NCDs", "",
         "material_exchange_filing", True),
        # 13. Robustness — buyback WITHOUT financial terms stays routine-procedural (no number/ratio
        #     present), proving the qualifier ("actual financial relevance") is enforced, not just
        #     the bare word "buyback".
        ("Board meeting intimation to consider buyback of equity shares", "",
         "routine_board_meeting", False),
        # 14. Robustness — buyback WITH financial terms overrides.
        ("Company announces buyback of equity shares at ₹450 per share, aggregating up to ₹500 crore", "",
         "material_exchange_filing", True),
    ]
    for headline, body, exp_type, exp_override in classify_cases:
        r = classify(headline, body)
        ok = (r["filing_type"] == exp_type and r["override_hit"] == exp_override)
        if not ok:
            bad += 1
        print(f"  [{'ok' if ok else 'XX'}] classify({headline!r}) -> "
              f"{r['filing_type']}, override={r['override_hit']}"
              + ("" if ok else f"  EXPECTED {exp_type}, override={exp_override}"))

    # ---- derate() chained cases: (filing_type, raw_score, override_hit, expected_final_score, expect_capped) ----
    derate_cases = [
        # Mandatory 1: routine_board_meeting at a generously-scored 78 must cap to <=50.
        ("routine_board_meeting", 78, False, 50, True),
        # Mandatory 2: trading_window_closure at a generously-scored 65 must cap to <=30.
        ("trading_window_closure", 65, False, 30, True),
        # Mandatory 3: CFO resignation (material_exchange_filing, override) must NOT be capped.
        ("material_exchange_filing", 82, True, 82, False),
        # Mandatory 4: profit warning (material_exchange_filing, override) stays high.
        ("material_exchange_filing", 85, True, 85, False),
        # Mandatory 5: acquisition/disposal (material_exchange_filing, override) stays high if material.
        ("material_exchange_filing", 88, True, 88, False),
        # unknown_filing never capped.
        ("unknown_filing", 60, False, 60, False),
        # procedural_exchange_filing already under its own ceiling — no-op, not just "capped silently".
        ("procedural_exchange_filing", 18, False, 18, False),
        # financial_results_notice exactly AT the ceiling — boundary, no-op (not >, not <).
        ("financial_results_notice", 50, False, 50, False),
        # financial_results_notice one over the ceiling — boundary capped.
        ("financial_results_notice", 51, False, 50, True),
        # Real ledger non-regression: Norben (unknown_filing, score 36) must stay 36.
        ("unknown_filing", 36, False, 36, False),
        # Real ledger non-regression: HKEX profit warning (material_exchange_filing, override, score 77).
        ("material_exchange_filing", 77, True, 77, False),
    ]
    for ftype, score, ov, exp_final, exp_capped in derate_cases:
        r = derate(score, ftype, override_hit=ov)
        ok = (r["final_score"] == exp_final and r["capped"] == exp_capped)
        if not ok:
            bad += 1
        print(f"  [{'ok' if ok else 'XX'}] derate({ftype!r}, {score}, override={ov}) -> "
              f"final={r['final_score']}, capped={r['capped']}"
              + ("" if ok else f"  EXPECTED final={exp_final}, capped={exp_capped}"))

    total = len(classify_cases) + len(derate_cases)
    print(f"screener_filing_classifier selftest: {total - bad}/{total} passed")
    return 1 if bad else 0


def cmd_classify(args) -> int:
    try:
        intake = json.load(open(args.intake_path, encoding="utf-8"))
    except Exception as e:
        print(f"error reading {args.intake_path}: {e}", file=sys.stderr)
        return 2
    result = classify(intake.get("headline", ""), intake.get("body_text", ""))
    print(json.dumps(result, ensure_ascii=False))
    return 0


def cmd_derate(args) -> int:
    result = derate(args.score, args.filing_type, args.override_hit)
    print(json.dumps(result, ensure_ascii=False))
    return 0


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="screener_filing_classifier.py")
    sub = ap.add_subparsers(dest="cmd")

    p_classify = sub.add_parser("classify")
    p_classify.add_argument("intake_path")

    p_derate = sub.add_parser("derate")
    p_derate.add_argument("--filing-type", required=True, choices=FILING_TYPES)
    p_derate.add_argument("--score", required=True, type=int)
    p_derate.add_argument("--override-hit", action="store_true")

    sub.add_parser("selftest")

    a = ap.parse_args(argv[1:])
    if a.cmd == "classify":
        return cmd_classify(a)
    if a.cmd == "derate":
        return cmd_derate(a)
    if a.cmd == "selftest":
        return run_selftest()
    ap.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
