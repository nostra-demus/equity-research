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
            # must not be able to hide (Codex r4). Scanned as whole decision phrases (not bare substrings),
            # so an unrelated qualifier mentioning "buyback" etc. cannot false-fire.
            _rest = cell_norm[_m.end():]
            _boundary_cls = r'[\s,;:./()\-–—]'
            for _dec in sorted(_ALL_DECISIONS, key=len, reverse=True):
                if _dec == want:
                    continue
                if re.search(r'(?:^|' + _boundary_cls + r')' + re.escape(_dec) + r'(?:$|' + _boundary_cls + r')', _rest):
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
            if _size_cell is None:
                # An ABSENT row is a violation, exactly as for Rating and the two score rows: synthesizer.md
                # §2 makes 'Suggested sizing' a required reader-facing row (= sizing_hint.action), so omitting
                # it ships the run without ever showing the reader the scorer-derived position size (Codex r3).
                det.append("Headline Scorecard row 'Suggested sizing' is required (the reader-facing "
                           "position size) but absent from the scorecard — synthesizer.md §2 defines it as "
                           "sizing_hint.action")
            else:
                _snorm = lambda s: re.sub(r'\s+', ' ', re.sub(r'[*_`]', '', str(s))).strip().lower()
                _a, _b = _snorm(_size_cell), _snorm(sh.get("action"))
                # The cell must carry the FULL recorded action, optionally followed by a boundary-delimited
                # trailing gloss ("standard position (2-4% NAV)"). A cell that is only a PREFIX of the action
                # ("standard" for "standard position", or "s") is a materially different / truncated size and
                # must fail — the earlier reverse-prefix tolerance let exactly that pass (Codex r3). Boundary =
                # end-of-string or a non-alphanumeric char after the action, so a gloss qualifies but a longer
                # word ("standard positioning") does not.
                if _a and _b and not re.match(re.escape(_b) + r'(?![0-9a-z])', _a):
                    det.append(f"Headline Scorecard 'Suggested sizing'={_size_cell!r} does not match "
                               f"sizing_hint.action={sh.get('action')!r} in decision_record.json — the "
                               f"position size the reader sees must be the recorded one, in full "
                               f"(synthesizer.md §2)")
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
    _cap = d.get("rating_cap")
    _cap_resolves = (len(crit) == 1 and isinstance(_cap, str)
                     and bool(_AK_RESOLVED.search(_cap)) and not _AK_RESOLVED_NEG.search(_cap))
    for rf in crit:
        if rf.get("resolved") is True:
            continue
        # A resolution counts only if resolution wording appears AND no negation appears in the SAME field
        # (clause). Negation in a DIFFERENT field must not veto a genuine one — "status: not resolved" is
        # not a resolution, but a "resolution: resolved by the FY25 audit" alongside a "description:
        # formerly unresolved" (historical wording) still is (Codex r3). Evaluate each field independently.
        if any(_AK_RESOLVED.search(_v) and not _AK_RESOLVED_NEG.search(_v)
               for _v in (str(rf.get(_f) or "") for _f in ("resolution", "status", "description"))):
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
    return bool(_AK_AFFIRM.search(txt)) and not _AK_AFFIRM_NEGATED.search(txt)
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
    if declared or json_critical:
        if declared:
            _tm = max(declared, key=declared.get)
            _who = f"{_tm} declares {declared[_tm]}"
        else:
            _who = f"decision_record.json records {json_critical} Critical red flag(s)"
        _sec = _scorecard_section(thesis)
        _cap_cell = _hs_cell(_sec, "Rating cap") if _sec else None
        for label, txt in [("Headline Scorecard 'Rating cap' cell", _cap_cell),
                           ("decision_record.json rating_cap field", d.get("rating_cap"))]:
            if not txt:
                continue
            if not isinstance(txt, str):
                # A truthy non-string (list/dict/number) would raise TypeError inside re.search and take the
                # whole live gate down with it. A rating cap that isn't text is itself malformed — report it.
                det.append(f"{label} is not a string (got {type(txt).__name__}: {txt!r}) — a rating cap must "
                           f"be readable text; cannot verify it does not deny the recorded Critical red flag(s)")
                continue
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
