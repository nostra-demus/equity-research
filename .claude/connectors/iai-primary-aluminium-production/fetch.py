#!/usr/bin/env python3
"""IAI primary-aluminium-production connector — world + China (Estimated) monthly output.

Fetches the International Aluminium Institute's monthly primary-production series (the "is China running
above its 45 Mt/yr cap" watch) and writes the trailing 13 months plus a China annualised-run-rate read into
a subject's external pool as a typed, §4 tier-5 API pull. A file-writing fetcher per EXTERNAL_DATA.md §7 —
zero engine wiring. The ALVIS API token is bootstrapped from the public stats page on every run and never
stored anywhere. Fails CLOSED: a missing token, a non-200, no confidently-matched China series, or empty
months writes NOTHING. `as_of` is the last day of the latest data month, read from the data, never mtime.

The 45 Mt cap in `cap_reference` is an analyst reference (China's policy cap), NOT IAI data — labelled so
in the payload and sidecar.

Usage:
  python3 fetch.py --verify                        # prove fetch + parse works; write nothing
  python3 fetch.py --verify --dump-raw raw.json    # also capture the raw API response (fixture capture)
  python3 fetch.py --subject ALUMINIUM             # write into data/ALUMINIUM/external/iai/
"""
from __future__ import annotations

import argparse
import calendar
import json
import os
import re
import sys
import tempfile
import urllib.request
from datetime import datetime, timezone

STATS_HOST = "international-aluminium.org"       # token bootstrap page
API_HOST = "alvis.international-aluminium.org"   # the data API
STATS_URL = f"https://{STATS_HOST}/statistics/primary-aluminium-production/"
API_URL = f"https://{API_HOST}/api/publication/?publication=primary-aluminium-production"
PROVIDER = "iai"
CONNECTOR_ID = "iai-primary-aluminium-production"
CAP_MT = 45.0                                    # analyst reference — China policy cap, not IAI data
TOKEN_RE = re.compile(r'window\.ALVIS_API_TOKEN\s*=\s*"([^"]+)"')

_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "connector.json"), encoding="utf-8") as _f:
    MANIFEST = json.load(_f)  # series / license / output_path come from the manifest so they can't drift

_MONTH_NAMES = {m.lower(): i for i, m in enumerate(calendar.month_name) if m}
_MONTH_ABBRS = {m.lower(): i for i, m in enumerate(calendar.month_abbr) if m}


def _get(url: str, headers: dict, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as r:  # noqa: S310 — fixed HTTPS hosts, not user input
        if r.status != 200:
            raise RuntimeError(f"HTTP {r.status} from {url}")
        return r.read()


def fetch_token() -> str:
    page = _get(STATS_URL, {"User-Agent": f"nostradamus-connector/{CONNECTOR_ID}"}).decode("utf-8", "replace")
    m = TOKEN_RE.search(page)
    if not m:
        raise RuntimeError("ALVIS_API_TOKEN not found on the stats page — IAI page changed? (fail closed)")
    return m.group(1)


def fetch_raw(token: str):
    text = _get(API_URL, {"User-Agent": f"nostradamus-connector/{CONNECTOR_ID}",
                          "X-AUTH-TOKEN": token}).decode("utf-8", "replace")
    try:
        return text, json.loads(text)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"ALVIS response is not JSON (fail closed): {e}")


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
                if isinstance(v, (int, float)) and not isinstance(v, bool):
                    out[name][month] = float(v)
    return {k: v for k, v in out.items() if v}


