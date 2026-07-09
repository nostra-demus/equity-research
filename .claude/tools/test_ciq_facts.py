#!/usr/bin/env python3
"""Smoke tests for the CIQ concept resolver + facts sidecar (concept_resolve.py + ciq_facts.py).

Builds a SYNTHETIC split-layout CIQ fixture (a multi-tab Financials workbook + standalone per-tab
Estimates files) with openpyxl, so the whole chain — classify -> read_sheets -> resolve concept ->
extract fact — is validated deterministically WITHOUT committing any real (proprietary) CIQ data.

Run: python3 test_ciq_facts.py   (exit 0 = all pass)
"""
from __future__ import annotations

import shutil
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
    check("resolve: standalone HISTORICAL Multiples (For Quarter Ending + Close, no IS/BS sibling) -> financials.Multiples",
          resolve_concept("Multiples", ["Multiples"],
                          [["For Quarter Ending", "Dec-31-2025"], ["TEV/LTM EBITDA"], ["", "Close", 8.6]])[:2] == ("financials", "Multiples"))
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
    present("net_debt_m", 29000)
    present("total_debt_m", 31500)
    present("ltm_ebitda_m", 2273)
    present("ltm_ocf_m", 2550)
    present("levered_fcf_m", 528)
    present("interest_coverage_x", round(2273 / 410, 1))
    present("net_debt_ebitda_x", round(29000 / 2273, 2))  # derived leverage ratio: 29000 / 2273 ≈ 12.76x
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


def test_standalone_multiples(base: Path) -> None:
    # DEFECT #3: a split-out historical Multiples file with NO in-file Income Statement / Balance Sheet
    # sibling must still resolve to financials.Multiples (by content) — else every valuation fact is UNKNOWN.
    d = base / "standalone_mult"
    d.mkdir()
    _wb(d / "06_Multiples_Quarterly.xlsx", {"Multiples": [
        ["For Quarter Ending", "", "Jun-30-2025", "Sep-30-2025", "Dec-31-2025", "Mar-31-2026"],
        ["TEV/LTM EBITDA"],
        ["", "Close", 8.0, 8.2, 8.6, 8.8],
        ["P/LTM EPS"],
        ["", "Close", 30.0, 31.0, 32.0, 33.0],
    ]})
    f = F.build_facts(d, "SOLO")["facts"]
    check("standalone split Multiples (no IS/BS sibling) -> ev_ebitda_current PRESENT (≈8.8), not UNKNOWN",
          f["ev_ebitda_current_x"]["status"] == "present" and abs(float(f["ev_ebitda_current_x"]["value"]) - 8.8) < 0.05,
          str(f["ev_ebitda_current_x"]))
    check("standalone split Multiples -> pe_ltm_current PRESENT (≈33.0)",
          f["pe_ltm_current_x"]["status"] == "present" and abs(float(f["pe_ltm_current_x"]["value"]) - 33.0) < 0.05,
          str(f["pe_ltm_current_x"]))


def test_conflict_freshest(base: Path) -> None:
    # DEFECT #1B: a STALE re-pulled export left beside the current one — both resolve to (financials,
    # Balance Sheet, annual). The FRESHEST (by 'as of' date) must win; the stale file must NOT shadow it
    # as a wrong PRESENT leverage number (the worst-case contract violation).
    d = base / "conflict"
    d.mkdir()
    _wb(d / "AA old Financials_Annual.xlsx", {"Balance Sheet": [
        ["Balance Sheet as of:", "Dec-31-2023"], ["Total Debt", 111111.1], ["Net Debt", 99999.9]]})
    _wb(d / "ZZ new Financials_Annual.xlsx", {"Balance Sheet": [
        ["Balance Sheet as of:", "Dec-31-2025"], ["Total Debt", 31500.0], ["Net Debt", 29188.6]]})
    out = F.build_facts(d, "CONF")
    f = out["facts"]
    check("conflict: net_debt serves the FRESHEST file (29188.6), not alphabetical-first stale (99999.9)",
          f["net_debt_m"]["status"] == "present" and abs(float(f["net_debt_m"]["value"]) - 29188.6) < 0.5,
          str(f["net_debt_m"]))
    check("conflict surfaced in ciq_facts.json conflicts[] (both files named for the human to prune)",
          any(c["sheet"] == "Balance Sheet" and len(c["files"]) == 2 for c in out["conflicts"]), str(out["conflicts"]))


def test_dual_freq(base: Path) -> None:
    # DEFECT #1A: two financials workbooks named WITHOUT the _Annual/_Quarterly token — the freq must come
    # from the verbatim 'Period Type:' cell so they DON'T collapse to freq=None and shadow each other.
    d = base / "dualfreq"
    d.mkdir()
    _wb(d / "Acme Financials Annual Report.xlsx", {"Income Statement": [
        ["Period Type:", "Annual"], ["Fiscal Period", "FY2024", "FY2025"],
        ["Total Revenue", 15000, 17000], ["EBITDA", 2100, 2355]]})
    _wb(d / "Acme Financials Q Report.xlsx", {"Income Statement": [
        ["Period Type:", "Quarterly"], ["Fiscal Period", "Q4 Dec-31-2025", "Q1 Mar-31-2026"],
        ["Total Revenue", 4300, 4400], ["EBITDA", 600, 620]]})
    pool = resolve_folder(d, "ACME")
    keys = set(pool.concept_map)
    check("untokened dual-freq: ANNUAL Income Statement key exists (period_type fallback, not freq=None)",
          ("financials", "Income Statement", "annual") in keys, str(keys))
    check("untokened dual-freq: QUARTERLY Income Statement key exists (no collapse onto one key)",
          ("financials", "Income Statement", "quarterly") in keys, str(keys))
    check("untokened dual-freq: NO freq=None collapse for Income Statement",
          ("financials", "Income Statement", None) not in keys, str(keys))
    b = F.ResolvedBundle(pool)
    check("untokened dual-freq: ltm_ebitda (annual request) reads the ANNUAL workbook (2355), not the quarter (620)",
          abs(float(F.ltm_ebitda(b).value) - 2355) < 1, str(F.ltm_ebitda(b)))


