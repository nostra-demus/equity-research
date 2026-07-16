#!/usr/bin/env python3
"""decision_surface.py — deterministic decision-surface extractor + differ for engine reports.

WHY THIS EXISTS (frameworks/INCREMENTAL_RERUN.md is the governing contract)
---------------------------------------------------------------------------
A `/research:rerun` (and `/commodity:rerun`) re-runs one orb and then, today, EVERY transitively
downstream module synthesis + the master synthesizer — even when the refreshed output carries the
exact same decision. This module provides the deterministic "did the decision actually change?"
test that lets the rerun cascade stop early (early cutoff): after a node is re-run, the OLD and NEW
versions of its output are reduced to their DECISION SURFACE and compared. Unchanged surface ⇒
downstream re-synthesis is provably redundant and may be pruned; any change — or ANY parse doubt —
propagates. This is a stronger condition than file presence (which the pipeline already uses for
resume) and a deterministic one, so it does not violate the INTAKE.md §1 rule that advisory LLM
judgment may never mark work fresh: no LLM is involved in the cutoff decision.

WHAT THE SURFACE IS — and what it deliberately is NOT
-----------------------------------------------------
A regenerated report ALWAYS rewords its prose, even when its decision is identical. So the surface
contains only regeneration-stable, decision-bearing values (the fields CLAUDE.md §22 says downstream
synthesis layers adjudicate on):
  • the Verdict category (the bold enum span of the `- **Verdict:**` line — not the rationale tail),
  • every `<label> /100: <value>` score bullet (value kept verbatim: number OR "Not assessable"),
    with its inverted-scale flag and any cap tags/limits attached to it,
  • the Score Cap Application table rows (trigger, the FULL Applied? cell verbatim — annotated
    cells like 'Y (partial)' are committed house style, numeric caps in the final column),
  • the §24 filter status lines and standalone `... CAP: [NOT] triggered` lines,
  • the disqualifier check (triggered count + the `Disqualifier triggered: Y/N` bullet),
  • per red-flag tag (RF-XXX-NNN), the status its standalone lines report (fired / cleared via
    strong negation phrases — so a fired↔cleared transition always flips the field),
  • numeric anchors in the Verdict section (fair-value levels, current price, red-flag counts …):
    every labelled bullet whose value carries digits, reduced to (label, digit-token tuple),
  • any fenced machine-readable JSON block (e.g. the MG synthesis's governance_summary.json),
    parsed and canonicalised.
Free prose (abstract, disconfirmation, notes, roll-up commentary) is EXCLUDED on purpose: including
it would make every regeneration read as "changed" and the cutoff would never fire.

CONTRACT (mirrors extract_pool.py / rating_caps.py)
---------------------------------------------------
  • Pure + importable: no side effects at import time; the CLI runs only under __main__.
  • Tolerant, fail-toward-changed: a section that cannot be parsed sets parse_ok=False, and
    diff() then reports changed=True for that pair. An EMPTY surface (no verdict AND no scores)
    also fails toward changed — an unparseable format must never cause a prune. No caller may
    treat "changed" as an error; it is the safe default.
  • Deterministic: identical input text ⇒ byte-identical JSON (sorted keys, stable list order).
  • Zero module knowledge (CLAUDE.md §26): sections are matched by heading NAME patterns
    ("… Verdict", "Score Cap Application"), never by module or agent names. A new module whose
    synthesis follows the shared template parses with zero edits here.

CLI (extract_pool.py conventions: positional args + --flags, JSON to stdout, [decision_surface] logs)
  python3 scripts/decision_surface.py extract <report.md> [--json <out.json>]
  python3 scripts/decision_surface.py diff <old.md> <new.md> [--json <out.json>]
  python3 scripts/decision_surface.py selftest
Exit codes: extract → 0 ok / 2 usage-or-io error. diff → 0 UNCHANGED / 3 CHANGED / 2 error
(callers MUST treat exit 2 as changed — fail toward blunt). selftest → 0 pass / 1 fail.
"""

import json
import os
import re
import sys

# NOTE on rating_caps._tag_fired_standalone (deliberately NOT reused here — an exception to §2,
# recorded): that detector is tuned for cap ENFORCEMENT, where a false "fired" is the conservative
# error. For EQUALITY comparison the same false positive is anti-conservative — the committed
# clearing phrasings ("…: NOT emitted", "(fired in the prior run) NOT triggered this run") read as
# fired on BOTH sides, so a real fired↔cleared transition would compare equal and wrongly prune.
# The comparator below classifies each standalone tag line by STRONG negation phrases instead, so
# any real transition flips the status (adversarial review: 'extract_fired_tags misreads').

SCHEMA = "decision_surface/v1"

# ── small pure helpers ───────────────────────────────────────────────────────────────────────────

