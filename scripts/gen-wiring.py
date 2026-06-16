#!/usr/bin/env python3
"""Turn verified feed results into the three firewall mirrors. Reads one or more verify-results JSON
files (from scripts/verify-feeds.ts), keeps the feeds that passed (verdict live OR empty_valid for a
real feed), and emits:
  1. <out>/wiring-rss-feeds.json   — the rss_feeds.json `feeds` array (url, source_name, user_agent?)
  2. <out>/wiring-domains.tsv      — domain  source_name  region  input_nature  (for approved-domains.ts)
  3. <out>/wiring-sources.txt      — new canonical source names (for SWARM.md allowed list)

The firewall gates on the item-LINK domain, so the domain map is built from each feed's observed
link_domains (falling back to registrable_domain), collapsed to the registrable suffix EXCEPT for
shared-parent hosts that must stay scoped to a full subdomain (indiatimes.com, feedburner, etc.).

Usage: python3 scripts/gen-wiring.py <out-dir> <results1.json> [results2.json ...]
"""
import sys, json, os
from collections import OrderedDict, Counter

SEC_UA = "nostra-demus-screener/1.0 (ceekay@muns.io)"  # SEC requires a descriptive contact UA

# Domains we deliberately DO NOT add to the firewall (and whose feeds we drop):
#  - aggregator REDIRECTORS whose item links resolve to themselves, not the publisher (adding them
#    would approve EVERYTHING they carry, defeating Gate-0 source discipline);
#  - UGC / social / commentary tiers below the approved-source bar;
#  - shared CDNs / S3 buckets / national-portal public suffixes (would approve unrelated content).
EXCLUDE_DOMAINS = {
    "news.google.com", "google.com", "bing.com", "news.bing.com",
    "reddit.com", "stocktwits.com", "seekingalpha.com",
    "amazonaws.com", "s3.amazonaws.com", "gdeltproject.org", "alphavantage.co",
    "gov.br", "com.tw", "org.tw", "markitdigital.com",
}
# One-off canonical source-name overrides for shared-but-approved govt delivery hosts.
SOURCE_NAME_OVERRIDE = {
    "content.govdelivery.com": "US Government agency (GovDelivery)",
}

# Hosts whose registrable parent is SHARED across unrelated publishers — keep the full subdomain so
# the firewall stays scoped (the existing firewall already does this for economictimes.indiatimes.com).
SHARED_PARENTS = {
    "indiatimes.com", "feedburner.com", "feedblitz.com", "google.com", "govdelivery.com",
    "substack.com", "wordpress.com", "medium.com", "blogspot.com", "tumblr.com", "bigcdn.com",
}
# multi-label public suffixes we must NOT collapse past (registrable = last 3 labels)
MULTI_SUFFIX = {
    "co.uk", "gov.uk", "org.uk", "ac.uk", "co.in", "gov.in", "org.in", "nic.in", "co.jp",
    "or.jp", "go.jp", "com.au", "gov.au", "org.au", "co.nz", "govt.nz", "com.hk", "com.sg",
    "com.br", "gov.br", "co.za", "com.cn", "gov.cn", "europa.eu", "com.tw", "org.tw", "gov.tw",
}
# domains already on the firewall today (don't re-propose; section-only additions are fine)
ALREADY = {
    "reuters.com","apnews.com","ap.org","bloomberg.com","afp.com","ft.com","spglobal.com","wsj.com",
    "cnbc.com","marketwatch.com","economictimes.indiatimes.com","business-standard.com","livemint.com",
    "moneycontrol.com","sec.gov","nseindia.com","bseindia.com","iea.org","opec.org","eia.gov",
    "argusmedia.com","tasnimnews.com",
}

def registrable(host: str) -> str:
    host = (host or "").strip().lower().lstrip(".")
    if host.startswith("www."):
        host = host[4:]
    parts = host.split(".")
    if len(parts) <= 2:
        return host
    last2 = ".".join(parts[-2:])
    last3 = ".".join(parts[-3:])
    if last2 in MULTI_SUFFIX:
        reg = last3
    else:
        reg = last2
    # shared parent → keep the full subdomain instead of the registrable parent
    if reg in SHARED_PARENTS:
        return host
    return reg

def feed_domain(r: dict) -> str:
    """The domain the firewall must approve = the dominant item-LINK domain, registrable-collapsed."""
    lds = r.get("link_domains") or []
    if lds:
        # dominant link domain (already host form from verifier)
        host = lds[0]["domain"]
    else:
        host = r.get("registrable_domain") or ""
    return registrable(host)

