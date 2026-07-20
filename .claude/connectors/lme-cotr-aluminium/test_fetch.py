#!/usr/bin/env python3
"""Unit test for the LME Aluminium COTR connector — XLSX parse/transform + fail-closed + manifest
consistency, NO network (a synthetic in-memory workbook reproducing the observed MiFID-II layout, including
inline strings, a sharedStrings cell, and the one-cell-per-<row> quirk). No real LME file is committed
(licensing); the live path is proven by `fetch.py --verify` / `--from-file` at merge time.
Run: python3 test_fetch.py
"""
from __future__ import annotations

import importlib.util
import io
import json
import os
import subprocess
import sys
import tempfile
import zipfile

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("lme_fetch", os.path.join(_HERE, "fetch.py"))
mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mod)

_fails = 0


def check(name: str, cond: bool) -> None:
    global _fails
    print(f"  {'ok ' if cond else 'FAIL'} {name}")
    if not cond:
        _fails += 1


def _sheet_xml(cells: dict) -> bytes:
    """Every cell in its OWN <row> element — the one-cell-per-<row> quirk observed in real LME workbooks."""
    rows = []
    for ref, (kind, value) in cells.items():
        rownum = "".join(ch for ch in ref if ch.isdigit())
        if kind == "is":
            c = f'<c r="{ref}" t="inlineStr"><is><t>{value}</t></is></c>'
        elif kind == "s":
            c = f'<c r="{ref}" t="s"><v>{value}</v></c>'
        else:
            c = f'<c r="{ref}"><v>{value}</v></c>'
        rows.append(f'<row r="{rownum}">{c}</row>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f"<sheetData>{''.join(rows)}</sheetData></worksheet>"
    ).encode()