def test_isolation(base: Path) -> None:
    # DEFECT #2: one throwing extractor must degrade to a single honest UNKNOWN, never crash build_facts
    # and lose every other fact.
    d = base / "iso"
    d.mkdir()
    _wb(d / "Acme Financials_Annual.xlsx", {
        "Income Statement": [["Period Type:", "Annual"], ["Fiscal Period", "FY2025"],
                             ["Total Revenue", 17000], ["EBITDA", 2355], ["Interest Expense", 400]],
        "Balance Sheet": [["Balance Sheet as of:", "Dec-31-2025"], ["Total Debt", 31000], ["Net Debt", 29000]],
    })

    def boom(_bundle):
        raise ValueError("synthetic extractor crash")

    orig = F.FACTS["net_debt_m"]
    F.FACTS["net_debt_m"] = boom
    try:
        f = F.build_facts(d, "ISO")["facts"]
    finally:
        F.FACTS["net_debt_m"] = orig
    check("build_facts isolates a throwing extractor -> THAT fact UNKNOWN (not a whole-sidecar crash)",
          f["net_debt_m"]["status"] == "unknown" and f["net_debt_m"]["value"] is None
          and "failed" in (f["net_debt_m"]["note"] or ""), str(f["net_debt_m"]))
    check("build_facts isolation: OTHER facts still PRESENT after one extractor throws",
          f["total_debt_m"]["status"] == "present" and abs(float(f["total_debt_m"]["value"]) - 31000) < 1,
          str(f["total_debt_m"]))


def test_ownership(base: Path) -> None:
    # The insider/holdings numbers governance F20 says an LLM fabricates. This fixture regression-guards every
    # bug the adversarial audit found: parent/leg DOUBLE-COUNTING, the open-market WHITELIST (a 'Sale' leg is
    # NOT open-market), the undated 'Latest' History column, and dropped-row DISCLOSURE.
    d = base / "ownership"
    d.mkdir()
    _wb(d / "Acme Public Ownership.xlsx", {
        "Insider Trading": [
            ["Acme (NYSE:ACME) > Public Ownership > Insider Trading"],
            ["Insider/Individual Trades"],
            ["Holder Name", "Trade Date Range", "Security Type", "Transacted Shares",
             "Transaction Value Range (USD)", "Transaction Type", "Price Range (USD)", "Filed Date"],
            # Event 1 — a NAMED open-market buy of 10,000 split into two blank-name LEGS (must count ONCE)
            ["Alice (CEO)", 45000, "Common Stock", 10000, 500000, "Open Market Acquisition", 50, 45002],
            ["", 45000, "Common Stock", 6000, 300000, "Open Market Acquisition", 50, 45002],  # leg — must be skipped
            ["", 45000, "Common Stock", 4000, 200000, "Open Market Acquisition", 50, 45002],  # leg — must be skipped
            ["Bob (Director)", 45010, "Common Stock", -4000, -200000, "Open Market Disposition", 50, 45012],
            # a 'Sale' (option-exercise sale leg) — NOT open-market; the old 'not derivative' filter wrongly kept it
            ["Carol (CFO)", 45020, "Common Stock", -3000, -150000, "Sale", 50, 45022],
            ["Dan (VP)", 45025, "Common Stock", 6000, 0, "Derivative Exercise and Retained Stock", 0, 45027],
            ["Eve (VP)", 45030, "Common Stock", 1234567891244257, 0, "Derivative Exercise", 0, 45032],  # SENTINEL
        ],
        "History": [
            ["Acme (NYSE:ACME) > Public Ownership > History"],
            ["Holders"],
            ["Holder", "Jun-30-2025 Common Stock Equivalent Held", "Dec-31-2025 Common Stock Equivalent Held",
             "Latest Common Stock Equivalent Held"],
            ["Big Fund LP", 5000, 6000, 9999],  # 'Latest' 9999 must be IGNORED — bind to the dated Dec-31 column
            ["Mid Fund LLC", 3000, 2000, 1],
            ["Small Fund", 1000, 1500, 1],
            ["MegaGarbage Fund", 2000000000000, 2000000000000, 5],  # sentinel — excluded + disclosed
        ],
    })
    f = F.build_facts(d, "ACME")["facts"]
    # NAMED events only, all types: +10000 −4000 −3000 +6000 = +9000 (legs +6000/+4000 NOT re-added; sentinel out).
    # If legs were summed the net would be +19,000 — asserting +9,000 proves de-dup.
    na = f["insider_net_activity"]
    check("insider_net_activity: named-event net +9,000 (legs de-duped), sentinel excluded + disclosed",
          na["status"] == "present" and "+9,000" in str(na["value"]) and "excluded" in str(na["value"])
          and "+19,000" not in str(na["value"]), str(na))
    # WHITELIST 'open market' only: Alice +10000 buy, Bob −4000 sell → net +6000, 1 buy / 1 sell. Carol's 'Sale'
    # (−3000) and the split legs must NOT appear — if the old 'not derivative' filter or legs leaked, it'd be
    # different counts / a different net.
    om = f["insider_open_market"]
    check("insider_open_market: net +6,000, 1 buys / 1 sells ('Sale' + legs excluded)",
          om["status"] == "present" and "net +6,000" in str(om["value"]) and "1 buys / 1 sells" in str(om["value"]), str(om))
    # top holders bind to the DATED Dec-31-2025 column (6,000), NOT the undated 'Latest' (9,999); sentinel disclosed
    th = f["top_institutional_holders"]
    check("top_institutional_holders: Big Fund LP 6,000 as-of 2025-12-31 (undated 'Latest' 9,999 ignored) + disclosure",
          th["status"] == "present" and "Big Fund LP 6,000" in str(th["value"]) and "as-of 2025-12-31" in str(th["value"])
          and "9,999" not in str(th["value"]) and "excluded" in str(th["value"]), str(th))
    # trend over DATED columns: 9,000 (Jun) → 9,500 (Dec), sentinel disclosed
    tr = f["institutional_ownership_trend"]
    check("institutional_ownership_trend: 9,000 (2025-06-30) → 9,500 (2025-12-31) + disclosure",
          tr["status"] == "present" and "9,000" in str(tr["value"]) and "9,500" in str(tr["value"])
          and "2025-12-31" in str(tr["value"]) and "excluded" in str(tr["value"]), str(tr))


def test_ownership_missing(base: Path) -> None:
    # no Public-Ownership export in the folder -> the ownership facts are MISSING (never faked)
    d = base / "own_missing"
    d.mkdir()
    _wb(d / "Acme Financials_Annual.xlsx", {"Income Statement": [
        ["Period Type:", "Annual"], ["Fiscal Period", "FY2025"], ["Total Revenue", 100], ["EBITDA", 20]]})
    f = F.build_facts(d, "ACME")["facts"]
    check("no Ownership export -> insider_net_activity MISSING (value None)",
          f["insider_net_activity"]["status"] == "missing" and f["insider_net_activity"]["value"] is None,
          str(f["insider_net_activity"]))


