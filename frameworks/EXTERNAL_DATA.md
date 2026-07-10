# External Data — Ingestion, Provenance, and Tier Contract

Who reads this: the ingestion router (`.claude/tools/ingest_external.py`), the pool extractor (`.claude/tools/extract_pool.py`), every module's Layer-0 data-triage agent, the specialists that cite external evidence, and the master synthesizer. It defines how data that does NOT come from a filing or a standard vendor terminal — paid alternative data, expert-network calls, the user's own channel checks, broker research, paid-API pulls — enters the pool, how its provenance travels with it, and at what CLAUDE.md §4 tier it may be cited.

Why this exists: proprietary and user-collected data is the canonical source of variant perception (§7) — it is where "what the market may be missing" actually comes from. But it is also the easiest place to smuggle in unverifiable claims. This contract lets the engine use that edge without relaxing a single truth rule (§3–§6).

---

## 1. Where external data lives

The data pool is a Google Drive folder (`My Drive/equity-research-data`, mounted as `data/`). External data has two places in it:

```
data/
  EXTERNAL-INBOX/                 <- DROP FILES HERE (reserved folder, never a ticker)
    <anything>.pdf|xlsx|txt|png    loose files: the router detects the ticker(s)
    <Provider>/<file>              provider subfolder: provider is taken from the folder name
    <Provider>/<TICKER>/<file>     forced routing: this file goes to that ticker, no detection
    _routed/                       originals archived here after routing (audit trail)
    .ingest_ledger.ndjson          append-only routing ledger (sha256-deduped)
  <TICKER>/
    external/
      <provider-slug>/
        <file>                     the routed document
        <file>.source.json         its provenance sidecar (see §3)
```

- **The inbox is the low-friction path.** Drop anything into `EXTERNAL-INBOX/` (or a provider subfolder); the router (`ingest_external.py`, run on a timer by `com.nostradamus.external-ingest`) sniffs each file, detects which existing ticker pools it concerns, copies it into each pool's `external/<provider>/`, writes the sidecar, and archives the original under `_routed/`. A file that matches no known ticker stays in the inbox and is reported — nothing is silently dropped.
- **Direct drops are also valid.** Putting a file straight into `data/<TICKER>/external/<provider>/` works without the router; the sidecar is then optional (the reading layer falls back to path-derived provenance: provider = folder name, tier per §4 below, as-of parsed from inside the document). **Two levels max under `external/`** (`external/<provider>/<file>`) — a deeper sub-subfolder is still extracted for runs, but the cockpit's live listing and change events only watch two levels.
- **Multi-ticker documents** (e.g. one cloud-infrastructure note covering AMZN, MSFT, GOOGL) are copied into every matching ticker pool, each copy with the same sidecar listing all covered tickers. Detection only targets tickers that already have a `data/<TICKER>/` pool — to route a document to a company with no pool yet, use the forced `<Provider>/<TICKER>/` layout (the router will create the pool folder).

`EXTERNAL-INBOX` is a reserved system folder (like `NEWS-ARCHIVE`): the cockpit never lists it as a company.

## 2. What counts as external data

| `source_type` | What it is | Examples |
|---|---|---|
| `alt_data_panel` | Measured/licensed panel or dataset with a methodology, usually estimate-based | YipitData, Second Measure, M Science, SimilarWeb, Sensor Tower exports |
| `expert_call` | Expert-network call notes or transcripts | GLG / Tegus / AlphaSights call notes |
| `channel_check` | The user's own primary fieldwork | distributor conversations, store visits, supplier checks, photos |
| `broker_research` | Sell-side research documents | initiation notes, sector primers, earnings previews |
| `vendor_export` | Paid-terminal exports beyond the standard CIQ set | specialist databases, paid screeners |
| `paid_api` | Machine-pulled data from a paid API (see §7) | a nightly KPI pull dropped as CSV/JSON |
| `management_meeting` | User's notes from management/IR access | NDR notes, AGM observations |
| `external_other` | Anything else third-party | unclassified — cite conservatively (tier 9 unless upgraded by evidence) |

## 3. The provenance sidecar — `<file>.source.json`

