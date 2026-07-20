#!/usr/bin/env python3
"""Headline-integrity detectors — Headline Scorecard reconciliation (check AI, CLAUDE.md
§10/§21) and red-flag severity reconciliation (check AK, CLAUDE.md §13/§18).

Side-effect-free, importable, doctrine logic — extracted from `scripts/eval.py` (checks AI
and AK) so the SAME detection functions can run in TWO places instead of one, mirroring
exactly why `scripts/rating_caps.py` exists (see that module's docstring):

1. **Retrospective** — `scripts/eval.py` imports these to grade already-committed runs
   (checks AI/AK), as it always has.
2. **Live, pre-publish** — `/research:full` Step 10B.1 (the deterministic finish-gate that
   also runs on every `/research:rerun`, per fix F-RRGATE) imports these to check a thesis
   BEFORE it ships, stamping `final_thesis.md` PROVISIONAL on a violation instead of letting
   it commit clean.

Before this module existed, checks AI and AK were the two checks that had NOT received the
same live-gate treatment already given to the §24 rejector-filter caps (checks AC/AD/AE/AF,
`rating_caps.py`) — they existed only as post-hoc `eval.py` checks nobody was required to run
before commit. Both defect classes have already shipped to `main` clean:

- **AI** (Headline Scorecard prose drifting from `decision_record.json`'s own numbers):
  `TMCV_2026-06-07/final_thesis.md` shipped "Expected return | +4.3%" while its own
  `decision_record.json` carried `expected_return_pct=-4.4` — caught only via a later manual
  `/research:eval` run and hand-corrected with a `corrections.json` errata + an appended
  `ERRATUM` banner (DECISION_LEDGER.md §4a). The live finish-gate's own scenario-math block
  (10B.1) re-derives `decision_record.json`'s INTERNAL math consistency, but never opened
  `final_thesis.md` to check the PROSE the reader actually sees still matches it.
- **AK** (a module's declared Critical red flag silently failing to reach
  `decision_record.json`'s `red_flags` array, or the Headline Scorecard's "Rating cap" cell
  denying one exists): `AMZN_2026-07-10/final_thesis.md` ships with its own earnings module
  declaring 2 Critical red flags while `decision_record.json`'s `red_flags` array carries zero
  Critical entries and the Headline Scorecard explicitly denies any Critical flag — a direct
  CLAUDE.md §13 violation ("a critical ... red flag must cap the final rating unless it is
  explicitly resolved by primary evidence") that shipped clean and sat undetected on `main`
  until a later manual `/research:eval` run (one day before AK's own gate date, so `eval.py`
  itself can only ever see it as a retrospective advisory, not a gating failure).

Importing this module into the live finish-gate closes that hole for every future run: the
exact same detection logic that flags a violation on `/research:eval` now flags it before the
thesis is committed — no bypass clause, no reliance on a human remembering to run `eval.py`
afterward.

Each function is pure and side-effect-free; see each docstring for its `None` / `[]` / `[...]`
return convention (mirrors `rating_caps.py`'s `eval_*_cap` functions: `None` = not applicable
/ pre-gate, `[]` = applicable and satisfied, `[...]` = one or more violation strings). No
caller may treat a violation as fatal — CLAUDE.md §13 requires caps to be *applied*, not used
to silently kill a run; both call sites (eval.py, the finish-gate) turn a non-empty result into
a visible flag (a FAIL row, or a PROVISIONAL banner) — never a silent abort.
"""

import re


def isdate(s):
    try:
        import datetime
        datetime.date.fromisoformat(s)
        return True
    except Exception:
        return False


def isnum(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)  # bool is an int subclass — exclude it


# ── Check AI (Headline Scorecard ↔ decision_record.json reconciliation) ──
# synthesizer.md §2/Step 4 requires the Part I Headline Scorecard cells (the ONLY numbers most readers
# ever see) to be "copied verbatim" from the same computed result that fills decision_record.json — "so
# the headline can never disagree with the body." A prose/JSON split is exactly the false-confidence
# failure mode CLAUDE.md §10/§21 exist to prevent — and it is not hypothetical (see module docstring).
AI_DATE = "2026-07-09"
# Two-number confidence split (Understanding + Conviction) replaces the single "Confidence /100" scorecard
# row on/after this date (schema fields analysis_confidence/conviction; DECISION_LEDGER.md §5). Before it,
# the old "Confidence /100" + "Data sufficiency /100" rows apply.
CONF_SPLIT_DATE = "2026-07-11"