def test_maturity_wall(base: Path) -> None:
    # The §18 distress input. Guards the nuance an LLM botches: LEASES (no maturity) are separated from the
    # dated refinancing wall; the '-' principal row is skipped; the next FY block does NOT leak in.
    from datetime import date as _date
    d = base / "maturity"
    d.mkdir()
    _wb(d / "Acme Financials_Annual.xlsx", {
        "Capital Structure Details": [
            ["Acme (NYSE:ACME) > Financials > Capital Structure Details"],
            ["FY 2025 (Dec-31-2025) Capital Structure As Reported Details"],
            ["Description", "Type", "Principal Due (USD)", "Coupon/Base Rate", "Floating Rate", "Maturity", "Seniority"],
            ["5% Notes Due 2026", "Bonds and Notes", 100, "5.0%", "NA", _date(2026, 6, 1), "Senior"],
            ["6% Notes Due 2028", "Bonds and Notes", 200, "6.0%", "NA", _date(2028, 6, 1), "Senior"],
            ["Revolver", "Revolving Credit", 50, "NA", "SOFR + 2%", _date(2027, 6, 1), "Senior"],
            ["Operating Lease Liabilities", "Capital Lease", 1000, "7.0%", "NA", "-", "Senior"],  # lease — no maturity
            ["Perp Bond", "Bonds and Notes", 300, "5.0%", "NA", "-", "Senior"],  # dated debt, maturity UNPARSED → disclose, NOT lease
            ["Matured Note", "Bonds and Notes", "-", "5.0%", "NA", _date(2025, 1, 1), "Senior"],  # '-' principal → skip
            ["FY 2024 (Dec-31-2024) Capital Structure As Reported Details"],  # next block — must STOP here
            ["Description", "Type", "Principal Due (USD)", "Coupon/Base Rate", "Floating Rate", "Maturity", "Seniority"],
            ["Old Note", "Bonds and Notes", 9999, "5.0%", "NA", _date(2024, 6, 1), "Senior"],  # must NOT be counted
        ],
    })
    f = F.build_facts(d, "ACME")["facts"]
    mw = f["debt_maturity_wall"]
    v = str(mw["value"])
    # dated=100+200+50=350; leases=1,000; undated Perp Bond=300 (NOT folded into leases); total=1,650; '-' skip; FY2024 out
    check("debt_maturity_wall: dated 350 of 1,650; leases separated",
          mw["status"] == "present" and "dated debt 350 of 1,650" in v and "leases (no refi maturity) 1,000" in v, str(mw))
    check("debt_maturity_wall: an undated (unparsed-maturity) bond is DISCLOSED, not hidden in leases",
          "undated debt 300 (maturity not parsed" in v, str(mw))
    check("debt_maturity_wall: schedule buckets 2026 100; 2027 50; 2028 200",
          "2026 100" in v and "2027 50" in v and "2028 200" in v, str(mw))
    check("debt_maturity_wall: 50 floating / 1,600 fixed (revolver floats; leases + fixed bonds fixed)",
          "50 floating / 1,600 fixed" in v, str(mw))
    check("debt_maturity_wall: next-block (FY2024) 9,999 does NOT leak in",
          "9,999" not in v, str(mw))


def test_maturity_floating_blank(base: Path) -> None:
    # A BLANK Floating Rate cell means FIXED by CIQ convention. openpyxl returns a blank cell as None (which
    # str()s to 'None'), so without normalising None → "" a fixed instrument with a blank cell is wrongly
    # bucketed as FLOATING, overstating floating exposure in the §15/§18 survival read.
    from datetime import date as _date
    d = base / "maturity_float"
    d.mkdir()
    _wb(d / "Acme Financials_Annual.xlsx", {
        "Capital Structure Details": [
            ["Acme (NYSE:ACME) > Financials > Capital Structure Details"],
            ["FY 2025 (Dec-31-2025) Capital Structure As Reported Details"],
            ["Description", "Type", "Principal Due (USD)", "Coupon/Base Rate", "Floating Rate", "Maturity", "Seniority"],
            ["Fixed Bond blank-cell", "Bonds and Notes", 400, "5.0%", None, _date(2029, 6, 1), "Senior"],  # blank → FIXED
            ["Term Loan floating", "Term Loan", 100, "NA", "SOFR + 3%", _date(2028, 6, 1), "Senior"],      # value → floating
        ],
    })
    mw = F.build_facts(d, "ACME")["facts"]["debt_maturity_wall"]
    check("maturity: a BLANK (None) Floating Rate cell is FIXED, not floating (CIQ convention)",
          mw["status"] == "present" and "100 floating / 400 fixed" in str(mw["value"]), str(mw))


def test_maturity_year_range_pastdate(base: Path) -> None:
    # DEFECT (#181 — LIVE on the real pool: EMAAR/AMZN/HCG). A 'Maturity' cell CIQ writes as a bare YEAR
    # (2026 as a NUMBER — EMAAR), a date RANGE ('MM-DD-YYYY - YYYY' bundled notes — AMZN), or a PAST date
    # (an overdue instrument — HCG) must bucket by its real year: NEVER a 1905 Excel-serial misread, never
    # silently dropped to 'undated', and never a NEGATIVE weighted-average maturity. This IS the §18/§24
    # distress input, so a mis-bucket silently mis-states the refinancing wall and the survival read.
    from datetime import date as _date
    d = base / "maturity_yr"
    d.mkdir()
    _wb(d / "Acme Financials_Annual.xlsx", {
        "Capital Structure Details": [
            ["Acme (NYSE:ACME) > Financials > Capital Structure Details"],
            ["FY 2025 (Dec-31-2025) Capital Structure As Reported Details"],
            ["Description", "Type", "Principal Due (USD)", "Coupon/Base Rate", "Floating Rate", "Maturity", "Seniority"],
            ["Trust Certificates (bare year)", "Bonds and Notes", 3100, "5.0%", "NA", 2031, "Senior"],           # EMAAR: 2031 → 2031, NOT 1905
            ["Secured Loan (bare year, near)", "Bonds and Notes", 2600, "4.0%", "NA", 2026, "Senior"],           # bare year → 2026
            ["25 Notes bundle (range)", "Bonds and Notes", 1500, "5.0%", "NA", "11-20-2028 - 2065", "Senior"],   # AMZN: range → earliest 2028
            ["Overdue deferred liability", "Term Loan", 200, "6.0%", "NA", _date(2023, 3, 1), "Senior"],         # HCG: past date → overdue, WAM≥0
            ["Lease Liabilities", "Capital Lease", 25000, "7.0%", "NA", "-", "Senior"],                          # lease — separated as before
        ],
    })
    mw = F.build_facts(d, "ACME")["facts"]["debt_maturity_wall"]
    v = str(mw["value"])
    check("maturity: a bare-YEAR cell (2031) buckets in 2031, NOT a 1905 Excel-serial misread",
          mw["status"] == "present" and "2031 3,100" in v and "1905" not in v, str(mw))
    check("maturity: a near-term bare-year (2026) stays in the dated wall, not dropped to undated",
          "2026 2,600" in v, str(mw))
    check("maturity: a date-RANGE bundle buckets at its earliest year (2028), not dropped to 'undated'",
          "2028 1,500" in v and "date-ranges bucketed at earliest" in v, str(mw))
    check("maturity: an overdue/past-due instrument is disclosed and never drives WAM negative (floored 0y)",
          "WAM ~-" not in v and "overdue" in v.lower(), str(mw))


