#!/usr/bin/env python3
"""Unit test for the Yunnan curtailment news-scan connector — filter/dedupe/as_of + fail-closed + manifest
consistency, NO network (fixture RSS strings). Google News access is manual-only; `--verify` proves the
automatic path stays disabled. Run: python3 test_fetch.py
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
               link="https://news.google.com/rss/articles/a")
DUPE_B = _item("YUNNAN SMELTERS HALT: aluminium output!", "Thu, 16 Jul 2026 10:00:00 GMT",
               link="https://news.google.com/rss/articles/b")

_fails = 0


def check(name: str, cond: bool) -> None:
    global _fails
    print(f"  {'ok ' if cond else 'FAIL'} {name}")
    if not cond:
        _fails += 1


feeds = [mod.parse_feed(_rss(MATCH, NEAR_MISS, STALE)), mod.parse_feed(_rss(DUPE_A, DUPE_B)), mod.parse_feed(_rss())]
signal, asof, payload, sidecar = mod.build(feeds, 30, now=NOW)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(_HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402
_manifest = json.load(open(os.path.join(_HERE, "connector.json")))
_contract_defects = validate_manifest(_manifest["id"], _HERE, _manifest) + validate_staged_output(
    _manifest, "ALUMINIUM", payload, sidecar, asof,
)
check("shared v2 manifest/staged-output contract accepts the production transform", not _contract_defects)
titles = [m["title"] for m in payload["matched"]]

check("signal detected on >=1 match", signal == "detected" and payload["signal"] == "detected")
# as_of is the SCAN date even when detected — the honest "data through" of the scan (EXTERNAL_DATA.md §7);
# pinning it to an old matched pubDate made the filename-derived freshness permanently stale (refetch loop).
check("as_of (detected) = the scan date, not the matched pubDate",
      asof == "2026-07-19" and payload["as_of"] == "2026-07-19" and sidecar["as_of"] == "2026-07-19")
check("each matched headline keeps its own pubDate in matched[]",
      payload["matched"][0]["published"] == "2026-07-17")
check("near-miss excluded (yunnan+curtail but no aluminium term)", not any("tobacco" in t.lower() for t in titles))
check("stale item outside the window excluded", "Yunnan aluminium production cut deepens" not in titles)
check("dedupe on normalized title (two spellings → one row)",
      len(payload["matched"]) == 2 and sum("halt" in t.lower() for t in titles) == 1)
check("matched_terms records each matched stem",
      payload["matched"][0]["matched_terms"] == ["yunnan", "curtail", "aluminium", "smelt"])
check("publisher from <source> when present", payload["matched"][0]["publisher"] == "Reuters")
check("publisher falls back to the link's registrable domain",
      any(m["publisher"] == "google.com" for m in payload["matched"]))
check("window_days + queries + scanned_at recorded",
      payload["window_days"] == 30 and payload["queries"] == list(mod.QUERIES)
      and payload["scanned_at"] == "2026-07-19T12:00:00Z")
check("sidecar tier 10 + external_other + connector_id + lead-not-measurement note",
      sidecar["tier"] == 10 and sidecar["source_type"] == "external_other"
      and sidecar["connector_id"] == "yunnan-curtailment-news" and "LEAD" in sidecar["note"])
check("every nested matched[].url is bound into provenance source_urls",
      {m["url"] for m in payload["matched"]}.issubset(set(sidecar["source_urls"])))

offhost_payload = json.loads(json.dumps(payload)); offhost_sidecar = json.loads(json.dumps(sidecar))
offhost_payload["matched"][0]["url"] = "https://internal.example.test/article"
offhost_sidecar["source_urls"].append(offhost_payload["matched"][0]["url"])
offhost_defects = validate_staged_output(
    _manifest, "ALUMINIUM", offhost_payload, offhost_sidecar, asof,
)
check("nested matched[].url on an off-allowlist host fails staged publication",
      any("payload.matched[0].url" in defect and "outside host_allowlist" in defect
          for defect in offhost_defects))

file_payload = json.loads(json.dumps(payload)); file_sidecar = json.loads(json.dumps(sidecar))
file_payload["matched"][0]["url"] = "file:///tmp/renamed-report.html"
file_sidecar["source_urls"].append(file_payload["matched"][0]["url"])
file_defects = validate_staged_output(_manifest, "ALUMINIUM", file_payload, file_sidecar, asof)
check("nested file: URL is forbidden for a connector payload",
      any("payload.matched[0].url" in defect and "absolute HTTPS" in defect
          for defect in file_defects))

unbound_sidecar = json.loads(json.dumps(sidecar))
unbound_sidecar["source_urls"] = [
    url for url in unbound_sidecar["source_urls"] if url != payload["matched"][0]["url"]
]
unbound_defects = validate_staged_output(_manifest, "ALUMINIUM", payload, unbound_sidecar, asof)
check("nested payload evidence URL must be repeated in provenance",
      any("payload evidence URLs must also appear" in defect for defect in unbound_defects))

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

for malformed, label in [
    ("<html><channel><title>q</title></channel></html>", "well-formed non-RSS XML"),
    ("<rss version='2.0'></rss>", "RSS with no channel coverage"),
    ("<rss version='2.0'><channel></channel></rss>", "RSS channel with no identity title"),
]:
    raised = False
    try:
        mod.parse_feed(malformed)
    except RuntimeError:
        raised = True
    check(f"fail-closed on {label}", raised)

check("curtailment matching uses word boundaries, not substrings",
      mod.match_terms("Yunnan aluminium celebration opens") == [])
future = _item("Yunnan aluminium smelters cut output", "Mon, 20 Jul 2026 12:00:00 GMT")
raised = False
try:
    mod.build([mod.parse_feed(_rss(future)), [], []], 30, now=NOW)
except RuntimeError:
    raised = True
check("future-dated headlines fail closed instead of manufacturing fresh coverage", raised)

tmp_root = tempfile.mkdtemp()
capture = os.path.join(tmp_root, "capture.json")
json.dump({
    "captured_at": "2026-07-19T12:00:00Z",
    "feeds": [{"query": query, "xml": _rss(MATCH) if index == 0 else _rss()}
              for index, query in enumerate(mod.QUERIES)],
}, open(capture, "w"))
old_argv = sys.argv
sys.argv = ["fetch.py", "--verify"]
try:
    verify_code = mod.main()
finally:
    sys.argv = old_argv
check("--verify performs no Google News request and states the manual-only boundary",
      verify_code == 0 and not hasattr(mod, "fetch_feed"))

bad_capture = os.path.join(tmp_root, "partial.json")
json.dump({"captured_at": "2026-07-19T12:00:00Z",
           "feeds": [{"query": mod.QUERIES[0], "xml": _rss(MATCH)}]}, open(bad_capture, "w"))
raised = False
try:
    mod._load_capture(bad_capture)
except RuntimeError:
    raised = True
check("a partial manual query capture is rejected", raised)

man = json.load(open(os.path.join(_HERE, "connector.json"), encoding="utf-8"))
check("connector.json tier/source_type agree with the sidecar the fetcher writes",
      man["tier"] == sidecar["tier"] == 10 and man["source_type"] == sidecar["source_type"] == "external_other")
check("connector.json declares an exact-host allowlist containing the fetch host",
      isinstance(man.get("host_allowlist"), list) and mod.HOST in man["host_allowlist"])
check("Google News terms are enforced as entitlement-required manual ingest",
      man.get("manual") is True and man.get("acquisition") == "manual"
      and man.get("manual_ingest", {}).get("file_arg") == "--from-file"
      and man["licensing"]["use"] == "entitlement_required")
check("payload keys match connector.json output_schema keys", set(payload.keys()) == set(man["output_schema"].keys()))
check("connector.json series/provider match the code", man["series"] == mod.SERIES and man["provider"] == mod.PROVIDER)

print(f"\n{'PASS' if not _fails else 'FAIL'}: yunnan-curtailment-news connector — {_fails} failing case(s)")
raise SystemExit(1 if _fails else 0)
