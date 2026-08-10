#!/usr/bin/env python3
"""Manual IAI primary-aluminium-production transform.

IAI's published terms limit ordinary downloads to personal, non-commercial use. This connector therefore
performs no unattended network access. An operator with prior written permission may supply an entitled
ALVIS JSON export through the runner's attested manual-ingest path. The transform writes the trailing 13
months plus the latest observations as typed tier-5 official data. `as_of` is the last day of the latest
data month, read from the supplied data, never mtime.

Usage:
  python3 fetch.py --verify                        # prove automatic access is disabled
  python3 fetch.py --from-file entitled.json --subject ALUMINIUM
"""
from __future__ import annotations

import argparse
import calendar
import json
import math
import os
import re
import sys
import tempfile
from datetime import datetime, timezone

STATS_HOST = "international-aluminium.org"       # token bootstrap page
API_HOST = "alvis.international-aluminium.org"   # the data API
STATS_URL = f"https://{STATS_HOST}/statistics/primary-aluminium-production/"
API_URL = f"https://{API_HOST}/api/publication/?publication=primary-aluminium-production"
PROVIDER = "iai"
CONNECTOR_ID = "iai-primary-aluminium-production"
MAX_INPUT_BYTES = 16 * 1024 * 1024

_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "connector.json"), encoding="utf-8") as _f:
    MANIFEST = json.load(_f)  # series / license / output_path come from the manifest so they can't drift

_MONTH_NAMES = {m.lower(): i for i, m in enumerate(calendar.month_name) if m}
_MONTH_ABBRS = {m.lower(): i for i, m in enumerate(calendar.month_abbr) if m}


def _norm_month(s) -> str | None:
    """'2026-05', '2026-05-01', ISO datetime, or '2026  May' → '2026-05'."""
    if not isinstance(s, str):
        return None
    m = re.match(r"(\d{4})-(\d{2})", s.strip())
    if m:
        return f"{m.group(1)}-{m.group(2)}"
    m = re.match(r"(\d{4})\s+([A-Za-z]+)", s.strip())
    if m:
        mon = _MONTH_NAMES.get(m.group(2).lower()) or _MONTH_ABBRS.get(m.group(2).lower()[:3])
        if mon:
            return f"{m.group(1)}-{mon:02d}"
    return None


def _series_from_matrix(node) -> dict:
    """The real ALVIS shape: {columns:[{id,name}], data:[{period, data:{rowId:{colId:{value}}}}]}.
    Only LABELED columns are kept — the feed's undeclared total column is deliberately ignored."""
    cols = {}
    for c in node.get("columns", []):
        if isinstance(c, dict) and "id" in c and isinstance(c.get("name"), str) and c["name"].strip():
            cols[str(c["id"])] = c["name"].strip()
    out = {name: {} for name in cols.values()}
    for entry in node.get("data", []):
        if not isinstance(entry, dict):
            continue
        period = entry.get("period") if isinstance(entry.get("period"), dict) else {}
        month = _norm_month(period.get("from")) or _norm_month(period.get("name"))
        if not month:
            continue
        data = entry.get("data") if isinstance(entry.get("data"), dict) else {}
        for rowgroup in data.values():  # merge every row group defensively
            if not isinstance(rowgroup, dict):
                continue
            for colid, cell in rowgroup.items():
                name = cols.get(str(colid))
                if name is None:
                    continue
                v = cell.get("value") if isinstance(cell, dict) else cell
                if (isinstance(v, (int, float)) and not isinstance(v, bool)
                        and math.isfinite(float(v)) and float(v) >= 0):
                    out[name][month] = float(v)
    return {k: v for k, v in out.items() if v}


