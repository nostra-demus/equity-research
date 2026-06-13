#!/usr/bin/env python3
"""Pull every discovered feed from a workflow's journal.jsonl, dedup by feed_url, write a flat
candidate list ready for scripts/verify-feeds.ts. Usage:
    python3 scripts/extract-candidates.py <journal.jsonl> <out-candidates.json>
"""
import sys, json

def main():
    journal, out = sys.argv[1], sys.argv[2]
    by_url = {}
    cat_counts = {}
    with open(journal) as f:
        for ln in f:
            try:
                o = json.loads(ln)
            except Exception:
                continue
            if o.get("type") != "result":
                continue
            r = o.get("result")
            if not isinstance(r, dict) or "feeds" not in r:
                continue
            cat = r.get("category", "?")
            n = 0
            for feed in r.get("feeds") or []:
                url = (feed.get("feed_url") or "").strip()
                if not url:
                    continue
                feed = {**feed, "category": cat}
                # first occurrence wins, but prefer a row that carries a high_value flag / richer notes
                if url not in by_url:
                    by_url[url] = feed
                    n += 1
            cat_counts[cat] = cat_counts.get(cat, 0) + n
    feeds = list(by_url.values())
    with open(out, "w") as f:
        json.dump(feeds, f, indent=2)
    print(f"{len(feeds)} unique candidate feeds written to {out}")
    for c, n in sorted(cat_counts.items()):
        print(f"  {c:26} {n}")
    # access + region breakdown
    from collections import Counter
    acc = Counter(f.get("access", "?") for f in feeds)
    reg = Counter(f.get("region", "?") for f in feeds)
    print("access:", dict(acc))
    print("region:", dict(reg))

if __name__ == "__main__":
    main()