def _strip_md(s):
    """Shed markdown emphasis/backticks and collapse whitespace. Keeps content, drops styling."""
    s = re.sub(r"[*_`]+", "", s or "")
    return re.sub(r"\s+", " ", s).strip()


def _norm_label(s):
    """Canonical label identity: markdown-stripped, trailing parenthetical glosses dropped,
    trailing punctuation dropped, lower-cased. Survives bold-vs-plain and colon-drift between
    regenerations of the same template line."""
    s = _strip_md(s)
    # drop trailing parenthetical gloss(es): "(higher = more beatable)", "(one line)", "(INVERTED …)"
    while True:
        t = re.sub(r"\s*\([^()]*\)\s*$", "", s)
        if t == s:
            break
        s = t
    return s.rstrip(" :–—-").lower()


_NUM_TOKEN = re.compile(r"\d[\d,]*(?:\.\d+)?")


def _digit_tokens(s):
    """The ordered tuple of numeric tokens in a value string, comma-separators removed.
    'AED 21.00 / AED 15.00 / AED 9.75' → ('21.00','15.00','9.75'). Currency/format words are
    dropped deliberately: numbers are the regeneration-stable part (§27 — numerals are
    language- and wording-independent)."""
    return tuple(m.group(0).replace(",", "") for m in _NUM_TOKEN.finditer(s or ""))


def _heading_lines(md):
    """Yield (index, level, text) for every markdown heading line."""
    out = []
    for i, ln in enumerate(md.split("\n")):
        m = re.match(r"^(#{1,6})\s+(.*\S)\s*$", ln)
        if m:
            out.append((i, len(m.group(1)), m.group(2)))
    return out


def _section(md, head_pred, *, stop_same_or_higher=True):
    """Text of the FIRST section whose heading matches head_pred(heading_text_normalized),
    running to the next heading of the same-or-higher level (H3 sub-sections stay inside their
    H2 section). Returns '' when absent. Heading text is compared markdown-stripped."""
    lines = md.split("\n")
    heads = _heading_lines(md)
    for idx, (i, lvl, text) in enumerate(heads):
        if head_pred(_strip_md(text).lower()):
            end = len(lines)
            for j, jlvl, _t in heads[idx + 1:]:
                if not stop_same_or_higher or jlvl <= lvl:
                    end = j
                    break
            return "\n".join(lines[i:end])
    return ""


# ── field extractors ─────────────────────────────────────────────────────────────────────────────

def extract_verdict_category(md):
    """The regeneration-stable verdict CATEGORY from the first `**Verdict…**` line.

    Handled shapes (all live in committed runs — see selftest fixtures):
      - **Verdict:** **Modestly undervalued** — rationale…       → 'Modestly undervalued'
      - **Verdict:** **Cyclical business — worth deeper work…**  → whole bold span (dash inside bold)
      - **Verdict: Mixed earnings setup** — rationale…           → 'Mixed earnings setup'
      - **Verdict:** Sufficient                                  → 'Sufficient'
      - **Verdict**: Standard / mixed                            → 'Standard / mixed'
    Returns the category string (markdown-stripped) or None."""
    if not isinstance(md, str):
        return None
    for raw in md.split("\n"):
        # colon inside the bold WITH the value: **Verdict: Mixed earnings setup**
        m = re.search(r"\*\*\s*Verdict\s*:\s*([^*\n][^*\n]*?)\*\*", raw, re.IGNORECASE)
        if m and m.group(1).strip():
            return _strip_md(m.group(1))
        # label-only bold (colon in or out): **Verdict:** value…  /  **Verdict**: value…
        m = re.search(r"\*\*\s*Verdict\s*:?\s*\*\*\s*:?\s*(.+)$", raw, re.IGNORECASE)
        if m and m.group(1).strip():
            rest = m.group(1).strip()
            b = re.match(r"\*\*(.+?)\*\*", rest)
            if b:
                return _strip_md(b.group(1))  # first bold span IS the category (dash may be inside)
            # plain value: category = text before a rationale dash, markdown-stripped
            return _strip_md(re.split(r"\s+[–—]\s+| — ", rest)[0])
    return None


_RF_TAG = re.compile(r"\bRF-[A-Z]{2,6}-\d{3}\b")