def _scorecard_section(thesis):
    """The text of the '## 2. Headline Scorecard' section ONLY — from its heading up to the next '## '
    heading (or EOF). Scoping every cell read to this slice is what stops _hs_cell picking up a row that
    actually lives in a LATER scenario/valuation table when the reader-facing scorecard omits or
    mislabels it. None if absent."""
    m = re.search(r"(?ims)^##\s*2\.\s*Headline Scorecard\b.*?(?=^##\s|\Z)", thesis)
    return m.group(0) if m else None


def _hs_cell(section, label):
    """The Headline Scorecard 'Answer' cell for a row whose label starts with `label` (tolerates trailing
    qualifiers like 'Expected return (probability-weighted)'), searched ONLY within the scorecard section
    text, or None if the row is absent. Anchored on the pipe-table row shape synthesizer.md §2 defines."""
    if not section: return None
    m = re.search(r"(?im)^\|\s*"+re.escape(label)+r"[^|]*\|\s*(.*?)\s*\|\s*$", section)
    return m.group(1) if m else None


def _metric_numbers(text, kind):
    """The numbers in a scorecard cell that actually CARRY the row's metric, so an unrelated price/range
    value sharing the cell cannot satisfy the check. Unicode minus/en/em-dashes and the '×' sign are
    normalized first. kind:
      'pct'   -> only numbers written with a percent sign (a bear-case price 'AED 20.0' is ignored);
      'ratio' -> numbers written as an x/× multiple, falling back to bare non-percent numbers when the
                 cell writes the ratio without a unit (e.g. '≈ −0.37');
      'plain' -> the score integer, after dropping a '/100' denominator."""
    if not text: return []
    t = text.replace("−","-").replace("–","-").replace("—","-").replace("×","x")
    if kind=="pct":
        return [float(x) for x in re.findall(r"([+-]?\d+(?:\.\d+)?)\s*%", t)]
    if kind=="ratio":
        xs = re.findall(r"([+-]?\d+(?:\.\d+)?)\s*x\b", t, re.I)
        if xs: return [float(x) for x in xs]
        # Ratio written without a unit ("≈ -0.37"): bare non-percent numbers, but FIRST drop figures that
        # cannot be a risk/reward ratio — currency amounts / prices ("$38", "AED 20", "Rs 1,450"), quantities
        # with a unit ("38/share", "480 million units"), and 4-digit years — so a stray price sharing the
        # cell ("≈ -0.37 … risking ~$38/share") can't spuriously satisfy a bad JSON ratio.
        tt = re.sub(r"(?:[$€£₹]|\b(?:aed|rs|usd|inr|eur|gbp)\b\.?)\s*[+-]?\d[\d,]*(?:\.\d+)?", " ", t, flags=re.I)
        tt = re.sub(r"[+-]?\d[\d,]*(?:\.\d+)?\s*(?:/\s*share|per\s+share|shares?|crore|cr|lakh|million|mn|billion|bn|units?)\b", " ", tt, flags=re.I)
        tt = re.sub(r"\b(?:19|20)\d{2}\b", " ", tt)
        return [float(x) for x in re.findall(r"[+-]?\d+(?:\.\d+)?(?!\s*%)", tt)]
    t = re.sub(r"/\s*100\b","",t)
    return [float(x) for x in re.findall(r"[+-]?\d+(?:\.\d+)?", t)]


def _reconciles(nums, target, tol_abs, tol_rel, use_abs=False):
    """True iff some number in `nums` ties to `target` within max(tol_abs, |target|*tol_rel).
    Downside risk (use_abs=True) is compared by MAGNITUDE only — synthesizer.md §2/Step-4 documents a
    deliberate reader-friendly sign inversion when the bear case sits above entry (EMAR: prose '+63.9%'
    for downside_risk_pct=-63.9, both describing one all-upside setup). For every sign-sensitive field
    (use_abs=False: Expected return, Risk/reward, the scores) a SIGN FLIP is never a match — a headline
    that flips the sign of the body is the exact TMCV bug this check exists to catch."""
    if not isnum(target) or not nums: return False
    t = abs(target) if use_abs else target
    for n in nums:
        if (not use_abs) and n and target and (n>0)!=(target>0): continue  # sign flip on a sign-sensitive field
        v = abs(n) if use_abs else n
        if abs(v-t) <= max(tol_abs, abs(target)*tol_rel): return True
    return False


