#!/usr/bin/env python3
"""The §16 sector ↔ valuation-method consistency gate (check W) — CLAUDE.md §16, SECTOR_OVERLAYS.md.

Side-effect-free, importable, doctrine logic — extracted verbatim from `scripts/eval.py`
(check W) so the SAME detection function can run in TWO places instead of one:

1. **Retrospective** — `scripts/eval.py` imports this to grade already-committed runs
   (check W), as it always has.
2. **Live, pre-publish** — `/research:full` Step 10B.1 (the deterministic finish-gate that
   also runs on every `/research:rerun`, per fix F-RRGATE) imports this to check a thesis
   BEFORE it ships, stamping `final_thesis.md` PROVISIONAL on a violation instead of letting
   it commit clean.

The gap this closes: CLAUDE.md §16 requires "method validity matched to business type
(operating vs financial vs REIT vs commodity vs holding company)". `frameworks/SECTOR_OVERLAYS.md`
makes that concrete — a bank/lender/insurer is balance-sheet-funded and must be valued on an
equity-side method (DDM / residual income / P-B / embedded value), never an enterprise-value or
unlevered-cashflow method (FCFF DCF, EV/EBITDA, EV/EBIT, EV/Sales, net-debt/EBITDA); a REIT must
not be headlined on an EBITDA / FCFF DCF or an EV multiple (the valuation module's Business-Type
Method Map, the stricter rule per CLAUDE.md §23). Only the HEADLINE method is judged — a method
named solely as a cross-check or an explicit exclusion is not the one the call is priced on
(`headline_method`). The valuation module's own agents already populate
`decision_record.json.business_type` and `.primary_valuation_method` (synthesizer.md), and
`scripts/eval.py` check W has graded that pair against `SECTOR_FORBIDDEN` since SECTOR_DATE —
but, like checks AA/AB/AG/AN before this module existed for them, W was defined only inline in
`scripts/eval.py`, the one place the live finish-gate could never reach. A bank valued on FCFF
DCF, or a REIT valued on EBITDA-DCF, could still print `GATE: PASS` and commit straight to
`main` (§25/§28), undetected until someone remembered to run `/research:eval` afterward.
Importing this module into the live finish-gate closes that hole the same way it was already
closed for §24/§13 (rating_caps.py), the Headline Scorecard / red-flag / audit trail checks
(headline_checks.py), the valuation-summary sidecar (valuation_summary_checks.py), §10/HARD GATE
11/13 (scenario_integrity_checks.py), and the §18 calibration-feedback gate (calibration_gate_checks.py).

`eval_w_sector_valuation` is pure: given `business_type` and `primary_valuation_method`, it
returns:
  - `None`     — not applicable (either field blank/absent — additive/optional, same convention
                 as `scenarios[]`/`edge_score`)
  - `[]`       — applicable and clean (no forbidden method token present)
  - `[tok...]` — one or more forbidden-method tokens present (a violation)

Both callers treat a non-empty list as a violation and `None`/`[]` as no violation.

Check BJ (§16 "no double-charging a quality gap", `eval_bj_quality_double_count`) lives here too — same
§16 valuation-method doctrine, same two callers, same return convention. See its section below.
"""
import re