def test_comps(base: Path) -> None:
    # Peer relative valuation + the keystones (price, shares outstanding). Guards: the SUBJECT row (:ACME))
    # is read, NOT a peer; the peer median is CIQ's own Summary-Statistics Median (not a re-derivation).
    d = base / "comps"
    d.mkdir()
    _wb(d / "Company Comparable Analysis.xlsx", {
        "Trading Multiples": [
            ["Acme (NYSE:ACME) > Quick Comparable Analysis > Trading Multiples"],
            ["As-Of Date:", 46206],
            ["Company Name", "TEV/EBITDA LTM - Latest"],
            ["Peer One (NYSE:P1)", 7.0],
            ["Peer Two (NYSE:P2)", 9.0],
            ["Acme Corp (NYSE:ACME)", 12.0],  # SUBJECT — premium to peers
            ["Summary Statistics", "TEV/EBITDA LTM - Latest"],
            ["High", 9.0], ["Low", 7.0], ["Mean", 8.0], ["Median", 8.0],
        ],
        "Financial Data": [
            ["Acme (NYSE:ACME) > Quick Comparable Analysis > Financial Data"],
            ["As-Of Date:", 46206],
            ["Company Name", "Day Close Price Latest", "Shares Outstanding Latest", "Market Capitalization Latest"],
            ["Peer One (NYSE:P1)", 10.0, 100.0, 1000.0],
            ["Peer Two (NYSE:P2)", 20.0, 200.0, 4000.0],
            ["Acme Corp (NYSE:ACME)", 55.5, 300.0, 16650.0],  # SUBJECT
            ["Summary Statistics", "", "", ""], ["High", 20.0, 200.0, 4000.0],
        ],
    })
    f = F.build_facts(d, "ACME")["facts"]
    so = f["shares_outstanding_m"]
    check("shares_outstanding_m: 300.0 from the SUBJECT row (not a peer's 100/200)",
          so["status"] == "present" and abs(float(so["value"]) - 300.0) < 0.05, str(so))
    cp = f["current_price"]
    check("current_price: 55.5 (subject) as-of 2026-07-03",
          cp["status"] == "present" and abs(float(cp["value"]) - 55.5) < 0.05 and "2026-07-03" in str(cp["source_ref"]), str(cp))
    pe = f["peer_ev_ebitda"]
    check("peer_ev_ebitda: subject 12.0x vs CIQ peer median 8.0x (not re-derived)",
          pe["status"] == "present" and "12.0x" in str(pe["value"]) and "median 8.0x" in str(pe["value"]), str(pe))


def test_comps_dual_listing(base: Path) -> None:
    # RE-AUDIT (critical): a PEER sharing the subject's BARE ticker on a different exchange (BSE:ACME vs the
    # subject's NYSE:ACME), placed AFTER the subject, must NOT be emitted as the subject. Matching on the full
    # EXCH:TICKER (not the bare ticker) keeps them distinct; before the fix the trailing BSE:ACME peer won.
    d = base / "comps_dual"
    d.mkdir()
    _wb(d / "Comparable Analysis.xlsx", {
        "Financial Data": [
            ["Acme Inc. (NYSE:ACME) > Quick Comparable Analysis > Financial Data"],
            ["As-Of Date:", 46206],
            ["Company Name", "Day Close Price Latest", "Shares Outstanding Latest"],
            ["Acme Inc. (NYSE:ACME)", 55.5, 300.0],  # SUBJECT (leads)
            ["Peer One (NYSE:P1)", 10.0, 100.0],
            ["Acme Sub Ltd (BSE:ACME)", 3.33, 999.0],  # same BARE ticker, different exchange, AFTER the subject
            ["Summary Statistics", "", ""], ["High", 55.5, 999.0],
        ],
        "Trading Multiples": [
            ["Acme Inc. (NYSE:ACME) > Quick Comparable Analysis > Trading Multiples"],
            ["Company Name", "TEV/EBITDA LTM - Latest"],
            ["Acme Inc. (NYSE:ACME)", 12.0],
            ["Peer One (NYSE:P1)", 8.0],
            ["Acme Sub Ltd (BSE:ACME)", 2.0],
            ["Summary Statistics", "TEV/EBITDA LTM - Latest"], ["Median", 8.0],
        ],
    })
    f = F.build_facts(d, "ACME")["facts"]
    check("comps dual-listing: shares from NYSE:ACME subject (300), NOT the BSE:ACME peer (999)",
          f["shares_outstanding_m"]["status"] == "present" and abs(float(f["shares_outstanding_m"]["value"]) - 300.0) < 0.5, str(f["shares_outstanding_m"]))
    check("comps dual-listing: price from NYSE:ACME subject (55.5), NOT the BSE:ACME peer (3.33)",
          f["current_price"]["status"] == "present" and abs(float(f["current_price"]["value"]) - 55.5) < 0.5, str(f["current_price"]))
    check("comps dual-listing: subject 12.0x vs median 8.0x, NOT the BSE:ACME peer's 2.0x",
          f["peer_ev_ebitda"]["status"] == "present" and "12.0x" in str(f["peer_ev_ebitda"]["value"]) and "median 8.0x" in str(f["peer_ev_ebitda"]["value"]), str(f["peer_ev_ebitda"]))