def extract_scores(md):
    """Every `<label> /100 … <value>` bullet in the document, as a sorted list of
    {label, value, inverted, cap_tags, cap_limits}. `value` is verbatim ('81', 'Not assessable').
    cap_tags / cap_limits capture decision-bearing cap attachments in the SAME line
    ('*(capped ≤60 by RF-OWN-004)*' → tags ['RF-OWN-004'], limits ['60'])."""
    out = {}
    for raw in md.split("\n"):
        if "/100" not in raw or not re.match(r"^\s*[-*]\s", raw):
            continue
        pre, _, post = raw.partition("/100")
        label = _norm_label(re.sub(r"^\s*[-*]\s*", "", pre))
        if not label:
            continue
        # The value is ANCHORED right after '/100': drop italic '*(gloss)*' spans from the value
        # path (they are direction glosses / provenance / cap annotations — the caps are harvested
        # from the full line below), shed the label's closing '**'/colons/spaces, then take a bare
        # number first, else the bold-span content. Anchoring matters: a search for the first bold
        # span ANYWHERE after '/100' would, for an unstyled value followed by a bold annotation
        # ('… /100: 85 — capped by **RF-X-001**'), capture the annotation as the value on both
        # sides and hide a real score move (adversarial review, extractor lens).
        clean = re.sub(r"\*\([^)]*\)\*", " ", post)
        tail = clean[re.match(r"^[\s:*]*", clean).end():]
        vn = re.match(r"(\d{1,3}(?:\.\d+)?)\b", tail)
        vb = re.match(r"([^*\n]+?)\*\*", tail)
        if vn:
            value = vn.group(1)
        elif vb and vb.group(1).strip():
            value = _strip_md(vb.group(1))
        else:
            continue  # no extractable value → not a score bullet (fail-soft; other fields still parse)
        inverted = "invert" in raw.lower()
        # cap attachments are harvested from the WHOLE post-'/100' line (value included) — more
        # sensitive than an after-the-value slice, and sensitivity fails toward changed.
        cap_tags = sorted(set(_RF_TAG.findall(post)))
        cap_limits = sorted(set(m2.group(1) for m2 in re.finditer(r"(?:≤|<=|max\s+)(\d{1,3})", post)))
        out[label] = {
            "label": label,
            "value": value,
            "inverted": inverted,
            "cap_tags": cap_tags,
            "cap_limits": cap_limits,
        }
    return [out[k] for k in sorted(out)]


def extract_cap_table(md):
    """Rows of any 'Score Cap Application' table (matched by heading NAME anywhere in the doc):
    sorted list of {trigger, applied, final_numbers}. `applied` is the FULL normalized cell text
    uppercased — NOT reduced to Y/N. The committed house style annotates the cell ('Y (partial)',
    'N (reconciled)', 'Partial'), and an exact-Y/N filter silently dropped those rows on BOTH
    sides, so a cap-application FLIP inside an annotated row compared UNCHANGED and wrongly
    pruned the cascade (adversarial review, confirmed high). Verbatim retention is
    regeneration-stable and any flip now compares unequal. Only header/separator rows are
    excluded, by shape: a dashes-only cell or a cell naming the column ('Applied?/Y/N')."""
    sec = _section(md, lambda h: "score cap application" in h)
    rows = []
    for raw in sec.split("\n"):
        if not raw.strip().startswith("|"):
            continue
        cells = [c.strip() for c in raw.strip().strip("|").split("|")]
        if len(cells) < 3:
            continue
        applied = _strip_md(cells[1]).upper()
        if not applied or re.fullmatch(r"[-: ]+", applied):
            continue  # separator row
        if "APPLIED" in applied or applied in ("Y/N", "(Y/N)"):
            continue  # header row
        rows.append({
            "trigger": _norm_label(cells[0]),
            "applied": applied,
            "final_numbers": list(_digit_tokens(" ".join(cells[2:]))),
        })
    return sorted(rows, key=lambda r: r["trigger"])


def extract_filter_statuses(md):
    """§24 rejector-filter and standalone cap status lines, wherever they appear:
      - **Filter 4 — Serial acquirers:** **Not tripped.** …   → {'filter 4': False}
      - **CAPITAL STRUCTURE TRANSACTION CAP: NOT triggered.** → {'capital structure transaction cap': False}
    True means tripped/triggered. Sorted dict for determinism."""
    out = {}
    for raw in md.split("\n"):
        plain = _strip_md(raw)
        m = re.search(r"\bFilter\s+(\d+)\b[^:]*:\s*(Not\s+tripped|Tripped|Not\s+triggered|Triggered)\b",
                      plain, re.IGNORECASE)
        if m:
            out[f"filter {m.group(1)}"] = not m.group(2).lower().startswith("not")
            continue
        m = re.search(r"\b([A-Z][A-Z /&-]{2,60}CAP)\s*:\s*(NOT\s+triggered|triggered)\b", plain)
        if m:
            out[_norm_label(m.group(1))] = not m.group(2).lower().startswith("not")
    return dict(sorted(out.items()))