One JSON sidecar per routed document, written by the router (or by hand for direct drops). All fields optional except `source_type`; absent fields degrade gracefully.

```json
{
  "provider": "YipitData",
  "source_type": "alt_data_panel",
  "tier": 5,
  "as_of": "2026-03-31",
  "published": "2026-04-16",
  "received": "2026-07-11",
  "tickers": ["AMZN", "MSFT", "GOOGL"],
  "license": "subscriber-only",
  "accuracy_note": "vendor backtest: AWS ±2.3pp, Azure ±4pp, GCP ±6pp at 80% confidence",
  "origin": "Cloud (AWS, Azure, GCP) | Mar-26 Update",
  "sha256": "…",
  "routed_by": "ingest_external.py",
  "routed_from": "EXTERNAL-INBOX/Cloud (AWS, Azure, GCP) _ Mar-26 Update.pdf"
}
```

- `as_of` is the DATA coverage end ("data through"), `published` the document's own date, `received` the ingestion date. These are three different dates; never conflate them. A Drive file's mtime is the SYNC date and is none of the three (fix F23) — the reading layer always confirms the as-of from inside the document.
- `license: subscriber-only` marks material that must not be republished: cite individual figures with attribution; never reproduce whole tables or pages into a memo or thesis.
- `accuracy_note` carries the vendor's own stated error margin / backtest where disclosed — specialists must quote it alongside any figure they lean on (§9–§10: an estimate travels with its uncertainty).

`extract_pool.py` folds each sidecar into its manifest row as `provenance` (and never lists the sidecar itself as a document), so every downstream agent sees provenance without touching the pool.

## 4. Tier mapping into CLAUDE.md §4

The §4 hierarchy is unchanged; this maps each `source_type` INTO it. The mapping refines the hierarchy, never reorders it (§4, §23).