# Method substrings SECTOR_OVERLAYS.md forbids per sector type, matched against a SEPARATOR-STRIPPED,
# lowercased primary_valuation_method so "EBITDA-DCF" / "EBITDA DCF" / "ebitdadcf" all collapse to one
# token (a hyphen-literal list would silently miss the spaced spellings). Banks / lenders / insurers are
# balance-sheet-funded financials: SECTOR_OVERLAYS.md values them on equity-side methods (DDM / residual
# income / P-B / embedded value) and says "NOT FCFF/EV ... never net-debt/EBITDA" — so EVERY enterprise-
# value / unlevered-cashflow method is a category error, not just FCFF. REITs: SECTOR_OVERLAYS.md names only
# EBITDA-DCF, but the valuation module's Business-Type Method Map — a Hard Rule and "the single source of
# truth" for method validity (.claude/agents/valuation/MODULE_RULES.md) — says a REIT must "NOT use: EBITDA /
# FCFF DCF (depreciation is non-economic)", and 99_valuation-synthesis.md's checklist bars "an operating-FCFF
# DCF or EV multiple" as the headline for a financial or REIT. CLAUDE.md §23 takes the stricter module rule,
# so a REIT's forbidden set covers FCFF and every EV multiple as well. Tokens are separator-free — "evebit"
# matches both EV/EBIT and EV/EBITDA; bare "ev" is deliberately NOT a token (it would false-match
# "revenue"/"leverage"/"level"). "evsales" AND "evrevenue" are both listed because "EV/Revenue" is used
# interchangeably with "EV/Sales" in this repo; without the "evrevenue" spelling a bank quoted on
# "EV/Revenue" would slip the gate (an EV method is a category error regardless of which synonym is written).
SECTOR_DATE = "2026-06-18"
_FIN_INSTITUTION_FORBIDDEN = ["fcff", "evebit", "evsales", "evrevenue", "ebitdadcf", "netdebtebitda", "enterprisevalue"]
_REIT_FORBIDDEN = ["ebitdadcf", "fcff", "evebit", "evsales", "evrevenue", "enterprisevalue"]
SECTOR_FORBIDDEN = {
    # lowercase key = substring matched against business_type (case-insensitive)
    # value = forbidden tokens, matched against the separator-stripped HEADLINE of primary_valuation_method
    "bank": _FIN_INSTITUTION_FORBIDDEN, "lender": _FIN_INSTITUTION_FORBIDDEN, "insur": _FIN_INSTITUTION_FORBIDDEN,
    "reit": _REIT_FORBIDDEN, "real estate": _REIT_FORBIDDEN,
}

# Only the method a call is PRICED on can break the sector rule — 99_valuation-synthesis.md judges "the
# headline". The free-form field routinely also names methods it merely cross-checks or rules out, and
# reading those mentions as use flags doctrine-valid calls: "Sum-of-the-parts / NAV (corroborated by
# normalized FCFF DCF)" (EMAAR_2026-07-10, a REIT priced on NAV) or "Residual income; FCFF DCF not
# applicable". Every committed record uses one of two grammatical shapes, so the cut follows the grammar:
#   - a PARTICIPLE puts the secondary method AFTER it — "corroborated by X", "cross-checked against X",
#     "cross-validated by X" — so the rest of that ;-clause is dropped;
#   - a NOUN puts it BEFORE — "with X cross-check", "X as a capped cross-check", "X not applicable",
#     "X excluded" — so that with-phrase, or that comma / "+" leg, is dropped.
# A parenthetical aside that only corroborates or excludes is dropped on its own, without taking the
# headline in front of it. Anything not marked as a cross-check or an exclusion still counts: a blend
# ("60% NAV + 40% FCFF DCF") prices the call on every leg it names, so each leg is judged.
_AFTER = re.compile(r"\b(?:corroborated|cross[\s-]?checked|cross[\s-]?validated|sanity[\s-]?checked)\b", re.I)
_XCHECK_NOUN = re.compile(r"\b(?:cross[\s-]?checks?|corroboration|sanity[\s-]?checks?)\b", re.I)
_WITH_XCHECK = re.compile(r"\bwith\b(?=[^;]*" + _XCHECK_NOUN.pattern + r")", re.I)
_EXCLUDED = re.compile(r"\bnot\s+(?:applicable|used|relied|meaningful)\b|\bn/a\b|\binapplicable\b|"
                       r"\bexclud\w*|\breject\w*|\bignored\b|\bdisregard\w*", re.I)
_ASIDE = re.compile(r"\(([^()]*)\)")


def _top_level_split(text, seps):
    """Split on any character in `seps`, but only outside parentheses — "(Multiples-First; 80% combined
    weight)" is one aside, not two clauses (ORCL_2026-08-14)."""
    parts, depth, cur = [], 0, []
    for ch in text:
        depth += (ch == "(") - (ch == ")" and depth > 0)
        if ch in seps and depth == 0:
            parts.append("".join(cur)); cur = []
        else:
            cur.append(ch)
    parts.append("".join(cur))
    return parts