def _xlsx(cells: dict, shared=("AH",)) -> bytes:
    sst = "".join(f"<si><t>{s}</t></si>" for s in shared)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml",
                   '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                   '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
                   '<Default Extension="xml" ContentType="application/xml"/></Types>')
        z.writestr("_rels/.rels",
                   '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                   '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        z.writestr("xl/workbook.xml",
                   '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
                   '<sheets><sheet name="COTR" sheetId="1" r:id="rId1" '
                   'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></sheets></workbook>')
        z.writestr("xl/sharedStrings.xml",
                   f'<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">{sst}</sst>')
        z.writestr("xl/worksheets/sheet1.xml", _sheet_xml(cells))
    return buf.getvalue()


def _fixture_cells(contract_via_shared=True) -> dict:
    cells = {
        "A1": ("is", "LME Commitments of Traders Report"),
        "A3": ("is", "2026-07-10"),
        "A5": ("is", "Aluminium High Grade"),
        "A6": ("s", "0") if contract_via_shared else ("is", "AH"),
        # category header row + Long/Short pair row
        "B8": ("is", "Investment Firms or credit institutions"),
        "D8": ("is", "Investment Funds"),
        "F8": ("is", "Other Financial Institutions"),
        "H8": ("is", "Commercial Undertakings"),
        "B9": ("is", "Long"), "C9": ("is", "Short"),
        "D9": ("is", "Long"), "E9": ("is", "Short"),
        "F9": ("is", "Long"), "G9": ("is", "Short"),
        "H9": ("is", "Long"), "I9": ("is", "Short"),
        # Number of Positions
        "A10": ("is", "Number of Positions"),
        "A11": ("is", "Risk Reducing"),
        "A12": ("is", "Other"),
        "A13": ("is", "Total"),
        "B13": ("n", "1000.5"), "C13": ("n", "2000.25"),
        "D13": ("n", "50263.57"), "E13": ("n", "82051.65"),
        "F13": ("n", "700"), "G13": ("n", "300"),
        "H13": ("n", "5000"), "I13": ("n", "4000"),
        # Change since the previous report
        "A15": ("is", "Change since the previous report"),
        "A16": ("is", "Risk Reducing"),
        "A17": ("is", "Other"),
        "A18": ("is", "Total"),
        "D18": ("n", "1200.50"), "E18": ("n", "3400.25"),
        # Percentage of the total open interest — the sheet stores this section as a raw fraction of 1,
        # not a pre-scaled percentage (confirmed against a real LME export: the long-side fractions
        # across all categories sum to 1.0)
        "A20": ("is", "Percentage of the total open interest"),
        "A21": ("is", "Total"),
        "D21": ("n", "0.186"), "E21": ("n", "0.304"),
    }
    return cells


FIX = _xlsx(_fixture_cells())
grid = mod.grid_from_xlsx(FIX)
asof, net, stance, payload, sidecar = mod.build(grid, "https://www.lme.com/-/media/test.xlsx")
inv = payload["investment_funds"]

check("net = long - short (net short)", net == -31788.08 and inv["net"] == -31788.08)
check("stance net_short", stance == "net_short" and inv["stance"] == "net_short")
check("net_change_wow from the change-block Total", inv["net_change_wow"] == round(1200.50 - 3400.25, 2) == -2199.75)
check("as_of is the preamble position date, read from the data",
      asof == "2026-07-10" and payload["as_of"] == "2026-07-10" and sidecar["as_of"] == "2026-07-10")
check("pct of OI pair scaled from raw fraction to percentage points",
      inv["pct_of_oi_long"] == 18.6 and inv["pct_of_oi_short"] == 30.4)
check("contract AH in lots", payload["contract"] == "AH" and payload["notation"] == "lots")
check("categories_net covers every category with a Long/Short pair",
      payload["categories_net"] == {
          "investment_firms_or_credit_institutions": -999.75,
          "investment_funds": -31788.08,
          "other_financial_institutions": 400.0,
          "commercial_undertakings": 1000.0,
      })
check("default acquired_via is direct_fetch", payload["acquired_via"] == "direct_fetch")
check("sidecar tier 5 + vendor_export + connector_id",
      sidecar["tier"] == 5 and sidecar["source_type"] == "vendor_export"
      and sidecar["connector_id"] == "lme-cotr-aluminium")

# stance flips when long > short
flip = _fixture_cells()
flip["D13"], flip["E13"] = ("n", "90000"), ("n", "10000")
_, net_l, stance_l, _, _ = mod.build(mod.grid_from_xlsx(_xlsx(flip)), "u")
check("net_long when long > short", net_l == 80000.0 and stance_l == "net_long")

# LME's real exporter names the sheet part "xl/worksheets/sheet.xml" (no digit) and provides workbook
# rels pointing at it — grid_from_xlsx must resolve the part dynamically, not assume sheet1.xml
lme_named = io.BytesIO()
with zipfile.ZipFile(lme_named, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml",
               '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
               '<Default Extension="xml" ContentType="application/xml"/></Types>')
    z.writestr("_rels/.rels",
               '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
               '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
    z.writestr("xl/workbook.xml",
               '<?xml version="1.0" encoding="utf-8"?><x:workbook xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
               '<x:sheets><x:sheet name="AH" sheetId="1" r:id="Rabc123" '
               'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" /></x:sheets></x:workbook>')
    z.writestr("xl/_rels/workbook.xml.rels",
               '<?xml version="1.0" encoding="utf-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
               '<Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
               'Target="/xl/worksheets/sheet.xml" Id="Rabc123" /></Relationships>')
    z.writestr("xl/worksheets/sheet.xml", _sheet_xml(_fixture_cells()))
grid_lme_named = mod.grid_from_xlsx(lme_named.getvalue())
check("resolves the worksheet part via workbook rels when it isn't named sheet1.xml",
      grid_lme_named.get((1, 1)) == "LME Commitments of Traders Report")

# real LME layout: the section header sits in col A but its "Risk Reducing / Other / Total" sub-rows
# sit in a different column (col N here — clear of every category's Long/Short data columns) —
# total_row must not assume the Total label shares the header's own column
offset_col = _fixture_cells()
for key in ("A11", "A12", "A13"):
    offset_col[f"N{key[1:]}"] = offset_col.pop(key)
_, net_o, stance_o, payload_o, _ = mod.build(mod.grid_from_xlsx(_xlsx(offset_col)), "u")
check("Total row found when its label is offset from the section header's column",
      net_o == -31788.08 and stance_o == "net_short" and payload_o["as_of"] == "2026-07-10")

wrong = _fixture_cells()
wrong["A6"] = ("is", "CA")
no_if = {k: v for k, v in _fixture_cells().items()}
no_if["D8"] = ("is", "Speculative Others")
bad_num = _fixture_cells()
bad_num["D13"] = ("is", "n/a")
no_total = {k: v for k, v in _fixture_cells().items() if k not in ("A18",)}
for bad_bytes, label in [
    (_xlsx(wrong), "wrong contract code"),
    (_xlsx(no_if), "missing Investment Funds column"),
    (_xlsx(bad_num), "non-numeric Total cell"),
    (_xlsx(no_total), "missing change-section Total row"),
    (b"PK\x03\x04truncated-junk", "truncated zip"),
    (b"not a zip at all", "garbage bytes"),
]:
    raised = False
    try:
        mod.build(mod.grid_from_xlsx(bad_bytes), "u")
    except Exception:
        raised = True
    check(f"fail-closed on {label} (writes nothing)", raised)

# --from-file end-to-end through the real CLI (manual bot-wall fallback path)
with tempfile.TemporaryDirectory() as td:
    xlsx_path = os.path.join(td, "AH-cotr-download.xlsx")
    with open(xlsx_path, "wb") as f:
        f.write(FIX)
    data_root = os.path.join(td, "data")
    r = subprocess.run([sys.executable, os.path.join(_HERE, "fetch.py"),
                        "--from-file", xlsx_path, "--subject", "ALUMINIUM", "--data-root", data_root],
                       capture_output=True, text=True)
    out_path = os.path.join(data_root, "ALUMINIUM", "external", "lme", "cotr_aluminium_2026-07-10.json")
    ok = r.returncode == 0 and os.path.exists(out_path) and os.path.exists(out_path + ".source.json")
    check("--from-file writes the manifest-templated output + sidecar", ok)
    if ok:
        written = json.load(open(out_path, encoding="utf-8"))
        side = json.load(open(out_path + ".source.json", encoding="utf-8"))
        check("--from-file payload is acquired_via manual_file", written["acquired_via"] == "manual_file")
        check("--from-file sidecar note names the original filename", "AH-cotr-download.xlsx" in side["note"])
    v = subprocess.run([sys.executable, os.path.join(_HERE, "fetch.py"),
                        "--from-file", xlsx_path, "--verify", "--data-root", data_root],
                       capture_output=True, text=True)
    check("--verify writes nothing", v.returncode == 0
          and not os.path.exists(os.path.join(data_root, "ALUMINIUM", "external", "lme",
                                              "cotr_aluminium_2026-07-10.json.tmp")))

man = json.load(open(os.path.join(_HERE, "connector.json"), encoding="utf-8"))
check("connector.json tier/source_type agree with the sidecar the fetcher writes",
      man["tier"] == sidecar["tier"] == 5 and man["source_type"] == sidecar["source_type"] == "vendor_export")
check("connector.json declares an exact-host allowlist containing the fetch host",
      isinstance(man.get("host_allowlist"), list) and mod.HOST in man["host_allowlist"])
check("connector.json entry/verify point at fetch.py",
      man["entry"] == "fetch.py" and man["verify"].startswith("fetch.py"))
check("output basename follows the manifest template",
      man["output_path"].rsplit("/", 1)[-1].replace("<as_of>", "2026-07-10") == "cotr_aluminium_2026-07-10.json")

print(f"\n{'PASS' if not _fails else 'FAIL'}: lme-cotr-aluminium connector — {_fails} failing case(s)")
raise SystemExit(1 if _fails else 0)
