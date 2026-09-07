#!/usr/bin/env python3
"""Headline-integrity detectors — Headline Scorecard reconciliation (check AI, CLAUDE.md
§10/§21), the Decision Audit Trail structural check (check AJ, CLAUDE.md §8/§22), and
red-flag severity reconciliation (check AK, CLAUDE.md §13/§18).

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
    """The text of the '## Decision Audit Trail' section ONLY — from its heading up to the next '## '
    heading (or EOF), mirroring `_scorecard_section`'s scoping so a table living in a LATER section
    cannot satisfy this check. None if absent.

    When the dossier uses the PART structure (synthesizer.md emits the audit trail under
    '# PART II — CROSS-CUTTING ANALYSIS'), the search is FIRST restricted to the Part II slice, so a
    later appendix/process section carrying its own '## Decision Audit Trail' heading cannot satisfy
    the check while Part II omits the table (r3556238203). Falls back to the whole document only when
    no Part II heading exists (degenerate/non-PART dossiers)."""
    p2 = re.search(r"(?ims)^#\s+PART\s+II\b.*?(?=^#\s+PART\b|\Z)", thesis)
    scope_text = p2.group(0) if p2 else thesis
    m = re.search(r"(?ims)^##\s*Decision Audit Trail\b.*?(?=^##\s|\Z)", scope_text)
    return m.group(0) if m else None
def _decision_audit_header(section):
    """The HEADER cells of the Decision Audit Trail pipe-table (the first non-separator pipe row), or []
    if the section holds no table. Split out so check AJ can verify the table actually carries the
    required bull/bear adjudication COLUMNS, not merely five columns of any shape (r3556238195)."""
    if not section: return []
    for line in section.splitlines():
        s=line.strip()
        if not s.startswith("|"): continue
        if re.match(r"^\|[\s:|-]+\|$", s): continue  # separator row
        return [c.strip() for c in s.strip("|").split("|")]
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
        cells=[c.strip() for c in s.strip("|").split("|")]
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
    hdr=[re.sub(r"\*+","",h).strip().lower() for h in _decision_audit_header(section)]
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