def headline_method(primary_valuation_method):
    """The part of a free-form primary_valuation_method the call is priced on: cross-checks and explicit
    exclusions removed per the grammar note above. Returns "" when nothing but asides remains."""
    text = primary_valuation_method
    while True:  # innermost-first, so a nested aside cannot shield an outer one
        stripped = _ASIDE.sub(lambda m: " " if (_AFTER.search(m.group(1)) or _XCHECK_NOUN.search(m.group(1))
                                                or _EXCLUDED.search(m.group(1))) else m.group(0), text)
        if stripped == text: break
        text = stripped
    kept = []
    for clause in _top_level_split(text, ";"):
        for rx in (_AFTER, _WITH_XCHECK):
            m = rx.search(clause)
            if m: clause = clause[:m.start()]
        kept += [seg for seg in _top_level_split(clause, ",+")
                 if seg.strip() and not (_EXCLUDED.search(seg) or _XCHECK_NOUN.search(seg))]
    return " ".join(seg.strip() for seg in kept)


def eval_w_sector_valuation(business_type, primary_valuation_method):
    """Core of check W. Returns None when N/A (either field blank), else the list of forbidden-method
    tokens present (empty list = clean). Separator-stripped substring match so hyphen/space spellings
    collapse. Side-effect-free + module-level so `eval.py selftest` can exercise it without a run fixture."""
    # Type-safe: a non-string field (a list/number from a malformed decision_record.json) degrades to
    # N/A instead of raising AttributeError on .strip() — both callers (eval.py grader and the live
    # Step 10B.1 finish-gate) pass raw JSON values straight in, and a crash there would kill the whole
    # gate before it emits a GATE:/PROVISIONAL result. Presence + type of these additive fields is
    # separately enforced by eval.py's B_schema check; W only judges validity when both are usable strings.
    bt = business_type.strip() if isinstance(business_type, str) else ""
    pvm = primary_valuation_method.strip() if isinstance(primary_valuation_method, str) else ""
    if not bt or not pvm: return None
    # Match the sector against the CANONICAL classification only — the text before any parenthetical
    # qualifier — so a free-form aside ("SaaS / subscription software (insurance vertical)", "Generic
    # operating company (banking software vendor)") is not mis-read as a financial/REIT and made to wrongly
    # forbid an otherwise-valid method. business_type routinely carries such parentheticals (synthesizer.md).
    # Judge only the HEADLINE method (see headline_method): a method named solely as a cross-check or an
    # explicit exclusion is not the method the call is priced on.
    bt_l = bt.lower().split("(", 1)[0]; pvm_norm = re.sub(r'[^a-z0-9]+', '', headline_method(pvm).lower())
    hits = []
    for sec, fmethods in SECTOR_FORBIDDEN.items():
        if sec in bt_l:
            for fm in fmethods:
                if fm in pvm_norm and fm not in hits: hits.append(fm)
    return hits


