#!/usr/bin/env python3
"""Manual LME Commitments-of-Traders transform — Aluminium (AH) investment-fund positioning.

The LME website terms do not grant this repository an unattended redistribution/fetch licence. This
connector therefore performs no network access. An entitled operator may download the Aluminium COTR
workbook and supply it through the runner's attested manual-ingest path. The transform writes the
investment-fund positioning into the subject's external pool as typed, §4 tier-5 official exchange data.
It fails closed on an unsafe archive, a changed workbook layout, or invalid values. `as_of` is the
position date read from inside the workbook, never a file mtime.

Usage:
  python3 fetch.py --verify                              # prove unattended access is disabled
  python3 fetch.py --from-file cotr.xlsx --subject ALUMINIUM
"""
from __future__ import annotations

import argparse
import io
import json
import math
import os
import re
import stat
import sys
import tempfile
import unicodedata
import zipfile
from datetime import datetime, timezone
from xml.etree import ElementTree as ET

HOST = "www.lme.com"                     # the ONE host this connector may reach
CONTRACT = "AH"                          # LME two-letter code: Aluminium High Grade
PROVIDER = "lme"
CONNECTOR_ID = "lme-cotr-aluminium"
MAX_INPUT_BYTES = 32 * 1024 * 1024        # entitled manual workbook; hard pre-parse cap
MAX_WORKBOOK_MEMBERS = 256                 # OOXML is small; reject central-directory floods
MAX_MEMBER_UNCOMPRESSED_BYTES = 16 * 1024 * 1024
MAX_WORKBOOK_UNCOMPRESSED_BYTES = 64 * 1024 * 1024
MAX_COMPRESSION_RATIO = 200.0              # XML compresses well, but not at zip-bomb ratios
MAX_MEMBER_NAME_BYTES = 512
PAGE_URL = f"https://{HOST}/en/market-data/reports-and-data/commitments-of-traders/aluminium"

_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "connector.json"), encoding="utf-8") as _f:
    MANIFEST = json.load(_f)  # series / license / output_path come from the manifest so they can't drift

def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _col_num(ref: str) -> int:
    n = 0
    for ch in ref:
        n = n * 26 + (ord(ch) - 64)
    return n


def _si_text(si) -> str:
    return "".join(t.text or "" for t in si.iter() if _local(t.tag) == "t")


class WorkbookPolicyError(RuntimeError):
    """The archive violates a pre-read safety rule and must never reach an OOXML parser."""


def _canonical_member_name(name: str) -> str:
    """Return a canonical relative POSIX member name, or fail closed.

    No archive member is extracted, but canonical names still matter: duplicate/case aliases and
    traversal-shaped names can make relationship lookup ambiguous across ZIP tooling and filesystems.
    """
    if not isinstance(name, str) or not name:
        raise WorkbookPolicyError("workbook contains an empty ZIP member name (fail closed)")
    if len(name.encode("utf-8")) > MAX_MEMBER_NAME_BYTES:
        raise WorkbookPolicyError("workbook ZIP member name is too long (fail closed)")
    if name != unicodedata.normalize("NFC", name):
        raise WorkbookPolicyError(f"workbook contains a non-canonical Unicode member name: {name!r}")
    if "\\" in name or "\x00" in name or any(ord(ch) < 32 or ord(ch) == 127 for ch in name):
        raise WorkbookPolicyError(f"workbook contains an unsafe ZIP member name: {name!r}")
    if name.startswith("/") or re.match(r"^[A-Za-z]:", name):
        raise WorkbookPolicyError(f"workbook contains an absolute ZIP member name: {name!r}")
    # ZIP members are not URLs. Reject encoded, query, and fragment forms so no downstream layer can
    # reinterpret two spellings as the same part.
    if any(ch in name for ch in ("%", "?", "#")):
        raise WorkbookPolicyError(f"workbook contains an aliased ZIP member name: {name!r}")
    bare = name[:-1] if name.endswith("/") else name
    parts = bare.split("/")
    if not bare or any(part in ("", ".", "..") for part in parts):
        raise WorkbookPolicyError(f"workbook contains a non-canonical ZIP member path: {name!r}")
    return bare