def _collect(node, matrices: list, generic: dict) -> None:
    """Defensive walker — collects the ALVIS matrix shape plus generic labeled datasets
    (month-keyed dicts or parallel arrays). Non-numeric values are skipped, never coerced."""
    if isinstance(node, dict):
        if isinstance(node.get("columns"), list) and isinstance(node.get("data"), list):
            matrices.append(node)
        label = node.get("label") if isinstance(node.get("label"), str) else (
            node.get("name") if isinstance(node.get("name"), str) else None)
        vals = node.get("data") if node.get("data") is not None else node.get("values")
        if label and isinstance(vals, dict):
            series = {}
            for k, v in vals.items():
                month = _norm_month(k)
                if month and isinstance(v, (int, float)) and not isinstance(v, bool):
                    series[month] = float(v)
            if series:
                generic.setdefault(label.strip(), series)
        elif label and isinstance(vals, list):
            months = node.get("months") or node.get("labels") or node.get("categories")
            if isinstance(months, list) and len(months) == len(vals):
                series = {}
                for k, v in zip(months, vals):
                    month = _norm_month(k)
                    if month and isinstance(v, (int, float)) and not isinstance(v, bool):
                        series[month] = float(v)
                if series:
                    generic.setdefault(label.strip(), series)
        for v in node.values():
            _collect(v, matrices, generic)
    elif isinstance(node, list):
        for v in node:
            _collect(v, matrices, generic)


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
    matrices, generic = [], {}
    _collect(raw, matrices, generic)
    matrix_series = {}
    for m in matrices:
        for label, series in _series_from_matrix(m).items():
            matrix_series.setdefault(label, {}).update(series)
    all_series = dict(generic)
    all_series.update(matrix_series)  # matrix wins on a label collision
    if not all_series:
        raise RuntimeError("no labeled series found in the ALVIS response (fail closed)")

    china_label = _pick(all_series, exact={"china"}, word_re=r"china\b", extra_exact="china (estimated)")
    if china_label is None:
        raise RuntimeError("no China series found (decoys like 'Chinese Taipei' do not count; fail closed)")
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
        if not matrix_series:
            raise RuntimeError("no labeled world series and no matrix to sum (fail closed)")
        combined_eu = [l for l in matrix_series if "europe" in l.casefold() and "inc" in l.casefold()]
        split_eu = [l for l in matrix_series if "europe" in l.casefold() and l not in combined_eu]
        world = {}
        for label, series in matrix_series.items():
            for month, v in series.items():
                world[month] = world.get(month, 0.0) + v

    months = sorted(m for m in china if m in world)[-13:]  # latest + its prior-year month, so YoY resolves
    if not months:
        raise RuntimeError("no months with both China and world values (fail closed)")
    if world_label is None:
        for month in months:
            comb = sum(matrix_series[l].get(month, 0.0) for l in combined_eu)
            split = sum(matrix_series[l].get(month, 0.0) for l in split_eu)
            if comb and split:
                raise RuntimeError(f"Europe series double-count in {month} — layout changed? (fail closed)")

    latest_month = months[-1]
    y, mo = int(latest_month[:4]), int(latest_month[5:7])
    days = calendar.monthrange(y, mo)[1]
    asof = f"{latest_month}-{days:02d}"
    china_kt = china[latest_month]
    daily = round(china_kt / days, 3)
    ann_mt = round(daily * 365 / 1000, 3)
    prior = f"{y - 1}-{mo:02d}"
    yoy = round((china_kt / china[prior] - 1) * 100, 2) if prior in months and china.get(prior) else None
    world_kt = world[latest_month]
    share = round(china_kt / world_kt * 100, 2) if world_kt else None
    vs_cap = round(ann_mt / CAP_MT * 100, 2)

    payload = {
        "series": MANIFEST["series"],
        "as_of": asof,
        "unit": "thousand tonnes",
        "months": [{"month": m, "world_kt": round(world[m], 2), "china_kt": round(china[m], 2)} for m in months],
        "latest": {
            "month": latest_month,
            "china_kt": round(china_kt, 2),
            "china_daily_avg_kt": daily,
            "china_annualised_run_rate_mt": ann_mt,
            "china_yoy_pct": yoy,
            "world_kt": round(world_kt, 2),
            "china_share_pct": share,
        },
        "cap_reference": {
            "cap_mt": CAP_MT,
            "run_rate_vs_cap_pct": vs_cap,
            "note": "45 Mt/yr cap is an analyst reference (China policy cap), not IAI data",
        },
        "source_url": API_URL,
    }
    sidecar = {
        "provider": "IAI",
        "source_type": "paid_api",          # §4 tier-5 "API pull, dated" bucket; this feed is free + attributed
        "tier": 5,
        "as_of": asof,
        "received": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source_url": API_URL,
        "license": MANIFEST["license"],
        "connector_id": CONNECTOR_ID,
        "note": f"{latest_month}: China {china_kt:,.0f} kt → annualised {ann_mt:.2f} Mt "
                f"({vs_cap:.1f}% of the 45 Mt analyst-reference cap); world {world_kt:,.0f} kt.",
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
    ap = argparse.ArgumentParser(description="Fetch IAI primary-aluminium production into a subject's pool.")
    ap.add_argument("--subject", help="the pool subject, e.g. ALUMINIUM (required unless --verify)")
    ap.add_argument("--data-root", default="data", help="pool root (default: data)")
    ap.add_argument("--verify", action="store_true", help="prove fetch + parse works; write nothing")
    ap.add_argument("--dump-raw", metavar="FILE", help="save the raw API response verbatim (fixture capture)")
    a = ap.parse_args()

    try:
        text, raw = fetch_raw(fetch_token())
        if a.dump_raw:
            with open(a.dump_raw, "w", encoding="utf-8") as f:
                f.write(text)
            print(f"raw response saved to {a.dump_raw}")
        asof, latest, payload, sidecar = build(raw)
    except RuntimeError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1

    if a.verify:
        print(f"OK verify: {latest['month']} China {latest['china_kt']:,.0f} kt → "
              f"annualised {latest['china_annualised_run_rate_mt']:.2f} Mt "
              f"({payload['cap_reference']['run_rate_vs_cap_pct']:.1f}% of the 45 Mt reference cap), "
              f"as_of {asof}")
        return 0

    if not a.subject:
        print("error: --subject is required (unless --verify)", file=sys.stderr)
        return 2

    data_path = _output_path(a.data_root, a.subject, asof)
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    _atomic_write_json(data_path, payload)
    _atomic_write_json(data_path + ".source.json", sidecar)
    print(f"wrote {data_path} ({latest['month']} China {latest['china_kt']:,.0f} kt, "
          f"annualised {latest['china_annualised_run_rate_mt']:.2f} Mt) + .source.json sidecar (tier 5)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
