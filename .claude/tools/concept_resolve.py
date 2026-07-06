"""concept_resolve.py — LAYOUT-AGNOSTIC CIQ concept resolver.

The problem it solves: a CIQ export arrives EITHER as one multi-tab workbook (Estimates with
Consensus/Surprise/Revisions/... tabs) OR as many single-tab files (01_Consensus.xls ... 07_Revisions.xls).
Matching a concept by FILENAME keyword (what vinci's from_files does) silently drops the split files —
05_Surprise.xls has no "estimate"/"consensus" token, so (estimates, Surprise) was reported UNKNOWN even
though the data was right there.

This keys off what the workbook ACTUALLY contains: for each (file, tab) it resolves a canonical CIQ
concept address (kind, sheet, freq) by TAB-NAME first (CIQ tab titles are stable across renames/splits),
then CONTENT, then the FILENAME as a weak tie-break — and NEVER drops a tab because of its filename. Both
layouts produce the SAME concept_map, so the facts layer downstream is layout-blind. Reads each workbook
ONCE (cached rows) so the facts layer reuses the parse.

Usage:  python3 concept_resolve.py <DATA_DIR> [--json]
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

from ciq import CiqFormat, CiqParseError, classify, read_sheets

Rows = list[list[Any]]

# Canonical CIQ concept catalog: (kind, sheet, tab-name regex). ONE shared table — a new CIQ sheet is one
# new row here (and mirrors the cockpit's SHEET_TYPE_RULES so the two never disagree). "Multiples" is
# ambiguous (financials-historical vs estimates-forward) and resolved by context below, not by this table.
CATALOG: tuple[tuple[str, str, str], ...] = (
    ("financials", "Income Statement", r"^income statement$"),
    ("financials", "Balance Sheet", r"^balance sheet$"),
    ("financials", "Cash Flow", r"^cash flow$"),
    ("financials", "Segments", r"^segments$"),
    ("financials", "Ratios", r"^ratios$"),
    ("financials", "Capital Structure Details", r"^capital structure details$"),
    ("financials", "Capital Structure Summary", r"^capital structure summary$"),
    ("estimates", "Consensus", r"^consensus$"),
    ("estimates", "Recent Changes", r"^recent changes$"),
    ("estimates", "Guidance", r"^guidance$"),
    ("estimates", "Surprise", r"^surprise$"),
    ("estimates", "Trends", r"^trends$"),
    ("estimates", "Revisions", r"^revisions$"),
    ("comps", "Financial Data", r"^financial data$"),
    ("comps", "Trading Multiples", r"^trading multiples$"),
    ("comps", "Operating Statistics", r"^operating statistics$"),
)


def _content_head(rows: Rows, n: int = 40) -> str:
    """A small text fingerprint of a tab (first ~40 rows) for content-based disambiguation."""
    return "\n".join(" ".join(str(c) for c in r if str(c).strip()) for r in rows[:n])


def resolve_concept(tab: str, siblings: list[str], rows: Rows) -> tuple[str, str, str] | None:
    """(kind, sheet, basis) or None (non-CIQ). Tab-name primary; content resolves 'Multiples' + a
    generic tab name; filename is only a weak tie-break upstream, never a reason to drop a tab."""
    t = tab.strip().lower()
    if t == "multiples":  # ambiguous: financials-historical (Close-based) vs estimates-forward (ladder)
        sib = {s.lower() for s in siblings}
        if {"income statement", "balance sheet"} & sib:
            return ("financials", "Multiples", "tab-name+sibling")
        head = _content_head(rows)
        if re.search(r"\bNTM\b|FY\s?20(2[6-9]|3\d)", head, re.I):
            return ("estimates", "Multiples", "tab-name+content")
        return ("estimates", "Multiples", "tab-name+standalone")
    for kind, sheet, pat in CATALOG:
        if re.search(pat, t):
            return (kind, sheet, "tab-name")
    # content fallback ONLY for a genuinely GENERIC tab name (Sheet1 / empty). A NAMED tab that is not in
    # the catalog (Key Stats, Historical Capitalization, Supplemental, …) is deliberately not a CIQ fact
    # sheet — content-guessing it would falsely claim a second Income Statement / Balance Sheet and create
    # a spurious concept conflict. A real Income Statement carries the verbatim 'Period Type:' cell; a real
    # Balance Sheet leads with 'Balance Sheet as of:'.
    if not t or re.fullmatch(r"(sheet|tab|worksheet)\s*\d*", t):
        head = _content_head(rows)
        if "Period Type:" in head and "Total Revenue" in head:
            return ("financials", "Income Statement", "content")
        if re.search(r"balance sheet\s+as of", head, re.I) and "Total Debt" in head:
            return ("financials", "Balance Sheet", "content")
    return None


def _freq(filename: str) -> str | None:
    """annual/quarterly for a financials export — anchored on the '_' so a company NAME with
    'annual'/'quarterly' can't false-match (CIQ names them '..Financials_Annual/_Quarterly')."""
    low = filename.lower()
    if "_quarterly" in low:
        return "quarterly"
    if "_annual" in low:
        return "annual"
    return None