def extract_disqualifier(md):
    """The BM-style automatic disqualifier check, when present:
    {triggered_count, verdict_locked, bullet} — bullet is the `Disqualifier triggered: Y/N` value.
    All three are None-tolerant (absent section ⇒ {}), and identical-absence compares equal."""
    out = {}
    sec = _section(md, lambda h: "disqualifier check" in h)
    if sec:
        y = 0
        for raw in sec.split("\n"):
            if not raw.strip().startswith("|"):
                continue
            cells = [_strip_md(c).upper() for c in raw.strip().strip("|").split("|")]
            if len(cells) >= 3 and cells[2] in ("Y", "N"):
                y += 1 if cells[2] == "Y" else 0
        out["triggered_count"] = y
        low = _strip_md(sec).lower()
        if "verdict is not locked" in low:
            out["verdict_locked"] = False
        elif "verdict is locked" in low or "verdict-lock" in low and "no verdict-lock" not in low:
            out["verdict_locked"] = True
    m = re.search(r"Disqualifier triggered\s*:?\s*\**\s*([YN])\b", _strip_md(md), re.IGNORECASE)
    if m:
        out["bullet"] = m.group(1).upper()
    return out


# Strong clearing phrases: when one of these appears in a standalone tag line's remainder, the
# line is reporting the tag as NOT fired. Deliberately strong/verbatim (never bare 'none'/'absent',
# which occur inside fired rationales) so a fired line is not misread as cleared — and any real
# fired↔cleared transition rewrites the line across this boundary, flipping the status.
_TAG_CLEARED = ("not emitted", "not triggered", "not fired", "did not fire", "not applicable",
                "n/a", "no cap applied")


def extract_tag_statuses(md):
    """Per red-flag/cap tag, the sorted set of statuses its STANDALONE lines report:
    {tag: ['cleared'] | ['fired'] | ['cleared', 'fired']}. A standalone line is one whose first
    non-markup token is the tag (markdown heading/bullet/quote cruft shed — same line shape
    rating_caps recognises); first-cell table rows (`TAG | N | …`) are excluded as status grids.
    The comparator property this field exists for: a real fired↔cleared transition rewrites the
    line across the _TAG_CLEARED boundary and the status flips, while a same-status rationale
    rewording keeps it stable."""
    out = {}
    for raw in (md or "").splitlines():
        line = raw.strip().lstrip("#-*•>|` \t").rstrip("` \t")
        m = _RF_TAG.match(line)
        if not m:
            continue
        rest = line[m.end():]
        if rest.lstrip().startswith("|"):
            continue  # first-cell status table row, not a standalone tag line
        # Scope the negation scan to the line's STATEMENT — the text before the bold close (or the
        # first sentence end). The rationale tail after it may legitimately contain negation words
        # ('Agent 06 found them *approached but not triggered*' follows a CLEARED statement, and a
        # FIRED statement's rationale could equally carry one) — scanning the whole line would make
        # the status depend on reworded rationale instead of the statement itself.
        stmt = rest.split("**")[0]
        stmt = re.split(r"(?<=\.)\s", stmt, 1)[0]
        low = _strip_md(stmt).lower()
        status = "cleared" if any(neg in low for neg in _TAG_CLEARED) else "fired"
        out.setdefault(m.group(0), set()).add(status)
    return {tag: sorted(v) for tag, v in sorted(out.items())}


def extract_numeric_anchors(md):
    """Labelled numeric bullets inside the Verdict section (matched by heading NAME: the first
    H2/H3 whose text ends with 'verdict'). Every `- [**]Label[:**] value…` bullet whose value
    carries at least one digit is reduced to (label → digit-token tuple). Prose bullets (no
    digits) are skipped — they reword between regenerations; numbers do not.
    Score bullets (`/100`) are skipped here — extract_scores() owns them."""
    sec = _section(md, lambda h: h.endswith("verdict"))
    out = {}
    for raw in sec.split("\n"):
        m = re.match(r"^\s*[-*]\s+(.*)$", raw)
        if not m or "/100" in raw:
            continue
        body = m.group(1)
        # a bold label may carry the colon inside (**Label:**) or outside (**Label**:)
        lm = re.match(r"\*\*([^*\n]+?)\*\*\s*:?\s*(.*)$", body) or re.match(r"([^:*\n]{2,80}?)\s*:\s*(.+)$", body)
        if not lm:
            continue
        label = _norm_label(lm.group(1).rstrip(":"))
        # provenance/reference noise is not decision data: drop backtick spans (`06` file refs)
        # and italic parentheticals (*(from 07)*) before harvesting digits. PLAIN parentheticals
        # stay — they carry real values ("(US$3.32, last close, as-of 2026-06-28)").
        value = re.sub(r"`[^`]*`", "", lm.group(2))
        value = re.sub(r"\*\([^)]*\)\*", "", value)
        nums = _digit_tokens(value)
        if not label or not nums:
            continue
        if label.startswith("verdict"):
            # owned by extract_verdict_category; the colon-inside-bold shape ('**Verdict: Mixed
            # earnings setup**') would otherwise leak its reworded rationale tail's digits into the
            # anchors and block the cutoff forever (adversarial review, extractor lens)
            continue
        out[label] = list(nums)
    return dict(sorted(out.items()))


