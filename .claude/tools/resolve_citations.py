#!/usr/bin/env python3
"""
resolve_citations.py — deterministic citation resolver for verify-evidence (fix F05).

WHY THIS EXISTS
  The truth-integrity auditor (commands/research/verify-evidence.md) is itself an LLM.
  Told to "grep the number in the corpus yourself," it can assert "verified — found
  (4 hits)" without ever running a grep — and the committed HCG v2->v3 correction
  ("only 2 of 4 figures verify") proves it has over-credited figures. This tool makes
  the search MECHANICAL: given the figures a claim rests on and the extracted corpus,
  it actually searches and returns machine hit-counts + context lines, so the auditor
  must reconcile its status against the TOOL's output, not its own recollection.

  "the model says it grepped"  ->  "the tool grepped."

WHAT IT GETS RIGHT THAT AN LLM SLIPS ON
  - Token match, not substring: searching 2442 will NOT match inside -0.092442 or
    12442 (the exact false-positive verify-evidence.md:59 warns about).
  - Comma / trailing-zero variants: 2442 <-> 2,442 <-> 2442.0; 4.60 <-> 4.6.
  - A hit found ONLY at a x1000 / /1000 scale is reported separately as a possible
    unit mismatch (crore vs million — pairs with F04), not counted as a clean hit.

USAGE
  python3 resolve_citations.py <corpus.txt> <figure> [<figure> ...]
  python3 resolve_citations.py <corpus.txt> --json '[{"label":"net debt","value":"30711"}]'
  echo '[{"label":"ROIC","value":"4.6"}]' | python3 resolve_citations.py <corpus.txt> --json -

OUTPUT  one JSON object on stdout:
  { "corpus": ..., "n_figures": N, "results": [
      { "figure", "label", "hit_count", "scaled_hit_count", "variants_tried", "contexts":[...] } ] }
  A rating-driver with hit_count == 0 cannot be marked "verified" by the auditor.
"""
import sys
import re
import json


def token_regex(value):
    """A tolerant numeric-TOKEN regex for a figure. Tolerant of thousands commas and
    trailing zeros (cited 4.6 matches 30,711-style commas and a corpus 4.60), but never
    a coincidental substring: 2442 will not match inside -0.092442 / 12442 / 2442.5."""
    raw = str(value).strip().replace(",", "")
    neg = raw.startswith("-")                     # [admin PR#9 fix] preserve sign — a cited -4.6 must NOT
    s = raw.lstrip("+-")                           # verify against a corpus 4.6 / +4.6 (sign-sensitive integrity)
    if not re.fullmatch(r"\d+(\.\d+)?", s):
        return None  # not a plain number (e.g. a date or percent string) — skip
    intpart, _, frac = s.partition(".")
    int_pat = ",?".join(list(intpart))            # 30711 -> 3,?0,?7,?1,?1 (matches with/without commas)
    if frac:
        body = int_pat + r"\." + frac.rstrip("0") + "0*"   # 4.6 / 4.60 / 4.600
    else:
        body = int_pat + r"(?:\.0+)?"             # 2442 and 2442.0, but NOT 2442.5
    # right guard: no following digit, and not ".<digit>" (a different number)
    if neg:
        # a NEGATIVE figure must be immediately preceded by a minus at a token boundary —
        # so -4.6 matches only -4.6, never 4.6 or +4.6.
        return re.compile(r"(?<![\d.])-" + body + r"(?![\d]|\.\d)")
    # an UNSIGNED / positive figure must NOT be preceded by a minus — so 4.6 never matches inside -4.6.
    return re.compile(r"(?<![\d.\-])" + body + r"(?![\d]|\.\d)")


def count_hits(lines, pat):
    return [ln.strip()[:200] for ln in lines if pat and pat.search(ln)]


def resolve(text, figures):
    lines = text.splitlines()
    out = []
    for fig in figures:
        label = fig.get("label", "") if isinstance(fig, dict) else ""
        value = fig.get("value") if isinstance(fig, dict) else fig
        pat = token_regex(value)
        h = count_hits(lines, pat)
        scaled = 0  # hits ONLY at a x1000 / /1000 scale -> possible unit mismatch (millions vs billions/crore)
        try:
            v = float(str(value).replace(",", ""))
            for sv in (v * 1000, v / 1000, v / 1e7):  # millions<->billions/thousands, and INR crore (1cr=1e7)
                if abs(sv) >= 0.001:
                    rep = str(int(sv)) if sv == int(sv) else ("%g" % sv)  # 72400 -> also search "72.4"
                    scaled += len(count_hits(lines, token_regex(rep)))
        except Exception:  # noqa
            pass
        out.append({"figure": str(value), "label": label, "hit_count": len(h),
                    "scaled_hit_count": scaled,
                    "pattern": pat.pattern if pat else "(not a plain number — skipped)",
                    "contexts": h[:5]})
    return out


def main(argv):
    if len(argv) < 2:
        sys.stdout.write(__doc__)
        return 2
    corpus = argv[0]
    try:
        text = open(corpus, encoding="utf-8", errors="ignore").read()
    except Exception as e:  # noqa
        print(json.dumps({"error": f"corpus unreadable: {e}"}))
        return 1
    if argv[1] == "--json":
        raw = sys.stdin.read() if (len(argv) < 3 or argv[2] == "-") else argv[2]
        figures = json.loads(raw)
    else:
        figures = list(argv[1:])
    res = resolve(text, figures)
    print(json.dumps({"corpus": corpus, "n_figures": len(res), "results": res}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