def test_comps_foreign_subject(base: Path) -> None:
    # AUDIT — the §27 default case: the FOLDER ticker (RELIANCE.NS) does NOT match the file's exchange ticker
    # (NSEI:RELIANCE), AND the subject is NOT the last row before Summary (a peer is). The subject must be
    # found via the grid's OWN title breadcrumb — a positional fallback would emit the PEER's numbers as the
    # subject's (a wrong PRESENT). Before the fix this returned Coal India's price/shares/multiple.
    d = base / "comps_foreign"
    d.mkdir()
    _wb(d / "Comparable Analysis.xlsx", {
        "Financial Data": [
            ["Reliance Industries Limited (NSEI:RELIANCE) > Quick Comparable Analysis > Financial Data"],
            ["As-Of Date:", 46206],
            ["Company Name", "Day Close Price Latest", "Shares Outstanding Latest"],
            ["Reliance Industries Limited (NSEI:RELIANCE)", 1400.0, 6766.0],  # SUBJECT — NOT last
            ["Oil & Natural Gas (NSEI:ONGC)", 250.0, 12580.0],
            ["Coal India Limited (NSEI:COALINDIA)", 400.0, 6160.0],  # a PEER sits last before Summary
            ["Summary Statistics", "", ""], ["High", 1400.0, 12580.0],
        ],
        "Trading Multiples": [
            ["Reliance Industries Limited (NSEI:RELIANCE) > Quick Comparable Analysis > Trading Multiples"],
            ["Company Name", "TEV/EBITDA LTM - Latest"],
            ["Reliance Industries Limited (NSEI:RELIANCE)", 11.0],  # SUBJECT — NOT last
            ["Oil & Natural Gas (NSEI:ONGC)", 5.0],
            ["Coal India Limited (NSEI:COALINDIA)", 4.0],
            ["Summary Statistics", "TEV/EBITDA LTM - Latest"], ["Median", 4.5],
        ],
    })
    f = F.build_facts(d, "RELIANCE.NS")["facts"]  # folder ticker != exchange ticker; subject not last
    so = f["shares_outstanding_m"]
    check("comps foreign: shares from the SUBJECT (6,766 Reliance), NOT the last peer (6,160 Coal India)",
          so["status"] == "present" and abs(float(so["value"]) - 6766.0) < 0.5, str(so))
    cp = f["current_price"]
    check("comps foreign: price from the SUBJECT (1,400 Reliance), NOT the last peer (400)",
          cp["status"] == "present" and abs(float(cp["value"]) - 1400.0) < 0.5, str(cp))
    pe = f["peer_ev_ebitda"]
    check("comps foreign: subject 11.0x (Reliance, via title ticker), NOT the last peer 4.0x",
          pe["status"] == "present" and "11.0x" in str(pe["value"]), str(pe))


def test_comps_p2(base: Path) -> None:
    # §15/§16 correctness on the comps facts: (1) the price carries its comp-set currency (never assumed USD);
    # (2) peer_ev_ebitda picks the LTM column, NOT a forward NTM one it would mislabel 'LTM'; (3) a sub-cent
    # price does not round to 0.00; (4) peer_ev_ebitda is UNKNOWN when the peer-set median is absent.
    d = base / "comps_p2"
    d.mkdir()
    _wb(d / "Comparable Analysis.xlsx", {
        "Financial Data": [
            ["Tata Motors Limited (NSEI:TATAMOTORS) > Quick Comparable Analysis > Financial Data"],
            ["Currency:", "Indian Rupee"], ["As-Of Date:", 46206],
            ["Company Name", "Day Close Price Latest", "Shares Outstanding Latest"],
            ["Tata Motors Limited (NSEI:TATAMOTORS)", 0.004, 3300.0],  # sub-cent price (must NOT become 0.00)
            ["Peer One (NSEI:P1)", 500.0, 100.0],
            ["Summary Statistics", "", ""], ["High", 500.0, 3300.0],
        ],
        "Trading Multiples": [
            ["Tata Motors Limited (NSEI:TATAMOTORS) > Quick Comparable Analysis > Trading Multiples"],
            ["As-Of Date:", 46206],
            # NTM column FIRST (a naive 'first tev/ebitda' match would wrongly pick 5.0 and label it LTM)
            ["Company Name", "TEV/EBITDA NTM", "TEV/EBITDA LTM - Latest"],
            ["Peer One (NSEI:P1)", 4.0, 6.0],
            ["Tata Motors Limited (NSEI:TATAMOTORS)", 5.0, 9.0],  # SUBJECT: NTM 5.0, LTM 9.0
            ["Summary Statistics", "TEV/EBITDA NTM", "TEV/EBITDA LTM - Latest"],
            ["Median", 4.5, 7.5],
        ],
    })
    f = F.build_facts(d, "TATAMOTORS")["facts"]
    cp = f["current_price"]
    check("comps price carries its comp-set currency (INR), never assumed USD",
          cp["status"] == "present" and "in INR" in str(cp["source_ref"]), str(cp))
    check("comps sub-cent price 0.004 does NOT round to 0.00",
          cp["status"] == "present" and float(cp["value"]) > 0, str(cp))
    pe = f["peer_ev_ebitda"]
    check("peer_ev_ebitda picks the LTM column (9.0x vs median 7.5x), NOT the forward NTM (5.0x)",
          pe["status"] == "present" and "9.0x" in str(pe["value"]) and "median 7.5x" in str(pe["value"])
          and "5.0x" not in str(pe["value"]), str(pe))

    # (4) no peer-set median -> UNKNOWN (a PEER-relative fact needs the comp-set stats, not just the subject)
    d2 = base / "comps_nomed"
    d2.mkdir()
    _wb(d2 / "Comparable Analysis.xlsx", {"Trading Multiples": [
        ["Beta Co (NYSE:BETA) > Quick Comparable Analysis > Trading Multiples"],
        ["Company Name", "TEV/EBITDA LTM - Latest"],
        ["Beta Co (NYSE:BETA)", 10.0],
        ["Peer One (NYSE:P1)", 8.0],
        ["Summary Statistics", "TEV/EBITDA LTM - Latest"], ["High", 10.0], ["Low", 8.0]]})  # no Median row
    pe2 = F.build_facts(d2, "BETA")["facts"]["peer_ev_ebitda"]
    check("peer_ev_ebitda UNKNOWN when the peer-set median is absent (not the subject's own multiple)",
          pe2["status"] == "unknown" and pe2["value"] is None and "median absent" in (pe2["note"] or ""), str(pe2))