def main():
    out_dir = sys.argv[1]
    os.makedirs(out_dir, exist_ok=True)
    results = []
    for p in sys.argv[2:]:
        results += json.load(open(p))
    # keep passing feeds; dedup by feed_url (first wins); drop excluded domains
    seen_url = set()
    kept = []
    dropped_excluded = 0
    for r in results:
        if not r.get("ok"):
            continue
        u = r.get("feed_url")
        if not u or u in seen_url:
            continue
        if feed_domain(r) in EXCLUDE_DOMAINS or registrable(r.get("registrable_domain", "")) in EXCLUDE_DOMAINS:
            dropped_excluded += 1
            continue
        seen_url.add(u)
        kept.append(r)

    # 1. rss_feeds.json feeds array (rss + atom only; json_api/html_scrape need adapters, excluded)
    feeds = []
    for r in kept:
        if r.get("access") not in ("rss", "atom"):
            continue
        entry = OrderedDict()
        entry["url"] = r["feed_url"]
        entry["source_name"] = r["source_name"]
        host = ""
        try:
            from urllib.parse import urlparse
            host = urlparse(r["feed_url"]).hostname or ""
        except Exception:
            pass
        # exact host or a real subdomain — NOT a substring/suffix match (endswith("sec.gov")
        # would also match "evilsec.gov"). Clears CodeQL py/incomplete-url-substring-sanitization.
        if host == "sec.gov" or host.endswith(".sec.gov"):
            entry["user_agent"] = SEC_UA
        feeds.append(entry)
    json.dump({"feeds": feeds}, open(os.path.join(out_dir, "wiring-rss-feeds.json"), "w"), indent=2)

    # 2. domain → meta map for the firewall (one row per NEW registrable domain)
    dom_meta = OrderedDict()
    dom_examples = Counter()
    for r in kept:
        dom = feed_domain(r)
        if not dom:
            continue
        dom_examples[dom] += 1
        if dom in ALREADY:
            continue
        if dom not in dom_meta:
            # canonical source name: strip a " — section" suffix to get the publisher
            name = r["source_name"].split(" — ")[0].split(" - ")[0].strip()
            name = SOURCE_NAME_OVERRIDE.get(dom, name)
            dom_meta[dom] = {"source_name": name, "region": r.get("region", "GLOBAL"),
                             "input_nature": r.get("input_nature", "news_headline")}
    with open(os.path.join(out_dir, "wiring-domains.tsv"), "w") as f:
        f.write("domain\tsource_name\tregion\tinput_nature\tfeeds_pointing_here\n")
        for dom, m in sorted(dom_meta.items(), key=lambda kv: (kv[1]["region"], kv[0])):
            f.write(f"{dom}\t{m['source_name']}\t{m['region']}\t{m['input_nature']}\t{dom_examples[dom]}\n")

    # 3. new canonical source names for SWARM allow-list
    names = sorted({m["source_name"] for m in dom_meta.values()})
    with open(os.path.join(out_dir, "wiring-sources.txt"), "w") as f:
        f.write("\n".join(names) + "\n")

    # 4. ready-to-paste TypeScript for approved-domains.ts DOMAINS map, grouped by region, gdelt:false
    region_label = {"US": "US (new)", "IN": "India (new)", "GLOBAL": "Global (new)", "OTHER": "Other markets (new)"}
    def ts_str(s: str) -> str:
        return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"
    lines = []
    for region in ("US", "IN", "GLOBAL", "OTHER"):
        rows = sorted([(d, m) for d, m in dom_meta.items() if m["region"] == region], key=lambda kv: kv[0])
        if not rows:
            continue
        lines.append(f"  // --- {region_label[region]} ---")
        for d, m in rows:
            lines.append(
                f"  '{d}': {{ source_name: {ts_str(m['source_name'])}, region: '{m['region']}', "
                f"input_nature: '{m['input_nature']}', gdelt: false }},"
            )
    with open(os.path.join(out_dir, "wiring-domains.ts.snippet"), "w") as f:
        f.write("\n".join(lines) + "\n")

    print(f"kept {len(kept)} passing feeds (dropped {dropped_excluded} excluded-domain feeds)")
    print(f"  rss/atom feeds for rss_feeds.json: {len(feeds)}")
    print(f"  NEW firewall domains: {len(dom_meta)}  (existing reused: {sum(1 for d in dom_examples if d in ALREADY)})")
    print(f"  new canonical source names: {len(names)}")
    print(f"  json_api/html_scrape excluded (need adapters): {sum(1 for r in kept if r.get('access') not in ('rss','atom'))}")
    print(f"written to {out_dir}/wiring-rss-feeds.json, wiring-domains.tsv, wiring-sources.txt")

if __name__ == "__main__":
    main()
