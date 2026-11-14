#!/usr/bin/env python3
"""Headline-integrity detectors — Headline Scorecard reconciliation (check AI, CLAUDE.md
§10/§21), the Decision Audit Trail structural check (check AJ, CLAUDE.md §8/§22), and
red-flag severity reconciliation (check AK, CLAUDE.md §13/§18), and the tradable-line / dividend-yield
availability check (check BG, CLAUDE.md §16), the net-cash basis label (check BH, §15), and run-wide
FX-conversion consistency (check BI, §27).

Side-effect-free, importable, doctrine logic — extracted from `scripts/eval.py` (checks AI,
AJ, and AK) so the SAME detection functions can run in TWO places instead of one, mirroring
exactly why `scripts/rating_caps.py` exists (see that module's docstring):

1. **Retrospective** — `scripts/eval.py` imports these to grade already-committed runs
   (checks AI/AJ/AK), as it always has.
2. **Live, pre-publish** — `/research:full` Step 10B.1 (the deterministic finish-gate that
   also runs on every `/research:rerun`, per fix F-RRGATE) imports these to check a thesis
   BEFORE it ships, stamping `final_thesis.md` PROVISIONAL on a violation instead of letting
   it commit clean.

Before this module existed, checks AI and AK were the two checks that had NOT received the
same live-gate treatment already given to the §24 rejector-filter caps (checks AC/AD/AE/AF,
`rating_caps.py`) — they existed only as post-hoc `eval.py` checks nobody was required to run
before commit. Check AJ joined this module later, for the identical reason (it too existed only
as a post-hoc `eval.py` check, so the live gate could never call it). All three defect classes
have already shipped to `main` clean, or were caught only by luck of timing:

- **AI** (Headline Scorecard prose drifting from `decision_record.json`'s own numbers):
  `TMCV_2026-06-07/final_thesis.md` shipped "Expected return | +4.3%" while its own
  `decision_record.json` carried `expected_return_pct=-4.4` — caught only via a later manual
  `/research:eval` run and hand-corrected with a `corrections.json` errata + an appended
  `ERRATUM` banner (DECISION_LEDGER.md §4a). The live finish-gate's own scenario-math block
  (10B.1) re-derives `decision_record.json`'s INTERNAL math consistency, but never opened
  `final_thesis.md` to check the PROSE the reader actually sees still matches it.
- **AJ** (the Part II "Decision Audit Trail" table — CLAUDE.md §8/§22's per-driver bull/bear
  adjudication, "which side wins and why" — actually present and populated, not merely
  instructed by synthesizer.md prompt text): until this check existed anywhere, a synthesizer
  could regress to an empty or token table and nothing would catch it — the exact
  "summarize, don't adjudicate" failure §22 warns against. See the AJ section below for the
  full rationale.
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
# Divergence (points) between the recorded conviction and the value scripts/confidence.py recomputes from
# `confidence_inputs` that this check treats as fabrication rather than input-completeness drift. See the
# re-derivation block in eval_ai_headline_reconciliation for why this is far wider than the scorer's own
# RECONCILE_TOL.
AI_CONVICTION_TOL = 15.0
# CLAUDE.md §18's full allowed-decision set, lower-cased for the Rating-qualifier contradiction check
# (a trailing qualifier may explain the recorded decision, e.g. "Buy — revisit after Q2", but must not
# NAME a second, different decision from this set, e.g. "Buy / Watchlist").
_ALL_DECISIONS = ["strong buy", "buy", "starter position only", "watchlist", "avoid", "short candidate",
                  "pair trade / hedge required", "insufficient data — refuse to rate"]
# The closed set of `action` strings scripts/confidence.py's sizing_hint() can ever produce (kept in sync
# with that function by hand — there is no shared source, so update both if sizing_hint()'s wording changes).
# Used the same way as _ALL_DECISIONS: a 'Suggested sizing' cell that leads with the recorded action must not
# go on to name a DIFFERENT one of these in its trailing gloss (Codex r6).
_ALL_SIZING_ACTIONS = [
    "no position — refuse to rate (§11)",
    "construct the pair/hedge — size to the spread, not directional",
    "hedge thesis noted — wait for the spread/trigger before constructing",
    "short candidate — initiate a (paper) short; size to borrow/risk",
    "lean short — monitor for the trigger, no short on yet",
    "clear avoid — do not own; exit if held",
    "lean avoid — monitor, no position",
    "starter position only (decision caps size)",
    "tiny starter — mostly watchlist",
    "full position candidate",
    "standard position",
    "starter position only",
    "monitor only — no position (track opportunity cost)",
]


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


def _hs_cell_exact(section, label):
    """Like _hs_cell but the row label must be EXACTLY `label` (ignoring surrounding spaces/emphasis), so
    'Rating' cannot be satisfied by a 'Rating cap' row."""
    if not section: return None
    # Emphasis may be `*`/`**` OR `_`/`__` (Markdown allows both), so `| __Rating__ |` is the SAME row as
    # `| Rating |` — matching only `*` would report a present underscore-emphasised row as absent.
    m = re.search(r"(?im)^\|\s*[*_]*\s*"+re.escape(label)+r"\s*[*_]*\s*\|\s*(.*?)\s*\|\s*$", section)
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
        # Only the LEADING number carries the ratio. The cell writes the value first and then explains it
        # ("-0.18 (probability-weighted upside vs target NOK 77.83)"), so returning every surviving number
        # let an unrelated amount satisfy a wrong JSON risk_reward — and the currency strip above can only
        # ever know a fixed whitelist, so an unlisted symbol (NOK, SEK, CHF, …) always leaked through.
        # Taking just the first number is whitelist-independent and matches how the row is actually written.
        _lead = re.search(r"[+-]?\d+(?:\.\d+)?(?!\s*%)", tt)
        return [float(_lead.group(0))] if _lead else []
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
    # The scorecard's RATING is the single most consequential cell a reader sees, and it was the one row
    # never reconciled here. Check I does not close it: it passes when EITHER any `Decision:` line OR any
    # Rating cell matches the JSON, so a correct decision line elsewhere in the thesis masks a Headline
    # Scorecard that says "Avoid" while decision_record.json says "Buy". Compared case/space-insensitively
    # on the leading decision phrase, so a cell that appends a qualifier ("Watchlist — revisit after Q2")
    # still reconciles; only a genuinely DIFFERENT decision fails.
    # EXACT label: _hs_cell's `label + [^|]*` also matches "Rating cap", so a scorecard that omits the real
    # Rating row would have had its cap text accepted as the rating (and reported nothing missing).
    rating_cell = _hs_cell_exact(section, "Rating")
    if section is not None and rating_cell is None:
        det.append("Headline Scorecard row 'Rating' is required (the decision the reader sees) but absent "
                   "from the scorecard — a 'Rating cap' row does not stand in for it")
    jdec = d.get("decision")
    if rating_cell is not None and not (isinstance(jdec, str) and jdec.strip()):
        # A present Rating row (whether it names a rating or is itself blank) with no decision of record to
        # reconcile it against is not "nothing to check" — it is a run that can ship a reader-facing rating
        # (or a blank one) with no recorded decision behind it at all. Previously this whole block was
        # skipped whenever `decision` was missing/blank, silently passing both cases (Codex r8).
        det.append(f"decision_record.json 'decision' field is missing or blank ({jdec!r}) but the Headline "
                   f"Scorecard has a 'Rating' row ({rating_cell!r}) — there is no decision of record to "
                   f"reconcile the reader-facing rating against (CLAUDE.md §18/§21)")
    if rating_cell is not None and isinstance(jdec, str) and jdec.strip():
        # Strip markdown emphasis first — real runs write "**Watchlist**", which is the SAME decision.
        _norm = lambda s: re.sub(r'\s+', ' ', re.sub(r'[*_`]', '', str(s))).strip().lower()
        cell_norm = _norm(rating_cell)
        want = _norm(jdec)
        # Boundary-anchored: a bare startswith lets 'Buyback candidate' satisfy decision 'Buy'.
        # The documented qualifier forms all put a delimiter after the decision.
        # No bare dash in the delimiter class: a real qualifier always puts WHITESPACE after the decision
        # ("Buy — revisit after Q2"), whereas a hyphen tight against it forms a different word
        # ("Buy-and-hold"), which must not satisfy decision "Buy".
        _m = re.match(re.escape(want) + r'(?:$|[\s,;:.()])', cell_norm)
        if not _m:
            det.append(f"Headline Scorecard 'Rating'={rating_cell!r} does not match decision={jdec!r} in "
                       f"decision_record.json — the rating the reader sees must be the decision of record "
                       f"(CLAUDE.md §18/§21)")
        else:
            # A leading match is not enough — "Buy / Watchlist", "Buy (Avoid)", and "Buy — capped at
            # Watchlist" all start with the recorded decision followed by a boundary, so the qualifier check
            # above passes them, but each also NAMES a second, different §18 decision in the trailing text —
            # a real contradiction a qualifier (which explains the SAME decision, not offers another one)
            # must not be able to hide (Codex r4). Restricted to syntax that actually PRESENTS an alternative
            # rating — slash-separated ("/ Watchlist"), parenthetical ("(Avoid)"), or an explicit cap/
            # downgrade phrase ("capped at Watchlist", "downgraded to Avoid") — rather than a bare whole-word
            # scan: "avoid" and "buy" are ordinary English words/verbs too, so a qualifier merely USING one
            # ("Buy — avoid chasing after the rally") must not be mistaken for naming a second rating
            # (Codex r5).
            _rest = cell_norm[_m.end():]
            _boundary_cls = r'[\s,;:./()\-–—]'
            for _dec in sorted(_ALL_DECISIONS, key=len, reverse=True):
                if _dec == want:
                    continue
                _e = re.escape(_dec)
                _second_rating_pat = (
                    r'/\s*' + _e + r'(?:$|' + _boundary_cls + r')'                       # "Buy / Watchlist"
                    r'|\(\s*' + _e + r'\s*\)'                                             # "Buy (Avoid)"
                    r'|\b(?:capp?ed\s+at|cap\s+to|downgrade[d]?\s+to|revised?\s+to)\s+' + _e + r'\b'  # "capped at Watchlist"
                    # explicit alternative-conjunctions ("Buy or Watchlist", "Buy vs Watchlist", "Buy,
                    # alternatively Watchlist") present a second rating just as plainly as a slash (Codex r7).
                    r'|\b(?:or|versus|vs\.?|alternatively)\b\s*' + _e + r'(?:$|' + _boundary_cls + r')'
                )
                if re.search(_second_rating_pat, _rest):
                    det.append(f"Headline Scorecard 'Rating'={rating_cell!r} also names {_dec!r} alongside "
                               f"decision={jdec!r} in decision_record.json — a qualifier may explain the "
                               f"recorded decision, not offer a second, different one (CLAUDE.md §18/§21)")
                    break
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
        # The reader-facing 'Suggested sizing' scorecard cell IS sizing_hint.action (synthesizer.md §2:
        # "`Suggested sizing` = `sizing_hint.action`"). Reconcile it here, exactly as the Rating row is
        # reconciled above — validating only the JSON sizing_hint (in the scorer block below) leaves the
        # cell the reader actually sees unchecked, so a scorecard showing 'full position candidate' over a
        # recorded 'standard position' would ship an unsupported size clean (Codex r2).
        if isinstance(sh, dict) and isinstance(sh.get("action"), str) and sh.get("action").strip():
            _size_cell = _hs_cell(section, "Suggested sizing")
            # A wholly ABSENT row and a PRESENT-but-BLANK cell ("| Suggested sizing | |") are the same
            # defect — synthesizer.md §2 makes this a required reader-facing row (= sizing_hint.action), and
            # `_hs_cell` returns '' (not None) for a blank cell, so the earlier `is None` check alone let a
            # blank cell skip reconciliation entirely (Codex r5).
            if _size_cell is None or not _size_cell.strip():
                det.append("Headline Scorecard row 'Suggested sizing' is required (the reader-facing "
                           "position size) but absent or blank in the scorecard — synthesizer.md §2 defines "
                           "it as sizing_hint.action")
            else:
                _snorm = lambda s: re.sub(r'\s+', ' ', re.sub(r'[*_`]', '', str(s))).strip().lower()
                _a, _b = _snorm(_size_cell), _snorm(sh.get("action"))
                # The cell must carry the FULL recorded action, optionally followed by a boundary-delimited
                # trailing gloss ("standard position (2-4% NAV)"). A cell that is only a PREFIX of the action
                # ("standard" for "standard position", or "s") is a materially different / truncated size and
                # must fail — the earlier reverse-prefix tolerance let exactly that pass (Codex r3). Boundary =
                # end-of-string or a non-alphanumeric char after the action, so a gloss qualifies but a longer
                # word ("standard positioning") does not.
                _lead = re.match(re.escape(_b) + r'(?![0-9a-z])', _a) if (_a and _b) else None
                if _a and _b and not _lead:
                    det.append(f"Headline Scorecard 'Suggested sizing'={_size_cell!r} does not match "
                               f"sizing_hint.action={sh.get('action')!r} in decision_record.json — the "
                               f"position size the reader sees must be the recorded one, in full "
                               f"(synthesizer.md §2)")
                elif _lead:
                    # A leading match of the FULL action is not enough — the permitted trailing gloss can
                    # still name ANOTHER of the scorer's own possible sizing actions ("standard position /
                    # full position candidate" over a recorded "standard position"), presenting an
                    # unsupported alternative size right alongside the real one (Codex r6) — the sizing twin
                    # of the Rating-qualifier contradiction fixed above.
                    _rest2 = _a[_lead.end():]
                    _boundary_cls2 = r'[\s,;:./()\-–—]'
                    # A NEGATED mention of another action ("standard position, not a full position
                    # candidate") REINFORCES the recorded size rather than contradicting it — only an
                    # unnegated alternative is the real defect (Codex r7). An arbitrary character lookback
                    # (the r7 fix) can still cross into a DIFFERENT clause's negation ("standard position,
                    # not capped; full position candidate" — the "not" negates "capped", not the alternative
                    # action in the next clause) — scoped instead to the SAME ';'/'.'-delimited clause as the
                    # matched alternative, checking only the text before the match WITHIN that clause (r8).
                    _neg_word = re.compile(r'\b(?:not|never|no)\b', re.I)
                    for _oa in sorted(_ALL_SIZING_ACTIONS, key=len, reverse=True):
                        _oa_n = _snorm(_oa)
                        if _oa_n == _b:
                            continue
                        _found_unnegated = False
                        for _cl in re.split(r'[;.]', _rest2):
                            _m3 = re.search(r'(?:^|' + _boundary_cls2 + r')' + re.escape(_oa_n) + r'(?:$|' + _boundary_cls2 + r')', _cl)
                            if _m3 and not _neg_word.search(_cl[:_m3.start()]):
                                _found_unnegated = True
                                break
                        if _found_unnegated:
                            det.append(f"Headline Scorecard 'Suggested sizing'={_size_cell!r} also names "
                                       f"{_oa!r} alongside sizing_hint.action={sh.get('action')!r} in "
                                       f"decision_record.json — a gloss may explain the recorded size, not "
                                       f"offer a second, different one (synthesizer.md §2)")
                            break
        # Container types alone do not prove the SCORER ran — a record can carry a hand-written conviction
        # with inputs that recompute to something else entirely (conviction 80 recorded against inputs that
        # deterministically yield 20), and every check above still passes, letting an inflated conviction AND
        # its position size ship. Re-derive from the recorded inputs with the real scorer, exactly as the
        # ledger intends (`scripts/confidence.py` reconcile()). Best-effort by construction: an import
        # failure or an inputs shape the scorer rejects is NOT a thesis defect, so it never fabricates a
        # violation — only a genuine, reproducible divergence is reported.
        if isinstance(ci, dict) and isnum(cv):
            try:
                import confidence as _conf   # ONLY an unavailable scorer is ignorable (see below)
            except Exception:
                _conf = None
            # Resolve the class defensively: a confidence module that imports but exposes no
            # ConfidenceInputs is an UNAVAILABLE scorer (its own contract above), not a record defect —
            # skip re-derivation rather than crash the harness on the bare attribute access (Gemini).
            _CI = getattr(_conf, "ConfidenceInputs", None) if _conf is not None else None
            if _conf is not None and _CI is not None:
                _fields = set(getattr(_CI, "__dataclass_fields__", {}))
                _kw = {k: v for k, v in ci.items() if k in _fields}
                # FAIL CLOSED when the inputs cannot even build a ConfidenceInputs. `data_sufficiency` is
                # required, so `confidence_inputs: {}` raises — and swallowing that let a hand-written
                # conviction (and its position size) ship with no recorded basis at all, which is the very
                # thing this check exists to stop. An unconstructable input object IS the violation.
                try:
                    _inp = _CI(**_kw)
                except Exception as _e:
                    det.append(f"post-split run: confidence_inputs cannot reconstruct the scorer's inputs "
                               f"({type(_e).__name__}: {_e}) — conviction={cv} therefore has no re-derivable "
                               f"basis (DECISION_LEDGER.md §5)")
                    _inp = None
                if _inp is not None:
                    # The recorded inputs DUPLICATE values that decision_record.json already holds
                    # authoritatively. Re-deriving from unchecked duplicates is circular: an `Avoid` with
                    # data_sufficiency_score=30 could record confidence_inputs.data_sufficiency=100 and any
                    # conviction it likes, and the recomputation would agree with itself. Cross-check the
                    # authoritative ones first.
                    for _k, _src in (("data_sufficiency", "data_sufficiency_score"),
                                     ("edge_score", "edge_score"),
                                     ("decision", "decision")):
                        _a, _b = ci.get(_k), d.get(_src)
                        if _a is None or _b is None:
                            continue
                        _same = (abs(float(_a) - float(_b)) <= 0.5) if (isnum(_a) and isnum(_b)) \
                            else (str(_a).strip().lower() == str(_b).strip().lower())
                        if not _same:
                            det.append(f"post-split run: confidence_inputs.{_k}={_a!r} contradicts "
                                       f"decision_record.json {_src}={_b!r} — the scorer's inputs must be the "
                                       f"record's own values, or conviction is re-derived from numbers the "
                                       f"record does not support")
                    # Deliberately a WIDE tolerance, not the scorer's own RECONCILE_TOL. A record may
                    # legitimately omit OPTIONAL inputs (corroboration, evidence_tier, downgrades…), which
                    # the scorer then defaults — a few points of drift that is an input-completeness
                    # artifact, not a defect (the repo's own selftest pins such a Δ4 case as clean). This
                    # targets FABRICATION (Codex's 80-vs-20), not defaulting drift.
                    try:
                        _r = _conf.reconcile(cv, _inp, tol=AI_CONVICTION_TOL)
                    except Exception as _e:
                        # Constructable but malformed (data_sufficiency: null, downgrades: "bad", …):
                        # compute() raises inside reconcile(). Swallowing that reopened the missing-basis
                        # path this gate exists to close — a scorer failure ON RECORDED INPUTS is a defect.
                        det.append(f"post-split run: scripts/confidence.py could not score the recorded "
                                   f"confidence_inputs ({type(_e).__name__}: {_e}) — conviction={cv} has no "
                                   f"re-derivable basis (DECISION_LEDGER.md §5)")
                        _r = None
                    if _r is not None and _r.get("delta") is not None and _r["delta"] > AI_CONVICTION_TOL:
                        det.append(f"post-split run: conviction={cv} cannot be re-derived from the recorded "
                                   f"confidence_inputs — scripts/confidence.py recomputes {_r.get('computed')} "
                                   f"(Δ{_r.get('delta')} > {AI_CONVICTION_TOL}); an inflated conviction also "
                                   f"inflates the position size (DECISION_LEDGER.md §5)")
                    # The scorer's WARNINGS are a separate signal from the arithmetic: reconcile() returns
                    # ok=False on e.g. an unknown modules_absent key, meaning an intended cap was silently
                    # ignored. Widening the tolerance must not also discard those — a matching number with a
                    # missed cap is still an unearned conviction.
                    for _w in ((_r or {}).get("warnings") or []):
                        det.append(f"post-split run: scripts/confidence.py flagged the recorded inputs while "
                                   f"re-deriving conviction={cv} — {_w} (an ignored input is an unapplied cap)")
                    # The recorded sizing_hint is READER-FACING (it names the action on the scorecard), so a
                    # structurally-valid but unsupported band ships a position size the scorer never derived.
                    # Re-derive it from the same decision+conviction and require a match.
                    if isinstance(sh, dict) and isinstance(jdec2 := d.get("decision"), str):
                        try:
                            _want = _conf.sizing_hint(jdec2, float(cv))
                        except Exception:
                            _want = None
                        if isinstance(_want, dict):
                            for _k in ("band", "action"):
                                _got = str(sh.get(_k, "")).strip().lower()
                                _exp = str(_want.get(_k, "")).strip().lower()
                                if _exp and _got != _exp:
                                    det.append(f"post-split run: sizing_hint.{_k}={sh.get(_k)!r} does not match "
                                               f"the size scripts/confidence.py derives for "
                                               f"decision={jdec2!r} + conviction={cv} ({_want.get(_k)!r}) — the "
                                               f"reader is shown an unsupported position size")
    return det


# ── Check AJ (Decision Audit Trail structural check, CLAUDE.md §8/§22) ──
# The Part II "Decision Audit Trail" table is the auditable adjudication core of the verdict — for each
# decision driver, which side won and why — but until now it was enforced only by synthesizer.md prompt
# instruction (Step 5, "Contradiction audit") with NO mechanical check that a run actually ships it
# populated. A synthesizer could regress to an empty or token table (the exact "summarize, don't
# adjudicate" failure §22 warns against) and nothing before this would catch it — the same class of
# silent-doctrine-violation defect check AI closed for the Headline Scorecard, and the improvement that
# check AI's own landing PR named as the next-highest-leverage gap.
#
# Moved here (not copied) from `scripts/eval.py`, mirroring exactly why `eval_ai_headline_reconciliation`
# and `eval_ak_red_flag_severity_reconciliation` already live in this module: `eval.py` was the only
# caller, so the live `/research:full` Step 10B.1 finish-gate could never call it — a run could ship a
# `final_thesis.md` with no Decision Audit Trail table (or one with blank adjudication cells), print
# `GATE: PASS`, and commit straight to `main` (CLAUDE.md §25/§28), undetected until a later manual
# `/research:eval` run. Wiring it into the live gate closes that hole the same way it was already closed
# for AI/AK.
AJ_DATE = "2026-07-10"
AJ_MIN_ROWS = 3
AJ_REQUIRED_COLS = ["Decision Driver", "Bull Evidence", "Bear Evidence", "Which Side Wins?", "Why?"]
def _decision_audit_section(thesis):
    """The text of the '## Decision Audit Trail' section ONLY — from its heading up to the next H1
    or H2 heading (or EOF), so a table living in a LATER section cannot satisfy this check. None if absent.

    When the dossier uses the PART structure (synthesizer.md emits the audit trail under
    '# PART II — CROSS-CUTTING ANALYSIS'), the search is FIRST restricted to the Part II slice, so a
    later appendix/process section carrying its own '## Decision Audit Trail' heading cannot satisfy
    the check while Part II omits the table (r3556238203). Any H1 ends Part II, including an appendix
    without a PART label. Falls back to the whole document only when
    no Part II heading exists (degenerate/non-PART dossiers)."""
    p2 = re.search(r"(?ims)^#\s+PART\s+II\b.*?(?=^#\s|\Z)", thesis)
    scope_text = p2.group(0) if p2 else thesis
    m = re.search(r"(?ims)^##\s*Decision Audit Trail\b.*?(?=^##?\s|\Z)", scope_text)
    return m.group(0) if m else None
def _decision_audit_cells(row):
    """Remove one outer pipe while preserving empty audit-table cells."""
    content = row[1:-1] if row.endswith("|") else row[1:]
    return [cell.strip() for cell in content.split("|")]

def _decision_audit_header(section):
    """The HEADER cells of the Decision Audit Trail pipe-table (the first non-separator pipe row), or []
    if the section holds no table. Split out so check AJ can verify the table actually carries the
    required bull/bear adjudication COLUMNS, not merely five columns of any shape (r3556238195)."""
    if not section: return []
    for line in section.splitlines():
        s=line.strip()
        if not s.startswith("|"): continue
        if re.match(r"^\|[\s:|-]+\|$", s): continue  # separator row
        return _decision_audit_cells(s)
    return []
def _decision_audit_rows(section):
    """The DATA rows of the Decision Audit Trail pipe-table (header and separator rows excluded), or []
    if the section holds no table. Side-effect-free + module-level so `selftest` can drive it directly."""
    if not section: return []
    rows=[]; header_seen=False
    for line in section.splitlines():
        s=line.strip()
        if not s.startswith("|"):
            if header_seen: break  # table ended
            continue
        if re.match(r"^\|[\s:|-]+\|$", s):
            continue  # the header/body separator row
        cells=_decision_audit_cells(s)
        if not header_seen:
            header_seen=True  # this pipe row IS the header — skip it, start collecting after
            continue
        rows.append(cells)
    return rows
def _audit_cell_blank(cell):
    """A cell counts as blank if it's empty after stripping markdown emphasis, or is a bare placeholder
    token rather than real adjudication content. Placeholders include any WHOLE-cell run of dash
    characters — ASCII '-'/'--'/'---' and the Unicode figure/en/em dashes and horizontal bar
    (—, –, ―) the synthesizer commonly types (r3556238198) — plus 'n/a', 'tbd', 'none', '?'. Matching
    a whole-cell dash run (not a substring) keeps real content like '~11–12%' or '₹1,184M–586M' from
    being misread as blank.

    Markdown emphasis is stripped with BOTH markers (`*` bold/italic AND `_` italic, r3942853467): a
    synthesizer that italicises a placeholder as `_N/A_` or `_-_` must still be caught as blank, exactly
    as `**-**` / `*n/a*` already were — otherwise an underscore-italicised placeholder slips through the
    §8/§22 adjudication gate. Stripping `_` never turns real content blank: after removal the cell only
    counts as blank when it is empty, a whole-cell dash run, or one of the fixed placeholder tokens, so a
    word like `_growth_` (→ `growth`) or an identifier like `net_debt/EBITDA` survives unflagged."""
    c = re.sub(r"[*_]+", "", cell or "").strip()
    if re.fullmatch(r"[-‒–—―]+", c):
        return True  # a cell that is ONLY dash characters is a placeholder
    return (not c) or c.lower() in {"n/a", "na", "tbd", "none", "?"}
def eval_aj_decision_audit_trail(decision_date, thesis):
    """Core of check AJ. Returns None (N/A — pre-gate) or a list of violation strings (empty = pass).
    `thesis` is the full final_thesis.md text. Side-effect-free + module-level so `eval.py selftest` can
    drive it with synthetic table snippets, fixture-free."""
    if not (isdate(decision_date) and decision_date >= AJ_DATE):
        return None  # forward-looking; pre-gate runs N/A
    section = _decision_audit_section(thesis)
    if section is None:
        return ["'## Decision Audit Trail' section not found in final_thesis.md"]
    rows = _decision_audit_rows(section)
    if not rows:
        return ["'## Decision Audit Trail' table has no data rows"]
    det=[]
    # Validate the table HEADER carries the required bull/bear adjudication columns, in order, before
    # trusting the positional per-cell checks below (r3556238195). A five-column table whose header
    # omits or reorders 'Bear Evidence' would otherwise pass the positional checks with the wrong fields.
    hdr=[re.sub(r"[*_]+","",h).strip().lower() for h in _decision_audit_header(section)]
    for j, label in enumerate(AJ_REQUIRED_COLS):
        if j >= len(hdr) or label.lower() not in hdr[j]:
            got = hdr[j] if j < len(hdr) else "<missing>"
            det.append(f"Decision Audit Trail header column {j+1} is {got!r} — expected {label!r} "
                       f"(required columns, in order: {', '.join(AJ_REQUIRED_COLS)})")
    if len(rows) < AJ_MIN_ROWS:
        det.append(f"only {len(rows)} Decision Audit Trail row(s) — fewer than the {AJ_MIN_ROWS} required for a real cross-module adjudication")
    for i, cells in enumerate(rows, 1):
        if len(cells) < len(AJ_REQUIRED_COLS):
            det.append(f"row {i} has only {len(cells)} column(s), fewer than the {len(AJ_REQUIRED_COLS)} required ({', '.join(AJ_REQUIRED_COLS)})")
            continue
        for j, label in enumerate(AJ_REQUIRED_COLS):
            if _audit_cell_blank(cells[j]):
                det.append(f"row {i} ({cells[0]!r}) has a blank {label!r} cell")
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
# A cap cell denies a Critical finding in two shapes, not one: the word "no"
# ("no Critical red flag"), and a ZERO COUNT ("0 Critical flags", "Critical: 0", "Critical flags — 0").
# The zero-count form reads as a denial to a human and is just as inconsistent with a module that declared
# one, so it must fire too — otherwise the reader-facing Rating-cap cell can contradict the module while the
# count reconciliation passes.
_AK_DENIAL = re.compile(
    r'\bno\b[^.\n]{0,60}\bcritical\b'                     # "no Critical red flag"
    r'|\b(?:0|zero)\s+critical\b'                         # "0 Critical flags" / "zero critical"
    r'|\bcritical\b[^.\n]{0,20}?[:—–-]\s*(?:0|zero)\b',  # "Critical: 0" / "Critical flags — 0"
    re.I)
# A denial only counts when the SAME cell does not ALSO affirm a Critical cap. A truthful scoped cell
# ("2 Critical earnings flags cap the rating; no Critical governance red flag") acknowledges the module's
# Criticals AND correctly notes a DIFFERENT module has none — compliant per §13/§18, not a denial. Affirm =
# a NONZERO "N Critical" count or an explicit "Critical ... cap"/"cap ... Critical" phrase. Nonzero on
# purpose: "0 Critical" is a denial, never an affirmation, and a `\d+` affirm would cancel the zero-count
# denial above and re-open exactly the hole it closes.
# Clause-scoped: `[^.\n;]` (note the ';') so "Critical: 0; High flags cap the rating" cannot let a cap
# phrase about a DIFFERENT severity, in a later clause, affirm the Critical the cell just denied.
_AK_AFFIRM = re.compile(r'[1-9]\d*\s+critical|critical[^.\n;]{0,40}\bcaps?\b|\bcaps?\b[^.\n;]{0,40}critical', re.I)
# ...but a "critical ... cap" phrase is NOT an affirmation when the sentence is actually saying the cap does
# NOT apply: "0 critical flags; no cap applies" matches the `critical ... cap` alternative above and would
# otherwise cancel the zero-count denial and re-open the hole it closes. A negated cap phrase is therefore
# disqualified before AFFIRM is consulted (a genuine affirmation states a count or an applied cap).
_AK_AFFIRM_NEGATED = re.compile(r'\b(?:no|zero|0|none|not)\b[^.\n]{0,20}\bcaps?\b|\bcaps?\b[^.\n]{0,20}\b(?:not\s+appl|does\s+not|n/?a)\b', re.I)
# A cap phrase naming a DIFFERENT severity explicitly ("High flags cap the rating") is what the ';' exclusion
# above must keep OUT of a Critical affirmation — this is that same check, reused below to let a genuine
# affirmation's subject and predicate sit in ADJACENT clauses without also re-admitting that false-affirm.
_AK_OTHER_SEVERITY_CAP = re.compile(r'\b(?:high|medium|low)\b[^.\n;]{0,40}\bcaps?\b', re.I)


# §13's escape clause, as the record can actually express it. A resolution must be STATED — on the flag
# entry (a `resolved`/`resolution` field, or resolution wording in its own text) or in the rating cap — so
# an unresolved Critical still caps. Deliberately narrow: silence never counts as resolution.
_AK_RESOLVED = re.compile(r'\bresolved\b|\bresolution\b|\bcap\s+lifted\b|\blift(?:s|ed)?\s+the\s+cap\b', re.I)
# ...but a NEGATED resolution ("not resolved", "unresolved", "no resolution", "resolution pending",
# "cap not lifted", "not yet resolved") must NOT count — otherwise a Critical whose status literally reads
# "not resolved" lifts the §13 cap because the substring "resolved" appears inside it (Codex r2). Checked
# on the SAME clause-scoped window (`[^.\n;]`) as the affirm-negation above, so a resolution in one clause
# and a negation in a different one do not cross-cancel.
_AK_RESOLVED_NEG = re.compile(
    r'\bun-?resolved\b'
    r'|\b(?:not|no|never|pending|awaiting|yet)\b[^.\n;]{0,20}\b(?:resolved|resolution|lifted)\b'
    r'|\b(?:resolution|resolved|cap)\b[^.\n;]{0,20}\b(?:pending|outstanding|not\s+lifted)\b',
    re.I)
# True iff SOME ';'/'.'-delimited clause of `s` affirms resolution wording with no negation in that SAME
# clause — module-level (not a closure inside _ak_resolution_stated) so the record-level denial-exemption
# check below can apply the identical clause-scoped test, instead of a bare unscoped `_AK_RESOLVED.search`
# that would let "no Critical red flag; resolution pending" pass as if it were resolved (Codex r8).
def _ak_resolved_in(s):
    return any(_AK_RESOLVED.search(_c) and not _AK_RESOLVED_NEG.search(_c) for _c in re.split(r'[;.]', s))


def _ak_resolution_stated(d):
    """True iff EVERY recorded Critical red flag is explicitly resolved. §13's escape is per-finding
    ("a critical ... red flag must cap the final rating unless IT is explicitly resolved"), so one
    resolved flag cannot lift the ceiling while another Critical stands. A blanket `rating_cap` phrase is
    accepted ONLY when there is exactly ONE Critical, where attribution is unambiguous (Codex r3) — with
    several Criticals it cannot be tied to any one of them. No Critical entries at all -> nothing has been
    resolved, so the cap stands."""
    crit = [rf for rf in (d.get("red_flags") or [])
            if isinstance(rf, dict) and str(rf.get("severity", "")).strip().lower() == "critical"]
    if not crit:
        return False
    # A blanket rating_cap resolution can lift the cap only with a SINGLE Critical, where "resolved ... cap
    # lifted" can only refer to that one flag; with several it is ambiguous and does not count (Codex r3).
    # Split on '.'/';' into clauses first (see the per-field loop below for why): a single free-text
    # rating_cap can equally carry historical negation and a later genuine resolution in the SAME field.
    _cap = d.get("rating_cap")
    _cap_resolves = len(crit) == 1 and isinstance(_cap, str) and _ak_resolved_in(_cap)
    for rf in crit:
        if rf.get("resolved") is True:
            continue
        # A resolution counts only if resolution wording appears AND no negation appears in the SAME
        # CLAUSE. Checking per-FIELD alone (resolution/status/description) fixed cross-FIELD cancellation
        # (Codex r3: "resolution: resolved..." vs "description: formerly unresolved" no longer cross-veto),
        # but a single free-text field can carry BOTH within itself — "formerly unresolved; resolved by the
        # audited FY25 filing" — where `_AK_RESOLVED_NEG`'s unscoped `unresolved` alternative still vetoed
        # the later, genuine resolution clause (Codex r6). Split each field into ';'/'.'-delimited clauses
        # and require the resolution wording and its own negation-check to be in the SAME clause.
        if any(_ak_resolved_in(str(rf.get(_f) or "")) for _f in ("resolution", "status", "description")):
            continue
        if _cap_resolves:
            continue   # single-Critical + unambiguous rating_cap resolution
        return False   # this Critical is unresolved -> the cap stands
    return True


def _ak_affirms(txt):
    """True iff the cell genuinely AFFIRMS a Critical cap. A count affirmation ("2 Critical") always
    counts; a "critical ... cap" phrase counts only when that phrase is not itself negated."""
    if not txt:
        return False
    if re.search(r'[1-9]\d*\s+critical', txt, re.I):
        return True
    if bool(_AK_AFFIRM.search(txt)) and not _AK_AFFIRM_NEGATED.search(txt):
        return True
    # A genuine affirmation's subject ("Critical earnings flags") and predicate ("cap the rating") can sit
    # in ADJACENT clauses, separated by a semicolon that is only there for sentence rhythm ("Critical
    # earnings flags; therefore cap the rating; no Critical governance red flag") — the ';' exclusion above
    # (needed to stop "Critical: 0; High flags cap the rating" from false-affirming) also discards this
    # genuine case (Codex r6). Accept a "cap" clause that immediately follows a clause mentioning "critical",
    # UNLESS that cap clause itself names a DIFFERENT severity — the exact false-affirm the exclusion guards.
    _clauses = re.split(r';', txt)
    for i in range(len(_clauses) - 1):
        _prev, _cur = _clauses[i], _clauses[i + 1]
        # `_prev` must itself AFFIRM a Critical, not merely CONTAIN the word — "Critical: 0" mentions
        # "critical" too, and treating a following "cap" clause as its affirmation would let "Critical: 0;
        # Watchlist cap applies for weak edge" pass as if the zero-count denial were retracted (Codex r7).
        # Excluding any `_prev` that is itself an _AK_DENIAL match closes that without a separate allowlist.
        if re.search(r'\bcritical\b', _prev, re.I) and not _AK_DENIAL.search(_prev) \
                and re.search(r'\bcaps?\b', _cur, re.I) \
                and not _AK_OTHER_SEVERITY_CAP.search(_cur) and not _AK_AFFIRM_NEGATED.search(_cur):
            return True
    return False
# Decisions that exceed the §18 "Watchlist or lower" ceiling a Critical flag imposes. Same membership as
# rating_caps.ABOVE_WATCHLIST_AF (§24 Filter 1's identical ceiling) — kept as its own constant so the two
# checks stay independently readable rather than importing across modules.
ABOVE_WATCHLIST_AK = {"Strong Buy", "Buy", "Starter Position Only"}



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
    flags = d.get("red_flags")
    if not isinstance(flags, list):  # a truthy non-list (bool/dict/number) would raise or miscount
        flags = []
    json_critical = sum(1 for rf in flags if isinstance(rf, dict) and str(rf.get("severity","")).strip().lower()=="critical")
    det = []
    # The §13/§18 ceiling attaches to the CRITICAL FLAG ITSELF, not to a module's declaration of it — so it
    # must be tested before the "no module declared one" early return below. A record can carry a Critical
    # entry with no recognised module count (a master-synthesis forensic roll-up, or wording outside
    # _AK_CRITICAL_PATTERNS) and would otherwise publish a Buy unchecked.
    decision = d.get("decision")
    if json_critical and isinstance(decision, str) and decision.strip() in ABOVE_WATCHLIST_AK \
            and not _ak_resolution_stated(d):
        det.append(f"decision_record.json records {json_critical} Critical red flag(s) but "
                   f"decision={decision.strip()!r} exceeds the 'Watchlist' cap, and not every Critical is "
                   f"explicitly resolved (CLAUDE.md §13: a critical governance/solvency/accounting red flag "
                   f"must cap the final rating unless explicitly resolved by primary evidence; §18: a "
                   f"critical flag caps the headline at Watchlist or lower)")
    # Rating-cap DENIAL check — a rating cap must not DENY a Critical that actually exists. It runs against
    # a Critical from EITHER a module declaration OR the record's own red_flags, and BEFORE the "no module
    # declared" early return below (Codex r3): a record-level Critical with no recognised module count would
    # otherwise let a cap cell/field saying "no Critical red flag" ship clean, directly contradicting the
    # recorded Critical entry.
    # ...but NOT when the record's own red_flags Critical(s) are already explicitly resolved AND the text
    # ITSELF describes that resolved state ("No unresolved Critical flags; cap lifted after the audited FY25
    # filing" — matches _AK_RESOLVED) — that is describing reality, not denying an outstanding flag (Codex
    # r6). Resolution does NOT excuse an UNQUALIFIED denial with no resolution wording at all ("no Critical
    # red flag") — that still erases the historical flag's existence, which resolving it does not do (Codex
    # r7). So the exemption is checked PER TEXT below, not as a blanket skip of the whole check.
    if declared or json_critical:
        if declared:
            _tm = max(declared, key=declared.get)
            _who = f"{_tm} declares {declared[_tm]}"
        else:
            _who = f"decision_record.json records {json_critical} Critical red flag(s)"
        _record_resolved = bool(json_critical) and _ak_resolution_stated(d)
        _sec = _scorecard_section(thesis)
        _cap_cell = _hs_cell(_sec, "Rating cap") if _sec else None
        for label, txt in [("Headline Scorecard 'Rating cap' cell", _cap_cell),
                           ("decision_record.json rating_cap field", d.get("rating_cap"))]:
            # Skip only a genuinely ABSENT cap (None) or an empty string (no cap given) — a bare `not txt`
            # also skipped other falsy-but-present values (0, False, [], {}), so a malformed rating_cap of
            # exactly one of those types shipped unreported (Codex r8): the non-string check right below
            # exists precisely to catch this and must actually run for them.
            if txt is None or txt == "":
                continue
            if not isinstance(txt, str):
                # A truthy non-string (list/dict/number) would raise TypeError inside re.search and take the
                # whole live gate down with it. A rating cap that isn't text is itself malformed — report it.
                det.append(f"{label} is not a string (got {type(txt).__name__}: {txt!r}) — a rating cap must "
                           f"be readable text; cannot verify it does not deny the recorded Critical red flag(s)")
                continue
            if _record_resolved and _ak_resolved_in(txt):
                continue  # this text itself describes the resolved state — not a denial of history
            if _AK_DENIAL.search(txt) and not _ak_affirms(txt):
                det.append(f"{label} denies a Critical red flag ({txt!r}) but {_who}")
    if not declared:
        return det  # no module declared a Critical count — the count reconciliation below needs one
    top_mod = max(declared, key=declared.get); top_n = declared[top_mod]
    if json_critical < top_n:
        det.append(f"{top_mod} declares {top_n} Critical red flag(s) but decision_record.json's red_flags "
                    f"array carries only {json_critical} entr{'y' if json_critical==1 else 'ies'} with "
                    f"severity=Critical (modules declaring a Critical count: {declared})")
    # NOT reconciled by flag IDENTITY, deliberately. Comparing the JSON's Critical ids against ids named in
    # the module syntheses would catch an independent flag dropped by a SECOND module (which the max-of-
    # counts test above cannot). It is not safely implementable against today's synthesis formats: those
    # syntheses are TABLES, so a row like "| … | Critical | … | **RF-CAP-001** | …" puts an unrelated
    # column's "Critical" on the same line as an id whose real severity is High — measured against the
    # committed runs, a line-scoped id/severity association false-fires on 4 of 7, including runs whose own
    # text says "all High/Medium, none Critical". Summing per-module counts instead is also wrong: §4B
    # requires dedup by the underlying problem, not by module mention, so the same flag echoed by two
    # modules would double-count. A correct fix needs modules to emit a STRUCTURED per-flag severity
    # (id + severity together); until they do, the conservative max-of-counts test is the honest check —
    # a live gate that blocks good runs is worse than one that misses a second module's omission.
    # §13/§18: a Critical red flag CAPS the rating at Watchlist-or-lower. Recording the flag is necessary
    # but not sufficient — the cap is the consequence, and without this the whole check can pass while a
    # Critical accounting/earnings flag ships a Buy. AA covers only the management-governance verdict and
    # AB only business-model disqualifiers, so no existing check closes this for the other modules.
    # Mirrors check AF's shape (fired tag + decision above the ceiling → violation).
    decision = d.get("decision")
    # §13's cap is explicitly conditional — "unless it is explicitly RESOLVED by primary evidence" — and the
    # synthesizer's Rating Cap Rules let a resolved Critical lift it. Flagging every above-Watchlist decision
    # would therefore stamp a legitimately-resolved thesis PROVISIONAL in the live gate. Honour the exception
    # where the record STATES it: an explicit resolution note on the flag entry, or a rating_cap cell that
    # affirms the Critical was resolved/lifted rather than denying it existed. Silence is NOT resolution —
    # the cap still applies unless the record says, in so many words, that it was resolved.
    # The record-level cap above already covers every case where the Critical actually reached red_flags.
    # This covers the remaining one: a module DECLARED a Critical that the record never recorded, so there
    # is no entry for the cap test to see — the flag is both missing AND uncapped.
    if not json_critical and isinstance(decision, str) and decision.strip() in ABOVE_WATCHLIST_AK:
        who = ", ".join(sorted(declared))
        det.append(f"{who} declare(s) a Critical red flag that never reached decision_record.json's "
                   f"red_flags array, and decision={decision.strip()!r} exceeds the 'Watchlist' cap "
                   f"(CLAUDE.md §13/§18) — a Critical cannot be dropped AND left uncapped")
    # The rating-cap DENIAL check ran earlier (before the `if not declared` return) so it also covers
    # record-level Criticals with no module declaration (Codex r3) — nothing further to add here.
    return det


# ── Check BG (tradable line + dividend-yield availability, CLAUDE.md §16) ──
# §16: the rating, price, fair value and yield belong to ONE named listed line (ticker · venue ·
# currency), and "a yield is only a yield a buyer can still receive" — a trailing yield whose record
# date has passed is not income available to a buyer today. synthesizer.md Part I item 12 instructs
# both, but until this check nothing opened final_thesis.md to see it happened: a dual-listed or
# ADR/GDR name could ship with a fair value on an unnamed line, and a stale trailing dividend yield
# could sit in the Headline Scorecard as a reason to own. Same defect class as AI/AJ/AK: a doctrine
# rule that lives only in a prompt. Forward-looking (landing BG_DATE) so no committed run is graded
# retroactively.
BG_DATE = "2026-10-05"
# A QUOTED dividend/distribution yield: the phrase with a percentage BOUND to it (the % sits within the
# yield expression, not merely somewhere on the line). This stops an unrelated percentage — e.g.
# "Dividend yield unavailable; foreign withholding tax is 15%" — from being read as the yield value and
# flagged for a missing basis/date (Codex r1 round 3).
# A third form binds the % through a comma/parenthetical aside plus a VALUE connector ("The dividend
# yield, on a trailing basis, sits at 3.1%", "dividend yield on the named ADR line is 3.1%") — the aside
# (comma/parenthetical, or an on/for qualifier with no negation word) must open right after "yield" and
# the % must follow a connector (of/is/at/sits at/=/:), so "Dividend yield unavailable, withholding tax is 15%"
# still does not bind (the window was NOT simply widened — PR #754 review 6718647404, case A).
_BG_YIELD_QUOTED = re.compile(
    r"(?:dividend|distribution)[\s\-]+yield\b[^.\n]{0,24}?\d[\d.,]*\s*%|"
    r"(?:dividend|distribution)[\s\-]+yield\b\s*(?:,[^,;.\n]{0,40},|\([^)\n]{0,40}\)|"
    r"(?:on|for)\s+(?:(?!unavailable|not\b|n/?a\b|none\b|nil\b|no\b)[^,;.\n%]){0,40}?\s)\s*"
    r"(?:(?:currently|now|still)\s+)?(?:of|is|was|at|sits\s+at|stands\s+at|=|:)\s*"
    r"(?:~|about\s+|roughly\s+|approximately\s+|around\s+|c\.\s*)?\d[\d.,]*\s*%|"
    # The %-first form must still read as a QUOTED yield when a basis adjective sits between the % and the
    # phrase ("3.1% trailing dividend yield", "4% forward dividend yield"); otherwise the whole §16
    # availability check (basis, ex-/record-date, staleness, reason-to-own) is skipped and a stale yield
    # presented as a reason to own ships clean. Restricted to basis/qualifier words so it never swallows an
    # unrelated "revenue rose 5% while the dividend yield …".
    r"\d[\d.,]*\s*%\s+(?:(?:trailing|forward|ttm|ltm|ntm|gross|net|annuali[sz]ed|current|indicative|"
    r"prospective|est(?:imated)?\.?|expected|headline|reported)\s+){0,3}(?:dividend|distribution)[\s\-]+yield\b", re.I)
# An explicit "no yield quoted" disclosure — never subject to the basis/date requirement. It must be a
# real no-yield CONSTRUCTION ("yield: none", "yield n/a", "yield unavailable", "no dividend yield", "does
# not pay a dividend"), not a "none"/"n/a" merely near the word "yield" — "yield 3%, none in its peer set
# higher" is a quoted yield (PR #754 review 6718647404, case B).
_BG_YIELD_NONE = re.compile(
    r"(?:dividend|distribution)[\s\-]+yield\b\s*(?:\([^)\n]{0,40}\)\s*)?(?:[:=\-\u2013\u2014]\s*|(?:is|was)\s+)?"
    r"(?:unavailable\b|not\s+(?:quoted|disclosed|applicable|available)\b|n/?a\b|none\b|nil\b)|"
    r"\bno\s+(?:dividend|distribution)[\s\-]+yield|"
    r"\b(?:does|did)\s+not\s+pay\s+(?:a\s+|any\s+)?(?:dividend|distribution)s?\b|"
    r"\bpays\s+no\s+(?:dividend|distribution)s?\b", re.I)
# A basis must say WHICH period the yield represents — trailing/backward or forward. "annualized" is
# deliberately NOT accepted alone: it describes scaling, not direction, so it does not satisfy §16's
# trailing-or-forward requirement (Codex r2 round 2). ttm/ltm = trailing, ntm = forward.
_BG_PERIOD = re.compile(r"\b(?:trailing|forward|ttm|ltm|ntm|next[- ]twelve|last[- ]twelve)\b", re.I)
# Entitlement date: ONLY an ex-date / ex-dividend / ex-distribution / record date establishes whether a
# buyer TODAY is entitled to the distribution. A payment / pay / payable date does NOT (it is when a
# holder of record is paid, after the entitlement has been fixed), so it is deliberately excluded here
# (Codex r1). Leading word-boundary + flexible separators cover ex-date / ex div / ex-dividend /
# ex-dist / ex-distribution date / record date / record-date (gemini r1).
_BG_EX_RECORD = re.compile(
    r"\bex[\s\-_]*(?:date|div(?:idend)?|dist(?:ribution)?)(?:[\s\-_]*date)?|\brecord[\s\-_]*date", re.I)
# An explicit statement that a yield whose ex-/record-date has already passed is no longer income a
# buyer today can receive. A bare date-status word like "passed" does NOT qualify (it can sit beside
# "is a reason to own") — the statement must be about a buyer not receiving the distribution (Codex r2
# round 3, CLAUDE.md §16: "must never be presented as a reason to own").
_BG_UNAVAIL = re.compile(
    r"buyer\s+(?:today\s+)?(?:no longer\s+)?(?:does not|do not|cannot|can't|will not|won'?t)\s+(?:get|receive|accrue)|"
    r"not\s+(?:income\s+)?available\s+to\s+(?:a|the|any|new|current)\s+buyer|"
    r"no\s+longer\s+available\s+to\s+(?:a|the|any|new|current)\s+buyer|"
    r"not\s+income\s+a\s+buyer\s+receives", re.I)
_BG_ISO = re.compile(r"\b(20\d{2}-\d{2}-\d{2})\b")
# A cross-line statement counts only when it is a REAL comparison — a premium/discount carrying an
# actual figure — or an explicit statement that no other listed line exists. A bare mention that another
# line exists ("the other listed line is HKEX", "this is not the only listed line") is NOT sufficient
# (Codex r3), and neither is the bare LABEL "cross-line premium/discount" with no value beside it, e.g.
# "Cross-line premium/discount: Not assessed" (Codex r1 round 2) — so the label-only form was dropped and
# a number is required. "the" is optional and separators flexible via the %-proximity form (gemini r2).
# The figure may be a percentage or a currency AMOUNT ("a USD 2 premium to the HKEX line", "HK$1.5
# discount") — both quantify the gap (PR #754 r4544983956).
_BG_FIG = (r"(?:\d[\d.,]*\s*%|(?:US\$|HK\$|[$€£₹¥]|\b(?:USD|EUR|GBP|INR|HKD|JPY|CNY|RMB|CAD|AUD|SGD|CHF)\s?)"
           r"\s?\d[\d.,]*)")
_BG_CROSS_CMP = re.compile(
    # "discount rate" (a DCF input) is never a cross-line discount (PR #754 r4542387645).
    r"(?:premium|discount(?!\s+rates?\b))[^.\n]{0,40}" + _BG_FIG + r"|"
    + _BG_FIG + r"[^.\n]{0,40}(?:premium|discount(?!\s+rates?\b))", re.I)
# ...and the premium/discount must be tied to the OTHER tradable line, not to an unrelated number such
# as a DCF discount rate. A cross-line statement counts only when the same clause also references the
# other INSTRUMENT (Codex r3 round 3). The bare words "line"/"listing"/"listed" are too generic ("the
# revenue line") so they are dropped (Codex r4 round 4) — the clause must name a depositary receipt, a
# share class, or (via _venue_canons in _has_cross_cmp) another venue.
_BG_LINE_REF = re.compile(
    r"\b(?:ADR|GDR|[HAB][\s\-]?shares?|ordinary\s+shares?|common\s+shares?|depositary|"
    r"dual[- ]listed|cross[- ]listed|share\s+class|listed\s+line)\b", re.I)
_BG_NO_OTHER = re.compile(
    r"no (?:other|alternative|second)\s+(?:listed\s+)?line|"
    r"\b(?:sole|single)\s+(?:listed\s+)?line|"
    r"no (?:other )?(?:ADR|GDR|dual listing|second listing|alternative listing)|"
    r"not (?:dual|cross)[\s\-_]*listed", re.I)
_BG_MULTI_LISTING = re.compile(r"\balso\b|\bADR\b|\bGDR\b|\bdual[- ]listed\b|\bcross[- ]listed\b", re.I)
# Best-effort canonical venue aliases so a decision line written "NYSE" matches a record whose exchange
# field is the full "New York Stock Exchange" (the real V_2026-09-23 shape) and vice-versa. The venue
# leg runs ONLY when the record's exchange resolves to exactly one known venue; an unknown venue or a
# multi-venue exchange string skips it (conservative — never fire when the venue cannot be resolved to
# one canonical, so a correct run is never flagged). Patterns allow a word-suffix after a compact code
# (e.g. NasdaqGS / NasdaqCM / NasdaqGM all resolve to NASDAQ — Codex r4 round 2) and the table carries
# the repository's own exchange identifiers (DFM, Oslo Børs, Xetra, SHSE, …), not only US venues.
# Extend the table as new venues appear.
_VENUE_CANON = [
    ("NYSE",     [r"\bnyse\b", r"new york stock exchange"]),
    ("NASDAQ",   [r"\bnasdaq\w*"]),
    ("LSE",      [r"\blse\b", r"london stock exchange"]),
    ("NSE-IN",   [r"\bnse\b", r"national stock exchange of india"]),
    ("BSE-IN",   [r"\bbse\b", r"bombay stock exchange"]),
    ("HKEX",     [r"\bhkex\b", r"\bsehk\b", r"\bhkse\b", r"hong kong (?:stock )?exchange"]),
    ("TSE-TYO",  [r"tokyo stock exchange", r"\btse\s+(?:prime|standard|growth)\b"]),
    ("SSE-SH",   [r"\bshse\b", r"shanghai stock exchange", r"\bsse\b"]),
    ("SZSE",     [r"\bszse\b", r"shenzhen stock exchange"]),
    ("TSX",      [r"\btsx\b", r"toronto stock exchange"]),
    ("ASX",      [r"\basx\b", r"australian securities exchange"]),
    ("EURONEXT", [r"euronext"]),
    ("XETRA",    [r"xetra", r"deutsche b\w+rse", r"frankfurt stock exchange"]),
    ("KRX",      [r"\bkrx\b", r"korea exchange"]),
    ("TADAWUL",  [r"tadawul", r"saudi exchange"]),
    ("B3-BR",    [r"\bb3\b", r"\bbovespa\b"]),
    ("JSE-ZA",   [r"\bjse\b", r"johannesburg stock exchange"]),
    ("DFM",      [r"\bdfm\b", r"dubai financial market"]),
    ("OSLO",     [r"oslo b\w+rs", r"oslo stock exchange", r"\bose\b"]),
    ("SIX",      [r"\bsix\s+swiss\s+exchange\b", r"\bsix\s+exchange\b"]),
]


def _venue_canons(text):
    """Canonical venue tags matched in `text` (deduplicated, order-preserving)."""
    out = []
    for canon, pats in _VENUE_CANON:
        if canon not in out and any(re.search(p, text, re.I) for p in pats):
            out.append(canon)
    return out


# A premium/discount measured against a VALUATION anchor (fair value, a DCF, target, peers, history) is not a
# cross-line gap, even when the clause also names a line: "The ADR trades at a 12% discount to fair value"
# says nothing about the other listed line (PR #754 thread "Require both instruments").
_BG_CMP_NON_LINE = re.compile(
    r"(?:premium|discount)\s+(?:to|vs\.?|versus|relative\s+to|against|over|of)\s+(?:the\s+|our\s+|its\s+|a\s+)?"
    r"(?:fair|intrinsic|target|dcf|nav|book|base|bull|bear|peers?|sector|histor\w*|consensus|model|valuation)", re.I)
# A share-class designation ("Class C", "class-B shares") names an instrument the same way an ADR/H-share does.
_BG_CLASS_REF = re.compile(r"\b[Cc]lass[\s\-]+[A-Z]\b")


def _bg_line_refs(text):
    """Normalised instrument references (_BG_LINE_REF / share class) in `text`: 'H-shares' -> 'hshare'."""
    refs = {re.sub(r"[^a-z]", "", m.group(0).lower()).rstrip("s") for m in _BG_LINE_REF.finditer(text or "")}
    refs |= {re.sub(r"[^a-z]", "", m.group(0).lower()) for m in _BG_CLASS_REF.finditer(text or "")}
    return refs


def _has_cross_cmp(part1, line_v=(), alt_tickers=(), own_refs=frozenset()):
    """True when some clause states a REAL cross-line premium/discount: a premium/discount carrying a
    figure, NOT measured against a valuation anchor, AND, in the same clause, a reference to the OTHER
    listed line — a depositary receipt / share class / alternate ticker, or a venue that is not the
    decision line's own venue (`line_v`). "The SSE line trades at a 10% discount to fair value" on an SSE
    decision line therefore no longer counts (PR #754 thread "Require both instruments"). Likewise an
    instrument reference that is only the DECISION instrument itself (`own_refs`, e.g. the ADR on an ADR
    decision line) does not name the other line (PR #754 r4542387645)."""
    # Split on newline / semicolon / sentence-ending period (a period FOLLOWED BY whitespace), never a
    # bare '.', so a decimal percentage like "22.5%" is not torn apart.
    alt_re = [re.compile(r"(?<![A-Za-z0-9])" + re.escape(t) + r"(?![A-Za-z0-9])") for t in alt_tickers if t]
    for seg in re.split(r"[\n;]|\.\s", part1):
        # Blank out ONLY the valuation-anchored comparison ("discount to fair value"), so a clause that also
        # carries a real cross-line gap still counts (PR #754 r4544983914).
        seg = _BG_CMP_NON_LINE.sub(" ", seg)
        if not _BG_CROSS_CMP.search(seg):
            continue
        seg_v = _venue_canons(seg)
        # an alternate venue, or two venues compared in one clause ("BSE trades at a 0.1% premium to NSE")
        other_venue = [v for v in seg_v if v not in set(line_v)] or (seg_v if len(seg_v) >= 2 else [])
        if (_bg_line_refs(seg) - set(own_refs)) or other_venue or any(r.search(seg) for r in alt_re):
            return True
    return False


# A decision-line statement that NEGATES itself ("Decision line unavailable / not established /
# unknown / n/a") is not a positive declaration — an insufficient-data or failed-synthesis run must not
# certify a tradable line it says it could not establish (Codex r2 round 5).
_BG_DL_NEG = re.compile(
    # The optional canonical label parenthetical and the label/value separator (':' or a table '|') are
    # skipped first, so the 24-char window is measured on the VALUE (PR #754 r4542387635).
    # The window also stops at a field separator (· ; ,), so a later field ("V · NYSE · USD; price
    # unavailable") is not read as negating the declaration itself (PR #754 r4544983962).
    r"decision line\s*(?:\([^)\n]{0,60}\))?[\s*:=|]*[^|\n·;,]{0,24}(?:unavailable|not\s+(?:available|established|determined|set)|undetermined|"
    r"unknown|\bn/?a\b|none|pending|could\s+not|cannot\s+be)", re.I)
# The finish-gate PROVISIONAL banner (a leading '>' blockquote quoting BG's own diagnostics). Only THIS
# banner is stripped before the scan — stripping every blockquote (the round-3 over-fix) would also hide
# a reader-facing blockquote that quotes a stale yield (Codex r3 round 5).
_BG_BANNER = re.compile(r"PROVISIONAL — the automated finish-gate", re.I)


def _strip_finish_gate_banner(text):
    """Remove ONLY a leading finish-gate PROVISIONAL banner (a '>' blockquote whose first lines carry the
    banner marker). Any other blockquote — including reader-facing thesis prose — is preserved."""
    if not isinstance(text, str):
        return text
    lines = text.splitlines()
    i = 0
    while i < len(lines) and lines[i].strip() == "":
        i += 1
    if i < len(lines) and lines[i].lstrip().startswith(">") and _BG_BANNER.search("\n".join(lines[i:i + 6])):
        while i < len(lines) and lines[i].lstrip().startswith(">"):
            i += 1
        while i < len(lines) and lines[i].strip() == "":
            i += 1
        return "\n".join(lines[i:])
    return text


def _bg_part_one(thesis):
    """Part I (everything before '# PART II'), the reader-facing decision block."""
    m = re.search(r"(?im)^#\s*PART\s+II\b", thesis)
    return thesis[:m.start()] if m else thesis


# ── PR #754 follow-up helpers (threads 16/17/22/23/25/32/33) ──
# A basis word counts only when it is about the DIVIDEND: it sits in a comma-field that names the dividend/
# yield/distribution (or "basis"), or is a bare basis field ("…, trailing, …" / "(forward)") — and is not
# immediately bound to another metric ("forward EPS guide", "trailing P/E"). "Gross dividend yield 3.1%,
# forward EPS guide, …" therefore has NO basis (thread 25).
_BG_DIV_WORD = re.compile(r"\b(?:dividends?|distributions?|yield|dps|payout|basis)\b", re.I)
_BG_PERIOD_OTHER = re.compile(
    r"\s+(?:twelve[- ]months?\s+|12[- ]?m(?:onths?)?\s+)?(?:EPS|P/?E|PE|earnings|revenue|sales|EBITDA|EBIT|FCF|free\s+cash|"
    r"cash\s+flow|guid\w*|multiples?|estimates?|consensus|growth|margins?|net\s+income|profit)\b", re.I)
_BG_BARE_PERIOD_FIELD = re.compile(
    r"^\W*(?:on\s+an?\s+|an?\s+)?(?:trailing|forward|ttm|ltm|ntm|next[- ]twelve(?:[- ]months?)?|last[- ]twelve(?:[- ]months?)?)"
    r"(?:\s+(?:basis|12[- ]?m(?:onths?)?|twelve[- ]months?))?\W*$", re.I)
# A record date belonging to a NON-dividend corporate event (AGM/EGM, a vote, a rights or bonus issue, a
# split, a buyback/tender, a scheme) is not the dividend's entitlement date (thread 25). The event token
# must QUALIFY the marker — sit immediately BEFORE it ("AGM record date", "rights issue ex-date") or
# immediately AFTER it ("record date for the AGM") — not merely co-occur somewhere in the comma-field, so a
# genuine dividend record date that a board meeting happened to set ("the board meeting set the record
# date 2026-12-01") is kept, not dropped (PR #754 false-positive fix). The over-generic "meeting" is
# excluded entirely: a board meeting declaring a dividend and fixing its record date is legitimate, and a
# genuine voting meeting is already caught by AGM/EGM/vote/ballot.
_BG_NON_DIV_EV = r"(?:AGM|EGM|vot\w*|ballot|rights|bonus|split|buy-?backs?|tender|merger|scheme|warrants?)"
_BG_EVENT_BEFORE = re.compile(_BG_NON_DIV_EV + r"(?:\s+(?:issue|offer|arrangement|approval|resolution|record))?[\s,]*$", re.I)
_BG_EVENT_AFTER = re.compile(
    r"^[\s,]*(?:for|of|ahead\s+of|relating\s+to|pursuant\s+to|under|re)\s+(?:the\s+|a\s+|an\s+)?" + _BG_NON_DIV_EV + r"\b", re.I)
# A stale yield must never be PRESENTED as a reason to own, even beside a non-receipt note (thread 23).
_BG_OWN_REASON = re.compile(
    r"\breasons?\s+to\s+(?:own|buy|hold|wait)\b|\bpays?\s+(?:holders|investors|shareholders|you)\s+to\s+wait\b|"
    r"\b(?:supports?|underpins?)\s+the\s+(?:thesis|rating|case|position)\b", re.I)
# The negation must govern the phrase itself: a negator followed only by copular / passive filler ("should
# not be considered", "cannot be treated as", "is no longer") — never an arbitrary clause, so "does not
# receive it and it is a reason to own" stays affirmative (PR #754 r4542387663).
_BG_NEG_BEFORE = re.compile(
    r"\b(?:not|never|no|nor|isn'?t|aren'?t|cannot|can'?t|won'?t|shouldn'?t|mustn'?t|doesn'?t)\b"
    r"(?:\s+(?:longer|even|really|truly|be|been|being|considered|treated|regarded|counted|seen|viewed|presented|"
    r"used|taken|cited|read|as|an?|the|any|valid|real|genuine))*\s*$", re.I)
# A depositary / foreign-wrapper line: its yield must say gross or net of withholding / depositary fees
# (§16); scoped to these lines so a domestic yield is never asked to state a withholding it does not bear.
_BG_DEPOSITARY = re.compile(r"\b(?:ADRs?|ADSs?|GDRs?|depositary|CEDEARs?|BDRs?)\b", re.I)
# An AFFIRMATIVE treatment statement: "gross of" / "net of" withholding / tax / depositary fees, or
# "before" / "after" withholding — NOT a bare "net"/"gross" (a stray "net debt" / "net margin" must not
# discharge it), and NOT a mere topic mention ("withholding treatment unknown", "depositary fee not
# stated"), which leaves the buyer's income basis unknown (PR #754 r4542387620).
_BG_GROSS_NET = re.compile(
    r"\b(?:gross|net)\s+of\b[^,;.\n]{0,40}?\b(?:withholding|WHT|tax(?:es)?|depositary|custody|fees?)\b|"
    r"\b(?:before|after|pre|post)[\s\-]+withholding\b", re.I)
# Headline price / fair-value value cells ("Current price: €90", "| Fair-value range | $100–$120 |").
# The label must sit in LABEL position — line start, a table cell, or a new clause — so prose such as
# "Uber's offer price: €41.50" (a different instrument's price) cannot fire.
_BG_PRICE_LABEL = re.compile(
    r"(?im)(?:^|\||;\s|\.\s)[\s>*-]*(?:current\s+(?:share\s+)?price|share\s+price|last\s+price|price|fair[- ]value(?:\s+range)?|"
    r"(?:bear|base|bull)(?:[- ]case)?\s+(?:fair\s+)?value|target\s+price|probability[- ]weighted\s+target(?:\s+price)?)"
    r"\s*\**\s*(?:\|\s*\**|:\**|=)\s*", re.I)
_BG_CCY_LEAD = re.compile(
    r"^[\s*~≈]*(US\$|HK\$|AU?\$|CA?\$|SG?\$|NZ\$|R\$|MX\$|NT\$|\$|€|£|₹|¥|Rs\.?(?=\s*\d)|[A-Z]{3}(?=\s*\d))\s*\d")
# The trailing marker may follow a RANGE ("100–120 EUR", "100 to 120 EUR"), not only a single value
# (PR #754 r4542387682).
_BG_CCY_TRAIL = re.compile(
    r"^[\s*~≈]*\d[\d.,]*\s*(?:bn|billion|m|mn|million|cr|crore|k)?"
    r"(?:\s*(?:-|–|—|to)\s*[~≈]?\d[\d.,]*\s*(?:bn|billion|m|mn|million|cr|crore|k)?)?\s*([A-Z]{3})\b")
_BG_ISO_CCY = {"USD","EUR","GBP","INR","JPY","CNY","HKD","AED","NOK","SEK","DKK","CHF","CAD","AUD","SGD","BRL",
               "KRW","TWD","SAR","ZAR","MXN","NZD","IDR","THB","MYR","PHP","PLN","TRY","ILS","QAR","KWD"}
_BG_CCY_SYM = {"US$":{"USD"},"HK$":{"HKD"},"A$":{"AUD"},"AU$":{"AUD"},"C$":{"CAD"},"CA$":{"CAD"},"S$":{"SGD"},
               "SG$":{"SGD"},"NZ$":{"NZD"},"R$":{"BRL"},"MX$":{"MXN"},"NT$":{"TWD"},
               "$":{"USD","HKD","AUD","CAD","SGD","NZD","MXN","TWD"},"€":{"EUR"},"£":{"GBP"},"₹":{"INR"},
               "Rs":{"INR"},"Rs.":{"INR"},"¥":{"JPY","CNY"},"RMB":{"CNY"}}
_BG_VENUE_STOP = {"the","stock","exchange","market","listed","listing","primary","main","home","local","venue",
                  "line","tbd","tba","na","unknown","unspecified","its","on","of"}


def _bg_ccy_set(tok):
    """Currencies a value token may denote (None when the token is not a recognised currency marker)."""
    if tok in _BG_CCY_SYM:
        return _BG_CCY_SYM[tok]
    if tok in _BG_ISO_CCY:
        return {tok}
    return None


_BG_CCY_ANY = re.compile(
    r"(?<![A-Za-z0-9$])(US\$|HK\$|AU?\$|CA?\$|SG?\$|NZ\$|R\$|MX\$|NT\$|\$|€|£|₹|¥|Rs\.?(?=\s*\d)|[A-Z]{3}(?=\s*\d))\s*\d|"
    r"\d[\d.,]*\s*(?:bn|billion|m|mn|million|cr|crore|k)?\s*([A-Z]{3})\b")


def _bg_headline_ccy_mismatch(part1, cur):
    """Headline price / fair-value cells in Part I whose currency marker cannot be the record currency.
    Only a value that LEADS with (or is immediately suffixed by) a recognised currency marker is read; a
    bare number, an unknown marker, or a '$' against any dollar currency is never flagged (thread 22).
    EVERY currency-marked value in the cell is read, not only the first, so "USD 80 / EUR 120" cannot hide
    the EUR scenario behind a leading USD one (PR #754 r4544983948). The cell ends at a table '|', a line
    end or a new clause; a parenthetical aside (a stated FX conversion, "₹2,450 (US$29.4)") is skipped."""
    out = []
    for m in _BG_PRICE_LABEL.finditer(part1):
        v = re.split(r"\||\n|;\s|\.\s", part1[m.end():m.end() + 160], 1)[0]
        v = re.sub(r"\([^)]*\)", " ", v)
        for cm in _BG_CCY_ANY.finditer(v):
            cs = _bg_ccy_set(cm.group(1) or cm.group(2))
            if cs and cur not in cs and not (cur == "CNY" and "CNY" in cs):
                out.append(f"{m.group(0).strip(' *|:=;.>-')} {v.strip(' *')[:60]}")
                break
    return out


def _bg_exchange_pairs(exch):
    """{canonical venue: ticker} for explicit VENUE:TICKER pairs in the record's exchange string
    (e.g. 'NSE (also listed BSE:542726)' -> {'BSE-IN': '542726'}) (thread 32)."""
    pairs = {}
    for vm in re.finditer(r"\b([A-Za-z]{2,8}):([A-Za-z0-9][A-Za-z0-9.\-]*)", exch or ""):
        for c in _venue_canons(vm.group(1)):
            pairs.setdefault(c, vm.group(2))
    return pairs


def _bg_other_lines(listed_lines_text):
    """Entries of valuation/01's Anchor-Block 'Other listed lines:' field, or [] when it says None /
    single line / is absent. Each entry is (raw text, leading ticker token)."""
    if not isinstance(listed_lines_text, str):
        return []
    hits = re.findall(r"(?im)^\s*[-*]\s*\**other listed lines:?\**:?\s*(.+)$", listed_lines_text)
    if not hits:
        return []
    val = hits[-1].strip()
    if re.match(r"^\W*(?:none|single\s+listed\s+line|n/?a|no\s+other)\b", val, re.I):
        return []
    out = []
    for ent in re.split(r";", re.split(r"\.\s", val, 1)[0]):
        ent = ent.strip(" *`")
        tm = re.match(r"^\**\s*(?:[A-Za-z]{2,8}:)?([A-Z0-9][A-Z0-9.]{0,9})\b", ent)
        if ent:
            out.append((ent, tm.group(1) if tm else None))
    return out


def _bg_venue_named(dl_text, tk, cur):
    """For a Decision line whose venue resolves to nothing in _VENUE_CANON: True when some field (other
    than the ticker/currency) names something concrete — a real venue the alias table lacks ('TSE Prime')
    is never flagged — and False when the line names no venue at all or only a generic placeholder
    ('AKAM · primary exchange · USD', 'AKAM · USD') (thread 17)."""
    body = re.sub(r"(?i)decision line\s*(?:\([^)]*\))?", " ", dl_text)
    for fld in re.split(r"·|\||:", body):
        f = fld.strip(" *`")
        if not f or (tk and f.upper() == tk.upper()) or (cur and f.upper() == cur.upper()):
            continue
        words = {w for w in re.findall(r"[a-z0-9]+", f.lower()) if len(w) >= 2} - _BG_VENUE_STOP
        words -= {(tk or "").lower(), (cur or "").lower()}
        if words:
            return True
    return False


def _bg_period_ok(seg):
    """True when a trailing/forward basis in `seg` is attached to the dividend (see _BG_DIV_WORD)."""
    for fld in seg.split(","):
        for m in _BG_PERIOD.finditer(fld):
            if _BG_PERIOD_OTHER.match(fld[m.end():]):
                continue
            if _BG_DIV_WORD.search(fld) or _BG_BARE_PERIOD_FIELD.match(fld):
                return True
    return False


def _bg_div_markers(seg):
    """Ex-/record-date markers in `seg`, dropping a record date that belongs to a non-dividend event."""
    out = []
    for m in _BG_EX_RECORD.finditer(seg):
        is_ex = m.group(0).lower().lstrip().startswith("ex")
        # A non-dividend event drops the marker only when it QUALIFIES it: adjacent immediately BEFORE the
        # marker ("rights issue ex-date …", "AGM record date …") or immediately AFTER it ("record date for
        # the AGM …"), within the marker's comma-field — NOT merely co-occurring in the field, so "the board
        # meeting set the record date …" keeps its (genuine dividend) date (PR #754 r4544983936; FP fix).
        # A marker that itself names the dividend ("ex-dividend", "ex-div") is never dropped.
        if not re.match(r"ex[\s\-_]*di", m.group(0), re.I):
            fstart = seg.rfind(",", 0, m.start()) + 1
            fend = seg.find(",", m.end())
            before = seg[fstart:m.start()]
            after = seg[m.end():fend if fend >= 0 else len(seg)]
            if _BG_EVENT_BEFORE.search(before) or _BG_EVENT_AFTER.match(after):
                continue
        out.append((m, is_ex))
    return out


def _bg_reason_to_own(line):
    """True when the line presents the yield as a reason to own (not negated: 'is not a reason to own')."""
    for m in _BG_OWN_REASON.finditer(line):
        pre = re.sub(r"\b(?:an?|the|any)\s*$", "", line[max(0, m.start() - 60):m.start()]).rstrip()
        if not _BG_NEG_BEFORE.search(pre + " "):
            return True
    return False


def eval_bg_tradable_line_and_yield(decision_date, d, thesis, listed_lines_text=None):
    """Core of check BG. Returns None (N/A — pre-gate) or a list of violation strings (empty = pass).

    Fires when Part I (a) carries no 'Decision line' statement naming the record's ticker (or, for an
    explicit VENUE:TICKER pair in the record's exchange, that venue's own ticker), a venue, and the
    currency (venue alias-aware); (b) a headline price / fair-value cell is marked in a currency that
    cannot be the record's; (c) the record's exchange — or valuation/01's 'Other listed lines' on the
    SAME venue (another share class), passed as `listed_lines_text` — flags another listed line but Part I
    never states a REAL cross-line premium/discount (a figure, tied to the OTHER line, not to fair value);
    or (d) a dividend/distribution yield with a percentage appears with no dividend-attached trailing/
    forward basis, no dividend ex-/record-date (a payment/pay date or an AGM/vote record date does not
    establish entitlement), on a depositary line without a gross/net-of-withholding statement, or — when
    its ex-/record-date has passed — with no statement that a buyer today no longer receives it, or still
    presented as a reason to own. Defensive against a malformed record: report, never raise (it runs in
    the live gate)."""
    if not (isdate(decision_date) and decision_date >= BG_DATE):
        return None  # forward-looking; pre-gate runs N/A
    if not isinstance(thesis, str):
        return ["final_thesis.md text unavailable — cannot check the tradable-line statement"]
    # Strip ONLY a leading finish-gate PROVISIONAL banner (not every blockquote), so the banner's quoted
    # diagnostics cannot satisfy the decision-line / currency checks on a re-gate, while reader-facing
    # blockquote prose (e.g. a quoted stale yield) is still validated (Codex r5 round 3, r3 round 5).
    thesis = _strip_finish_gate_banner(thesis)
    part1 = _bg_part_one(thesis)
    det = []
    rec_v, line_v, dl_joined = [], [], ""
    exch_s = d.get("exchange") if isinstance(d, dict) and isinstance(d.get("exchange"), str) else ""
    cur_s = d.get("currency").strip() if isinstance(d, dict) and isinstance(d.get("currency"), str) else ""
    # A self-negating line ("Decision line unavailable …") is not a positive declaration (Codex r2 round 5).
    dl_lines = [l for l in part1.splitlines() if re.search(r"decision line", l, re.I) and not _BG_DL_NEG.search(l)]
    if not dl_lines:
        det.append("Part I has no 'Decision line (ticker · venue · currency)' statement — the rating, price "
                   "and fair value must name the ONE listed line they apply to (CLAUDE.md §16)")
    elif isinstance(d, dict):
        joined = dl_joined = " ".join(dl_lines)
        tk, cur, exch = d.get("ticker"), d.get("currency"), d.get("exchange")
        line_v = _venue_canons(joined)
        _has_tok = lambda t: re.search(r"(?<![A-Za-z0-9])" + re.escape(t) + r"(?![A-Za-z0-9])", joined)
        # Ticker and venue are ONE listed line (thread 32): when the record's exchange carries an explicit
        # VENUE:TICKER pair (e.g. 'NSE (also listed BSE:542726)') and the decision line names that venue,
        # the line must carry THAT venue's ticker — 'INDIAMART · BSE · INR' names a nonexistent instrument,
        # while '542726 · BSE · INR' is the real BSE line and is accepted without the record ticker.
        _pairs = _bg_exchange_pairs(exch if isinstance(exch, str) else "")
        # Only when EVERY venue the line names is a paired alternate venue (a line naming the primary venue
        # too — e.g. a same-row cross-line note — keeps the record-ticker rule).
        # The venue is read from the DECLARATION itself — the value up to a dash / ';' / cell end — so a
        # trailing same-row comparison naming the primary venue cannot switch the rule off (PR #754 r4544983910).
        decl = " ".join(re.split(r"\s[—–-]\s|;|\|",
                                 re.sub(r"(?i)^.*?decision line\s*(?:\([^)\n]*\))?[\s*:=|]*", "", dl), 1)[0]
                        for dl in dl_lines)
        decl_v = _venue_canons(decl) or line_v
        pair_need = {_pairs[c] for c in decl_v if c in _pairs} if decl_v and all(c in _pairs for c in decl_v) else set()
        if pair_need and not (isinstance(tk, str) and tk.strip() in pair_need):
            if not any(re.search(r"(?<![A-Za-z0-9])" + re.escape(t) + r"(?![A-Za-z0-9])", decl) for t in pair_need):
                det.append(f"the Decision line names venue {'/'.join(c for c in decl_v)} but not that venue's own ticker "
                           f"{'/'.join(sorted(pair_need))!r} from the record's exchange {exch.strip()!r} — ticker and venue "
                           f"must be one listed line (CLAUDE.md §16)")
        elif isinstance(tk, str) and tk.strip() and not _has_tok(tk.strip()):
            det.append(f"the Decision line statement does not name the record's ticker {tk.strip()!r}")
        if isinstance(cur, str) and cur.strip() and not re.search(r"\b"+re.escape(cur.strip())+r"\b", joined):
            det.append(f"the Decision line statement does not name the record's currency {cur.strip()!r}")
        # Venue (§16: ticker · VENUE · currency). When the record's exchange resolves to one or more
        # known venues and the decision line also names a known venue, that venue must be one of the
        # record's (so a multi-listed SHSE/HKEX record cannot accept a decision line naming NYSE — Codex
        # r1 round 3). Alias-aware, so "NYSE" matches a "New York Stock Exchange" record; if the exchange
        # or the decision-line venue resolves to nothing known, the leg skips (never flags a correct run).
        if isinstance(exch, str) and exch.strip():
            rec_v = _venue_canons(exch)
            if rec_v and line_v and not (set(rec_v) & set(line_v)):
                det.append(f"the Decision line statement names a venue that does not match the record's exchange "
                           f"{exch.strip()!r} — the price and fair value must belong to one of the record's listed line(s) (CLAUDE.md §16)")
            # A line that names NO venue (thread 17): when the record's venue is known but the decision line
            # resolves to none, it passes only if some field names something concrete (a real venue the
            # alias table lacks) — an absent venue or a placeholder like 'primary exchange' does not.
            elif rec_v and not line_v and not _bg_venue_named(joined, tk if isinstance(tk, str) else "",
                                                             cur if isinstance(cur, str) else ""):
                det.append(f"the Decision line statement names no venue matching the record's exchange {exch.strip()!r} "
                           f"— §16 requires ticker · VENUE · currency (CLAUDE.md §16)")
    # This branch runs ONLY when the record positively flags a second listing, so a "no other listed
    # line" statement would contradict the record and is not an escape here — a REAL quantified
    # cross-line comparison is required (Codex r1 round 5).
    # The comparison must name the OTHER line — not just the decision venue, and not fair value (thread 26).
    others = _bg_other_lines(listed_lines_text)
    alt_tk = [t for _, t in others if t] + list(_bg_exchange_pairs(exch_s).values())
    # The decision instrument's own references: those on the Decision line, plus those the record's exchange
    # attaches to the primary listing (before any "also …" alternate), e.g. 'NYSE (ADR; also HKEX-listed)'.
    own_refs = _bg_line_refs(dl_joined) | _bg_line_refs(re.split(r"\balso\b", exch_s, 1)[0])
    if exch_s and _BG_MULTI_LISTING.search(exch_s) and not _has_cross_cmp(part1, line_v, alt_tk, own_refs):
        det.append(f"decision_record.json exchange {exch_s!r} flags another listed line, but Part I never "
                   f"states a cross-line premium/discount (a figure, tied to the other line) (CLAUDE.md §16)")
    # Another share class on the SAME venue (GOOGL/GOOG on Nasdaq) is invisible in the exchange label, so it
    # is read from valuation/01's Anchor-Block 'Other listed lines' (thread 33). Scoped to same-venue lines
    # so a far-away wrapper (a BDR/CEDEAR on another venue) is not newly required here.
    else:
        same_venue = [e for e, _ in others if set(_venue_canons(e)) & (set(line_v) | set(rec_v))]
        if same_venue and not _has_cross_cmp(part1, line_v, alt_tk, own_refs):
            det.append(f"valuation/01 lists another listed line on the same venue ({same_venue[0][:80]!r}) but Part I "
                       f"never states a cross-line premium/discount (a figure, tied to that line) (CLAUDE.md §16)")
    # Headline price / fair-value currency must be the decision line's currency (thread 22).
    if cur_s:
        bad_ccy = _bg_headline_ccy_mismatch(part1, cur_s)
        if bad_ccy:
            det.append(f"a headline price / fair-value figure is not in the decision line's currency {cur_s!r} "
                       f"({bad_ccy[0][:80]!r}) — the price and fair value must belong to the ONE named line (CLAUDE.md §16)")
    depositary = bool(_BG_DEPOSITARY.search(exch_s) or _BG_DEPOSITARY.search(dl_joined))
    # Yield availability (§16) is checked across the WHOLE thesis, not just Part I: a dividend/
    # distribution yield is a quoted yield wherever it is published (Codex r8 round 4). Banner-stripped,
    # scanned clause by clause so the required basis and ex-/record-date must sit in the YIELD's OWN
    # clause — unrelated "forward EPS guide; AGM record date …" on the line cannot satisfy them (Codex r3
    # round 4). The unavailability disclosure is checked on the whole line (explanatory prose may follow
    # the clause, e.g. a parenthetical that itself contains a ';').
    # EVERY quoted yield in a clause is validated on its own (PR #754 r4542387670): the clause is cut into one
    # chunk per yield, each starting at the comma-field that opens it (so a leading basis word such as
    # "the forward dividend yield" stays with its yield) and ending where the next yield's chunk begins — a
    # valid first yield's ex-date can no longer mask a second yield's unparseable one.
    def _yield_chunks(seg):
        ms = list(_BG_YIELD_QUOTED.finditer(seg))
        cuts = [0]
        for prev, cur in zip(ms, ms[1:]):
            c = seg.rfind(",", prev.end(), cur.start())
            cuts.append(c + 1 if c >= 0 else cur.start())
        return [seg[a:b] for a, b in zip(cuts, cuts[1:] + [len(seg)])] if ms else []

    for l in thesis.splitlines():  # `thesis` already has the finish-gate banner stripped (above)
        for seg in (ch for s_ in re.split(r"[;]|\.\s", l) for ch in _yield_chunks(s_)):
            # Exempt only when the no-yield construction IS this chunk's quoted yield expression (overlaps
            # it) — a peers' "no dividend yield" elsewhere in the chunk must not suppress it (r4544983929).
            q = _BG_YIELD_QUOTED.search(seg)
            if any(n.start() < q.end() and q.start() < n.end() for n in _BG_YIELD_NONE.finditer(seg)):
                continue
            missing = []
            if not _bg_period_ok(seg):
                missing.append("a trailing/forward basis")
            markers = _bg_div_markers(seg)
            if not markers:
                missing.append("an ex-/record-date (a payment or pay date does not establish a buyer's entitlement)")
            # The yield's OWN chunk, not the whole line: a second yield's treatment must not discharge the
            # first's (PR #754 r4544983893).
            if depositary and not _BG_GROSS_NET.search(seg):
                missing.append("a gross/net-of-withholding statement (required on a depositary line)")
            if missing:
                det.append(f"a dividend/distribution yield is quoted without {' or '.join(missing)} in its own "
                           f"clause — a trailing yield whose record date has passed is not income a buyer receives "
                           f"(CLAUDE.md §16): {seg.strip()[:140]!r}")
                continue
            # The entitlement date must be a parseable ISO CALENDAR date in the SAME field as its marker, so
            # staleness is checkable. "ex-date TBD", a non-ISO "August 14, 2025", or an impossible
            # "2026-99-99" is not verifiable (reject it). Parse EVERY ex-/record marker on the clause and
            # use the EX-date cutoff when present (a buyer on the ex-date does not receive the distribution),
            # rather than letting field order pick the date; compare with <= (Codex r7 round 4, r4 round 5).
            # Bind the date to the marker's OWN field — up to the next comma — so a later field's date
            # (e.g. "ex-date TBD, payment date 2026-12-01") is not borrowed as the ex-date (Codex r1 round 6).
            ex_present = False
            ex_dates, rec_dates = [], []
            for m, is_ex in markers:
                ex_present = ex_present or is_ex
                dmm = _BG_ISO.search(seg[m.end():].split(",", 1)[0])
                if dmm and isdate(dmm.group(0)):
                    (ex_dates if is_ex else rec_dates).append(dmm.group(0))
            # The ex-date is the binding cutoff: when an ex-date marker is PRESENT it must itself carry a
            # valid date — do NOT fall back to a record date if the ex-date's own field is unparseable
            # (e.g. "ex-date TBD, record date 2026-12-01") (Codex r1 round 7). A record date is used only
            # when no ex-date marker appears at all.
            eff = ex_dates if ex_present else rec_dates
            if not eff:
                det.append(f"a dividend/distribution yield's ex-/record-date has no parseable ISO (yyyy-mm-dd) "
                           f"date beside it, so whether a buyer today still receives the income cannot be verified "
                           f"(CLAUDE.md §16): {seg.strip()[:140]!r}")
            elif min(eff) <= decision_date and _bg_reason_to_own(l):
                det.append(f"a dividend/distribution yield's ex-/record-date {min(eff)} is on or before the "
                           f"decision date {decision_date} and the line still presents it as a reason to own — a "
                           f"buyer today does not receive it, so it can never support the thesis, disclosed or not "
                           f"(CLAUDE.md §16): {seg.strip()[:140]!r}")
            elif min(eff) <= decision_date and not _BG_UNAVAIL.search(l):
                det.append(f"a dividend/distribution yield's ex-/record-date {min(eff)} is on or before the "
                           f"decision date {decision_date} but the line does not state a buyer today no longer "
                           f"receives it — a yield whose record date has passed must never be a reason to own "
                           f"(CLAUDE.md §16): {seg.strip()[:140]!r}")
    return det


# ── Check BH (net-cash / net-debt basis label in Part I, CLAUDE.md §15) ──
# §15: "whenever a net-cash / net-debt figure departs from the strict basis ... label the basis inline
# every time the figure appears (strict / broad / gross-liquidity), and never present an
# investment-inclusive figure as bare 'net cash' without also showing the strict figure." synthesizer.md
# Part I item 6 restates it for the headline ("Any net cash / net debt framing ... must state its basis").
# Nothing opened final_thesis.md to verify it — the same prompt-only gap AI/AJ/AK closed for their rules.
# It is not hypothetical: INDIAMART_2026-08-14's Part I says "~₹31 billion of net cash" with no label,
# while its own valuation file shows the broad figure is ₹33,670 mn and the STRICT figure is ₹152 mn —
# a ~220x basis gap in the one sentence a reader sees. BG_2026-06-01, TMCV_2026-06-07 and UBER_2026-08-06
# carry the same unlabeled-figure shape. Presence/shape only: whether the label is TRUE is the
# valuation module's job (price-and-capital-structure); this only stops a bare number reaching the reader.
BH_DATE = "2026-11-06"  # forward-looking; committed runs predate it → N/A
# "net cash flow(s)" is the cash-flow-statement line, NOT the §15 net-cash / net-debt BALANCE-SHEET
# position (debt − cash) this check governs. Without the lookahead, _BH_B matches "$5bn of net cash"
# inside "$5bn of net cash flow" and raises a false PROVISIONAL on a correct thesis (§17: a gate must be
# capable of passing legitimately). Ratios ("net debt / EBITDA") and framing ("a net-cash balance sheet")
# are already out of scope; this keeps the CF-statement line out too (PR #781 false-positive fix).
_BH_NET = r"\bnet[\s‑-]*(?:cash|debt)\b(?!\s+flows?\b)"
_BH_MONEY = (r"(?:[$€£¥₹]|\b(?:US\$|USD|EUR|GBP|INR|CNY|RMB|JPY|AED|SAR|Rs\.?"
             r"|CHF|HKD|SGD|AUD|CAD|NZD|NOK|SEK|DKK|BRL|ZAR|MXN|KRW)\s?)\s?\d[\d,]*(?:\.\d+)?"
             # Any ISO-4217-shaped code (§27: any market), case-SENSITIVE so re.I does not match "the"/"was";
             # a magnitude word is required so a date like "FYE 2026" is not read as an amount (PR #781).
             r"|\b(?-i:[A-Z]{3})\s?\d[\d,]*(?:\.\d+)?\s?(?:bn|mn|million|billion|trillion|crore|cr|lakh)\b"
             r"|\b\d[\d,]*(?:\.\d+)?\s?(?:bn|mn|million|billion|trillion|crore|cr|lakh|[BMK])\b")
# An amount counts as "the net-cash figure" only when it is attached to the term: the term, then plain
# connectors, then the amount ("net debt doubled to $9.3 billion") — or the amount, then at most a few
# filler words, then the term ("₹31 billion of net cash"). "net cash even after $53.8B of new debt" is NOT
# attached (the amount belongs to something else), which keeps unrelated figures in the same clause out.
_BH_CONN = (r"(?:[\s,:(~≈=\-—]|\b(?:of|at|to|from|was|is|were|are|be|been|stood|stands|jumped|rose|fell|doubled|"
            r"tripled|up|down|about|around|roughly|approximately|approx|over|under|nearly|almost|only|just|"
            r"already|by|c|in|now|currently|presently|totals?|totall?ed|totall?ing|reach(?:es|ed|ing)?|"
            r"amounts?|amounted|amounting|positions?|came|comes?|coming|sits?|sat|sitting|registered|registers|"
            r"printed|prints|clocked|remains?|remained|holds?|held|ends?|ended|equals?|equall?ed|swung|grew|"
            r"climbed|rising|falling|widened|narrowed|ballooned|surged|swelled)\b\.?)*")
# A qualifier may sit BETWEEN the term and its amount — a parenthetical ("Net cash (strict) of …") or an
# including/excluding clause ("Net cash including investments is $10 billion"). Skipping it keeps the
# figure attached, so the label/strict-figure tests below actually see it (Codex r3, PR #781).
_BH_QUAL = (r"(?:\s*\([^()]{0,80}\)"
            r"|,?\s+(?:incl|excl|including|excluding|includes|excludes)\w*\.?\s+(?:[\w-]+\s+){0,4}?"
            r"(?:investments?|treasury|securities|deposits|funds)\b,?"
            r"|,?\s+on\s+(?:an?|the)\s+(?:broad|strict|gross[\s-]*liquidity)\s+basis\b)?")
# "Net debt was zero." / "Net cash was nil." is a stated net-cash AMOUNT too (strict nil and broad nil are
# different claims), so a nil/zero value attached to the term needs the same label (Codex r3, PR #781).
_BH_A = re.compile(_BH_NET + _BH_QUAL + _BH_CONN + "(?:" + _BH_MONEY + r"|\b(?:nil|zero)\b)", re.I)
_BH_B = re.compile("(?:" + _BH_MONEY + r")(?:\s+(?:of|its|the|a|total|reported|group|consolidated|year-end|"
                   r"in|held\s+as|worth\s+of|pro[\s-]*forma|(?:post|pre)-\w+))*\s+" + _BH_NET, re.I)
# A basis label: the §15 words, the "cash & equivalents" definition of strict, an explicit
# including/excluding-investments clause, or an explicit company-defined figure.
# "strict" labels the figure only where it is USED as a basis word — "strict net cash", "strict-basis",
# "on a strict basis", "(strict", "strict:" — not an unrelated "strict" elsewhere in the clause ("under
# strict covenant tests", Codex r3). The canonical §15 definition "debt − cash equivalents" counts with or
# without "cash and". A company-defined label counts only when it states what the measure contains
# (§15: "unless the company defines it differently (then state it)") — a bare "company-defined" does not.
_BH_STRICT_LBL = (r"\bstrict(?:[\s-]+basis)?[\s-]+net[\s‑-]*(?:cash|debt)\b|\bstrict[\s-]+basis\b"
                  r"|\(\s*strict\b|\bstrict\s*[:,)]|\bnet[\s‑-]*(?:cash|debt)\s*[-–—,]?\s*strict\b")
_BH_DEFN = r"(?:,?\s*(?:[\w'-]+\s+){0,3}?(?:incl|excl|compris|consist|net\s+of|less\b|minus\b|after\b|before\b|[=:(—–]))"
_BH_BASIS = re.compile(
    _BH_STRICT_LBL + r"|\bbroad\b|gross[\s-]*liquidity"
    # A cash-and-equivalents phrase is a basis label only as the subtracted term of a definition ("debt
    # less cash and cash equivalents"), not as any mention of cash equivalents in the clause ("…and cash
    # and cash equivalents yielded 4%" defines nothing — Codex r5, PR #781).
    r"|(?:less|minus|net\s+of|[−–-])\s*(?:total\s+|group\s+)?cash\s*(?:&|and)\s*(?:cash[\s-]*)?equivalents"
    r"|debt\s*(?:[−–-]|less|minus)\s*(?:cash[\s-]*)?equivalents"
    r"|\b(?:incl|excl)\w*\.?\s+(?:[\w-]+\s+){0,4}?(?:investments?|treasury|securities|deposits|funds)"
    r"|(?:company[\s-]*defined|(?:company|management)'?s?\s+(?:own\s+)?(?:definition|figure)"
    r"|as defined by (?:the )?company)" + _BH_DEFN, re.I)
_BH_NONSTRICT = re.compile(
    r"\bbroad\b|gross[\s-]*liquidity|\b(?:incl|including|includes)\w*\.?\s+(?:[\w-]+\s+){0,4}?"
    r"(?:investments?|treasury|securities|deposits|funds)", re.I)
# The STRICT FIGURE that §15 wants beside a broad one: a value ("₹0.15 bn", or nil / zero) that a
# "strict" token sits directly on — "strict net cash is ₹0.15 bn", "₹0.15 bn on a strict basis",
# "(strict: ₹0.15 bn)". Used where a bare "strict" anywhere in the segment is not enough: a segment that
# also carries the broad label (the "strict" must quote its OWN amount, not the broad one — "Net cash of
# ₹33.7 bn on the broad basis, held under strict treasury rules" shows no strict figure), and an
# elliptical ';' continuation of a net-cash clause ("…incl. investments; ₹0.15 bn strict").
_BH_VAL = r"(?:(?:" + _BH_MONEY + r")(?:\s?(?:bn|mn|million|billion|trillion|crore|cr|lakh)\b)?|\b(?:nil|zero)\b)"
_BH_STRICT_FIG = re.compile(
    r"\bstrict\b[\w-]*(?:[\s,:()=~≈–—-]+[\w&'.-]+){0,4}?[\s,:()=~≈–—-]+" + _BH_VAL
    + "|" + _BH_VAL + r"(?:[\s,()]+[\w'.-]+){0,2}?[\s,(]+strict\b", re.I)
_BH_VAL_RE = re.compile(_BH_VAL, re.I)
# Markdown emphasis / table punctuation (**bold**, *italic*, _under_, `code`, | table |) is presentational
# noise that must not defeat the figure↔term adjacency _BH_A/_BH_B rely on: a bolded or table-celled bare
# net-cash figure is the SAME §15 defect as a plain one, and bolding the headline number is idiomatic in
# these theses, so a gate that a **₹31 billion** figure slips past is a §17 rubber stamp. Normalise it to
# spaces for MATCHING only; the violation message still quotes the original segment.
_BH_MD = re.compile(r"[*`_|]")
# A Markdown table row, list item, heading or quote line is its own block: joining it onto the line above
# as if it were a hard-wrapped sentence would let one row's "strict" label excuse an unlabelled amount in
# the row before it (Codex r5, PR #781). Only genuine prose wraps are joined.
_BH_BLOCK = re.compile(r"^\s*(?:\||[-*+]\s|\d+[.)]\s|#|>)")
# Period / as-of tokens that tie a figure to its reporting date. A strict companion discharges a broad
# figure only for an overlapping (or unstated) period — a FY25 strict figure does not cover a FY26 broad
# one (Codex r5, PR #781).
_BH_PERIOD = re.compile(r"\b(?:FY|CY)\s?'?\d{2,4}\b|\b[QH][1-4]\s?(?:FY|CY)?\s?'?\d{2,4}\b"
                        r"|\b9M\s?(?:FY|CY)?\s?'?\d{2,4}\b|\b(?:19|20)\d{2}\b", re.I)


def _bh_periods(seg):
    return frozenset(re.sub(r"[\s']", "", m.group(0)).upper() for m in _BH_PERIOD.finditer(seg))


def _bh_units(para):
    """Lines of one paragraph regrouped into clause-bearing units: prose hard-wraps joined with a space,
    every table row / list item / heading / quote line kept as its own unit."""
    units = []
    for ln in para.split("\n"):
        if not ln.strip():
            continue
        if units and not _BH_BLOCK.match(ln) and not _BH_BLOCK.match(units[-1][0]):
            units[-1][1].append(ln.strip())
        else:
            units.append((ln, [ln.strip()]))
    return [" ".join(parts) for _, parts in units]


def _part_one(thesis):
    """Part I ('# PART I — INVESTMENT COMMITTEE DECISION') up to Part II; the text before Part II when
    there is no explicit Part I heading; the whole document only when neither heading exists."""
    m = re.search(r"(?ims)^#\s+PART\s+I\b(?!I).*?(?=^#\s+PART\s+II\b|\Z)", thesis)
    if m: return m.group(0)
    return re.split(r"(?im)^#\s+PART\s+II\b", thesis)[0]


def eval_bh_net_debt_basis_label(decision_date, thesis):
    """Core of check BH. Returns None (N/A — pre-gate) or a list of violation strings (empty = pass).
    A sentence in Part I that states a net-cash / net-debt AMOUNT (a currency amount attached to the
    term) must carry a basis label in the same sentence; and where any such sentence labels its figure
    broad / gross-liquidity / investment-inclusive, the strict figure must also be named in Part I (§15:
    never an investment-inclusive number as bare net cash). Ratios ('net debt / EBITDA 1.2x') and
    unquantified framing ('a net-cash balance sheet') are out of scope. Pure and defensive: no I/O."""
    if not (isdate(decision_date) and decision_date >= BH_DATE):
        return None
    if not isinstance(thesis, str) or not thesis.strip():
        return []
    part1 = _part_one(thesis).replace("\r\n", "\n").replace("\r", "\n")
    det, broad_keys, strict_keys = [], [], []
    # A hard-wrapped sentence — a single newline inside a paragraph — must not break the figure↔term
    # adjacency _BH_A/_BH_B rely on ("Net debt was\n$9.3 billion."), nor strand a basis label on the
    # continuation line ("…$9.3 billion on a\nstrict basis." → a false PROVISIONAL). Collapse intra-paragraph
    # newlines to spaces, keeping blank-line paragraph breaks as separators and the ';'/sentence-boundary
    # clause split below intact (Codex r4, PR #781).
    for line in (u for para in re.split(r"\n[ \t]*\n", part1) for u in _bh_units(para)):
        # Split into clauses. A basis label discharges the §15 duty only for a figure in its OWN clause,
        # so an independent clause after ';' is always its own segment (a borrowed label there — "…; leverage
        # on a strict basis is 2.1x", "…net cash; its cash and cash equivalents sit offshore" — must NOT
        # cover the figure). Sentence breaks (. ! ?) still require a following capital/quote so a decimal or
        # "Inc." is not split; ';' needs no such guard because it always separates independent clauses.
        prev_net = False  # the previous ';'-clause on this line quoted a net-cash / net-debt amount
        prev_key = frozenset()
        for seg in re.split(r"(?<=;)\s*|(?<=[.!?])\s+(?=[A-Z*(\[‘\"])", line):
            # Match on markdown-normalised text so **bold**, `code`, _under_ and | table | punctuation cannot
            # break the figure↔term adjacency _BH_A/_BH_B require (§15). The report below still quotes the
            # original seg; the ';'-structure check below also keeps the original (normalisation never adds ';').
            nseg = _BH_MD.sub(" ", seg)
            has_net = bool(_BH_A.search(nseg) or _BH_B.search(nseg))
            continuation = prev_net and not has_net
            key = _bh_periods(nseg) or (prev_key if continuation else frozenset())
            prev_net = has_net and seg.rstrip().endswith(";")
            prev_key = key if has_net else frozenset()
            if not has_net:
                # An elliptical ';' continuation of a net-cash clause ("…incl. investments; ₹0.15 bn strict")
                # names the strict figure only when "strict" sits on its own amount.
                if continuation and _BH_STRICT_FIG.search(nseg):
                    strict_keys.append(key)
                continue
            # §15 requires the STRICT FIGURE alongside an investment-inclusive one — so "strict" only
            # discharges that duty when it sits in a segment that itself quotes a net-cash/net-debt
            # AMOUNT (a quantified strict figure), not as a bare token borrowed from "strict leverage".
            # Where the same segment ALSO carries the broad label, "strict" must sit on a second, distinct
            # amount — one amount cannot be both the broad figure and the strict one.
            if re.search(r"\bstrict\b", nseg, re.I):
                if not _BH_NONSTRICT.search(nseg):
                    strict_keys.append(key)
                elif len(_BH_VAL_RE.findall(nseg)) >= 2 and _BH_STRICT_FIG.search(nseg):
                    strict_keys.append(key)
            if _BH_BASIS.search(nseg):
                if _BH_NONSTRICT.search(nseg):
                    broad_keys.append((key, seg.strip()[:160]))
            else:
                det.append("Part I states a net cash / net debt amount with no basis label "
                           f"(strict / broad / gross-liquidity, CLAUDE.md §15): {seg.strip()[:160]!r}")
    for bkey, bseg in broad_keys:
        if not any(not bkey or not skey or (bkey & skey) for skey in strict_keys):
            det.append("Part I labels a net cash / net debt figure broad / gross-liquidity but never names the "
                       "strict (debt − cash & equivalents) figure alongside it for the same period "
                       f"(CLAUDE.md §15): {bseg!r}")
            break
    return det


# ── Check BI (FX-conversion consistency across a run, CLAUDE.md §27 / §15) ──
# §27: "When a filing states a foreign-currency amount together with its home-currency equivalent … use the
# filing's stated home-currency figure verbatim; do NOT re-derive it", and "sanity-check that the implied rate
# matches the stated currency, never a different currency's rate (a EUR amount at the USD rate is the recurring
# error)". verify-evidence.md asks the LLM auditor to look for this, but nothing mechanical did — and the
# doctrine's own example shipped: TMCV_2026-06-07 carries "EUR 3.8 billion (~₹41,691 crore)" (₹109.7/EUR, the
# filing's figure) in eleven files and, in earnings/07 and earnings/99, "EUR 3.8 billion (~₹33,250 cr)" /
# "EUR 3.875 billion (~₹33,250 crore)" (₹85.8–87.5/EUR — the USD rate). One deal, two rupee values ~25% apart,
# in the same committed run, the smaller one feeding the earnings-sensitivity read.
#
# Self-referential, no FX data needed: every "<amount> (<other-currency amount>)" pair in the run's markdown
# implies a rate, and two pairs for the same currency pair must agree unless the text dates them differently.
#   (A) SAME FIGURE, TWO VALUES — one side's amount equal (≤2.5%) but implied rates >5% apart. A single amount
#       has a single converted value at a given date; two values is a contradiction whatever the period.
#   (B) SAME PERIOD, DIFFERENT RATE — any two conversions of the pair with implied rates >15% apart.
# Both rules skip two lines dated to clearly different periods (each names a year, none in common) — §27
# asks for the period-appropriate rate, and USD/INR moved ~20% between FY22 and FY26 (INDIAMART_2026-08-22
# converts a 2022 acquisition at ~₹75/USD and its 2026 market cap at ~₹89/USD; both are right).
# Rounding is respected: each side's half-unit-in-the-last-significant-digit error widens the tolerance, so a
# "€1 bn (~₹8,700 cr)" (±50% on the euro side) is never used to accuse anything. Presence/consistency only:
# which of two disagreeing rates is right is the reader's/auditor's call; the check only stops the run
# shipping both. Bare "$" and "¥" are kept as their own tokens (never merged into USD / JPY / CNY) so a
# report that writes HK$ as "$" cannot manufacture a contradiction against a US$ figure.
BI_DATE = "2026-11-15"  # forward-looking; committed runs predate it → N/A (retrospective advisory in eval.py)
_BI_SYM = {"US$": "USD", "HK$": "HKD", "S$": "SGD", "A$": "AUD", "C$": "CAD", "NZ$": "NZD", "R$": "BRL",
           "€": "EUR", "£": "GBP", "₹": "INR", "$": "$", "¥": "¥"}
_BI_CODES = ("USD|EUR|GBP|INR|JPY|CNY|RMB|HKD|CHF|SGD|AUD|CAD|NZD|AED|SAR|QAR|KWD|BHD|OMR|BRL|ZAR|MXN|KRW|TWD|"
             "NOK|SEK|DKK|IDR|THB|MYR|PHP|VND|TRY|PLN|EGP|NGN|ILS|CLP|COP|PEN|ARS")
_BI_CCY = (r"(US\$|HK\$|S\$|A\$|C\$|NZ\$|R\$|(?<![A-Za-z])\$|€|£|₹|¥|\bRs\.?(?=\s?\d)|\b(?:" + _BI_CODES
           + r")\b(?=\s?\d))")
_BI_NUM = r"(\d[\d,]*(?:\.\d+)?)\+?"  # "₹1,30,000+ crore" — a floor, still the converted amount
_BI_SCALE_WORDS = (r"lakh\s+crores?|lakh\s+cr|trillion|tn|billion|bn|million|mn|mm|crores?|cr|lakhs?|lacs?|"
                   r"thousand|[bBmMkK]")
_BI_SCALE = r"(?:\s?(" + _BI_SCALE_WORDS + r")(?![A-Za-z]))?"
_BI_HEDGE = r"(?:~|≈|c\.\s?|ca\.\s?|about\s|approx(?:\.|imately)?\s|roughly\s|around\s)?"
_BI_PAIR = re.compile(_BI_CCY + r"\s?" + _BI_NUM + _BI_SCALE + r"\s*\(\s*" + _BI_HEDGE + r"\s*" + _BI_CCY
                      + r"\s?" + _BI_NUM + _BI_SCALE + r"(?!\s*(?:/|per\b|[\d.]))")
_BI_TAIL = re.compile(r"[\d.,]*\d|\s?(?:" + _BI_SCALE_WORDS + r")(?![A-Za-z])|\s*(?:/|per\b)")
_BI_MULT = {"lakh crore": 1e12, "lakh crores": 1e12, "lakh cr": 1e12, "trillion": 1e12, "tn": 1e12,
            "billion": 1e9, "bn": 1e9, "b": 1e9, "million": 1e6, "mn": 1e6, "mm": 1e6, "m": 1e6,
            "crore": 1e7, "crores": 1e7, "cr": 1e7, "lakh": 1e5, "lakhs": 1e5, "lac": 1e5, "lacs": 1e5,
            "thousand": 1e3, "k": 1e3}
# Period years on a line: 2026, FY26, FY2026, Q1 FY26, H1 CY25, 9M FY26 → {"26"}; used only by rule (B).
_BI_YEAR = re.compile(r"\b(?:FY|CY)\s?'?((?:19|20)?\d{2})\b|\b(?:19|20)(\d{2})\b", re.I)
_BI_SAME_FIGURE_TOL = 0.025
_BI_RULE_A_GAP = 0.05
_BI_RULE_B_GAP = 0.15


def _bi_code(tok):
    tok = tok.strip()
    if tok.startswith("Rs"):
        return "INR"
    if tok == "RMB":
        return "CNY"
    return _BI_SYM.get(tok, tok)


def _bi_amount(num, scale):
    """(value, relative rounding error). Trailing integer zeros are not significant ("8,700" → ±50 of 8,700)."""
    raw = num.replace(",", "")
    try:
        v = float(raw)
    except ValueError:
        return None, None
    if v <= 0:
        return None, None
    if "." in raw:
        ulp = 10 ** -len(raw.split(".", 1)[1])
    else:
        stripped = raw.rstrip("0")
        ulp = 10 ** (len(raw) - len(stripped)) if stripped else 1
    key = re.sub(r"\s+", " ", scale.lower()) if scale else None
    mult = _BI_MULT.get(key, 1.0) if key else 1.0
    return v * mult, (0.5 * ulp) / v


def _bi_years(line):
    return frozenset(m.group(1)[-2:] if m.group(1) else m.group(2) for m in _BI_YEAR.finditer(line))


def _bi_conversions(name, text):
    out = []
    for line in text.replace("\r\n", "\n").split("\n"):
        if "(" not in line:
            continue
        for m in _BI_PAIR.finditer(line):
            # The regex may backtrack OFF the converted amount's scale or digits to satisfy its lookahead
            # ("AED 30,982M / 3.6725" would read as AED 30,982); re-check what really follows the match, and
            # drop a parenthetical that is a rate ("₹110/€") rather than an amount.
            if _BI_TAIL.match(line, m.end()):
                continue
            a, b = _bi_code(m.group(1)), _bi_code(m.group(4))
            if a == b:
                continue
            va, ea = _bi_amount(m.group(2), m.group(3))
            vb, eb = _bi_amount(m.group(5), m.group(6))
            if va is None or vb is None:
                continue
            # One side scaled (≥ lakh) and the other a bare small number ("INR 1,275m (AED 52)") is a dropped
            # scale word, not a rate — reading it literally would invent a contradiction, so skip it.
            sa, sb = m.group(3), m.group(6)
            if (bool(sa) != bool(sb)) and min(va if not sa else vb, 1e9) < 1e4 and max(va, vb) >= 1e5:
                continue
            if a > b:  # one orientation per pair, so "₹41,691 cr (€3.8 bn)" meets "€3.8 bn (~₹41,691 cr)"
                a, b, va, vb, ea, eb = b, a, vb, va, eb, ea
            out.append({"pair": (a, b), "va": va, "vb": vb, "rate": vb / va, "tol": ea + eb,
                        "years": _bi_years(line), "file": name, "text": m.group(0).strip()})
    return out


def eval_bi_fx_conversion_consistency(decision_date, docs):
    """Core of check BI. `docs` maps a run-relative file name → markdown text (final_thesis.md, memo.md and
    the module reports; deterministic *_dossier.md concatenations add nothing and may be omitted). Returns
    None (N/A — pre-gate) or a list of violation strings (empty = pass): rule (A) the same amount converted to
    two values, rule (B) the same currency pair at materially different rates — neither between two lines
    dated to clearly different periods.
    At most one violation per currency pair, naming the extreme pair of conversions. Pure; no I/O."""
    if not (isdate(decision_date) and decision_date >= BI_DATE):
        return None
    if not isinstance(docs, dict):
        return []
    by_pair = {}
    for name in sorted(docs):
        txt = docs[name]
        if isinstance(txt, str) and txt:
            for c in _bi_conversions(name, txt):
                by_pair.setdefault(c["pair"], []).append(c)
    det = []
    for pair in sorted(by_pair):
        convs = by_pair[pair]
        worst = None  # (excess gap, rule, c1, c2)
        for i, c1 in enumerate(convs):
            for c2 in convs[i + 1:]:
                lo, hi = sorted((c1["rate"], c2["rate"]))
                gap = hi / lo - 1
                slack = c1["tol"] + c2["tol"]
                same_fig = (abs(c1["va"] / c2["va"] - 1) <= _BI_SAME_FIGURE_TOL
                            or abs(c1["vb"] / c2["vb"] - 1) <= _BI_SAME_FIGURE_TOL)
                # Lines dated to clearly different periods (both carry years, none shared) may each be at
                # their own period rate (§27) — never compared. Everything else is claimed to be one period.
                if c1["years"] and c2["years"] and not (c1["years"] & c2["years"]):
                    continue
                if same_fig and gap > _BI_RULE_A_GAP + slack:
                    cand = (gap - _BI_RULE_A_GAP - slack, "A", c1, c2)
                elif gap > _BI_RULE_B_GAP + slack:
                    cand = (gap - _BI_RULE_B_GAP - slack, "B", c1, c2)
                else:
                    continue
                if worst is None or cand[0] > worst[0]:
                    worst = cand
        if worst is None:
            continue
        _, rule, c1, c2 = worst
        a, b = pair
        what = ("the same amount is converted to two different values"
                if rule == "A" else "the same currency pair is converted at materially different rates "
                "with no different period stated")
        det.append(f"§27 FX conversion: {what} ({b} per {a}: {c1['rate']:.4g} vs {c2['rate']:.4g}, "
                   f"{(max(c1['rate'], c2['rate']) / min(c1['rate'], c2['rate']) - 1) * 100:.0f}% apart) — "
                   f"{c1['text']!r} [{c1['file']}] vs {c2['text']!r} [{c2['file']}]; use the filing's stated "
                   "home-currency figure, or convert at the period-appropriate rate for THAT currency and state it "
                   "(CLAUDE.md §27)")
    return det
