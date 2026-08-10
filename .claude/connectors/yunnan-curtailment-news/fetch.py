#!/usr/bin/env python3
"""Manual Google News RSS transform — Yunnan smelter-curtailment signal.

Transforms three FIXED, operator-supplied RSS captures for headlines pairing Yunnan with a curtailment term and an
aluminium term — the dry-season power-rationing signal the aluminium supply thesis watches. The window that
matters is roughly Nov-Apr. Google disallows automated access to this path in its machine-readable policy,
so this connector performs no network request. An entitled operator may route a JSON capture through the
attested manual-ingest boundary. Every hit is a tier-10 lead to verify at the publisher, never a measurement.

Usage:
  python3 fetch.py --verify
  python3 fetch.py --from-file entitled-rss-capture.json --subject ALUMINIUM
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

HOST = "news.google.com"                 # the ONE host this connector may reach
PROVIDER = "Google News"
PROVIDER_SLUG = "google-news"
CONNECTOR_ID = "yunnan-curtailment-news"
MAX_INPUT_BYTES = 12 * 1024 * 1024
SERIES = "Yunnan smelter-curtailment news scan — dry-season power-rationing signal for Chinese aluminium supply"
_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "connector.json"), encoding="utf-8") as _f:
    MANIFEST = json.load(_f)
QUERIES = (
    "Yunnan aluminium curtailment",
    "Yunnan smelter power rationing",
    "Yunnan hydropower aluminium production cut",
)
CURTAIL_PATTERNS = (
    ("curtail", re.compile(r"\bcurtail(?:s|ed|ing|ment|ments)?\b")),
    ("cut", re.compile(r"\bcut(?:s|ting)?\b")),
    ("ration", re.compile(r"\bration(?:s|ed|ing)?\b")),
    ("halt", re.compile(r"\bhalt(?:s|ed|ing)?\b")),
    ("suspend", re.compile(r"\bsuspend(?:s|ed|ing|sion|sions)?\b")),
    ("reduc", re.compile(r"\breduc(?:e|es|ed|ing|tion|tions)\b")),
)
ALU_PATTERNS = (
    ("aluminium", re.compile(r"\baluminium\b")),
    ("aluminum", re.compile(r"\baluminum\b")),
    ("smelt", re.compile(r"\bsmelt(?:er|ers|ing|ed|s)?\b")),
)
_SECOND_LEVEL = {"co", "com", "net", "org", "gov", "ac", "edu"}   # minimal registrable-domain heuristic


def _url(query: str) -> str:
    q = {"q": query, "hl": "en-US", "gl": "US", "ceid": "US:en"}
    return f"https://{HOST}/rss/search?" + urllib.parse.urlencode(q)


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
    local = lambda tag: str(tag).rsplit("}", 1)[-1]
    if local(root.tag).casefold() != "rss":
        raise RuntimeError("capture root is not RSS (fail closed)")
    channels = [child for child in list(root) if local(child.tag).casefold() == "channel"]
    if len(channels) != 1:
        raise RuntimeError("RSS capture must contain exactly one channel (fail closed)")
    channel = channels[0]
    if not any(local(child.tag).casefold() == "title" and (child.text or "").strip()
               for child in list(channel)):
        raise RuntimeError("RSS channel lacks an identity title (fail closed)")
    items = []
    for it in (child for child in list(channel) if local(child.tag).casefold() == "item"):
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
    curtail_hits = [label for label, pattern in CURTAIL_PATTERNS if pattern.search(t)]
    alu_hits = [label for label, pattern in ALU_PATTERNS if pattern.search(t)]
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
            if it["published"] > now + timedelta(minutes=5):
                raise RuntimeError("RSS item is dated after the capture time (fail closed)")
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
        # Every nested payload evidence URL is repeated in provenance so the
        # shared staged-output validator can bind it to this exact retrieval.
        # The connector never follows article links and the manifest permits
        # only news.google.com, so an off-host RSS link fails publication.
        "source_urls": list(dict.fromkeys([
            *[_url(q) for q in QUERIES],
            *[item["url"] for item in matched],
        ])),
        "license": MANIFEST["license"],
        "connector_id": CONNECTOR_ID,
        "dataset_id": MANIFEST["dataset_id"], "series_id": MANIFEST["series_id"],
        "schema_version": MANIFEST["schema_version"],
        "licensing": MANIFEST["licensing"],
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


def _load_capture(path: str):
    try:
        with open(path, "rb") as fh:
            encoded = fh.read(MAX_INPUT_BYTES + 1)
    except OSError as exc:
        raise RuntimeError(f"cannot read manual RSS capture: {exc}") from exc
    if len(encoded) > MAX_INPUT_BYTES:
        raise RuntimeError(f"manual RSS capture exceeds {MAX_INPUT_BYTES} bytes")
    try:
        raw = json.loads(encoded.decode("utf-8"))
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"manual RSS capture is not UTF-8 JSON: {exc}") from exc
    if not isinstance(raw, dict) or set(raw) != {"captured_at", "feeds"}:
        raise RuntimeError("manual RSS capture must contain exactly captured_at and feeds")
    captured_at = raw.get("captured_at")
    try:
        captured = datetime.fromisoformat(str(captured_at).replace("Z", "+00:00"))
    except ValueError as exc:
        raise RuntimeError("captured_at must be a timezone-aware ISO datetime") from exc
    if captured.tzinfo is None:
        raise RuntimeError("captured_at must include a timezone")
    captured = captured.astimezone(timezone.utc)
    feeds = raw.get("feeds")
    if not isinstance(feeds, list) or len(feeds) != len(QUERIES):
        raise RuntimeError(f"manual capture requires exactly {len(QUERIES)} query feeds")
    parsed = []
    for expected_query, record in zip(QUERIES, feeds):
        if (not isinstance(record, dict) or set(record) != {"query", "xml"}
                or record.get("query") != expected_query or not isinstance(record.get("xml"), str)):
            raise RuntimeError("manual capture query identity/order is incomplete or changed")
        parsed.append(parse_feed(record["xml"]))
    return parsed, captured


def main() -> int:
    ap = argparse.ArgumentParser(description="Transform an entitled manual RSS capture into a Yunnan signal.")
    ap.add_argument("--subject", help="the pool subject, e.g. ALUMINIUM (required unless --verify)")
    ap.add_argument("--data-root", default="data", help="pool root (default: data)")
    ap.add_argument("--window-days", type=int, default=30, help="match window in days (default: 30)")
    ap.add_argument("--verify", action="store_true", help="prove unattended access is disabled; write nothing")
    ap.add_argument("--from-file", help="entitled JSON capture containing all three fixed RSS feeds")
    a = ap.parse_args()

    if a.verify and not a.from_file:
        print("OK verify: manual-only connector; automated Google News access is disabled")
        return 0
    if not a.from_file:
        print("error: --from-file is required; automated Google News access is disabled", file=sys.stderr)
        return 2
    try:
        feeds, captured = _load_capture(a.from_file)
        signal, asof, payload, sidecar = build(feeds, a.window_days, now=captured)
    except RuntimeError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

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