def extract_fenced_json(md):
    """Named fenced machine-readable JSON blocks (the MG §9 convention: a ```json fence whose
    preceding fence-line or nearest heading names a *.json file). Returns {name: parsed} with
    parse failures recorded as {'__parse_error__': True} — which diff() treats as changed."""
    out = {}
    fence = re.compile(r"```json([^\n]*)\n(.*?)```", re.DOTALL | re.IGNORECASE)
    for m in fence.finditer(md):
        # the MG convention names the artifact in the fence info-string (```json governance_summary.json);
        # fall back to the nearest preceding line that names a .json artifact, then a positional name
        name = None
        nm = re.search(r"([A-Za-z0-9_.-]+\.json)\b", m.group(1))
        if nm:
            name = nm.group(1)
        else:
            prefix = md[:m.start()].split("\n")
            for back in range(len(prefix) - 1, max(-1, len(prefix) - 8), -1):
                nm = re.search(r"([A-Za-z0-9_.-]+\.json)\b", prefix[back])
                if nm:
                    name = nm.group(1)
                    break
        name = name or f"fenced_json_{len(out) + 1}"
        try:
            out[name] = json.loads(m.group(2))
        except (json.JSONDecodeError, ValueError):
            out[name] = {"__parse_error__": True}
    return dict(sorted(out.items()))


# ── surface + diff ───────────────────────────────────────────────────────────────────────────────

def extract_surface(md):
    """The full decision surface of one report. parse_ok=False whenever the document yields
    NEITHER a verdict category NOR any score — an empty surface must fail toward changed, never
    silently compare equal to another empty surface."""
    if not isinstance(md, str) or not md.strip():
        return {"schema": SCHEMA, "parse_ok": False, "reason": "empty or unreadable document"}
    surface = {
        "schema": SCHEMA,
        "verdict": extract_verdict_category(md),
        "scores": extract_scores(md),
        "cap_table": extract_cap_table(md),
        "filter_statuses": extract_filter_statuses(md),
        "disqualifier": extract_disqualifier(md),
        "tag_statuses": extract_tag_statuses(md),
        "numeric_anchors": extract_numeric_anchors(md),
        "fenced_json": extract_fenced_json(md),
    }
    surface["parse_ok"] = bool(surface["verdict"] or surface["scores"])
    if not surface["parse_ok"]:
        surface["reason"] = "no verdict category and no /100 score bullets found"
    if any(isinstance(v, dict) and v.get("__parse_error__") for v in surface["fenced_json"].values()):
        surface["parse_ok"] = False
        surface["reason"] = "a fenced machine-readable JSON block failed to parse"
    return surface


_COMPARED_FIELDS = ("verdict", "scores", "cap_table", "filter_statuses",
                    "disqualifier", "tag_statuses", "numeric_anchors", "fenced_json")


def diff_surfaces(old, new):
    """Compare two surfaces. Returns {changed, reasons} — reasons are short human-readable deltas
    for the rerun manifest / audit trail. ANY parse doubt on either side ⇒ changed (fail toward
    blunt: an unparseable report must never prune downstream work)."""
    reasons = []
    for side, s in (("old", old), ("new", new)):
        if not isinstance(s, dict) or s.get("schema") != SCHEMA:
            return {"changed": True, "reasons": [f"{side} surface missing or wrong schema"]}
        if not s.get("parse_ok"):
            return {"changed": True, "reasons": [f"{side} surface parse failure: {s.get('reason', 'unknown')}"]}
    # a missing verdict category is itself a change signal: if BOTH sides failed to yield one, a
    # verdict flip would otherwise compare None == None and prune (adversarial review, extractor
    # lens). Module syntheses — the only prune boundary — always carry a verdict bullet, so this
    # strictness costs nothing on the paths that matter.
    if old.get("verdict") is None or new.get("verdict") is None:
        reasons.append("verdict category missing on "
                       + ("both sides" if old.get("verdict") is None and new.get("verdict") is None
                          else "one side")
                       + " — not comparable, treated as changed")
    elif (old.get("verdict") or "").strip().lower() != (new.get("verdict") or "").strip().lower():
        reasons.append(f"verdict category: {old.get('verdict')!r} → {new.get('verdict')!r}")
    o_scores = {s["label"]: s for s in old.get("scores", [])}
    n_scores = {s["label"]: s for s in new.get("scores", [])}
    for label in sorted(set(o_scores) | set(n_scores)):
        a, b = o_scores.get(label), n_scores.get(label)
        if a is None or b is None:
            reasons.append(f"score {'appeared' if a is None else 'disappeared'}: {label!r}")
        elif a != b:
            reasons.append(f"score {label!r}: {a['value']}{' (inv)' if a['inverted'] else ''}"
                           f"{'+caps' + str(a['cap_tags'] + a['cap_limits']) if a['cap_tags'] or a['cap_limits'] else ''}"
                           f" → {b['value']}{' (inv)' if b['inverted'] else ''}"
                           f"{'+caps' + str(b['cap_tags'] + b['cap_limits']) if b['cap_tags'] or b['cap_limits'] else ''}")
    for field in ("cap_table", "filter_statuses", "disqualifier", "numeric_anchors", "fenced_json"):
        if old.get(field) != new.get(field):
            reasons.append(f"{field} changed")
    if old.get("tag_statuses") != new.get("tag_statuses"):
        reasons.append(f"red-flag tag statuses: {old.get('tag_statuses')} → {new.get('tag_statuses')}")
    return {"changed": bool(reasons), "reasons": reasons}


