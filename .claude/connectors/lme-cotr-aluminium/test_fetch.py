#!/usr/bin/env python3
"""Unit test for the LME Aluminium COTR connector — XLSX parse/transform + fail-closed + manifest
consistency, NO network (a wholly synthetic in-memory workbook exercising the MiFID-II table structure,
inline strings, a sharedStrings cell, and a one-cell-per-<row> parser edge). Dates and values are invented
test data; no captured LME row or table is committed because redistribution is prohibited. The live path is
proven only by an entitled operator's `fetch.py --verify` / `--from-file` run.
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


def _with_extra_member(base: bytes, name: str, body: bytes, compression=zipfile.ZIP_DEFLATED) -> bytes:
    buf = io.BytesIO(base)
    with zipfile.ZipFile(buf, "a", compression) as z:
        z.writestr(name, body, compress_type=compression)
    return buf.getvalue()


def _policy_rejected(data: bytes, message_fragment: str = "") -> bool:
    try:
        mod.grid_from_xlsx(data)
    except mod.WorkbookPolicyError as exc:
        return not message_fragment or message_fragment in str(exc)
    return False


def _fixture_cells(contract_via_shared=True) -> dict:
    # Deliberately round, invented values and a historical dummy date. These test arithmetic and structural
    # selection only; they are not sampled, rounded, or transformed from an LME publication.
    cells = {
        "A1": ("is", "LME Commitments of Traders Report"),
        "A3": ("is", "2000-01-14"),
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
        "B13": ("n", "110"), "C13": ("n", "210"),
        "D13": ("n", "1234"), "E13": ("n", "2345"),
        "F13": ("n", "330"), "G13": ("n", "130"),
        "H13": ("n", "800"), "I13": ("n", "500"),
        # Change since the previous report
        "A15": ("is", "Change since the previous report"),
        "A16": ("is", "Risk Reducing"),
        "A17": ("is", "Other"),
        "A18": ("is", "Total"),
        "D18": ("n", "90"), "E18": ("n", "120"),
        # Exercise the connector contract that percentage cells arrive as fractions of one. The chosen
        # fractions are synthetic and intentionally simple.
        "A20": ("is", "Percentage of the total open interest"),
        "A21": ("is", "Total"),
        "D21": ("n", "0.125"), "E21": ("n", "0.25"),
    }
    return cells


FIX = _xlsx(_fixture_cells())
grid = mod.grid_from_xlsx(FIX)
asof, net, stance, payload, sidecar = mod.build(grid, "https://www.lme.com/-/media/test.xlsx")
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(_HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402
_manifest = json.load(open(os.path.join(_HERE, "connector.json")))
_contract_defects = validate_manifest(_manifest["id"], _HERE, _manifest) + validate_staged_output(
    _manifest, "ALUMINIUM", payload, sidecar, asof,
)
check("shared v2 manifest/staged-output contract accepts the production transform", not _contract_defects)
inv = payload["investment_funds"]

check("net = long - short (net short)", net == -1111.0 and inv["net"] == -1111.0)
check("stance net_short", stance == "net_short" and inv["stance"] == "net_short")
check("net_change_wow from the change-block Total", inv["net_change_wow"] == 90 - 120 == -30.0)
check("as_of is the preamble position date, read from the data",
      asof == "2000-01-14" and payload["as_of"] == "2000-01-14" and sidecar["as_of"] == "2000-01-14")
check("pct of OI pair scaled from raw fraction to percentage points",
      inv["pct_of_oi_long"] == 12.5 and inv["pct_of_oi_short"] == 25.0)

bad_percentage = _fixture_cells()
bad_percentage["D21"] = ("n", "50")
raised = False
try:
    mod.build(mod.grid_from_xlsx(_xlsx(bad_percentage)), "u")
except RuntimeError:
    raised = True
check("raw percentage points cannot be multiplied into impossible 5000% exposure", raised)
check("contract AH in lots", payload["contract"] == "AH" and payload["notation"] == "lots")
check("categories_net covers every category with a Long/Short pair",
      payload["categories_net"] == {
          "investment_firms_or_credit_institutions": -100.0,
          "investment_funds": -1111.0,
          "other_financial_institutions": 200.0,
          "commercial_undertakings": 300.0,
      })
check("the pure transform is manual_file-only", payload["acquired_via"] == "manual_file")
check("sidecar tier 5 + official_data + connector_id",
      sidecar["tier"] == 5 and sidecar["source_type"] == "official_data"
      and sidecar["connector_id"] == "lme-cotr-aluminium")

# stance flips when long > short
flip = _fixture_cells()
flip["D13"], flip["E13"] = ("n", "3000"), ("n", "1000")
_, net_l, stance_l, _, _ = mod.build(mod.grid_from_xlsx(_xlsx(flip)), "u")
check("net_long when long > short", net_l == 2000.0 and stance_l == "net_long")

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

# Archive safety is checked against the entire central directory before grid_from_xlsx reads even one
# member. The fixtures below are synthetic ZIP metadata/payloads, not redistributed LME content.
traversal = _with_extra_member(FIX, "xl/worksheets/../outside.xml", b"synthetic")
check("rejects traversal-shaped ZIP member names before OOXML parsing",
      _policy_rejected(traversal, "non-canonical ZIP member path"))

case_alias = _with_extra_member(FIX, "XL/WORKBOOK.XML", b"synthetic")
check("rejects case-aliased ZIP member names before OOXML parsing",
      _policy_rejected(case_alias, "case-aliased ZIP members"))

unsafe_rels = (
    '<?xml version="1.0"?><Relationships '
    'xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" '
    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
    'Target="../worksheets/sheet1.xml"/></Relationships>'
).encode()
unsafe_target = _with_extra_member(FIX, "xl/_rels/workbook.xml.rels", unsafe_rels)
check("unsafe relationship policy failure propagates instead of falling back to sheet1.xml",
      _policy_rejected(unsafe_target, "non-canonical ZIP member path"))

high_ratio = _with_extra_member(FIX, "xl/synthetic-high-ratio.xml", b"A" * (1024 * 1024))
check("rejects a highly compressed member before decompression",
      _policy_rejected(high_ratio, "compression-ratio limit"))

with zipfile.ZipFile(io.BytesIO(FIX)) as _base_zip:
    _base_infos = _base_zip.infolist()
    _base_count = len(_base_infos)
    _base_total = sum(info.file_size for info in _base_infos)
    _base_largest = max(info.file_size for info in _base_infos)

_old_member_cap = mod.MAX_MEMBER_UNCOMPRESSED_BYTES
try:
    mod.MAX_MEMBER_UNCOMPRESSED_BYTES = _base_largest + 16
    oversized = _with_extra_member(
        FIX, "xl/synthetic-oversized.xml", b"Z" * (_base_largest + 17), zipfile.ZIP_STORED
    )
    check("rejects a member over the per-member uncompressed cap",
          _policy_rejected(oversized, "limit is"))
finally:
    mod.MAX_MEMBER_UNCOMPRESSED_BYTES = _old_member_cap

_old_count_cap = mod.MAX_WORKBOOK_MEMBERS
try:
    mod.MAX_WORKBOOK_MEMBERS = _base_count
    too_many = _with_extra_member(FIX, "xl/synthetic-count.xml", b"x", zipfile.ZIP_STORED)
    check("rejects an archive over the member-count cap",
          _policy_rejected(too_many, "ZIP members; limit"))
finally:
    mod.MAX_WORKBOOK_MEMBERS = _old_count_cap

_old_total_cap = mod.MAX_WORKBOOK_UNCOMPRESSED_BYTES
try:
    mod.MAX_WORKBOOK_UNCOMPRESSED_BYTES = _base_total + 10
    too_large_total = _with_extra_member(FIX, "xl/synthetic-total.xml", b"T" * 11, zipfile.ZIP_STORED)
    check("rejects an archive over the cumulative uncompressed cap",
          _policy_rejected(too_large_total, "expands beyond"))
finally:
    mod.MAX_WORKBOOK_UNCOMPRESSED_BYTES = _old_total_cap

# real LME layout: the section header sits in col A but its "Risk Reducing / Other / Total" sub-rows
# sit in a different column (col N here — clear of every category's Long/Short data columns) —
# total_row must not assume the Total label shares the header's own column
offset_col = _fixture_cells()
for key in ("A11", "A12", "A13"):
    offset_col[f"N{key[1:]}"] = offset_col.pop(key)
_, net_o, stance_o, payload_o, _ = mod.build(mod.grid_from_xlsx(_xlsx(offset_col)), "u")
check("Total row found when its label is offset from the section header's column",
      net_o == -1111.0 and stance_o == "net_short" and payload_o["as_of"] == "2000-01-14")

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
    out_path = os.path.join(data_root, "ALUMINIUM", "external", "lme", "cotr_aluminium_2000-01-14.json")
    ok = r.returncode == 0 and os.path.exists(out_path) and os.path.exists(out_path + ".source.json")
    check("--from-file writes the manifest-templated output + sidecar", ok)
    if ok:
        written = json.load(open(out_path, encoding="utf-8"))
        side = json.load(open(out_path + ".source.json", encoding="utf-8"))
        check("--from-file payload is acquired_via manual_file", written["acquired_via"] == "manual_file")
        check("--from-file provenance keeps the lawful LME page URL and no local path",
              side["source_url"] == mod.PAGE_URL and "file://" not in json.dumps(side)
              and td not in json.dumps(side))
    v = subprocess.run([sys.executable, os.path.join(_HERE, "fetch.py"),
                        "--from-file", xlsx_path, "--verify", "--data-root", data_root],
                       capture_output=True, text=True)
    check("--verify writes nothing", v.returncode == 0
          and not os.path.exists(os.path.join(data_root, "ALUMINIUM", "external", "lme",
                                              "cotr_aluminium_2000-01-14.json.tmp")))

disabled = subprocess.run(
    [sys.executable, os.path.join(_HERE, "fetch.py"), "--verify"],
    capture_output=True, text=True,
)
check("bare --verify proves unattended LME access is disabled",
      disabled.returncode == 0 and "manual-only" in disabled.stdout)
check("manual-only implementation exposes no network fetch function",
      not hasattr(mod, "fetch_workbook"))

man = json.load(open(os.path.join(_HERE, "connector.json"), encoding="utf-8"))
check("connector.json tier/source_type agree with the sidecar the fetcher writes",
      man["tier"] == sidecar["tier"] == 5 and man["source_type"] == sidecar["source_type"] == "official_data")
check("connector.json declares an exact-host allowlist containing the fetch host",
      isinstance(man.get("host_allowlist"), list) and mod.HOST in man["host_allowlist"])
check("connector.json entry/verify point at fetch.py",
      man["entry"] == "fetch.py" and man["verify"].startswith("fetch.py"))
check("output basename follows the manifest template",
      man["output_path"].rsplit("/", 1)[-1].replace("<as_of>", "2000-01-14") == "cotr_aluminium_2000-01-14.json")

print(f"\n{'PASS' if not _fails else 'FAIL'}: lme-cotr-aluminium connector — {_fails} failing case(s)")
raise SystemExit(1 if _fails else 0)
