#!/usr/bin/env python3
"""Unit test for the Yunnan curtailment news-scan connector — filter/dedupe/as_of + fail-closed + manifest
consistency, NO network (fixture RSS strings). A Google News RSS shape change is the realistic break; the
live endpoint is proven by `fetch.py --verify` at merge time. Run: python3 test_fetch.py
"""
from __future__ import annotations

import glob
import importlib.util
import json
import os
import sys
import tempfile
from datetime import datetime, timezone

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("yunnan_fetch", os.path.join(_HERE, "fetch.py"))
mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mod)

NOW = datetime(2026, 7, 19, 12, 0, 0, tzinfo=timezone.utc)


def _item(title, pub, link="https://news.google.com/rss/articles/x", source=None):
    src = f'<source url="https://example.com">{source}</source>' if source else ""
    return f"<item><title>{title}</title><link>{link}</link><pubDate>{pub}</pubDate>{src}</item>"


def _rss(*items):
    return '<?xml version="1.0"?><rss version="2.0"><channel><title>q</title>' + "".join(items) + "</channel></rss>"


MATCH = _item("Yunnan orders aluminium smelters to curtail output as dry season bites",
              "Fri, 17 Jul 2026 08:00:00 GMT", source="Reuters")
NEAR_MISS = _item("Yunnan tobacco curtailment plan announced", "Thu, 16 Jul 2026 09:00:00 GMT", source="Xinhua")
STALE = _item("Yunnan aluminium production cut deepens", "Mon, 01 Jun 2026 08:00:00 GMT", source="Reuters")
DUPE_A = _item("Yunnan smelters halt aluminium output", "Wed, 15 Jul 2026 10:00:00 GMT",
               link="https://www.metalbulletin.co.uk/a/b")
DUPE_B = _item("YUNNAN SMELTERS HALT: aluminium output!", "Thu, 16 Jul 2026 10:00:00 GMT",
               link="https://www.metalbulletin.co.uk/c/d")

_fails = 0


def check(name: str, cond: bool) -> None:
    global _fails
    print(f"  {'ok ' if cond else 'FAIL'} {name}")
    if not cond:
        _fails += 1


feeds = [mod.parse_feed(_rss(MATCH, NEAR_MISS, STALE)), mod.parse_feed(_rss(DUPE_A, DUPE_B)), mod.parse_feed(_rss())]
signal, asof, payload, sidecar = mod.build(feeds, 30, now=NOW)
titles = [m["title"] for m in payload["matched"]]

check("signal detected on >=1 match", signal == "detected" and payload["signal"] == "detected")
check("as_of (detected) = latest matched pubDate date part", asof == "2026-07-17" and sidecar["as_of"] == "2026-07-17")
check("near-miss excluded (yunnan+curtail but no aluminium term)", not any("tobacco" in t.lower() for t in titles))
check("stale item outside the window excluded", "Yunnan aluminium production cut deepens" not in titles)
check("dedupe on normalized title (two spellings → one row)",
      len(payload["matched"]) == 2 and sum("halt" in t.lower() for t in titles) == 1)
check("matched_terms records each matched stem",
      payload["matched"][0]["matched_terms"] == ["yunnan", "curtail", "aluminium", "smelt"])
check("publisher from <source> when present", payload["matched"][0]["publisher"] == "Reuters")
check("publisher falls back to the link's registrable domain",
      any(m["publisher"] == "metalbulletin.co.uk" for m in payload["matched"]))
check("window_days + queries + scanned_at recorded",
      payload["window_days"] == 30 and payload["queries"] == list(mod.QUERIES)
      and payload["scanned_at"] == "2026-07-19T12:00:00Z")
check("sidecar tier 9 + external_other + connector_id + lead-not-measurement note",
      sidecar["tier"] == 9 and sidecar["source_type"] == "external_other"
      and sidecar["connector_id"] == "yunnan-curtailment-news" and "LEAD" in sidecar["note"])

signal_n, asof_n, payload_n, _ = mod.build([mod.parse_feed(_rss(NEAR_MISS, STALE)), [], []], 30, now=NOW)
check("signal not_detected on 0 matches", signal_n == "not_detected" and payload_n["matched"] == [])
check("as_of (not_detected) = the scan date", asof_n == "2026-07-19")
check("note explains the Nov-Apr dry-season baseline", "Nov-Apr" in payload_n["note"] and "baseline" in payload_n["note"])

raised = False
try:
    mod.parse_feed("<rss><channel><item><title>truncated")
except Exception:
    raised = True
check("fail-closed on malformed XML", raised)

_orig_fetch = mod.fetch_feed
_calls = {"n": 0}


def _fake_fetch(query, timeout=20):
    _calls["n"] += 1
    if _calls["n"] == 3:
        raise RuntimeError("HTTP 503 from news.google.com (fail closed)")
    return _rss(MATCH)


mod.fetch_feed = _fake_fetch
tmp_root = tempfile.mkdtemp()
sys.argv = ["fetch.py", "--subject", "ALUMINIUM", "--data-root", tmp_root]
raised = False
try:
    mod.main()
except Exception:
    raised = True
mod.fetch_feed = _orig_fetch
check("any-query-fails → exits non-zero and writes NOTHING",
      raised and _calls["n"] == 3 and not glob.glob(os.path.join(tmp_root, "**", "*.json"), recursive=True))

man = json.load(open(os.path.join(_HERE, "connector.json"), encoding="utf-8"))
check("connector.json tier/source_type agree with the sidecar the fetcher writes",
      man["tier"] == sidecar["tier"] == 9 and man["source_type"] == sidecar["source_type"] == "external_other")
check("connector.json declares an exact-host allowlist containing the fetch host",
      isinstance(man.get("host_allowlist"), list) and mod.HOST in man["host_allowlist"])
check("payload keys match connector.json output_schema keys", set(payload.keys()) == set(man["output_schema"].keys()))
check("connector.json series/provider match the code", man["series"] == mod.SERIES and man["provider"] == mod.PROVIDER)

print(f"\n{'PASS' if not _fails else 'FAIL'}: yunnan-curtailment-news connector — {_fails} failing case(s)")
raise SystemExit(1 if _fails else 0)