class ResolvedPool:
    """The resolved concept map for one subject's CIQ folder + the cached workbook rows the facts layer
    reads. concept_map: {(kind, sheet, freq): [unit, ...]}, each unit = {file, tab, basis}."""

    def __init__(self, ticker: str) -> None:
        self.ticker = ticker
        self.concept_map: dict[tuple[str, str, str | None], list[dict[str, Any]]] = {}
        self.non_ciq: list[dict[str, str]] = []
        self._cache: dict[str, dict[str, Rows]] = {}  # filename -> {tab: rows}

    def rows(self, kind: str, sheet: str, freq: str | None) -> Rows | None:
        """The winning unit's rows for a concept address (exact freq, else any freq), or None."""
        units = self.concept_map.get((kind, sheet, freq))
        if units is None:  # fall back to any freq for this (kind, sheet)
            for (k, s, _f), u in self.concept_map.items():
                if k == kind and s == sheet:
                    units = u
                    break
        if not units:
            return None
        u = units[0]
        return self._cache.get(u["file"], {}).get(u["tab"])

    def has(self, kind: str) -> bool:
        return any(k == kind for (k, _s, _f) in self.concept_map)


def resolve_folder(data_dir: Path, ticker: str) -> ResolvedPool:
    """Read every CIQ file in the folder ONCE, resolve each (file, tab) to a canonical concept."""
    pool = ResolvedPool(ticker)
    for p in sorted(data_dir.iterdir()):
        if not p.is_file() or p.name.startswith("."):
            continue
        try:
            fmt = classify(p)
        except OSError:
            continue
        if fmt not in (CiqFormat.BIFF_XLS, CiqFormat.OOXML):
            pool.non_ciq.append({"file": p.name, "why": f"not a CIQ workbook ({fmt.value})"})
            continue
        try:
            sheets = read_sheets(p, fmt)
        except CiqParseError as exc:
            pool.non_ciq.append({"file": p.name, "why": f"unreadable: {exc}"})
            continue
        pool._cache[p.name] = sheets
        siblings = list(sheets.keys())
        for tab, rows in sheets.items():
            r = resolve_concept(tab, siblings, rows)
            if r is None:
                pool.non_ciq.append({"file": f"{p.name} :: {tab}", "why": "unmapped (non-CIQ / needs a rule)"})
                continue
            kind, sheet, basis = r
            freq = _freq(p.name) if kind == "financials" else None
            pool.concept_map.setdefault((kind, sheet, freq), []).append(
                {"file": p.name, "tab": tab, "basis": basis})
    return pool


def concept_map_json(pool: ResolvedPool) -> dict[str, Any]:
    """Serializable view (JSON needs string keys): one entry per concept, with all contributing units
    and a conflict flag when >1 unit resolved to the same address (never silently first-wins)."""
    concepts = []
    for (kind, sheet, freq), units in sorted(pool.concept_map.items(), key=lambda x: (x[0][0], x[0][1], x[0][2] or "")):
        concepts.append({
            "kind": kind, "sheet": sheet, "freq": freq,
            "units": units, "conflict": len(units) > 1,
        })
    return {"ticker": pool.ticker, "concepts": concepts, "non_ciq": pool.non_ciq}


def main(argv: list[str]) -> int:
    if not argv:
        print("usage: concept_resolve.py <DATA_DIR> [--json]", file=sys.stderr)
        return 2
    data_dir = Path(argv[0])
    ticker = data_dir.name
    pool = resolve_folder(data_dir, ticker)
    out = concept_map_json(pool)
    if "--json" in argv[1:]:
        print(json.dumps(out, indent=2, default=str))
        return 0
    print(f"=== concept map for {ticker} ({len(out['concepts'])} concepts) ===")
    for c in out["concepts"]:
        fr = f" [{c['freq']}]" if c["freq"] else ""
        flag = "  <-- CONFLICT" if c["conflict"] else ""
        u = c["units"][0]
        print(f"  ({c['kind']}, {c['sheet']}{fr})  <=  {u['file']} :: '{u['tab']}'  ({u['basis']}){flag}")
    print(f"\n  non-CIQ / unmapped: {len(out['non_ciq'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