def diff_files(old_path, new_path):
    """Read + extract + diff two report files. Missing/unreadable file ⇒ changed (fail toward
    blunt — e.g. no snapshot of the old version means no proof of equality)."""
    sides = {}
    for name, p in (("old", old_path), ("new", new_path)):
        try:
            # errors='replace' keeps a stray non-UTF-8 byte from crashing outside the documented
            # exit contract; replacement is deterministic, so equality semantics are preserved
            with open(p, "r", encoding="utf-8", errors="replace") as f:
                sides[name] = f.read()
        except OSError as e:
            return {"changed": True, "reasons": [f"{name} file unreadable: {e}"],
                    "old": old_path, "new": new_path}
    # byte-identical is the strongest possible 'unchanged' — short-circuit before any parsing
    if sides["old"] == sides["new"]:
        return {"changed": False, "reasons": [], "byte_identical": True,
                "old": old_path, "new": new_path}
    res = diff_surfaces(extract_surface(sides["old"]), extract_surface(sides["new"]))
    res.update({"byte_identical": False, "old": old_path, "new": new_path})
    return res


# ── selftest (fixture lines are REAL rendered lines from committed runs) ─────────────────────────

def selftest():
    ok = True

    def check(cond, msg):
        nonlocal ok
        if not cond:
            ok = False
            print(f"[decision_surface] SELFTEST FAIL: {msg}")

    # verdict category — the five committed shapes
    check(extract_verdict_category("- **Verdict:** **Modestly undervalued** — base-case fair value AED 15.00")
          == "Modestly undervalued", "valuation verdict shape")
    check(extract_verdict_category("- **Verdict: Mixed earnings setup** — near-term accelerating")
          == "Mixed earnings setup", "earnings colon-inside-bold shape")
    check(extract_verdict_category("- **Verdict:** **Cyclical business — worth deeper work only with a strong timing edge**")
          == "Cyclical business — worth deeper work only with a strong timing edge", "BM dash-inside-bold shape")
    check(extract_verdict_category("- **Verdict:** Sufficient — audited FY2025 AR present")
          == "Sufficient", "plain triage shape truncates at rationale dash")
    check(extract_verdict_category("- **Verdict**: Standard / mixed") == "Standard / mixed",
          "colon-outside-bold shape")
    check(extract_verdict_category("## 1. Earnings Verdict\nno verdict bullet here") is None,
          "a heading is not a verdict")

    # scores — bold label, plain label, gloss-before-colon, non-numeric value, inline cap
    md_scores = "\n".join([
        "- **Earnings quality /100:** **81** *(from 06 — cash-backed)*",
        "- Business clarity /100: **80** — identity is clear",
        "- External dependency risk /100 *(INVERTED — higher = worse)*: **63** *(from 10)*",
        "- Covenant headroom /100: **Not assessable** *(no covenant disclosure)*",
        "- Valuation attractiveness /100 *(higher = cheaper)*: **54** *(capped ≤60 by RF-OWN-004)*",
        "- Catalyst strength /100: **47** *(held ≤55 — Filter-6 gated)*",
    ])
    scores = {s["label"]: s for s in extract_scores(md_scores)}
    check(scores.get("earnings quality", {}).get("value") == "81", "bold-label score value")
    check(scores.get("business clarity", {}).get("value") == "80", "plain-label score value")
    check(scores.get("external dependency risk", {}).get("value") == "63"
          and scores["external dependency risk"]["inverted"], "inverted gloss-before-colon score")
    check(scores.get("covenant headroom", {}).get("value") == "Not assessable", "non-numeric score value")
    check(scores.get("valuation attractiveness", {}).get("cap_tags") == ["RF-OWN-004"]
          and scores["valuation attractiveness"]["cap_limits"] == ["60"], "inline cap tag + limit")
    check(scores.get("catalyst strength", {}).get("cap_limits") == ["55"], "held ≤N cap limit")
    anchored = {sc["label"]: sc for sc in extract_scores("- Data quality /100: 85 — capped by **RF-X-001** next year")}
    check(anchored.get("data quality", {}).get("value") == "85",
          "unstyled value is anchored — a later bold annotation is never mistaken for the value")

    # cap table — full Applied?-cell retention (annotated cells are committed house style) +
    # final-cap numerics; header/separator excluded by shape, not by exact-Y/N matching
    md_cap = "\n".join([
        "## 4. Score Cap Application",
        "| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |",
        "|---|---|---|---|",
        "| No consensus / estimate data | **N** | Consensus setup | max 30 — not applied |",
        "| Transcript role filled ONLY by a sell-side proxy | **Y** | Earnings clarity | **max 70 (applied)** |",
        "| Methods disagree >40% unreconciled | **N (reconciled)** | Valuation confidence | max 55 — not applied |",
        "| No covenant disclosure | **Partial** | Covenant headroom | Not assessable |",
    ])
    rows = extract_cap_table(md_cap)
    check([r["applied"] for r in rows] == ["N (RECONCILED)", "N", "PARTIAL", "Y"],
          "cap table keeps annotated cells verbatim (sorted by trigger)")
    check(rows[3]["final_numbers"] == ["70"], "final-cap numerics")
    # THE FLIP CLASS: an annotated cap-application flip must read as changed (review finding)
    a_cap = extract_surface("- **Verdict:** Sufficient\n" + md_cap)
    b_cap = extract_surface(("- **Verdict:** Sufficient\n" + md_cap).replace("**N (reconciled)**", "**Y (unreconciled)**"))
    check(diff_surfaces(a_cap, b_cap)["changed"] is True, "annotated cap-application flip reads changed")

    # filter statuses + standalone cap lines (BM shapes)
    md_filters = "\n".join([
        "- **Filter 4 — Serial acquirers:** **Not tripped.** Growth is organic.",
        "- **Filter 5 — Fast-changing industry:** **Not tripped.**",
        "**CAPITAL STRUCTURE TRANSACTION CAP: NOT triggered.** Debt fell every year.",
    ])
    fs = extract_filter_statuses(md_filters)
    check(fs.get("filter 4") is False and fs.get("filter 5") is False, "filters not tripped")
    check(fs.get("capital structure transaction cap") is False, "standalone cap line")
    check(extract_filter_statuses("- **Filter 2 — Turnarounds:** **Tripped.**").get("filter 2") is True,
          "tripped filter reads True")

    # disqualifier — table Y-count + lock line + bullet
    md_dq = "\n".join([
        "### Automatic Disqualifier Check",
        "| # | Disqualifier | Triggered (Y/N) | Source |",
        "|---|---|---|---|",
        "| 1 | Auditor qualification | N | clean |",
        "| 2 | Pledging | Y | pledge found |",
        "**No disqualifier triggered — the Verdict is NOT locked.**",
        "### Verdict",
        "- Disqualifier triggered: **N**",
    ])
    dq = extract_disqualifier(md_dq)
    check(dq.get("triggered_count") == 1 and dq.get("verdict_locked") is False and dq.get("bullet") == "N",
          "disqualifier extraction")

    # tag statuses — the committed clearing phrasings must read as cleared, a fired line as fired,
    # table rows excluded; and BOTH transition directions must read as changed (review finding:
    # the enforcement detector's boolean hid fired↔cleared transitions).
    md_tags = "\n".join([
        "- **RF-BQ-005 (fast-changing industry: rate-of-change ≤40): NOT emitted** — scored 72.",
        "- **RF-DISC-001 / RF-DISC-002 (fired in the prior run) NOT triggered this run.**",
        "| Serial-acquirer pattern (RF-CAP-004) | N | capital allocation | max 50 |",
        "RF-OWN-004 — government-owner value trap: fired, cap applied.",
    ])
    ts_ = extract_tag_statuses(md_tags)
    check(ts_.get("RF-BQ-005") == ["cleared"], "committed NOT-emitted phrasing reads cleared")
    check(ts_.get("RF-DISC-001") == ["cleared"], "committed NOT-triggered-this-run phrasing reads cleared")
    check("RF-CAP-004" not in ts_, "first-cell table row excluded")
    check(ts_.get("RF-OWN-004") == ["fired"], "fired standalone line reads fired")
    base_tags = extract_surface("- **Verdict:** Sufficient\n" + md_tags)
    refired = extract_surface(("- **Verdict:** Sufficient\n" + md_tags).replace(
        "(fired in the prior run) NOT triggered this run.**",
        "(fired in the prior run) FIRED AGAIN this run.** The FY25 report is again delayed."))
    check(diff_surfaces(base_tags, refired)["changed"] is True, "cleared→fired transition reads changed")
    unfired = extract_surface(("- **Verdict:** Sufficient\n" + md_tags).replace(
        "RF-OWN-004 — government-owner value trap: fired, cap applied.",
        "RF-OWN-004 not triggered — the controller sold down below the threshold."))
    check(diff_surfaces(base_tags, unfired)["changed"] is True, "fired→cleared transition reads changed")

    # numeric anchors — verdict-section labelled numerics only; prose bullets skipped
    md_anchor = "\n".join([
        "## 1. Valuation Verdict",
        "- **Verdict:** **Modestly undervalued** — gated by RF-OWN-004.",
        "- **Base-case fair value (point, per share):** **AED 15.00** *(from 07)*",
        "- **Bull / Base / Bear fair-value levels (points):** **AED 21.00 / AED 15.00 / AED 9.75** *(from 07)*",
        "- **Current price:** **AED 12.20** (US$3.32, last close, as-of 2026-06-28)",
        "- Dominant valuation method (one line): **Sum-of-the-parts (`06`)** — surfaces the annuity.",
        "## 2. Roll-Up",
        "- **Some other section number:** **99**",
    ])
    anchors = extract_numeric_anchors(md_anchor)
    check(anchors.get("base-case fair value") == ["15.00"], "base FV anchor")
    check(anchors.get("bull / base / bear fair-value levels") == ["21.00", "15.00", "9.75"], "FV levels anchor")
    check(anchors.get("current price") == ["12.20", "3.32", "2026", "06", "28"], "price + as-of anchor")
    check("dominant valuation method" not in anchors, "digit-free prose bullet skipped")
    check("some other section number" not in anchors, "bullets outside the verdict section skipped")

    # fenced JSON — named + parse-failure poisoning
    md_json = "```json governance_summary.json\n{\"governance_score\": 59}\n```"
    fj = extract_fenced_json(md_json)
    check(fj.get("governance_summary.json", {}).get("governance_score") == 59, "named fenced JSON parsed")
    bad = extract_surface("- **Verdict:** Sufficient\n```json x.json\n{broken\n```")
    check(bad["parse_ok"] is False, "broken fenced JSON fails parse_ok")

    # surface + diff behavior
    a = extract_surface(md_anchor)
    check(a["parse_ok"], "anchor fixture parses ok")
    check(diff_surfaces(a, a) == {"changed": False, "reasons": []}, "identical surfaces compare unchanged")
    b = extract_surface(md_anchor.replace("AED 15.00** *(from 07)*", "AED 14.00** *(from 07)*", 1))
    d = diff_surfaces(a, b)
    check(d["changed"] and any("numeric_anchors" in r for r in d["reasons"]), "moved FV point reads changed")
    # reworded rationale with identical decision values compares UNCHANGED (the whole point)
    reworded = md_anchor.replace("gated by RF-OWN-004", "held back by the government-owner trap RF-OWN-004")
    check(diff_surfaces(a, extract_surface(reworded))["changed"] is False,
          "prose rewording with identical decision values is unchanged")
    # a verdict-less pair must not compare equal (None == None would hide a category flip)
    noverdict = extract_surface("## 1. Some Verdict\n- Data quality /100: **80**")
    check(noverdict["parse_ok"] and diff_surfaces(noverdict, noverdict)["changed"] is True,
          "verdict missing on both sides still reads changed")
    # parse failure on either side propagates
    check(diff_surfaces(extract_surface(""), a)["changed"], "empty old surface fails toward changed")
    check(diff_surfaces(a, extract_surface("no structure at all"))["changed"],
          "unparseable new surface fails toward changed")

    print("[decision_surface] selftest", "PASS" if ok else "FAIL")
    return ok