def _generic_series(node) -> tuple[str, dict] | None:
    if not isinstance(node, dict):
        return None
    label = node.get("label") if isinstance(node.get("label"), str) else (
        node.get("name") if isinstance(node.get("name"), str) else None)
    vals = node.get("data") if node.get("data") is not None else node.get("values")
    series = {}
    if label and isinstance(vals, dict):
        for key, value in vals.items():
            month = _norm_month(key)
            if (month and isinstance(value, (int, float)) and not isinstance(value, bool)
                    and math.isfinite(float(value)) and float(value) >= 0):
                series[month] = float(value)
    elif label and isinstance(vals, list):
        months = node.get("months") or node.get("labels") or node.get("categories")
        if isinstance(months, list) and len(months) == len(vals):
            for key, value in zip(months, vals):
                month = _norm_month(key)
                if (month and isinstance(value, (int, float)) and not isinstance(value, bool)
                        and math.isfinite(float(value)) and float(value) >= 0):
                    series[month] = float(value)
    return (label.strip(), series) if label and series else None


def _collect_candidates(node, candidates: list[tuple[dict, bool]]) -> None:
    """Keep sibling chart scopes separate; never merge a response-wide auxiliary chart."""
    if isinstance(node, dict):
        if isinstance(node.get("columns"), list) and isinstance(node.get("data"), list):
            matrix = _series_from_matrix(node)
            if matrix:
                candidates.append((matrix, True))
        for value in node.values():
            if isinstance(value, list):
                siblings = {}
                duplicate = False
                for child in value:
                    parsed = _generic_series(child)
                    if parsed is None:
                        continue
                    label, series = parsed
                    if label in siblings:
                        duplicate = True
                    siblings[label] = series
                if siblings and not duplicate:
                    candidates.append((siblings, False))
            _collect_candidates(value, candidates)
    elif isinstance(node, list):
        for value in node:
            _collect_candidates(value, candidates)


def _pick(labels, exact: set, word_re: str, extra_exact: str | None = None) -> str | None:
    """Ranked label match; ambiguity at the best rank fails closed."""
    ranked = []
    for label in labels:
        l = label.casefold().strip()
        if extra_exact and l == extra_exact:
            ranked.append((0, label))
        elif l in exact:
            ranked.append((1, label))
        elif re.match(word_re, l):
            ranked.append((2, label))
    if not ranked:
        return None
    best = min(r for r, _ in ranked)
    cands = [lab for r, lab in ranked if r == best]
    if len(cands) > 1:
        raise RuntimeError(f"ambiguous series match {cands!r} (fail closed)")
    return cands[0]


