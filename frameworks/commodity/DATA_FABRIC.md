# Commodity data fabric

The cockpit may use only:

1. free, authoritative data;
2. a Capital IQ export supplied under the user's licence; or
3. a deterministic series derived from those inputs with parent vintage IDs.

If none can meet the profile's exact definition, history, freshness, units, and point-in-time rules, the
series stays unavailable. The engine must not fill the gap with an improvised web number.

## Daily operating flow

```bash
# Refresh reviewed automatic feeds for one commodity only.
python3 .claude/tools/run_connectors.py --subject COPPER

# Show coverage without writing or freezing a run artifact.
python3 scripts/commodity_profile_coverage.py commodity/runs/COPPER \
  --preflight --decision-time "$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Show every unimplemented need and its preferred primary authority.
python3 scripts/commodity_feed_plan.py COPPER --gaps-only
```

`/commodity:full` performs the subject refresh and preflight before it dispatches any analytical orb. A
zero-evidence result stops there. Partial evidence can continue, but it never bypasses the terminal
sufficiency and abstention rules.

## What makes a feed decision-grade

- One stable semantic series ID and one primary provider. Explicit fallbacks must use the same definition,
  schema, units, and history contract.
- Exact HTTPS host allowlists. Redirects, credentials, response size, and network destinations are checked.
- The date comes from the source data. File times and download times never become the observation date.
- Strict headers, types, numeric ranges, unique dates, minimum history, freshness, and closed output schemas.
- Every accepted pull becomes a content-addressed, immutable vintage with source, rights, code, retrieval,
  and release identity.
- Revisions create new vintages. Old decision cutoffs continue to see only what was knowable then.
- Primary/fallback disagreement for the same release is quarantined instead of averaged.
- A broken site, changed layout, stale release, bad licence, or missing credential fails closed. The last
  valid vintage remains auditable, but cannot pass freshness after its allowed window.

No Internet feed can be guaranteed to work forever. The durable guarantee is that failure becomes visible
and cannot silently turn into fabricated evidence.

## Declarative official CSV feeds

Use `scripts/commodity_tabular_feed.py` when an authority publishes a stable CSV. The connector folder
contains the normal reviewed `connector.json`, a `feed.json`, and this fixed wrapper:

```python
#!/usr/bin/env python3
import os, sys
SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from commodity_tabular_feed import main
raise SystemExit(main(__file__))
```

`feed.json` declares the URL, optional rolling start date, byte cap, exact CSV header, column mapping,
missing-value rule, numeric bounds, static identifiers, output fields, and provenance note. The manifest
still owns the evidence identity, source rights, release calendar, schema, units, and minimum history.
Configuration and tests are included in the connector fingerprint, so a mapping change invalidates silent
reuse and requires a real refresh.

The shared `fred-us-10y-real-yield` connector is the reference implementation. It supplies one official
semantic series to both COPPER and ALUMINIUM without commodity-specific engine code.

## Capital IQ CSV exports

Do not scrape a signed-in Capital IQ page and do not store its session or password. Export a CSV using the
user's licensed account. Build the connector with:

- `authority_class: "licensed_vendor"`;
- `acquisition: "manual"`, `manual: true`, and `manual_ingest.file_arg`;
- `source_type: "vendor_export"`, tier 5;
- `licensing.access: "licensed"`, `use: "entitlement_required"`, and the real redistribution limit;
- a Capital IQ HTTPS source/terms page in the allowlist and provenance;
- an exact `feed.json` header/mapping for that named export.

Then seal the raw export through the publisher:

```bash
python3 .claude/tools/run_connectors.py \
  --only <connector-id> --subject <COMMODITY> --manual-file <capital-iq-export.csv>
```

The runner snapshots and hashes the raw file, runs the same schema and quality gates as an automatic feed,
stores its entitlement/provenance contract, and publishes an immutable vintage. A properly sealed official
or Capital IQ manual vintage is decision-grade when it is tier 5 or better, within freshness limits, and its
licensing permits the user's use. An ordinary note or hand-entered number is not.

## Adding another commodity

Add its human and structured profile as required by `COMMODITY_PROFILES.md`, then run:

```bash
python3 scripts/commodity_feed_plan.py <COMMODITY> --gaps-only
```

The planner matches every need to the ordered source policy in `SOURCE_AUTHORITIES.json`: free primary
authority first, lawful official file second, licensed Capital IQ CSV third, and refusal last. New profiles,
shared series, fallback providers, and declarative feeds are discovered from their contracts; the cockpit
server and web app need no commodity switch or wiring change.