def test_xls_fact_chain() -> None:
    # The whole chain above is exercised on synthetic .xlsx (openpyxl). But real Capital IQ exports are
    # frequently LEGACY BIFF .xls read by xlrd — a different reader with its own date/number decoding. Prove
    # the SAME facts resolve from a committed synthetic .xls fixture, so an xlrd drift can't silently poison
    # facts on the format real exports actually arrive as. (period_type on the Income Statement supplies the
    # freq — the fixture has no _Annual/_Quarterly filename token.)
    fixture = Path(__file__).resolve().parent / "testdata" / "ciq_synth.xls"
    if not fixture.exists():
        check("xls/xlrd fact chain: fixture present", False, f"missing {fixture}")
        return
    with tempfile.TemporaryDirectory() as td:  # isolate: build_facts scans a whole dir
        shutil.copy(fixture, Path(td) / fixture.name)
        f = F.build_facts(Path(td), "XLSFIX")["facts"]

    def near(name: str, want: float) -> bool:
        v = f[name]
        return v["status"] == "present" and v["value"] is not None and abs(float(v["value"]) - want) < 0.5

    check("xls/xlrd: net_debt resolves from a legacy .xls (250)", near("net_debt_m", 250), str(f["net_debt_m"]))
    check("xls/xlrd: total_debt resolves from a legacy .xls (300)", near("total_debt_m", 300), str(f["total_debt_m"]))
    check("xls/xlrd: ltm_ebitda resolves from a legacy .xls (120)", near("ltm_ebitda_m", 120), str(f["ltm_ebitda_m"]))
    check("xls/xlrd: interest_coverage resolves from a legacy .xls (5.5)", near("interest_coverage_x", 5.5), str(f["interest_coverage_x"]))


def test_currency(base: Path) -> None:
    # Money facts are millions of the REPORTED currency, not USD — the code is read + published so an INR/GBP
    # figure is never compared as USD (§15/§27). The keys are '_m' (reported currency), never '_musd'.
    d = base / "curr"
    d.mkdir()
    _wb(d / "Acme Financials_Annual.xlsx", {"Income Statement": [
        ["Period Type:", "Annual"], ["Currency:", "Indian Rupee"], ["Fiscal Period", "FY2025"],
        ["Total Revenue", 1000], ["EBITDA", 200]]})
    _wb(d / "01_Consensus.xlsx", {"Consensus": [["Target Price", 3200.0, 3300.0], ["LT Growth %", 0.14, 0.14]]})
    out = F.build_facts(d, "ACME")
    check("reported currency read + published ('Indian Rupee' -> INR)", out.get("currency") == "INR", str(out.get("currency")))
    check("money-fact keys are '_m' (reported currency), never '_musd' (false USD)",
          "ltm_ebitda_m" in out["facts"] and not any(k.endswith("_musd") for k in out["facts"]), str([k for k in out["facts"]][:5]))
    cv = out["facts"]["consensus_view"]
    check("consensus target price is labelled INR, never a hard-coded '$'",
          cv["status"] == "present" and "INR 3,200" in cv["value"] and "$" not in cv["value"], str(cv))

    # A NON-US subject: financials in the local currency (AED), but the COMPS grid is CONVERTED to a USD
    # display currency. The reported currency for the '_m' money facts must be read from the FINANCIALS
    # (AED), NEVER the comps USD (which here sorts first) — the EMAAR AED-read-as-USD defect (§15/§27).
    d2 = base / "curr_comps"
    d2.mkdir()
    _wb(d2 / "AA Comps.xlsx", {"Financial Data": [  # sorts BEFORE the financials file → would win pre-fix
        ["Currency:", "US Dollar"],
        ["Company Name", "Day Close Price", "Shares Outstanding"],
        ["Acme (NYSE:ACME)", 3.32, 8838.8]]})
    _wb(d2 / "Acme Financials_Annual.xlsx", {
        "Income Statement": [["Period Type:", "Annual"], ["Fiscal Period", "FY2025"], ["Total Revenue", 1000], ["EBITDA", 200]],
        "Capital Structure Details": [
            ["FY 2025 (Dec-31-2025) Capital Structure As Reported Details"],
            ["Currency", "AED"],
            ["Description", "Principal Due", "Maturity"],
            ["Sukuk", 5000, 2030]]})
    out2 = F.build_facts(d2, "ACME")
    check("currency reads the FINANCIALS local currency (AED), NOT the comps USD display (EMAAR defect)",
          out2.get("currency") == "AED", str(out2.get("currency")))


def test_comps_asof_forward(base: Path) -> None:
    # #183 comps hardening. shares_outstanding must carry its as-of date (a share count compared against
    # dated ownership needs one). peer_ev_ebitda must REFUSE a bare forward-year column ('TEV/EBITDA 2026E')
    # → UNKNOWN, never publish a forward multiple as the trailing peer read (§16).
    d = base / "comps_prb"
    d.mkdir()
    _wb(d / "Acme Comps.xlsx", {
        "Financial Data": [
            ["As-Of Date", "Mar-31-2026"],
            ["Company Name", "Shares Outstanding", "Day Close Price"],
            ["Acme (NYSE:ACME)", 255.9, 47.1],
            ["Peer One (NYSE:P1)", 100.0, 20.0]],
        "Trading Multiples": [
            ["As-Of Date", "Mar-31-2026"],
            ["Company Name", "TEV/EBITDA 2026E"],   # ONLY a forward-year column
            ["Acme (NYSE:ACME)", 9.1],
            ["Peer One (NYSE:P1)", 8.0],
            ["Summary Statistics"],
            ["Median", 8.5]],
    })
    f = F.build_facts(d, "ACME")["facts"]
    so = f["shares_outstanding_m"]
    check("shares_outstanding carries an as-of date (subject row)",
          so["status"] == "present" and "as-of 2026-03-31" in (so["source_ref"] or ""), str(so))
    ee = f["peer_ev_ebitda"]
    check("peer_ev_ebitda REFUSES a bare forward-year (2026E) multiple → UNKNOWN, not forward-as-trailing",
          ee["status"] == "unknown" and ee["value"] is None, str(ee))

    # …but a calendar-/fiscal-year ACTUAL column ('CY2025A') is a valid TRAILING multiple and must STILL be
    # selected — the forward reject keys on the 'E' estimate marker, never on a bare fy/cy year (else a
    # calendar-year comp grid loses its peer multiple entirely).
    d2 = base / "comps_cyactual"
    d2.mkdir()
    _wb(d2 / "Acme Comps.xlsx", {"Trading Multiples": [
        ["As-Of Date", "Mar-31-2026"],
        ["Company Name", "TEV/EBITDA CY2025A", "TEV/EBITDA CY2026E"],  # actual + estimate; must pick the ACTUAL
        ["Acme (NYSE:ACME)", 9.1, 10.4],
        ["Peer One (NYSE:P1)", 8.0, 9.0],
        ["Summary Statistics"],
        ["Median", 8.5, 9.5]]})
    ee2 = F.build_facts(d2, "ACME")["facts"]["peer_ev_ebitda"]
    check("peer_ev_ebitda KEEPS a CY-actual column (CY2025A) and picks it over the CY2026E estimate",
          ee2["status"] == "present" and "9.1x" in str(ee2["value"]) and "8.5x" in str(ee2["value"]), str(ee2))