def build(raw):
    """Pure transform (parsed ALVIS JSON → payload + sidecar). Label-driven, never positional."""
    candidates: list[tuple[dict, bool]] = []
    _collect_candidates(raw, candidates)
    if not candidates:
        raise RuntimeError("no labeled series found in the ALVIS response (fail closed)")
    selected = []
    for series, is_matrix in candidates:
        china_label = _pick(series, exact={"china"}, word_re=r"china\b", extra_exact="china (estimated)")
        if china_label is not None:
            selected.append((series, is_matrix, china_label))
    if not selected:
        raise RuntimeError("no China series found (decoys like 'Chinese Taipei' do not count; fail closed)")
    if len(selected) != 1:
        raise RuntimeError("more than one chart scope contains a China series (fail closed)")
    all_series, is_matrix, china_label = selected[0]
    china = all_series[china_label]

    world_label = _pick(all_series, exact={"world", "total", "world total", "grand total"},
                        word_re=r"(world|total)\b")
    if world_label is not None:
        world = all_series[world_label]
        combined_eu, split_eu = [], []
    else:
        # The live feed has NO labeled world/total — its total column is undeclared. World = the sum of
        # all labeled matrix series per month (verified equal to the feed's own total), guarded against
        # double-counting the two mutually-exclusive Europe representations.
        if not is_matrix:
            raise RuntimeError("no labeled world series and no matrix to sum (fail closed)")
        combined_eu = [l for l in all_series if "europe" in l.casefold() and "inc" in l.casefold()]
        split_eu = [l for l in all_series if "europe" in l.casefold() and l not in combined_eu]
        world = {}
        for label, series in all_series.items():
            for month, v in series.items():
                world[month] = world.get(month, 0.0) + v

    months = sorted(m for m in china if m in world)[-13:]  # a stable one-year-plus history window
    if not months:
        raise RuntimeError("no months with both China and world values (fail closed)")
    if world_label is None:
        for month in months:
            comb = sum(all_series[l].get(month, 0.0) for l in combined_eu)
            split = sum(all_series[l].get(month, 0.0) for l in split_eu)
            if comb and split:
                raise RuntimeError(f"Europe series double-count in {month} — layout changed? (fail closed)")
    if any(not math.isfinite(world[month]) or world[month] < china[month] or china[month] < 0
           for month in months):
        raise RuntimeError("world/China production values are not economically coherent (fail closed)")

    latest_month = months[-1]
    y, mo = int(latest_month[:4]), int(latest_month[5:7])
    days = calendar.monthrange(y, mo)[1]
    asof = f"{latest_month}-{days:02d}"
    china_kt = china[latest_month]
    world_kt = world[latest_month]

    payload = {
        "series": MANIFEST["series"],
        "as_of": asof,
        "unit": "thousand tonnes",
        "months": [{"month": m, "world_kt": round(world[m], 2), "china_kt": round(china[m], 2)} for m in months],
        "latest": {
            "month": latest_month,
            "china_kt": round(china_kt, 2),
            "world_kt": round(world_kt, 2),
        },
        "source_url": API_URL,
    }
    sidecar = {
        "provider": "IAI",
        "source_type": "official_data",     # first-party industry-body series; §4 tier-5 external-data ceiling
        "tier": 5,
        "as_of": asof,
        "received": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source_url": API_URL,
        "license": MANIFEST["license"],
        "connector_id": CONNECTOR_ID,
        "dataset_id": MANIFEST["dataset_id"], "series_id": MANIFEST["series_id"],
        "schema_version": MANIFEST["schema_version"],
        "licensing": MANIFEST["licensing"],
        "note": f"{latest_month}: IAI China (Estimated) {china_kt:,.0f} kt; world {world_kt:,.0f} kt.",
    }
    return asof, payload["latest"], payload, sidecar


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
    ap = argparse.ArgumentParser(description="Transform an entitled IAI production export into a subject's pool.")
    ap.add_argument("--subject", help="the pool subject, e.g. ALUMINIUM (required unless --verify)")
    ap.add_argument("--data-root", default="data", help="pool root (default: data)")
    ap.add_argument("--verify", action="store_true", help="prove unattended access is disabled; write nothing")
    ap.add_argument("--from-file", help="entitled IAI ALVIS JSON export supplied by the operator")
    a = ap.parse_args()

    if a.verify and not a.from_file:
        print("OK verify: manual-only connector; unattended IAI retrieval is disabled")
        return 0
    if not a.from_file:
        print("error: --from-file is required; IAI terms do not permit unattended institutional retrieval",
              file=sys.stderr)
        return 2
    try:
        with open(a.from_file, "rb") as fh:
            encoded = fh.read(MAX_INPUT_BYTES + 1)
        if len(encoded) > MAX_INPUT_BYTES:
            raise RuntimeError(f"manual IAI input exceeds {MAX_INPUT_BYTES} bytes")
        raw = json.loads(encoded.decode("utf-8"))
        asof, latest, payload, sidecar = build(raw)
    except (OSError, UnicodeError, json.JSONDecodeError, RuntimeError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 1

    if a.verify:
        print(f"OK verify: {latest['month']} IAI China (Estimated) {latest['china_kt']:,.0f} kt; "
              f"world {latest['world_kt']:,.0f} kt, as_of {asof}")
        return 0

    if not a.subject:
        print("error: --subject is required (unless --verify)", file=sys.stderr)
        return 2

    data_path = _output_path(a.data_root, a.subject, asof)
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    _atomic_write_json(data_path, payload)
    _atomic_write_json(data_path + ".source.json", sidecar)
    print(f"wrote {data_path} ({latest['month']} IAI China (Estimated) {latest['china_kt']:,.0f} kt, "
          f"world {latest['world_kt']:,.0f} kt) + .source.json sidecar (tier 5)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