# ── CLI ──────────────────────────────────────────────────────────────────────────────────────────

def _write_or_print(payload, json_out):
    text = json.dumps(payload, indent=2, sort_keys=True, ensure_ascii=False)
    if json_out:
        with open(json_out, "w", encoding="utf-8") as f:
            f.write(text + "\n")
        print(f"[decision_surface] wrote {json_out}")
    else:
        print(text)


def main(argv):
    if len(argv) >= 1 and argv[0] == "selftest":
        return 0 if selftest() else 1
    json_out = None
    if "--json" in argv:
        i = argv.index("--json")
        if i + 1 >= len(argv):
            print(__doc__)
            return 2
        json_out = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    try:
        if len(argv) == 2 and argv[0] == "extract":
            with open(argv[1], "r", encoding="utf-8", errors="replace") as f:
                _write_or_print(extract_surface(f.read()), json_out)
            return 0
        if len(argv) == 3 and argv[0] == "diff":
            res = diff_files(argv[1], argv[2])
            _write_or_print(res, json_out)
            return 3 if res["changed"] else 0
    except Exception as e:  # any unexpected failure must land INSIDE the exit contract (2 = error,
        # which every caller treats as changed) — never a bare traceback with exit 1
        print(f"[decision_surface] ERROR: {e}", file=sys.stderr)
        return 2
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