def eval_ai_headline_reconciliation(decision_date, d, thesis):
    """Core of check AI. Returns None (N/A — pre-gate) or a list of violation strings (empty = pass).
    `d` is the parsed decision_record.json; `thesis` is the full final_thesis.md text.
    Confidence /100 and Data sufficiency /100 are exact-match (plain integers, no legitimate reason to
    differ). Expected return and Risk/reward are sign-sensitive (a sign flip IS the bug — see _reconciles).
    Downside risk is compared by MAGNITUDE only (the documented §2 reader-friendly sign inversion)."""
    if not (isdate(decision_date) and decision_date >= AI_DATE):
        return None  # forward-looking; pre-gate runs N/A
    # Defensive for the same reason as AK below: in the live 10B.1 gate a raise would kill the whole block,
    # so a malformed record must surface as a violation, never as an exception.
    if not isinstance(d, dict):
        return [f"decision_record.json did not parse as a JSON object (got {type(d).__name__}) — "
                f"cannot reconcile the Headline Scorecard"]
    section = _scorecard_section(thesis)
    if section is None:
        return ["'## 2. Headline Scorecard' section not found in final_thesis.md"]
    det=[]
    # The two reader-facing SCORE rows are MANDATORY in the §2 scorecard even for a non-conviction run whose
    # score field is null — synthesizer.md §2 makes them numbers the reader always sees, so an omitted row is
    # a real defect the §8/§14 tables cannot paper over. (An honest "N/A" cell for a null field is still a
    # present row and is fine — only a wholly ABSENT row fails.) For a return/ratio field, an absent row is
    # only a defect when the JSON actually carries a value to reconcile against.
    # Two-number confidence (Understanding + Conviction) supersedes the single Confidence /100 row on/after
    # CONF_SPLIT_DATE; data sufficiency is folded into Understanding (still in the JSON, still drives §11 caps).
    if isdate(decision_date) and decision_date >= CONF_SPLIT_DATE:
        SCORE_ROWS_REQUIRED = {"conviction", "analysis_confidence"}
        _rows = [
            ("Conviction /100", "conviction", "plain", 0.5, 0.0, False),
            ("Understanding /100", "analysis_confidence", "plain", 0.5, 0.0, False),
            ("Expected return", "expected_return_pct", "pct", 1.0, 0.05, False),
            ("Risk/reward", "risk_reward", "ratio", 0.15, 0.12, False),
            ("Downside risk", "downside_risk_pct", "pct", 1.0, 0.05, True),
        ]
    else:
        SCORE_ROWS_REQUIRED = {"confidence_score", "data_sufficiency_score"}
        _rows = [
            ("Confidence /100", "confidence_score", "plain", 0.5, 0.0, False),
            ("Data sufficiency /100", "data_sufficiency_score", "plain", 0.5, 0.0, False),
            ("Expected return", "expected_return_pct", "pct", 1.0, 0.05, False),
            ("Risk/reward", "risk_reward", "ratio", 0.15, 0.12, False),
            ("Downside risk", "downside_risk_pct", "pct", 1.0, 0.05, True),
        ]
    for label, field, kind, tol_abs, tol_rel, use_abs in _rows:
        target = d.get(field)
        cell = _hs_cell(section, label)
        nums = _metric_numbers(cell, kind)
        if cell is None:
            if field in SCORE_ROWS_REQUIRED:
                det.append(f"Headline Scorecard row {label!r} is required (a reader-facing score) but absent from the scorecard")
            elif isnum(target):
                det.append(f"Headline Scorecard row {label!r} not found but {field}={target} is set")
            continue  # row absent + non-score field + null JSON → nothing to reconcile
        if not isnum(target):
            # field null/missing but the row IS present: a numeric headline cell then has no computed value
            # to be a verbatim copy OF (§2) — flag the split; an empty / "N/A" cell for a null field is fine.
            if nums:
                det.append(f"Headline Scorecard {label!r}={cell!r} carries a number but {field} is null/missing in decision_record.json")
            continue
        if not _reconciles(nums, target, tol_abs, tol_rel, use_abs):
            det.append(f"Headline Scorecard {label!r}={cell!r} does not reconcile with {field}={target}"
                        +(" (by magnitude)" if use_abs else ""))
    # Post-split (>= CONF_SPLIT_DATE): the scorer's two outputs are REQUIRED numbers, and confidence_score
    # MUST equal conviction. Without this, a run can present Conviction /100 = 80 in the headline while
    # leaving confidence_score = 50 (or null); the shipped §7 gates V_edge_gate and AH_expectations_gap_gate
    # still read confidence_score, so they bind to the stale value and an unproven high-conviction thesis
    # passes — and a null conviction/analysis_confidence with an "N/A" cell would otherwise slip past the
    # row-presence check with the scorer never run.
    if isdate(decision_date) and decision_date >= CONF_SPLIT_DATE:
        cf=d.get("confidence_score"); cv=d.get("conviction"); au=d.get("analysis_confidence")
        for fld,val in [("conviction",cv),("analysis_confidence",au)]:
            if not isnum(val):
                det.append(f"post-split run (>= {CONF_SPLIT_DATE}): decision_record.json {fld}={val!r} must be a number "
                           f"(from scripts/confidence.py) — a null/absent value means the scorer did not run")
            elif not (0.0 <= float(val) <= 100.0):
                det.append(f"post-split run: decision_record.json {fld}={val} is outside the 0-100 range "
                           f"(CLAUDE.md §12 — all scores are 0-100)")
        if isnum(cv) and not isnum(cf):
            det.append(f"post-split run: conviction={cv} is set but confidence_score={cf!r} is null — set "
                       f"confidence_score=conviction (backward-compat; V_edge_gate/AH still read confidence_score)")
        elif isnum(cv) and isnum(cf) and abs(float(cf)-float(cv))>0.5:
            det.append(f"post-split run: confidence_score={cf} must equal conviction={cv} (backward-compat; the §7 "
                       f"V_edge_gate/AH gates read confidence_score, so a split lets an unproven high-conviction thesis ship)")
        # The split REPLACES the legacy rows — data sufficiency is folded into Understanding (synthesizer.md
        # §2). A carried-forward old template that still shows Confidence /100 or Data sufficiency /100
        # alongside the new rows leaves the reader two disagreeing systems; reject it.
        for legacy in ("Confidence /100", "Data sufficiency /100"):
            if _hs_cell(section, legacy) is not None:
                det.append(f"post-split run (>= {CONF_SPLIT_DATE}): legacy scorecard row {legacy!r} must not appear — "
                           f"post-split emits Conviction /100 + Understanding /100 only (data sufficiency folded into Understanding)")
        # A numeric conviction/analysis_confidence pair alone does not prove scripts/confidence.py actually
        # ran — a record can hand-write matching numbers and leave the scorer's own artifacts null. Require
        # confidence_inputs (the recorded judgments the scorer consumes) and confidence_breakdown (the
        # auditable step-by-step build) to be present dict objects, and sizing_hint to be a {band, action}
        # dict — DECISION_LEDGER.md §5's declared shapes.
        ci = d.get("confidence_inputs")
        if not isinstance(ci, dict):
            det.append(f"post-split run (>= {CONF_SPLIT_DATE}): confidence_inputs={ci!r} must be an object "
                       f"(the recorded judgments scripts/confidence.py consumed) — a null/absent value means "
                       f"the scorer may never have actually run")
        cb = d.get("confidence_breakdown")
        if not isinstance(cb, dict):
            det.append(f"post-split run (>= {CONF_SPLIT_DATE}): confidence_breakdown={cb!r} must be an object "
                       f"(the scorer's auditable step-by-step build) — a null/absent value means conviction "
                       f"cannot be re-derived")
        sh = d.get("sizing_hint")
        if not (isinstance(sh, dict) and isinstance(sh.get("band"), str) and isinstance(sh.get("action"), str)):
            det.append(f"post-split run (>= {CONF_SPLIT_DATE}): sizing_hint={sh!r} must be an object with "
                       f"string 'band' and 'action' fields (DECISION_LEDGER.md §5)")
    return det