def test_shares_units_normalize(base: Path) -> None:
    # §15 units guard. The comps grid has NO units cell, but Market Cap = Price × Shares on the same subject
    # row, shares in millions. A grid that states shares in THOUSANDS (255,900 for a 255.9M-share company)
    # must snap back to millions via market_cap ÷ price — else market cap and every ownership % is 1000x off.
    d = base / "shares_units"
    d.mkdir()
    _wb(d / "Acme Comps.xlsx", {"Financial Data": [
        ["As-Of Date", "Mar-31-2026"],
        ["Company Name", "Day Close Price Latest", "Shares Outstanding Latest", "Market Capitalization Latest"],
        ["Acme (NYSE:ACME)", 47.1, 255900.0, 12053.0],   # shares in THOUSANDS; mc ÷ px = 255.9 (millions)
        ["Peer One (NYSE:P1)", 20.0, 100000.0, 2000.0]]})
    so = F.build_facts(d, "ACME")["facts"]["shares_outstanding_m"]
    check("shares stated in thousands are normalized to millions via market_cap ÷ price (255,900 → 255.9)",
          so["status"] == "present" and abs(float(so["value"]) - 255.9) < 0.5 and "normalized" in (so["source_ref"] or ""), str(so))

    # a CONSISTENT grid (shares already millions, reconciles with mc ÷ px) is left UNTOUCHED — no false correction.
    d2 = base / "shares_ok"
    d2.mkdir()
    _wb(d2 / "Acme Comps.xlsx", {"Financial Data": [
        ["As-Of Date", "Mar-31-2026"],
        ["Company Name", "Day Close Price Latest", "Shares Outstanding Latest", "Market Capitalization Latest"],
        ["Acme (NYSE:ACME)", 47.1, 255.9, 12053.0]]})
    so2 = F.build_facts(d2, "ACME")["facts"]["shares_outstanding_m"]
    check("consistent shares (already millions) are NOT altered (no false units correction)",
          so2["status"] == "present" and abs(float(so2["value"]) - 255.9) < 0.05 and "normalized" not in (so2["source_ref"] or ""), str(so2))

    # GUARD: a plausible (correct) share count must survive even when Market Cap itself is mis-scaled — the
    # correction fires ONLY on an implausibly-large raw count, so it can never drag a right value down.
    d3 = base / "shares_mc_bad"
    d3.mkdir()
    _wb(d3 / "Acme Comps.xlsx", {"Financial Data": [
        ["As-Of Date", "Mar-31-2026"],
        ["Company Name", "Day Close Price Latest", "Shares Outstanding Latest", "Market Capitalization Latest"],
        ["Acme (NYSE:ACME)", 47.1, 255.9, 12.053]]})   # shares CORRECT (255.9mm); Market Cap mis-scaled to billions
    so3 = F.build_facts(d3, "ACME")["facts"]["shares_outstanding_m"]
    check("a plausible share count is NEVER rescaled by a mis-scaled Market Cap (255.9 stays 255.9)",
          so3["status"] == "present" and abs(float(so3["value"]) - 255.9) < 0.05 and "normalized" not in (so3["source_ref"] or ""), str(so3))

    # A SUB-100M-share issuer in thousands is caught too (50M shares → 50,000; mc ÷ px = 50) — the raw>1000
    # suspect line reaches well below 100M shares, not just mega-caps.
    d4 = base / "shares_small"
    d4.mkdir()
    _wb(d4 / "Acme Comps.xlsx", {"Financial Data": [
        ["As-Of Date", "Mar-31-2026"],
        ["Company Name", "Day Close Price Latest", "Shares Outstanding Latest", "Market Capitalization Latest"],
        ["Acme (NYSE:ACME)", 40.0, 50000.0, 2000.0]]})   # 50M-share issuer stated in THOUSANDS; mc ÷ px = 50
    so4 = F.build_facts(d4, "ACME")["facts"]["shares_outstanding_m"]
    check("a sub-100M-share issuer in thousands is normalized (50,000 → 50) — threshold reaches small caps",
          so4["status"] == "present" and abs(float(so4["value"]) - 50.0) < 0.5 and "normalized" in (so4["source_ref"] or ""), str(so4))

    # An OFF-CONVENTION 100x gap (scale 2 — NOT a real share unit; the kind a GBp/pence price against a
    # £-millions Market Cap produces) must NOT be rescaled even though the raw clears the >1000 line: only
    # 10^3/10^6 are share-unit scales, so a 10^2 gap leaves the count alone rather than fabricating one.
    d5 = base / "shares_offscale"
    d5.mkdir()
    _wb(d5 / "Acme Comps.xlsx", {"Financial Data": [
        ["As-Of Date", "Mar-31-2026"],
        ["Company Name", "Day Close Price Latest", "Shares Outstanding Latest", "Market Capitalization Latest"],
        ["Acme (LSE:ACME)", 47.1, 25590.0, 12053.0]]})   # shares ÷ (mc÷px) = 25590/255.9 = 100 → scale 2, not 3/6
    so5 = F.build_facts(d5, "ACME")["facts"]["shares_outstanding_m"]
    check("an off-convention 100x gap (scale 2) is NOT rescaled (25,590 stays; only 10^3/10^6 count)",
          so5["status"] == "present" and abs(float(so5["value"]) - 25590.0) < 0.5 and "normalized" not in (so5["source_ref"] or ""), str(so5))


