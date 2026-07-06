#!/usr/bin/env python3
"""Smoke tests for the CIQ concept resolver + facts sidecar (concept_resolve.py + ciq_facts.py).

Builds a SYNTHETIC split-layout CIQ fixture (a multi-tab Financials workbook + standalone per-tab
Estimates files) with openpyxl, so the whole chain — classify -> read_sheets -> resolve concept ->
extract fact — is validated deterministically WITHOUT committing any real (proprietary) CIQ data.

Run: python3 test_ciq_facts.py   (exit 0 = all pass)
"""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path

import openpyxl

import ciq
import ciq_facts as F
from ciq_facts import SourceStatus
from concept_resolve import resolve_concept, resolve_folder

_passed = 0
_failed = 0


def check(name: str, cond: bool, detail: str = "") -> None:
    global _passed, _failed
    if cond:
        _passed += 1
        print(f"  ok   {name}")
    else:
        _failed += 1
        print(f"  FAIL {name}   {detail}")


def _wb(path: Path, sheets: dict[str, list[list]]) -> None:
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    for name, rows in sheets.items():
        ws = wb.create_sheet(name)
        for r in rows:
            ws.append(r)
    wb.save(str(path))


def build_fixture(d: Path) -> None:
    # a multi-tab Financials workbook (freq from the '_Annual' filename token)
    _wb(d / "Acme Financials_Annual.xlsx", {
        "Income Statement": [
            ["Period Type:", "Annual"],
            ["Fiscal Period", "FY2024", "FY2025", "LTM Mar-31-2026"],
            ["Total Revenue", 15000, 17000, 17200],
            ["EBITDA", 2100, 2355, 2273],
            ["Interest Expense", 380, 400, 410],
            ["Gross Profit", 6000, 6600, 6700],
        ],
        "Balance Sheet": [
            ["Balance Sheet as of:", "Dec-31-2025", "Mar-31-2026"],
            ["Total Debt", 31000, 31500],
            ["Net Debt", 28000, 29000],
        ],
        "Cash Flow": [
            ["Fiscal Period", "FY2025", "LTM Mar-31-2026"],
            ["Cash from Ops.", 2500, 2550],
            ["Levered Free Cash Flow", 500, 528],
        ],
        "Multiples": [
            ["For Quarter Ending", "", "Dec-31-2025", "Mar-31-2026"],
            ["TEV/LTM EBITDA"],
            ["", "Close", 8.0, 8.5],
            ["P/LTM EPS"],
            ["", "Close", 40.0, 48.7],
        ],
        "Segments": [
            ["Fiscal Period", "12 months Dec-31-2025"],
            ["Revenues"],
            ["North America", 12000],
            ["International", 5000],
            ["Total Revenue", 17000],
        ],
        "Key Stats": [["Company Name", "Acme"], ["Total Debt", 31500], ["as of", "Mar-2026"]],  # NOT a fact sheet
    })
    # standalone SPLIT estimate files — the layout that vinci's filename mapping silently drops
    _wb(d / "05_Surprise.xlsx", {"Surprise": [
        ["", 2022, 2023, 2024, 2025],
        ["EPS (GAAP) Actual vs Estimate", 1.75, 0.08, 0.07, 0.55],
        ["Revenue", 0.02, 0.01, 0.00, 0.01],
    ]})
    _wb(d / "01_Consensus.xlsx", {"Consensus": [
        ["Target Price", 47.28, 48.50],
        ["LT Growth %", 0.42, 0.42],
        ["Industry Recommendation", 2.1],
    ]})


def test_resolver() -> None:
    # unit: concept resolution by tab-name / content, layout-agnostic, never filename-first
    check("resolve: 'Surprise' -> (estimates, Surprise)", resolve_concept("Surprise", ["Surprise"], [])[:2] == ("estimates", "Surprise"))
    check("resolve: 'Balance Sheet' -> (financials, Balance Sheet)", resolve_concept("Balance Sheet", [], [])[:2] == ("financials", "Balance Sheet"))
    check("resolve: 'Multiples' with IS/BS siblings -> financials.Multiples",
          resolve_concept("Multiples", ["Income Statement", "Balance Sheet", "Multiples"], [[]])[:2] == ("financials", "Multiples"))
    check("resolve: standalone 'Multiples' -> estimates.Multiples",
          resolve_concept("Multiples", ["Multiples"], [["NTM", "FY 2027"]])[:2] == ("estimates", "Multiples"))
    check("resolve: a NAMED non-fact tab ('Key Stats') is NOT content-guessed",
          resolve_concept("Key Stats", ["Key Stats"], [["Period Type:", "x"], ["Total Revenue", 1]]) is None)
    check("resolve: a GENERIC 'Sheet1' with income content -> financials.Income Statement (content rescue)",
          resolve_concept("Sheet1", ["Sheet1"], [["Period Type:", "Annual"], ["Total Revenue", 1]])[:2] == ("financials", "Income Statement"))