# ── Check AK (red-flag severity reconciliation, CLAUDE.md §13/§18) ──
# CLAUDE.md §13 makes a Critical red flag hard-cap the rating; §18 caps the headline at Watchlist or
# lower whenever one stands unresolved. Every module already tells the synthesizer its own Critical
# count in its 99_*-synthesis.md (management-governance's `critical_red_flag_count` JSON field;
# earnings-red-flags' "N critical" prose + "Critical" severity table cells; the shapes already in
# production use). This checks that count actually reaches decision_record.json's `red_flags` array
# with severity="Critical" — a module could report "Critical concerns" and the synthesizer could
# silently write those same flags in as "High" (or drop them) with nothing to catch it.
AK_DATE = "2026-07-11"
_AK_CRITICAL_PATTERNS = [
    re.compile(r'"critical_red_flag_count"\s*:\s*(\d+)'),
    re.compile(r'\bCritical\s*:\s*(\d+)\b', re.I),
    re.compile(r'\((\d+)\s+critical\b', re.I),
    re.compile(r'\|\s*Critical\s+flags?\s*\|\s*(\d+)\s*\|', re.I),
    re.compile(r'(\d+)\s+critical\s+(?:red[- ]?flags?|flags?)\b', re.I),
    re.compile(r'\bCritical\s+flags?\s*\((\d+)\)', re.I),   # "**Critical flags (3):**" — a production phrasing
]
_AK_DENIAL = re.compile(r'\bno\b[^.\n]{0,60}\bcritical\b', re.I)
# A denial only counts when the SAME cell does not ALSO affirm a Critical cap. A truthful scoped cell
# ("2 Critical earnings flags cap the rating; no Critical governance red flag") acknowledges the module's
# Criticals AND correctly notes a DIFFERENT module has none — compliant per §13/§18, not a denial. Affirm =
# a digit-anchored "N Critical" count or an explicit "Critical ... cap"/"cap ... Critical" phrase.
_AK_AFFIRM = re.compile(r'\d+\s+critical|critical[^.\n]{0,40}\bcaps?\b|\bcaps?\b[^.\n]{0,40}critical', re.I)