def test_ltm_quarter_guard(base: Path) -> None:
    # A quarterly-ONLY financials export (no annual sibling, no _Annual token) served to an annual request
    # must NEVER publish its single-quarter EBITDA/OCF/levered-FCF under an 'ltm_' key — a 4x period error
    # (§15). The workbook self-declares 'Period Type: Quarterly'; the latest Fiscal-Period column is 'Q3 2025'.
    d = base / "qonly"
    d.mkdir()
    _wb(d / "Acme Financials.xlsx", {
        "Income Statement": [["Period Type:", "Quarterly"], ["Fiscal Period", "Q2 2025", "Q3 2025"],
                             ["Total Revenue", 900, 1000], ["EBITDA", 180, 200], ["Interest Expense", 30, 40]],
        "Cash Flow": [["Period Type:", "Quarterly"], ["Fiscal Period", "Q2 2025", "Q3 2025"],
                      ["Cash from Ops.", 150, 170], ["Levered Free Cash Flow", 90, 110]]})
    f = F.build_facts(d, "ACME")["facts"]
    for key in ("ltm_ebitda_m", "ltm_ocf_m", "levered_fcf_m"):
        v = f[key]
        check(f"quarter-guard: {key} is UNKNOWN, not a single-quarter figure published as LTM",
              v["status"] == "unknown" and v["value"] is None and "single quarter" in (v["note"] or ""), str(v))
    # the pure period-label classifier: quarters trip, LTM / FY do not
    check("_is_single_quarter('Q3 2025') is True", F._is_single_quarter("Q3 2025") is True)
    check("_is_single_quarter('3 months Sep-2025') is True", F._is_single_quarter("3 months Sep-2025") is True)
    check("_is_single_quarter('LTM Sep-30-2025') is False (twelve months)", F._is_single_quarter("LTM Sep-30-2025") is False)
    check("_is_single_quarter('FY2025') is False", F._is_single_quarter("FY2025") is False)


def test_net_debt_ebitda_guards(base: Path) -> None:
    # Derived leverage ratio net_debt_ebitda_x is PRESENT only when BOTH operands are PRESENT and EBITDA > 0.
    # (a) net CASH (negative net debt) is a valid, important PRESENT result — a negative ratio, NOT a guard trip.
    d1 = base / "ndx_netcash"
    d1.mkdir()
    _wb(d1 / "Acme Financials_Annual.xlsx", {
        "Income Statement": [["Fiscal Period", "FY2025", "LTM Mar-31-2026"], ["EBITDA", 1800, 2000]],
        "Balance Sheet": [["Balance Sheet as of:", "Dec-31-2025", "Mar-31-2026"],
                          ["Total Debt", 1000, 1200], ["Net Debt", -4000, -5000]]})
    v1 = F.build_facts(d1, "ACME")["facts"]["net_debt_ebitda_x"]
    check("net-cash: net_debt_ebitda_x PRESENT and NEGATIVE (−5000/2000 = −2.5), not a guard trip",
          v1["status"] == "present" and v1["value"] is not None and abs(float(v1["value"]) - (-2.5)) < 0.01, str(v1))

    # (b) non-positive EBITDA -> the ratio is undefined; UNKNOWN, never a fabricated leverage multiple.
    d2 = base / "ndx_negebitda"
    d2.mkdir()
    _wb(d2 / "Acme Financials_Annual.xlsx", {
        "Income Statement": [["Fiscal Period", "FY2025", "LTM Mar-31-2026"], ["EBITDA", 200, -100]],
        "Balance Sheet": [["Balance Sheet as of:", "Dec-31-2025", "Mar-31-2026"],
                          ["Total Debt", 5000, 5200], ["Net Debt", 4000, 4200]]})
    v2 = F.build_facts(d2, "ACME")["facts"]["net_debt_ebitda_x"]
    check("non-positive EBITDA: net_debt_ebitda_x UNKNOWN (no leverage against ≤0 EBITDA), value None",
          v2["status"] == "unknown" and v2["value"] is None and "non-positive" in (v2["note"] or ""), str(v2))

    # (c) net debt PRESENT but EBITDA absent -> UNKNOWN (one operand not PRESENT), never half-fabricated.
    d3 = base / "ndx_noebitda"
    d3.mkdir()
    _wb(d3 / "Acme Financials_Annual.xlsx", {
        "Income Statement": [["Fiscal Period", "FY2025", "LTM Mar-31-2026"], ["Total Revenue", 900, 1000]],
        "Balance Sheet": [["Balance Sheet as of:", "Dec-31-2025", "Mar-31-2026"],
                          ["Total Debt", 5000, 5200], ["Net Debt", 4000, 4200]]})
    v3 = F.build_facts(d3, "ACME")["facts"]["net_debt_ebitda_x"]
    check("EBITDA absent: net_debt_ebitda_x UNKNOWN (operand not PRESENT), value None",
          v3["status"] == "unknown" and v3["value"] is None, str(v3))


def test_primitives() -> None:
    # UNAVAILABLE cells -> None, NEVER coerced to 0 (the anti-fabrication primitive)
    check("clean_num('-') is None (not 0)", ciq.clean_num("-") is None)
    check("clean_num('NM') is None", ciq.clean_num("NM") is None)
    check("clean_num('') is None", ciq.clean_num("") is None)
    check("clean_num('1,234') == 1234.0", ciq.clean_num("1,234") == 1234.0)
    check("clean_num(0) == 0.0 (a real zero survives)", ciq.clean_num(0) == 0.0)
    # non-finite floats are UNAVAILABLE, never a PRESENT 'nan' that poisons a median/percentile (DEFECT #4)
    check("clean_num(nan) is None", ciq.clean_num(float("nan")) is None)
    check("clean_num(inf) is None", ciq.clean_num(float("inf")) is None)
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
        print("== layout-agnostic: standalone split Multiples ==")
        test_standalone_multiples(d)
        print("== conflict handling: freshest-wins + surfaced ==")
        test_conflict_freshest(d)
        print("== untokened dual-freq: period_type fallback ==")
        test_dual_freq(d)
        print("== per-fact isolation ==")
        test_isolation(d)
        print("== honest MISSING ==")
        test_missing(d)
        print("== ownership / insider facts (+ data-error sentinel guard) ==")
        test_ownership(d)
        test_ownership_missing(d)
        print("== debt maturity wall (lease-separation + block boundary) ==")
        test_maturity_wall(d)
        test_maturity_floating_blank(d)
        test_maturity_year_range_pastdate(d)
        print("== comps: peer multiple + price + shares outstanding ==")
        test_comps(d)
        test_comps_dual_listing(d)
        test_comps_foreign_subject(d)
        test_comps_p2(d)
        test_comps_asof_forward(d)
        test_shares_units_normalize(d)
        print("== legacy .xls (xlrd) fact chain ==")
        test_xls_fact_chain()
        print("== reported currency (not USD) ==")
        test_currency(d)
        print("== LTM quarter-guard (no 3-month figure as LTM) ==")
        test_ltm_quarter_guard(d)
        print("== derived net debt / EBITDA guards (net cash, ≤0 EBITDA, absent operand) ==")
        test_net_debt_ebitda_guards(d)
        print("== parsing primitives ==")
        test_primitives()
    print(f"\n{_passed} passed, {_failed} failed")
    return 1 if _failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