# ── Check BJ — §16 "no double-charging a quality gap" ─────────────────────────────────────────────
# CLAUDE.md §16: on an EARNINGS-based multiple (EV/EBITDA, EV/EBIT, P/E, P/FCF) the profitability gap is
# already in the denominator — the peer multiple applied to the company's own weaker earnings has priced
# it once — so a further haircut "derived mechanically as own margin ÷ peer margin" charges the same
# weakness twice. `03_relative-valuation-peers.md` carries a DOUBLE-COUNT TEST and a quality-adjustment
# ledger for exactly this, but nothing checked either. The defect it closes is the doctrine's own
# example, shipped: HAIER_2026-08-13 03 §5 sized its BASE case as `9.71x × (8.7% / 11.5%) = 7.35x` on
# LTM EV/EBITDA (claiming EV/EBITDA "does not already normalize for margin differences") — a ~24%
# value cut the denominator had already taken. Three rules, each narrow enough to measure clean on the
# committed corpus (only HAIER's formula, and the pre-ledger runs' unledgered haircuts, fire):
#   F  a line that multiplies a multiple by a ratio of two percentages, names an earnings multiple and
#      "margin", and is not a book/return-based (P/B, P/TBV, ROE) scaling — §16 allows those;
#   L  a ledger row marked "Yes — gap already in the denominator" that ADJUSTS the multiple and is
#      sized by a percentage-over-percentage ratio;
#   P  the valuation sidecar records a haircut (applied < median) on an earnings multiple while 03
#      carries no quality-adjustment ledger — the haircut's reason is then unauditable.
# A line that is itself discussing the double count ("double-count", "twice") is exempt from F, so an
# orb quoting the bad formula in order to reject it is not flagged.
BJ_DATE = "2026-11-15"  # forward-looking; committed runs predate it → N/A (retrospective advisory in eval.py)
_BJ_MULT = r"\d+(?:\.\d+)?\s*[x×]"
_BJ_PCT = r"\d+(?:\.\d+)?\s*%"
_BJ_FORMULA = re.compile(_BJ_MULT + r"\s*[×*x·]\s*\(?\s*" + _BJ_PCT + r"\s*(?:[/÷]|divided by)\s*" + _BJ_PCT, re.I)
_BJ_RATIO = re.compile(_BJ_PCT + r"\s*(?:[/÷]|divided by)\s*" + _BJ_PCT, re.I)
_BJ_EARN = re.compile(r"EBITDA|EBIT\b|\bP\s*/\s*E\b|\bPE\b|\bEPS\b|\bearnings\b|P\s*/\s*FCF|\bFCF\b", re.I)
_BJ_BOOK = re.compile(r"\bP\s*/\s*(?:T(?:ang)?)?B(?:V|ook)?\b|tangible book|book value|\bROE\b|\bROTE\b|"
                      r"EV\s*/\s*(?:Sales|Revenue)", re.I)
_BJ_MULT_NAME = re.compile(r"\bEV\s*/\s*(?:LTM\s+|NTM\s+)?(?:EBITDA|EBIT|Sales|Revenue)\b|\bP\s*/\s*(?:E|FCF|B|BV|TBV|TangBV|"
                           r"tangible book|book)\b", re.I)
_BJ_SELF_AWARE = re.compile(r"double[\s-]?(?:count|charg)|\btwice\b", re.I)
_BJ_LEDGER_HEAD = re.compile(r"gap already in the denominator", re.I)
_BJ_NUM = re.compile(r"-?\d+(?:\.\d+)?")


def _bj_cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def _bj_ledger_rows(md):
    """(header cells, [row cells]) for every quality-adjustment ledger table in the orb's markdown."""
    out, lines = [], md.splitlines()
    for i, ln in enumerate(lines):
        if ln.lstrip().startswith("|") and _BJ_LEDGER_HEAD.search(ln):
            head, rows = _bj_cells(ln), []
            for nxt in lines[i + 1:]:
                if not nxt.lstrip().startswith("|"):
                    break
                cells = _bj_cells(nxt)
                if all(re.fullmatch(r":?-+:?", c or "-") for c in cells):
                    continue
                rows.append(cells)
            out.append((head, rows))
    return out


def _bj_first_num(cell):
    m = _BJ_NUM.search((cell or "").replace(",", ""))
    return float(m.group()) if m else None