def _validate_workbook_archive(zf: zipfile.ZipFile) -> None:
    """Validate all central-directory metadata before the first member read."""
    infos = zf.infolist()
    if len(infos) > MAX_WORKBOOK_MEMBERS:
        raise WorkbookPolicyError(
            f"workbook has {len(infos)} ZIP members; limit is {MAX_WORKBOOK_MEMBERS} (fail closed)"
        )

    aliases = {}
    total_uncompressed = 0
    for info in infos:
        # ZipInfo truncates a filename at a NUL during construction; comparing with orig_filename makes
        # that otherwise-hidden alias detectable before a read.
        if getattr(info, "orig_filename", info.filename) != info.filename:
            raise WorkbookPolicyError("workbook contains a NUL-aliased ZIP member name (fail closed)")
        canonical = _canonical_member_name(info.filename)
        alias_key = unicodedata.normalize("NFC", canonical).casefold()
        if alias_key in aliases:
            raise WorkbookPolicyError(
                f"workbook contains duplicate or case-aliased ZIP members: "
                f"{aliases[alias_key]!r} and {info.filename!r}"
            )
        aliases[alias_key] = info.filename

        if info.flag_bits & 0x1:
            raise WorkbookPolicyError(f"encrypted ZIP member is not permitted: {info.filename!r}")
        mode = (info.external_attr >> 16) & 0o170000
        if info.create_system == 3 and mode not in (0, stat.S_IFREG, stat.S_IFDIR):
            raise WorkbookPolicyError(f"non-regular ZIP member is not permitted: {info.filename!r}")
        if info.file_size < 0 or info.compress_size < 0:
            raise WorkbookPolicyError(f"invalid ZIP member sizes for {info.filename!r}")
        if info.file_size > MAX_MEMBER_UNCOMPRESSED_BYTES:
            raise WorkbookPolicyError(
                f"ZIP member {info.filename!r} expands to {info.file_size} bytes; "
                f"limit is {MAX_MEMBER_UNCOMPRESSED_BYTES} (fail closed)"
            )
        total_uncompressed += info.file_size
        if total_uncompressed > MAX_WORKBOOK_UNCOMPRESSED_BYTES:
            raise WorkbookPolicyError(
                f"workbook expands beyond {MAX_WORKBOOK_UNCOMPRESSED_BYTES} bytes (fail closed)"
            )
        if info.file_size and info.file_size / max(info.compress_size, 1) > MAX_COMPRESSION_RATIO:
            raise WorkbookPolicyError(
                f"ZIP member {info.filename!r} exceeds the {MAX_COMPRESSION_RATIO:g}:1 "
                "compression-ratio limit (fail closed)"
            )


def _worksheet_relationship_target(target: str) -> str:
    """Resolve a workbook relationship target without accepting traversal or path aliases."""
    if not isinstance(target, str) or not target or target != target.strip():
        raise WorkbookPolicyError("worksheet relationship has an empty or non-canonical Target")
    # OPC permits a package-root URI spelling. Convert that one documented form to the archive spelling;
    # every remaining slash and path component must already be canonical.
    if target.startswith("/"):
        target = target[1:]
    elif not target.startswith("xl/"):
        target = f"xl/{target}"
    target = _canonical_member_name(target)
    if not target.startswith("xl/worksheets/") or not target.endswith(".xml"):
        raise WorkbookPolicyError(f"unsafe worksheet relationship Target: {target!r}")
    return target