def test_facts(d: Path) -> None:
    out = F.build_facts(d, "ACME")
    f = out["facts"]

    def present(name: str, want: float | None = None, tol: float = 0.1) -> None:
        v = f[name]
        ok = v["status"] == "present" and v["value"] is not None and v["source_ref"]
        if ok and want is not None:
            ok = abs(float(v["value"]) - want) <= tol
        check(f"fact {name} PRESENT{'' if want is None else f' ≈ {want}'}", ok, str(v))

    # the split standalone Surprise file resolves (the whole point) — vinci's from_files would drop it
    check("estimates.Surprise resolves from the SPLIT 05_Surprise.xlsx",
          f["surprise_history"]["status"] == "present", str(f["surprise_history"]))
    present("net_debt_musd", 29000)
    present("total_debt_musd", 31500)
    present("ltm_ebitda_musd", 2273)
    present("ltm_ocf_musd", 2550)
    present("free_cash_flow_musd", 528)
    present("interest_coverage_x", round(2273 / 410, 1))
    present("ev_ebitda_current_x", 8.5)
    present("pe_ltm_current_x", 48.7)
    present("segments_revenue")
    present("consensus_view")

    # HONESTY: <4 quarters of closes -> UNKNOWN (not a fabricated percentile); every fact obeys the
    # Sourced contract (PRESENT => value+source; UNKNOWN/MISSING => value is None, never faked).
    check("ev_ebitda_percentile UNKNOWN on <4 quarters (no fabricated pctile)",
          f["ev_ebitda_percentile"]["status"] == "unknown" and f["ev_ebitda_percentile"]["value"] is None)
    contract_ok = all(
        (v["status"] == "present" and v["value"] is not None and v["source_ref"])
        or (v["status"] in ("unknown", "missing") and v["value"] is None)
        for v in f.values()
    )
    check("Sourced contract holds for EVERY fact (no fabricated value on a non-PRESENT fact)", contract_ok)


def test_missing(d: Path) -> None:
    # a folder with ONLY financials -> estimate facts are MISSING (whole export absent), never faked
    only_fin = d / "onlyfin"
    only_fin.mkdir()
    (d / "Acme Financials_Annual.xlsx").replace(only_fin / "Acme Financials_Annual.xlsx")
    f = F.build_facts(only_fin, "ACME")["facts"]
    check("no Estimates export -> surprise_history MISSING (value None)",
          f["surprise_history"]["status"] == "missing" and f["surprise_history"]["value"] is None, str(f["surprise_history"]))


def test_primitives() -> None:
    # UNAVAILABLE cells -> None, NEVER coerced to 0 (the anti-fabrication primitive)
    check("clean_num('-') is None (not 0)", ciq.clean_num("-") is None)
    check("clean_num('NM') is None", ciq.clean_num("NM") is None)
    check("clean_num('') is None", ciq.clean_num("") is None)
    check("clean_num('1,234') == 1234.0", ciq.clean_num("1,234") == 1234.0)
    check("clean_num(0) == 0.0 (a real zero survives)", ciq.clean_num(0) == 0.0)
    check("Sourced.present carries value+source", (s := F.Sourced.present(1.0, source_ref="x")).value == 1.0 and s.source_ref == "x")
    check("Sourced.unknown carries no value", F.Sourced.unknown(note="n").value is None)


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        d = Path(td)
        build_fixture(d)
        print("== ciq concept resolver ==")
        test_resolver()
        print("== ciq_facts extraction (synthetic split layout) ==")
        test_facts(d)
        print("== honest MISSING ==")
        test_missing(d)
        print("== parsing primitives ==")
        test_primitives()
    print(f"\n{_passed} passed, {_failed} failed")
    return 1 if _failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
