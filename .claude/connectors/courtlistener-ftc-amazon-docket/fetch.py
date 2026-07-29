#!/usr/bin/env python3
"""CourtListener docket-entries connector — FTC v. Amazon.com, Inc. (2:23-cv-01495, W.D. Wash.).

Fetches the latest federal docket entries (motions, orders, scheduling, trial date) for the FTC's core
antitrust suit against Amazon and writes them into the AMZN subject's external pool as a typed, §4 tier-9
API pull, for the management-governance module. A file-writing fetcher per EXTERNAL_DATA.md §7 — zero
engine wiring. Gives a dated, primary read on the docket without waiting for news coverage to summarize a
filing.

Acquisition is free_key_api: CourtListener's REST v4 `docket-entries` endpoint requires a free, self-service
API token (Authorization: Token <token>, obtained at https://www.courtlistener.com/profile/), unlike its
public anonymous search endpoint. The token is never stored in this repo — it is read from the
COURTLISTENER_API_TOKEN environment variable, or from ~/.config/nostra-engine/providers.env (§7, §28). With
no token configured, this fetcher fails closed: it writes nothing and exits non-zero with instructions,
exactly like any other unmet precondition. Fails CLOSED on top of that: a non-200, an empty result, a docket
mismatch, or a shape mismatch also writes NOTHING. `as_of` is the latest entry's filing date, read from the
data.

Usage:
  python3 fetch.py --verify                # prove the endpoint fetches + parses; write nothing
  python3 fetch.py --subject AMZN          # write into data/AMZN/external/courtlistener/
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

HOST = "www.courtlistener.com"           # the ONE host this connector may reach
DOCKET_ID = 67828404                      # FTC v. Amazon.com, Inc., 2:23-cv-01495 (W.D. Wash.)
CASE_NAME = "Federal Trade Commission v. Amazon.com, Inc."
DOCKET_NUMBER = "2:23-cv-01495"
COURT = "W.D. Wash."
PROVIDER = "courtlistener"
CONNECTOR_ID = "courtlistener-ftc-amazon-docket"
MAX_ENTRIES = 20                          # most-recent entries carried in the payload
TOKEN_ENV = "COURTLISTENER_API_TOKEN"
PROVIDERS_ENV_PATH = os.path.expanduser("~/.config/nostra-engine/providers.env")


def load_token() -> str | None:
    """Read the free CourtListener API token from the environment, falling back to the shared
    providers.env (§7, §28) — the key never lives in the repo."""
    tok = os.environ.get(TOKEN_ENV)
    if tok:
        return tok.strip()
    try:
        with open(PROVIDERS_ENV_PATH, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                if k.strip() == TOKEN_ENV:
                    return v.strip().strip('"').strip("'") or None
    except OSError:
        pass
    return None


def _url() -> str:
    q = {"docket": str(DOCKET_ID), "order_by": "-date_filed", "page_size": str(MAX_ENTRIES)}
    return f"https://{HOST}/api/rest/v4/docket-entries/?" + urllib.parse.urlencode(q)


def fetch_json(token: str, timeout: int = 20):
    req = urllib.request.Request(
        _url(),
        headers={
            "User-Agent": f"nostradamus-connector/{CONNECTOR_ID}",
            "Authorization": f"Token {token}",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:  # noqa: S310 — fixed HTTPS host, not user input
            if r.status != 200:
                raise RuntimeError(f"HTTP {r.status} from {HOST}")
            return json.loads(r.read().decode("utf-8", "replace"))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code} from {HOST}: {e.read().decode('utf-8', 'replace')[:300]}") from e


def _docket_id_from(rec: dict):
    """The `docket` field may come back as a plain id or a hyperlinked URL — accept either."""
    v = rec.get("docket")
    if isinstance(v, int):
        return v
    if isinstance(v, str):
        m = re.search(r"/dockets/(\d+)/", v)
        if m:
            return int(m.group(1))
        if v.isdigit():
            return int(v)
    return None


def build(data):
    """Pure transform (API response → payload + sidecar). Separated from I/O so it is unit-testable, no
    network."""
    if not isinstance(data, dict) or not isinstance(data.get("results"), list):
        raise RuntimeError("unexpected response shape (fail closed — CourtListener shape may have changed)")
    results = data["results"]
    if not results:
        raise RuntimeError("no docket entries returned (fail closed)")

    matched = [rec for rec in results if _docket_id_from(rec) == DOCKET_ID]
    if not matched:
        raise RuntimeError(f"no entries matched docket {DOCKET_ID} (fail closed — contract mismatch)")

    dated = [rec for rec in matched if rec.get("date_filed")]
    if not dated:
        raise RuntimeError("no entry carried a date_filed (fail closed)")

    dated.sort(key=lambda r: (str(r["date_filed"]), r.get("entry_number") or 0), reverse=True)
    as_of = str(dated[0]["date_filed"])[:10]

    entries = []
    for rec in dated[:MAX_ENTRIES]:
        desc = (rec.get("description") or "").strip()
        entries.append({
            "entry_number": rec.get("entry_number"),
            "date_filed": str(rec["date_filed"])[:10],
            "description": desc,
            "recap_documents_count": len(rec.get("recap_documents") or []),
        })

    payload = {
        "series": "CourtListener federal docket entries — FTC v. Amazon.com, Inc. (2:23-cv-01495, W.D. Wash.)",
        "as_of": as_of,
        "docket_id": DOCKET_ID,
        "case_name": CASE_NAME,
        "docket_number": DOCKET_NUMBER,
        "court": COURT,
        "entries_count": len(dated),
        "latest_entries": entries,
        "source_url": _url(),
    }
    sidecar = {
        "provider": "CourtListener",
        "source_type": "paid_api",
        "tier": 9,
        "as_of": as_of,
        "received": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source_url": _url(),
        "license": "public_domain (US federal court record); accessed via CourtListener API under its Terms of Use",
        "connector_id": CONNECTOR_ID,
        "note": f"{len(dated)} docket entries through {as_of}; latest: entry {entries[0]['entry_number']} — "
                f"{entries[0]['description'][:120]}",
    }
    return as_of, entries, payload, sidecar


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
    ap = argparse.ArgumentParser(description="Fetch CourtListener FTC-v-Amazon docket entries into AMZN's external-data pool.")
    ap.add_argument("--subject", help="the pool subject, e.g. AMZN (required unless --verify)")
    ap.add_argument("--data-root", default="data", help="pool root (default: data)")
    ap.add_argument("--verify", action="store_true", help="prove the endpoint fetches + parses; write nothing")
    a = ap.parse_args()

    token = load_token()
    if not token:
        print(
            f"error: no CourtListener API token configured. Fails closed — writes nothing. "
            f"Register a free account and get a token at https://www.courtlistener.com/profile/, "
            f"then set {TOKEN_ENV} (env or {PROVIDERS_ENV_PATH}).",
            file=sys.stderr,
        )
        return 2

    as_of, entries, payload, sidecar = build(fetch_json(token))

    if a.verify:
        print(f"OK verify: {HOST}/api/rest/v4/docket-entries/ → 200, docket {DOCKET_ID} "
              f"({len(entries)} entries fetched, latest as_of {as_of})")
        return 0

    if not a.subject:
        print("error: --subject is required (unless --verify)", file=sys.stderr)
        return 2

    out_dir = os.path.join(a.data_root, a.subject, "external", PROVIDER)
    os.makedirs(out_dir, exist_ok=True)
    data_path = os.path.join(out_dir, f"ftc_v_amazon_docket_{as_of}.json")
    _atomic_write_json(data_path, payload)
    _atomic_write_json(data_path + ".source.json", sidecar)
    print(f"wrote {data_path} ({len(entries)} entries, as_of {as_of}) + .source.json sidecar (tier 9)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