| `source_type` | §4 tier | Cite as | Hard rules |
|---|---|---|---|
| `alt_data_panel` | 5 (data vendor) | licensed alt-data, **estimate** | Always labelled estimate-based; carry the vendor error margin where disclosed; a filing's own number beats it (§4) and is never replaced by it |
| `vendor_export`, `paid_api` | 5 (data vendor) | vendor export / API pull, dated | Same vendor rules as Capital IQ exports (§5: never under a filing's name) |
| `broker_research` | 7 band (at/below decks) | broker note, verdict-stripped | Strip Rating / Target Price / "our estimate" (§24); never a source for consensus numbers (fix F19) or for any figure a primary doc carries |
| `expert_call`, `channel_check`, `management_meeting` | 9 (user-collected note) | user-collected primary note, dated | One person's view, not a measurement: N=1 unless the note says otherwise; can RAISE a question against filings, never override them; integrity-adverse signal escalates per §24 filter 1 |
| `external_other` | 9 | third-party, unverified | Conservative default until provenance is established |

Two standing rules on top:
- **External data never substitutes a required filing.** Data sufficiency (§11) and every module's triage sufficiency rule count filings, transcripts, and decks exactly as before — an external doc is enrichment that can sharpen a call, not a unit that fills a missing-filing slot.
- **External data CAN be the edge.** Where a tier-5 panel with a stated error margin diverges from consensus, or a channel check contradicts the narrative, that is admissible §7 item-3/item-4 evidence ("what the market is missing" + "what would prove we're different") — cited at its tier, with its as-of and margin, and with the divergence quantified against the consensus data-as-of.

## 5. Citation forms (§5-compatible)

- `YipitData Cloud panel, Mar-26 update (pub. 2026-04-16), Ex.1A — licensed alt-data, estimate (AWS ±2.3pp @80% vendor backtest)`
- `Expert call notes (Tegus), 2026-06-20 — user-collected, N=1, unverified`
- `Channel check: 3 AWS reseller conversations, 2026-07-02 (user notes) — anecdotal, N=3`
- `Broker initiation, <Broker> 2026-05-12 — verdict-stripped colour only`
- `Paid API pull (<provider>), data as of 2026-07-10`

Ban the same vagueness §5 bans: "alternative data suggests", "channel checks indicate" with no provider, date, or N.

## 6. How the engine consumes it (the loop)

1. **Ingest** — file lands in `EXTERNAL-INBOX/` → router copies to `data/<TICKER>/external/<provider>/` + sidecar (§1, §3). The cockpit's data watcher sees the change live; readiness dots refresh.
2. **Extract** — `extract_pool.py` extracts it like any pool doc (workbook tabs, PDF text, images/scans via vision/OCR) and stamps its manifest row `external: true` + `provenance` (§3).
3. **Inventory** — every module's 00 data-triage lists each external doc as its own inventory row with provider · source_type · tier · as-of; external docs never move the sufficiency verdict (§4 above).
4. **Analyze** — specialists cite external evidence at its mapped tier with the required labels; `guidance-consensus` cross-checks alt-data panel estimates against consensus as a labelled, non-substitute read; the synthesizer's §7 audit treats quantified external divergence as edge evidence.
5. **Re-rate** — new external files bump the pool's newest-file date, so a finished run shows `stale` in the cockpit's thesis plan; `/research:review-decisions` maps material new docs to `impacted_modules` + an exact rerun command. The router also prints a suggested `/research:rerun …` per routed ticker and records it in the ledger row. Reruns stay human-triggered (they cost money); nothing auto-launches. Note: a routed COPY's file date is the routing date, so even an old document flags finished runs stale — deliberately: staleness means "the engine has not read this yet", not "this is new information".

Two consumption limits, stated honestly: the deterministic `ciq_facts.json` sidecar reads only the pool's TOP-LEVEL files, so a CIQ-shaped workbook under `external/` never feeds the facts sidecar (specialists still read its extracts directly). And the readiness gate's entity-contamination check deliberately SKIPS `external/` files (a multi-company external note is normal, not contamination) — a genuinely mis-routed external file is caught by the triage inventory and its sidecar's `tickers[]`, not by the entity gate.

## 6A. Commodities — the same lane, one caveat

The commodity swarm shares the pool root: `data/<COMMODITY>/external/<provider>/` works identically (satellite crop analytics, paid ag/energy reports, broker commodity research, trade-house channel checks), the same sidecar travels with each document, `.claude/agents/commodity/MODULE_RULES.md` §2 maps the source types into the commodity source hierarchy, and the commodity triage inventories external docs the same way. The router detects a commodity subject (a `## <NAME>` heading in `frameworks/commodity/COMMODITY_PROFILES.md`) and suggests `/commodity:rerun supply-demand <NAME>` instead of a research-swarm rerun.

The one caveat: commodity names are common English words ("gold", "sugar"), so loose-drop auto-detection is unreliable for them — use the forced `<Provider>/<COMMODITY>/` inbox layout, or add precise `.aliases.json` entries (e.g. `"GOLD": ["XAU", "bullion", "COMEX gold"]`), rather than relying on body mentions.

## 7. Paid APIs (adapter contract)

A paid-API integration is a fetcher that WRITES FILES — it needs no engine wiring. Contract: drop the pull (CSV/JSON/PDF) into `EXTERNAL-INBOX/<Provider>/` (or directly into a ticker's `external/<provider>/` with a sidecar), one file per pull, the as-of IN the filename or body. Keys live in `~/.config/nostra-engine/providers.env` (never in the repo, §28). The router, extractor, triage, and staleness loop then treat it exactly like a manual drop. This is deliberately the same zero-touch shape as §26: adding a data source must never require engine-code edits.

## 8. Hard rules (recap)

- No source = no claim (§3). An external figure cites provider + date + where in the document, like any other source.
- Estimates are labelled estimates, with the vendor's error margin where disclosed (§9–§10).
- A filing beats external data at equal coverage (§4); when an external source contradicts a filing, surface the conflict — the conservative reading wins until primary evidence resolves it.
- Verdict-bearing broker material is stripped per §24 before use.
- `license: subscriber-only` material: cite figures, never republish tables/pages.
- The as-of comes from inside the document, never from file mtime (fix F23).
- A failed extraction is missing data (fix F03); a non-English external doc is NOT (§27).