def _worksheet_part(zf: zipfile.ZipFile) -> str:
    """Resolve the first sheet's real archive path via workbook.xml + its rels — LME's own exporter
    names the part xl/worksheets/sheet.xml (no digit), not Excel's usual xl/worksheets/sheet1.xml.
    Falls back to the sheet1.xml convention for workbooks that don't carry rels (e.g. this test's
    synthetic fixture, or a genuine Excel export)."""
    try:
        wb = ET.fromstring(zf.read("xl/workbook.xml"))
        rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
        targets = {rel.get("Id"): rel.get("Target") for rel in rels if _local(rel.tag) == "Relationship"}
        for sheet_el in wb.iter():
            if _local(sheet_el.tag) != "sheet":
                continue
            rid = next((v for k, v in sheet_el.attrib.items() if k.endswith("}id") or k == "id"), None)
            # A <sheet> with no r:id, or a <Relationship> carrying an Id but no Target, yields None here —
            # `None.lstrip` would raise AttributeError, which the old narrow except let ESCAPE, so the
            # sheet1.xml fallback below never ran and a recoverable workbook failed outright.
            target = targets.get(rid) if rid else None
            if isinstance(target, str) and target.strip():
                return _worksheet_relationship_target(target)
    except (KeyError, ET.ParseError):
        # Missing or malformed relationship metadata may use the conventional sheet1.xml fallback. Safety
        # policy failures deliberately are not caught here: an unsafe Target must never be masked by fallback.
        pass
    return "xl/worksheets/sheet1.xml"


def grid_from_xlsx(data: bytes):
    """bytes → {(row, col): str}. Keyed by each cell's own r= reference, so the observed
    one-cell-per-<row> quirk and merged/sparse rows need no special handling."""
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            _validate_workbook_archive(zf)
            sheet = zf.read(_worksheet_part(zf))
            shared = []
            try:
                ss = ET.fromstring(zf.read("xl/sharedStrings.xml"))
                shared = [_si_text(si) for si in ss if _local(si.tag) == "si"]
            except KeyError:
                pass
            except ET.ParseError as e:
                raise RuntimeError(f"bad sharedStrings.xml (fail closed): {e}")
    except WorkbookPolicyError:
        raise
    except (zipfile.BadZipFile, KeyError) as e:
        raise RuntimeError(f"not a readable COTR workbook (fail closed): {e}")
    try:
        root = ET.fromstring(sheet)
    except ET.ParseError as e:
        raise RuntimeError(f"bad sheet XML (fail closed): {e}")
    grid = {}
    for c in root.iter():
        if _local(c.tag) != "c":
            continue
        ref = c.get("r") or ""
        m = re.fullmatch(r"([A-Z]+)(\d+)", ref)
        if not m:
            continue
        row, col = int(m.group(2)), _col_num(m.group(1))
        t = c.get("t")
        text = ""
        if t == "s":
            v = next((el for el in c if _local(el.tag) == "v"), None)
            if v is not None and v.text is not None:
                idx = int(v.text)
                text = shared[idx] if 0 <= idx < len(shared) else ""
        elif t == "inlineStr":
            is_el = next((el for el in c if _local(el.tag) == "is"), None)
            text = _si_text(is_el) if is_el is not None else ""
        else:  # t == "str" or numeric
            v = next((el for el in c if _local(el.tag) == "v"), None)
            text = (v.text or "") if v is not None else ""
        if text.strip():
            grid[(row, col)] = text.strip()
    return grid


def _num(grid, row: int, col: int, what: str) -> float:
    raw = grid.get((row, col))
    if raw is None:
        raise RuntimeError(f"missing numeric cell for {what} at row {row} col {col} (fail closed)")
    try:
        value = float(raw.replace(",", ""))
        if not math.isfinite(value):
            raise ValueError
        return value
    except ValueError:
        raise RuntimeError(f"non-numeric {what} at row {row} col {col}: {raw!r} (fail closed)")


def _fraction(grid, row: int, col: int, what: str) -> float:
    value = _num(grid, row, col, what)
    if value < 0 or value > 1:
        raise RuntimeError(f"{what} must be a raw fraction from 0 to 1, got {value!r} (fail closed)")
    return value


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


_SECTIONS = ("number of positions", "change since the previous report", "percentage of the total open interest")