def _module_critical_count(text):
    """Best-effort count of a module's OWN declared Critical-severity red-flag total, scanning the
    digit-anchored phrasings modules already use in production ('2 critical', 'Critical: 0',
    '| Critical flags | 2 |', 'critical_red_flag_count'). Digit-anchored on purpose so loose prose use
    of the word 'critical' (a 'critical risk', 'critical juncture') can't false-fire. Returns None when
    the text carries no such declaration at all (nothing to reconcile) — an explicit declared zero is a
    real 0, not None."""
    found = [int(m.group(1)) for pat in _AK_CRITICAL_PATTERNS for m in pat.finditer(text or "")]
    return max(found) if found else None


def eval_ak_red_flag_severity_reconciliation(decision_date, d, thesis, module_texts):
    """Core of check AK. `module_texts` is {module_name: its 99_*-synthesis.md text}. Returns None
    (N/A — pre-gate) or a list of violation strings (empty = pass)."""
    if not (isdate(decision_date) and decision_date >= AK_DATE):
        return None  # forward-looking; pre-gate runs N/A
    # These checks now run in the LIVE 10B.1 finish-gate, where an exception is worse than a violation: it
    # kills the whole gate block, so nothing stamps final_thesis.md PROVISIONAL and the run ships clean —
    # the exact false-confidence hole this check exists to close. Every read below is therefore defensive
    # against a malformed record: report the malformation as a violation, never raise.
    if not isinstance(d, dict):
        return [f"decision_record.json did not parse as a JSON object (got {type(d).__name__}) — "
                f"cannot reconcile red-flag severity"]
    declared = {}
    for mod, text in (module_texts or {}).items():
        c = _module_critical_count(text)
        if c:  # 0/None both mean "nothing to reconcile from this module"
            declared[mod] = c
    if not declared:
        return []  # no module declared a Critical flag — nothing to reconcile
    top_mod = max(declared, key=declared.get); top_n = declared[top_mod]
    flags = d.get("red_flags")
    if not isinstance(flags, list):  # a truthy non-list (bool/dict/number) would raise or miscount
        flags = []
    json_critical = sum(1 for rf in flags if isinstance(rf, dict) and str(rf.get("severity","")).strip().lower()=="critical")
    det = []
    if json_critical < top_n:
        det.append(f"{top_mod} declares {top_n} Critical red flag(s) but decision_record.json's red_flags "
                    f"array carries only {json_critical} entr{'y' if json_critical==1 else 'ies'} with "
                    f"severity=Critical (modules declaring a Critical count: {declared})")
    section = _scorecard_section(thesis)
    cap_cell = _hs_cell(section, "Rating cap") if section else None
    for label, txt in [("Headline Scorecard 'Rating cap' cell", cap_cell), ("decision_record.json rating_cap field", d.get("rating_cap"))]:
        if not txt:
            continue
        if not isinstance(txt, str):
            # A truthy non-string (list/dict/number) would raise TypeError inside re.search and take the
            # whole live gate down with it. A rating cap that isn't text is itself malformed — report it.
            det.append(f"{label} is not a string (got {type(txt).__name__}: {txt!r}) — a rating cap must be "
                       f"readable text; cannot verify it does not deny {top_mod}'s {top_n} Critical flag(s)")
            continue
        if _AK_DENIAL.search(txt) and not _AK_AFFIRM.search(txt):
            det.append(f"{label} denies a Critical red flag ({txt!r}) but {top_mod} declares {top_n}")
    return det