def eval_bj_quality_double_count(decision_date, peers_md, peers_internals=None):
    """Core of check BJ. `peers_md` = text of valuation/03_relative-valuation-peers.md (or None);
    `peers_internals` = valuation_summary.json's `peers_internals` object (or None). Returns None (N/A —
    pre-gate, or no peers orb) or a list of violations (empty = clean). Pure; no I/O."""
    if not (isinstance(decision_date, str) and decision_date >= BJ_DATE):
        return None
    if not isinstance(peers_md, str) or not peers_md.strip():
        return None
    det = []
    # F — the formula in prose (ledger rows are judged by L). The multiple the formula is APPLIED to is
    # the nearest multiple named before it on the line (else the first after): HAIER's line says "unlike
    # EV/Sales or P/E" in passing, but the formula is applied to "the peer median EV/EBITDA multiple".
    in_ledger = False
    for ln in peers_md.splitlines():
        is_row = ln.lstrip().startswith("|")
        in_ledger = is_row and (in_ledger or bool(_BJ_LEDGER_HEAD.search(ln)))
        if in_ledger:
            continue
        m = _BJ_FORMULA.search(ln)
        if not m or not re.search(r"margin", ln, re.I) or _BJ_SELF_AWARE.search(ln):
            continue
        before = list(_BJ_MULT_NAME.finditer(ln, 0, m.start()))
        after = _BJ_MULT_NAME.search(ln, m.start())
        target = before[-1].group(0) if before else (after.group(0) if after else "")
        if _BJ_EARN.search(target) and not _BJ_BOOK.search(target):
            det.append(f"§16 double count: an earnings-multiple haircut is sized as a margin ratio "
                       f"({m.group(0).strip()!r}) — the weaker margin is already in the denominator, so this "
                       "charges it twice; apply the peer median to the company's own metric, or size a "
                       "discount by a reason the denominator does not carry (durability, growth, incremental "
                       "returns, risk) — CLAUDE.md §16, 03 DOUBLE-COUNT TEST")
    # L — a ledger row that admits the gap is in the denominator, adjusts anyway, and sizes by a ratio.
    ledgers = _bj_ledger_rows(peers_md)
    for head, rows in ledgers:
        low = [h.lower() for h in head]
        gi = next((i for i, h in enumerate(low) if "denominator" in h), None)
        if gi is None:
            continue
        mi = next((i for i, h in enumerate(low) if "median" in h), None)
        ai = next((i for i, h in enumerate(low) if "adjusted to" in h), None)
        si = next((i for i, h in enumerate(low) if "sized" in h), None)
        for cells in rows:
            if len(cells) <= gi or not re.match(r"[*_\s]*yes\b", cells[gi], re.I):
                continue
            med = _bj_first_num(cells[mi]) if mi is not None and mi < len(cells) else None
            adj = _bj_first_num(cells[ai]) if ai is not None and ai < len(cells) else None
            if med is None or adj is None or abs(adj - med) <= 0.005 * abs(med):
                continue  # no adjustment made — nothing charged
            sizing = cells[si] if si is not None and si < len(cells) else ""
            r = _BJ_RATIO.search(sizing)
            if r and not _BJ_SELF_AWARE.search(sizing) and not _BJ_BOOK.search(sizing):
                det.append(f"§16 double count: ledger row {cells[0]!r} says the gap is already in the "
                           f"denominator, then sizes its {med:g}x → {adj:g}x adjustment by a ratio "
                           f"({r.group(0)!r}) — size it by the separate reason it pays for (CLAUDE.md §16)")
    # P — a recorded earnings-multiple haircut with no ledger to audit its reason.
    pi = peers_internals if isinstance(peers_internals, dict) else {}
    metric, med, app = pi.get("metric_name"), pi.get("median_multiple"), pi.get("applied_multiple")
    num = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool)
    if (isinstance(metric, str) and _BJ_EARN.search(metric) and not _BJ_BOOK.search(metric)
            and num(med) and num(app) and med > 0 and app < med * 0.995 and not ledgers):
        det.append(f"§16 unaudited haircut: valuation_summary.json peers_internals cuts {metric!r} from the "
                   f"{med:g}x peer median to {app:g}x ({(1 - app / med) * 100:.1f}% haircut on an earnings "
                   "multiple) but 03_relative-valuation-peers.md carries no quality-adjustment ledger — the "
                   "DOUBLE-COUNT TEST cannot be checked; add the ledger naming what the haircut pays for "
                   "beyond the margin already in the denominator (CLAUDE.md §16)")
    return det