def build(grid, source_url: str, acquired_via: str = "manual_file", original_filename: str = ""):
    """Pure transform (cell grid → payload + sidecar). Label-anchored, never coordinates; fails closed on a
    wrong contract, a missing preamble date, a missing Investment Funds column, or a missing section Total."""
    cells = sorted(grid.items())  # row-major

    asof = None
    for (_, _), text in cells:
        m = re.search(r"\d{4}-\d{2}-\d{2}", text)
        if m:
            try:
                datetime.strptime(m.group(0), "%Y-%m-%d")
                asof = m.group(0)
                break
            except ValueError:
                continue
    if not asof:
        raise RuntimeError("no ISO position date found in the workbook preamble (fail closed)")

    header_row = None
    for (row, _), text in cells:
        if "investment funds" in text.lower():
            header_row = row
            break
    if header_row is None:
        raise RuntimeError("Investment Funds column not found — COTR layout changed? (fail closed)")

    contract = next((t for (r, _), t in cells if r < header_row and re.fullmatch(r"[A-Z]{2}", t)), None)
    if contract is None:
        raise RuntimeError("no LME contract code in the workbook preamble (fail closed)")
    if contract != CONTRACT:
        raise RuntimeError(f"unexpected contract {contract!r}, wanted {CONTRACT!r} (fail closed)")

    pair_row = header_row + 1
    categories = {}  # col → name; a category is a header cell with a Long/Short pair directly beneath
    for (row, col), text in cells:
        if row != header_row:
            continue
        if (grid.get((pair_row, col), "").lower() == "long"
                and grid.get((pair_row, col + 1), "").lower() == "short"):
            categories[col] = text
    if_col = next((c for c, name in categories.items() if "investment funds" in name.lower()), None)
    if if_col is None:
        raise RuntimeError("Investment Funds header has no Long/Short pair beneath it (fail closed)")

    section_rows = {}
    for (row, col), text in cells:
        key = text.lower().rstrip(":")
        for s in _SECTIONS:
            if key.startswith(s):
                section_rows.setdefault(s, (row, col))
    missing = [s for s in _SECTIONS if s not in section_rows]
    if missing:
        raise RuntimeError(f"section label(s) missing: {missing} (fail closed)")

    bounds = sorted(r for r, _ in section_rows.values())
    max_row = max((r for r, _ in grid), default=0)

    def total_row(section: str) -> int:
        """The 'Total' sub-row label can sit in a different column than the section header itself
        (observed: header in col A, sub-row labels — Risk Reducing / Other / Total — in col C), so
        scan every column in the row range rather than assuming the header's own column."""
        srow, _ = section_rows[section]
        nxt = min([b for b in bounds if b > srow] + [max_row + 1], default=max_row + 1)
        for row in range(srow + 1, nxt):
            if any(v.lower() == "total" for (r, _), v in grid.items() if r == row):
                return row
        raise RuntimeError(f"no Total row under section {section!r} (fail closed)")

    pos_row, chg_row, pct_row = (total_row(s) for s in _SECTIONS)

    if_long = _num(grid, pos_row, if_col, "Investment Funds long")
    if_short = _num(grid, pos_row, if_col + 1, "Investment Funds short")
    net = round(if_long - if_short, 2)
    stance = "net_short" if net < 0 else ("net_long" if net > 0 else "flat")
    net_chg = round(_num(grid, chg_row, if_col, "IF change long") - _num(grid, chg_row, if_col + 1, "IF change short"), 2)

    categories_net = {
        _slug(name): round(_num(grid, pos_row, col, f"{name} long") - _num(grid, pos_row, col + 1, f"{name} short"), 2)
        for col, name in categories.items()
    }

    payload = {
        "series": MANIFEST["series"],
        "as_of": asof,
        "contract": CONTRACT,
        "notation": "lots",
        "investment_funds": {
            "long": if_long, "short": if_short, "net": net, "stance": stance, "net_change_wow": net_chg,
            # the sheet stores this section as a raw fraction of 1 (the long-side fractions across all
            # categories sum to 1.0) — scale to percentage points to match the field name and §15 hygiene
            "pct_of_oi_long": round(_fraction(grid, pct_row, if_col, "IF pct of OI long") * 100, 4),
            "pct_of_oi_short": round(_fraction(grid, pct_row, if_col + 1, "IF pct of OI short") * 100, 4),
        },
        "categories_net": categories_net,
        "acquired_via": acquired_via,
        "source_url": source_url,
    }
    note = f"Investment funds net {net:+,.2f} lots ({stance}) as of {asof}."
    if acquired_via == "manual_file":
        note += f" Manual browser download, original filename {original_filename!r}."
    sidecar = {
        "provider": "LME",
        "source_type": "official_data",     # first-party exchange publication; §4 tier-5 external-data ceiling
        "tier": 5,
        "as_of": asof,
        "received": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source_url": source_url,
        "license": MANIFEST["license"],
        "connector_id": CONNECTOR_ID,
        "dataset_id": MANIFEST["dataset_id"], "series_id": MANIFEST["series_id"],
        "schema_version": MANIFEST["schema_version"],
        "licensing": MANIFEST["licensing"],
        "origin": original_filename or os.path.basename(source_url),
        "note": note,
    }
    return asof, net, stance, payload, sidecar


