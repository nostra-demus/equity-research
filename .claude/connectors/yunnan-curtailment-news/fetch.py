#!/usr/bin/env python3
"""Google News RSS connector — Yunnan smelter-curtailment news scan (Chinese aluminium supply signal).

Scans three FIXED Google News RSS queries for headlines pairing Yunnan with a curtailment stem and an
aluminium term — the dry-season power-rationing signal the aluminium supply thesis watches. The window that
matters is roughly Nov-Apr (Yunnan hydro dry season); an off-season not_detected is the expected baseline.
A file-writing fetcher per EXTERNAL_DATA.md §7 — zero engine wiring; keyless; headline metadata + links only
(articles are read at their publishers). Every hit is a LEAD to verify at the publisher, never a measurement,
so it folds in at §4 tier 10 (external_other — a dated, unverified web/news scan, not a user note). Fails CLOSED: a non-200 or malformed feed on ANY of the three
queries writes NOTHING (a partial scan would understate). `as_of` is always the scan date — the honest
"data through" of the scan (§7): it covers the wire up to now regardless of how old the newest match is, and
each matched headline keeps its own pubDate in `matched[]`.

Usage:
  python3 fetch.py --verify                # fetch + parse all three queries; print per-query counts + signal; write nothing
  python3 fetch.py --subject ALUMINIUM     # write into data/ALUMINIUM/external/google-news/
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

HOST = "news.google.com"                 # the ONE host this connector may reach
PROVIDER = "Google News"
PROVIDER_SLUG = "google-news"
CONNECTOR_ID = "yunnan-curtailment-news"
SERIES = "Yunnan smelter-curtailment news scan — dry-season power-rationing signal for Chinese aluminium supply"
QUERIES = (
    "Yunnan aluminium curtailment",
    "Yunnan smelter power rationing",
    "Yunnan hydropower aluminium production cut",
)
CURTAIL_STEMS = ("curtail", "cut", "ration", "halt", "suspend", "reduc")
ALU_TERMS = ("aluminium", "aluminum", "smelt")
_SECOND_LEVEL = {"co", "com", "net", "org", "gov", "ac", "edu"}   # minimal registrable-domain heuristic


def _url(query: str) -> str:
    q = {"q": query, "hl": "en-US", "gl": "US", "ceid": "US:en"}
    return f"https://{HOST}/rss/search?" + urllib.parse.urlencode(q)


def fetch_feed(query: str, timeout: int = 20) -> str:
    req = urllib.request.Request(_url(query), headers={"User-Agent": f"nostradamus-connector/{CONNECTOR_ID}"})
    with urllib.request.urlopen(req, timeout=timeout) as r:  # noqa: S310 — fixed HTTPS host, not user input
        if r.status != 200:
            raise RuntimeError(f"HTTP {r.status} from {HOST} for query {query!r} (fail closed)")
        return r.read().decode("utf-8", "replace")


def _registrable_domain(url: str) -> str:
    host = (urllib.parse.urlparse(url).hostname or "").lower()
    parts = [p for p in host.split(".") if p]
    if len(parts) >= 3 and parts[-2] in _SECOND_LEVEL:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:]) if len(parts) >= 2 else host


def parse_feed(xml_text: str):
    """Pure parse (RSS text → item rows). Separated from I/O so it is unit-testable, no network."""
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError as e:
        raise RuntimeError(f"malformed RSS XML (fail closed — a partial scan would understate): {e}")
    items = []
    for it in root.iter("item"):
        title = (it.findtext("title") or "").strip()
        link = (it.findtext("link") or "").strip()
        pub_raw = (it.findtext("pubDate") or "").strip()
        if not title or not pub_raw:
            raise RuntimeError("RSS item missing title/pubDate (fail closed — cannot filter what it cannot date)")
        try:
            pub = parsedate_to_datetime(pub_raw)
        except (TypeError, ValueError) as e:
            raise RuntimeError(f"unparseable pubDate {pub_raw!r} (fail closed): {e}")
        if pub.tzinfo is None:
            pub = pub.replace(tzinfo=timezone.utc)
        publisher = (it.findtext("source") or "").strip() or _registrable_domain(link)
        items.append({"title": title, "url": link, "published": pub, "publisher": publisher})
    return items


def match_terms(title: str):
    """Return the matched terms for a title, or [] — yunnan AND a curtailment stem AND an aluminium term."""
    t = title.lower()
    if "yunnan" not in t:
        return []
    curtail_hits = [s for s in CURTAIL_STEMS if s in t]
    alu_hits = [s for s in ALU_TERMS if s in t]
    if not curtail_hits or not alu_hits:
        return []
    return ["yunnan"] + curtail_hits + alu_hits


def _norm_title(title: str) -> str:
    return "".join(c for c in title.lower() if c.isalnum())


def build(feeds, window_days: int, now: datetime | None = None):
    """Pure transform (parsed feeds → payload + sidecar). Separated from I/O so it is unit-testable, no network."""
    if len(feeds) != len(QUERIES):
        raise RuntimeError(f"expected {len(QUERIES)} parsed feeds, got {len(feeds)} (fail closed)")
    now = now or datetime.now(timezone.utc)
    cutoff = now - timedelta(days=window_days)
    matched, seen = [], set()
    for items in feeds:
        for it in items:
            if it["published"] < cutoff:
                continue
            terms = match_terms(it["title"])
            if not terms:
                continue
            key = _norm_title(it["title"])
            if key in seen:
                continue
            seen.add(key)
            matched.append({
                "title": it["title"],
                "publisher": it["publisher"],
                "published": it["published"].date().isoformat(),
                "url": it["url"],
                "matched_terms": terms,
            })
    matched.sort(key=lambda m: m["published"], reverse=True)
    signal = "detected" if matched else "not_detected"
    # as_of is the SCAN date — the honest "data through" of a clean scan (EXTERNAL_DATA.md §7), which
    # covers the wire up to now regardless of how old the newest match is. Each headline's own pubDate
    # lives in matched[]. (Fix: pinning as_of to an old matched pubDate made the filename-derived freshness
    # permanently stale, so run_connectors refetched the same article every sweep, forever.)
    asof = now.date().isoformat()
    note = (
        f"Signal {signal}: {len(matched)} matched headline(s) across {len(QUERIES)} queries in the last "
        f"{window_days} days. The dry-season power-rationing window that matters for Yunnan's hydro-powered "
        "smelting is roughly Nov-Apr; an off-season not_detected is the expected baseline, not an all-clear. "
        "Each headline is a LEAD to verify at its publisher, never a measurement."
    )
    payload = {
        "series": SERIES,
        "as_of": asof,
        "signal": signal,
        "window_days": window_days,
        "matched": matched,
        "queries": list(QUERIES),
        "scanned_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "note": note,
    }
    sidecar = {
        "provider": PROVIDER,
        "source_type": "external_other",    # §4 tier-10 ceiling: a dated, unverified third-party web/news scan (a user note = tier 9; a web scan is tier 10), never a measurement
        "tier": 10,
        "as_of": asof,
        "received": now.strftime("%Y-%m-%d"),
        "source_urls": [_url(q) for q in QUERIES],
        "license": "headline metadata + links only; articles are read at their publishers",
        "connector_id": CONNECTOR_ID,
        "note": f"News scan, {signal}: {len(matched)} matched headline(s) in the last {window_days}d. "
                "Each hit is a LEAD to verify at the publisher, never a measurement.",
    }
    return signal, asof, payload, sidecar


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


def main() -> int:
    ap = argparse.ArgumentParser(description="Scan Google News RSS for Yunnan smelter-curtailment headlines into a subject's external-data pool.")
    ap.add_argument("--subject", help="the pool subject, e.g. ALUMINIUM (required unless --verify)")
    ap.add_argument("--data-root", default="data", help="pool root (default: data)")
    ap.add_argument("--window-days", type=int, default=30, help="match window in days (default: 30)")
    ap.add_argument("--verify", action="store_true", help="fetch + parse all three queries; print counts + signal; write nothing")
    a = ap.parse_args()

    feeds = [parse_feed(fetch_feed(q)) for q in QUERIES]   # ANY query failing raises here — nothing written, non-zero exit
    signal, asof, payload, sidecar = build(feeds, a.window_days)

    if a.verify:
        for q, items in zip(QUERIES, feeds):
            print(f"OK verify: {q!r} → {len(items)} item(s)")
        print(f"OK verify: signal {signal}, {len(payload['matched'])} match(es) in {a.window_days}d, as_of {asof}")
        return 0

    if not a.subject:
        print("error: --subject is required (unless --verify)", file=sys.stderr)
        return 2

    out_dir = os.path.join(a.data_root, a.subject, "external", PROVIDER_SLUG)
    os.makedirs(out_dir, exist_ok=True)
    data_path = os.path.join(out_dir, f"yunnan_curtailment_scan_{asof}.json")
    _atomic_write_json(data_path, payload)
    _atomic_write_json(data_path + ".source.json", sidecar)
    print(f"wrote {data_path} (signal {signal}, {len(payload['matched'])} match(es), as_of {asof}) + .source.json sidecar (tier 10)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