def _atomic_write_json(path: str, obj) -> None:
    """Write JSON atomically — a crash / disk-full mid-write can't leave a truncated file at `path`
    (write a temp in the same dir, fsync, then os.replace, which is atomic on POSIX)."""
    d = os.path.dirname(path) or "."
    fd, tmp = tempfile.mkstemp(dir=d, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(obj, f, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def _output_path(data_root: str, subject: str, asof: str) -> str:
    rel = MANIFEST["output_path"].replace("<SUBJECT>", subject).replace("<as_of>", asof)
    if rel.startswith("data/"):
        rel = rel[len("data/"):]
    return os.path.join(data_root, rel)


def main() -> int:
    ap = argparse.ArgumentParser(description="Transform an entitled LME Aluminium COTR workbook.")
    ap.add_argument("--subject", help="the pool subject, e.g. ALUMINIUM (required unless --verify)")
    ap.add_argument("--data-root", default="data", help="pool root (default: data)")
    ap.add_argument("--verify", action="store_true", help="verify a supplied file, or prove unattended access is disabled")
    ap.add_argument("--from-file", help="parse an entitled, operator-supplied COTR workbook")
    a = ap.parse_args()

    if not a.from_file:
        if a.verify:
            print("OK verify: manual-only connector; unattended LME retrieval is disabled")
            return 0
        print("error: this connector is manual-only; supply an entitled workbook with --from-file", file=sys.stderr)
        return 2

    try:
        with open(a.from_file, "rb") as f:
            body = f.read(MAX_INPUT_BYTES + 1)
        if len(body) > MAX_INPUT_BYTES:
            raise RuntimeError(f"workbook exceeds the {MAX_INPUT_BYTES}-byte manual-input limit (fail closed)")
        if body[:2] != b"PK":
            raise RuntimeError(f"{a.from_file} is not an .xlsx workbook (no ZIP magic; fail closed)")
        asof, net, stance, payload, sidecar = build(
            grid_from_xlsx(body), PAGE_URL, acquired_via="manual_file",
            original_filename=os.path.basename(a.from_file),
        )
    except RuntimeError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1

    if a.verify:
        print(f"OK verify: AH investment funds net {net:+,.2f} lots ({stance}), as_of {asof} "
              f"[{payload['acquired_via']}]")
        return 0

    if not a.subject:
        print("error: --subject is required (unless --verify)", file=sys.stderr)
        return 2

    data_path = _output_path(a.data_root, a.subject, asof)
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    _atomic_write_json(data_path, payload)
    _atomic_write_json(data_path + ".source.json", sidecar)
    print(f"wrote {data_path} (IF net {net:+,.2f} lots, {stance}, as_of {asof}) + .source.json sidecar (tier 5)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
