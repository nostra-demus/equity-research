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
- **Direct drops are also valid.** Putting an ordinary file straight into `data/<TICKER>/external/<provider>/` works without the router; its sidecar is optional and the reading layer falls back to path-derived provenance (provider = folder name, tier per §4 below, as-of parsed from inside the document). This fallback never applies to a path owned by a v2 connector: a connector projection without its exact valid sidecar is unusable and fails extraction. **Two levels max under `external/`** (`external/<provider>/<file>`) — a deeper sub-subfolder is still extracted for runs, but the cockpit's live listing and change events only watch two levels.
- **Multi-ticker documents** (e.g. one cloud-infrastructure note covering AMZN, MSFT, GOOGL) are copied into every matching ticker pool, each copy with the same sidecar listing all covered tickers. Detection only targets tickers that already have a `data/<TICKER>/` pool — to route a document to a company with no pool yet, use the forced `<Provider>/<TICKER>/` layout (the router will create the pool folder).

`EXTERNAL-INBOX` is a reserved system folder (like `NEWS-ARCHIVE`): the cockpit never lists it as a company.

### 1.1 Selected data-need uploads from the cockpit

The cockpit may accept one manually found document against one exact open `data_needs[]` row. This is a
controlled variant of the inbox lane, not a second publisher:

The wire contract is `data-need-upload/1`. `POST /api/data-needs/:subject/upload?swarm=<swarm>` accepts
multipart fields `run_root`, `decision_fingerprint`, `need_id`, `series`, `provider`, optional `source_url`,
and exactly one `file`; success is HTTP 202 `{ "ok": true, "upload": <read> }`.
`GET /api/data-needs/:subject/upload-status` takes `swarm`, `runRoot`, `decisionFingerprint`, `need_id`, and
`series` and returns the raw durable `<read>` (not a wrapper). A read contains exactly the binding plus
`contract_version`, top-level `status`, and append-ordered `items`; each item exposes only `request_id`,
sanitized `filename`, `sha256`, `staged_at`, optional repo/data-relative `routed_path`, and optional generic
`reason`. It never exposes an absolute filesystem path or an internal exception.

- The request is bound to the exact `{swarm, subject, run_root, decision_fingerprint, need_id, series}` the
  server served. Before accepting it, the server re-reads both that selected decision and the bare standing
  (current) decision; historical or superseded cards cannot feed today's shared pool. It repeats this
  compare-and-set immediately before publication of the request intent.
- Exactly one sanitized, size-limited file is streamed into a hidden staging lane. The payload is moved into
  `EXTERNAL-INBOX/.data-need-requests/<request_id>/payload` first; a server-generated, HMAC-signed
  `intent.json` is written last and is the atomic commit marker. Partial envelopes, symlinks, hardlinks,
  duplicate files, bad hashes, forged intents, and request-id collisions are never routed.
- Only the durable connector writer may accept bytes or nudge the router. Before multipart parsing and again
  at the terminal compare-and-set, the server proves owner-private `~/.nostra-ops` state says exact role
  `doer`, names the local host as `connector-writer-host`, and binds canonical `pool-root` to the production
  repository's `data` symlink. The HMAC state directory/key are current-UID, unique, regular/non-symlink,
  owner-private objects. An admin/standby host returns `manual_upload_writer_unavailable` before reading a
  file and cannot mint a request the dedicated writer would be unable to verify.
- The signed intent freezes the selected identity, payload hash and size, the operator's provider label, and
  source URL context. The provider is explicitly stamped `operator_supplied_unverified`. The latest
  non-stale decision-scoped public-DNS lookup URL wins when one exists; a URL
  typed with the upload is labelled `user_supplied_unverified`. Either URL is provenance context only.
- `ingest_external.py` remains the sole publisher. It forces the signed subject and provider label and copies
  the request context into the payload's hash-bound `.source.json`, but it infers `source_type`, tier,
  license, `as_of`, and published date only from readable payload content. Provider, filename, source URL,
  selected-series prose, and desired tier can never upgrade those fields.
- The router extracts, infers from, and publishes one private hash-checked snapshot while revalidating the
  signed request inode around the operation. Destination names are bounded by UTF-8 bytes with room for the
  `.source.json` sidecar. A pre-existing sidecar is reusable only when its complete JSON value and exact
  generated bytes match the conservative sidecar; matching identity fields cannot smuggle a stronger tier,
  source type, licence, or date into a signed result.
- The router archives the exact payload + intent + signed result under
  `EXTERNAL-INBOX/_routed/.data-need-requests/<request_id>/`. That result signs the routed payload and exact
  provenance-sidecar hashes, so later mutation fails status verification. The cockpit's durable status reports
  only `staged_waiting`, `routed_provenance_verified`, `rejected_policy`, or `failed_tampered`; the top-level
  value follows the newest deterministically ordered request, not any older success. `rejected_policy` with
  `policy_rejected` means the bytes are not allowed as runtime evidence (including WILTW or an unreadable
  GOLD-sensitive visual); it is not described as tampering, and the validated prohibited payload is removed
  only after that signed terminal result is durable. No status says that a run considered the document
  or that the need was resolved. A best-effort bounded server nudge runs this same router under a retained,
  fail-closed singleton lease after staging; the ordinary timer recovers any request still waiting. A transient
  filesystem/router exception leaves the exact two-file request staged and retryable rather than manufacturing
  a terminal failure.
- A `filing_required: true` need never enters this lane. Statutory filings use the existing company
  filing/document upload path and remain subject to the ordinary filing sufficiency rules. The cockpit
  endpoint reports that limitation instead of relabelling a filing as external evidence.

## 2. What counts as external data

| `source_type` | What it is | Examples |
|---|---|---|
| `alt_data_panel` | Measured/licensed panel or dataset with a methodology, usually estimate-based | YipitData, Second Measure, M Science, SimilarWeb, Sensor Tower exports |
| `expert_call` | Expert-network call notes or transcripts | GLG / Tegus / AlphaSights call notes |
| `channel_check` | The user's own primary fieldwork | distributor conversations, store visits, supplier checks, photos |
| `broker_research` | Sell-side research documents | initiation notes, sector primers, earnings previews |
| `peer_transcript` | A COMPETITOR's own earnings-call transcript, collected to benchmark the subject (read by the `competitive-intel` module) | Capital IQ "Competitor Transcripts" exports; a peer's own earnings-call transcript |
| `vendor_export` | Paid-terminal exports beyond the standard CIQ set | specialist databases, paid screeners |
| `paid_api` | Machine-pulled data from a paid API (see §7) | a nightly KPI pull dropped as CSV/JSON |
| `official_data` | Machine-pulled raw series published by a government, regulator, official exchange, or recognized industry body | CFTC COT, NOAA climate series, CME exchange data, IAI production data |
| `management_meeting` | User's notes from management/IR access | NDR notes, AGM observations |
| `external_other` | Anything else third-party | unclassified — cite conservatively (tier 9 unless upgraded by evidence) |

## 3. The provenance sidecar — `<file>.source.json`

One JSON sidecar per routed document, written by the router (or by hand for ordinary direct drops). For ordinary documents, all fields are optional except `source_type` and absent fields degrade conservatively. A v2 connector sidecar is different: every field required by §7 must be present and exact, and a missing, unreadable, non-object, or mismatched sidecar makes its owned projection unusable.

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
  "licensing": {
    "access": "licensed",
    "use": "entitlement_required",
    "redistribution": "derived_only",
    "terms_url": "https://provider.example/terms"
  },
  "accuracy_note": "vendor backtest: AWS ±2.3pp, Azure ±4pp, GCP ±6pp at 80% confidence",
  "origin": "Cloud (AWS, Azure, GCP) | Mar-26 Update",
  "sha256": "…",
  "routed_by": "ingest_external.py",
  "routed_from": "EXTERNAL-INBOX/Cloud (AWS, Azure, GCP) _ Mar-26 Update.pdf"
}
```

- `as_of` is the DATA coverage end ("data through"), `published` the document's own date, `received` the ingestion date. These are three different dates; never conflate them. A Drive file's mtime is the SYNC date and is none of the three (fix F23) — the reading layer always confirms the as-of from inside the document.
- `license: subscriber-only` marks material that must not be republished: cite individual figures with attribution; never reproduce whole tables or pages into a memo or thesis.
- `licensing` makes machine-enforced rights separate from the human `license` label: `access` is `public | licensed | restricted | unknown`; `use` is `allowed | entitlement_required | unavailable`; `redistribution` is `allowed | derived_only | prohibited | unknown`; and `terms_url` is the provider's absolute HTTPS terms page. Carry it on an ordinary document sidecar whenever the rights are known. It is mandatory and exact for every v2 connector (§7.1).
- `accuracy_note` carries the vendor's own stated error margin / backtest where disclosed — specialists must quote it alongside any figure they lean on (§9–§10: an estimate travels with its uncertainty).

`extract_pool.py` folds each sidecar into its manifest row as `provenance` (and never lists the sidecar itself as a document), so every downstream agent sees provenance without touching the pool.

## 4. Tier mapping into CLAUDE.md §4

The §4 hierarchy is unchanged; this maps each `source_type` INTO it. The mapping refines the hierarchy, never reorders it (§4, §23).

| `source_type` | §4 tier | Cite as | Hard rules |
|---|---|---|---|
| `alt_data_panel` | 5 (data vendor) | licensed alt-data, **estimate** | Always labelled estimate-based; carry the vendor error margin where disclosed; a filing's own number beats it (§4) and is never replaced by it |
| `vendor_export`, `paid_api`, `official_data` | 5 (data-vendor / official-data band) | vendor export / API pull / official series, dated | Cite the actual provider; never relabel a vendor pull as official data or attach either to a filing citation (§5) |
| `broker_research` | 7 band (at/below decks) | broker note, verdict-stripped | Strip Rating / Target Price / "our estimate" (§24); never a source for consensus numbers (fix F19) or for any figure a primary doc carries |
| `peer_transcript` | 6 (transcript — about the NAMED peer) | peer earnings-call transcript, dated, about the peer | Tier 6 about the PEER's own company; using it to say anything about the SUBJECT is Level-1 inference (§3/§6), never a source ABOUT the subject; strip analyst questions/assertions (§24); a peer press release beats it for the peer's own numbers; read + translate non-English calls (§27). The `competitive-intel` module owns its use; it never substitutes for a filing the subject's own sufficiency rules require. |
| `expert_call`, `channel_check`, `management_meeting` | 9 (user-collected note) | user-collected primary note, dated | One person's view, not a measurement: N=1 unless the note says otherwise; can RAISE a question against filings, never override them; integrity-adverse signal escalates per §24 filter 1 |
| `external_other` | 9 | third-party, unverified | Conservative default until provenance is established |

Standing rules on top:
- **External data never substitutes a required filing.** Data sufficiency (§11) and every module's triage sufficiency rule count filings, transcripts, and decks exactly as before — an external doc is enrichment that can sharpen a call, not a unit that fills a missing-filing slot.
- **External data CAN be the edge.** Where a tier-5 panel with a stated error margin diverges from consensus, or a channel check contradicts the narrative, that is admissible §7 item-3/item-4 evidence ("what the market is missing" + "what would prove we're different") — cited at its tier, with its as-of and margin, and with the divergence quantified against the consensus data-as-of.
- **The tier ceiling is ENFORCED, not just documented (§5 masquerade guard).** `extract_pool.py` clamps any sidecar whose `tier` is more trusted than its `source_type` earns DOWN to the ceiling above, at fold time, and flags the correction (`tier_corrected`) in the manifest. A sidecar may declare a MORE conservative tier, never a more trusted one — so a mislabelled hand-drop, or an auto-built connector's fetcher whose self-reported tier is not to be trusted, can never fold a scrape / channel check / broker note into the pool stamped as a tier-5 vendor number. A missing tier is derived from the `source_type`. An **unknown / missing / typo'd `source_type`** fails CLOSED to the conservative `external_other` ceiling (tier 9) — a self-declared tier the gate cannot classify is never folded in verbatim, so an off-list `source_type` can't smuggle a filing-grade tier past it.
- **Research reports are not a hidden runtime data feed.** WILTW is permanently methodology-only: the document, its figures, and its assertions may shape question design but may never enter runtime evidence or a commodity forecast — including after rename, sidecar attachment, manual routing, or connector transformation. Other analyst, memo, and broker material may be evidence only when lawfully ingested through the ordinary sidecar, source-tier, structured-licensing, provenance, and verdict-stripping rules above. No report's figures may be copied into connector code, fixtures used as runtime data, seeds, or fallbacks. Cite the actual admissible document/provider at its tier; never cite WILTW as the source of a number.

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

## 7. External-data connectors (API, download, and manual adapter contract)

A one-off API export or downloaded report still enters through `EXTERNAL-INBOX/<Provider>/` (or directly through a subject's `external/<provider>/` folder with a sidecar), one source artifact per pull and the source `as_of` inside the file. A recurring source becomes a file-writing connector, whether its acquisition is an official API, a keyed or paid API, an allowed scrape, or an explicit operator download. Keys live in `~/.config/nostra-engine/providers.env` (never in the repo, §28). Every route produces ordinary pool files; adding a source never requires engine-specific wiring (§26).

A connector is the standing adapter. `.claude/connectors/<id>/` holds a `connector.json` manifest, a `fetch.py`, its offline `test_*.py`, and any fixed parser fixture, all discovered generically by glob. The runner (`.claude/tools/run_connectors.py`, launched every 15 minutes) decides from the manifest's release clock and persisted last-attempt time whether the next observation is due, and appends every connector × subject decision to `data/_connectors/run_ledger.ndjson`. Fifteen minutes is the scheduler floor, not every feed's fetch cadence: current slower series are no-op sweeps and a due-but-recently-checked slow source is deferred without another request. This serial evidence-connector lane deliberately starts at `twelve_hourly`; live market prices stay on the existing quote infrastructure, which has its own scheduler. The failure contract is fail-closed: a failed fetch advances no visible canonical data, the cockpit shows the exact health state, and the same ledger drives repair. Whatever a connector produces still passes the §4 tier clamp, structured licensing gate, and projection-integrity check before an agent can read it.

### 7.1 Connector manifest v2 — the one machine-readable contract

`frameworks/connector.schema.json` is the canonical production schema. A v2 manifest is closed: an unknown field, a missing required field, an invalid enum, or a mismatch between linked identity and contract fields makes the connector undiscoverable. The Python runner and the TypeScript registry both read that artifact and add the same fail-closed semantic checks. Production discovery rejects version 1; its parser remains only for explicit historical unit tests and is not a migration bridge.

The identity fields are deliberately separate:

- `id` is the stable code-package identity and must equal the directory name.
- `dataset_id` identifies the provider's dataset. `series_id` identifies the economic measurement across providers. `series` is only the human-readable label. Renaming a label must not silently create a new series, and a source replacement must not silently inherit another provider's dataset identity.
- `schema_version` records an intentional output-contract change. `satisfies[]` carries the exact data-need IDs the feed closes, and `subjects[]` is the explicit set of pools it may enter.
- `provider`, `authority_class`, `acquisition`, `source_type`, `tier`, `license`, and `licensing` are different facts. `official_data` is the shared ingestion ontology for first-party government, regulator, exchange, and industry-body datasets; `authority_class` preserves which of those authorities actually published the series (`government_official`, `exchange_official`, `industry_body_official`, `court_record_aggregator`, `licensed_vendor`, `news_aggregator`, or `other`). Neither field lets a connector outrank §4 or bypass the extract-time tier ceiling. `provider_priority` is selection metadata, not an evidence-quality score.

Coverage is unambiguous. There must be exactly one primary connector for each `(subject, series_id)`. Another provider is admitted only as an explicit `fallback_for` that primary, with a different `provider` and `dataset_id`; priorities within the coverage group must be unique. A collision, an orphan fallback, or an invalid primary fails the affected coverage closed. Directory order is never a provider-selection rule.

The human `license` string and structured `licensing` object are both required. The object contains exactly `access`, `use`, `redistribution`, and an absolute HTTPS `terms_url`, using the enums in §3. `use: unavailable` forbids runtime publication. `access: unknown` fails closed to an explicit manual connector. `use: entitlement_required` requires declared credential names or explicit manual ingest. The staged sidecar must carry the exact `license` and `licensing` values. The publisher then freezes the full evidence contract — authority, acquisition, source type, tier, human license, and structured rights — into every vintage and `current`, while exact sidecar evidence/licensing travels in its provenance; a later manifest edit cannot rewrite what rights or evidence quality applied when bytes were accepted.

The release contract is exact, not a descriptive note. For v2, cadence exists **only** inside `release`; there is no flat cadence or separate staleness field. `release` contains `cadence`, a valid IANA `timezone`, `expected_lag_days`, `grace_days`, and `revision_policy` (`revisable` or `append_only`), plus optional `active_months` for a genuinely seasonal calendar feed. Cadence is one of `twelve_hourly`, `daily`, `weekly`, `monthly`, `quarterly`, `semiannual`, `annual`, or `event_driven`. `active_months` is a sorted unique list of calendar months from 1 through 12 and is allowed only on a daily, weekly, monthly, quarterly, semiannual, or annual feed. `realtime` is intentionally not an evidence-connector cadence: the batch runner cannot honestly guarantee a 15-minute observation under network failure, so current market prices use the separate quote infrastructure.

For calendar cadences, the runner advances the source `as_of` by the declared period in the declared timezone, skips periods whose month is outside `active_months` when that optional calendar is present, then adds `expected_lag_days` to find when the next release is due and `grace_days` to find the end of its allowed arrival window. The point-in-time reader and commodity coverage gate use that same frozen calendar: an in-season weekly crop report remains valid through the off-season, but becomes due and can become stale when the next reporting season opens. Monthly, quarterly, semiannual, and annual periods advance by calendar months, not a fixed day approximation. `twelve_hourly` feeds use the accepted retrieval time as their clock anchor, then apply expected lag and grace separately. An `event_driven` feed has no knowable next source period: `expected_lag_days` is zero and `grace_days` is its recheck interval from the accepted retrieval, not a claim about when an event will occur or a second arrival window. The observation's `as_of` comes from the source data and cannot lie after the actual retrieval date in the release timezone. `retrieved_at` is stamped in UTC when the production fetch actually completes — never from a filename mtime, the scheduler's nominal start time, or an operator-supplied historical clock.

`output_schema` is the compact, closed payload contract. Explicit object shapes reject extra fields; arrays contain one item schema; supported scalar tokens include `string`, `date`, `datetime`, `YYYY-MM`, `int`, `float`, `bool`, `object`, enums, and their allowed nullable forms. An open, genuinely dynamic map is declared as `object`, not disguised as a closed shape. `units` must name every numeric schema path and no non-numeric path: use `[]` for array items and `.*` for a dynamic numeric map. The unit is the measurement actually emitted — for example `contracts`, `lots`, `kilotonnes`, `degrees_celsius`, `percent`, `days`, or `dimensionless` — not a convenient label. `minimum_history.observations` and its optional dotted `path` state the minimum history the payload must carry; a short history is `suspect`, not silently accepted.

### 7.2 Network, credentials, and manual sources

`host_allowlist` contains unique, exact, public-DNS bare hostnames. No IP literal, localhost, wildcard, or implicit subdomain is allowed: permission for `example.com` does not imply permission for `api.example.com`. Every source URL in the payload and staged provenance must be absolute **HTTPS** on the standard HTTPS origin port, contain no embedded username or password, and resolve to an exact allowed host; every payload URL must also appear in the sidecar. A local manual file is an ephemeral runner-attested input, never a durable source locator: `file:` URLs are forbidden in payloads and provenance. The fetcher must enforce the same boundary before and after every redirect. On an allowed cross-host redirect it retains only `Accept`, `Accept-Language`, and `User-Agent`; bearer, cookie, custom-token, and all other caller headers are stripped. An HTTP endpoint, nonstandard port, redirect, or host move does not authorize an exception by implication.

`credential_env` lists environment-variable NAMES, never values, and every name must use the `CONNECTOR_*` prefix. `~/.config/nostra-engine/providers.env` is the sole persisted source for connector credentials (§28): connector secrets must not be embedded in or carried forward through launchd plists. For an operator-run invocation, an explicitly supplied process-environment value may override the file for that one invocation. The runner otherwise parses only the declared missing names from `providers.env` without sourcing shell code, checks that every declared credential exists before starting the connector, reports `credentials_missing` with zero fetch attempts if one is absent, and gives the child only the small runtime environment plus those declared names. An undeclared ambient secret is not available to connector code. Declared values and their URL-encoded forms are redacted from persisted failures. Tests, logs, payloads, sidecars, outcome files, and PR text must never contain a credential value.

A source that requires an operator download is still governed by the same contract. It declares all three together: `acquisition: "manual"`, `manual: true`, and `manual_ingest.file_arg` (for example `--from-file`). It is never invoked by an automatic sweep. The operator seals a supplied file through the runner, not by copying transformed output into the pool:

```text
python3 .claude/tools/run_connectors.py --only <connector-id> --subject <SUBJECT> --manual-file <downloaded-file>
```

The runner snapshots and hashes the local bytes, passes that snapshot with the manifest's declared argument, and applies the same staging, schema, provenance, history, hash, and publication gates as an automatic pull. The publisher freezes the attestation under `manual_input`; the staged sidecar must cite the lawful official HTTPS source page and may not persist the local path or any `file:` URL. "Manual" changes acquisition, not evidence quality or integrity.

### 7.3 Stage first; publish only validated bytes

The connector process is a transformer, not the publisher. It accepts `--subject` and the runner-supplied `--data-root`, writes exactly one regular, non-symlink payload matching `output_path` plus its one regular `<payload>.source.json`, and writes no other file or directory in the isolated stage. It never writes `data/_connectors/` itself. `--verify` proves acquisition and parsing while writing nothing. A pure transform is kept separate from I/O so the offline test can exercise the real parser against a fixed fixture.

For each attempt, the runner gives the connector an isolated directory on local ephemeral storage, outside the published or synced `data/` pool. Unvalidated bytes — especially a payload that accidentally contains a credential — therefore never enter Google Drive before quarantine. Before anything becomes readable, the shared validator proves all of the following:

- the manifest satisfies the canonical v2 schema and its semantic invariants;
- the payload is valid JSON, matches the closed `output_schema`, carries the manifest's exact `series`, and has an `as_of` equal to the date in the one staged filename and no later than the real retrieval date in the release timezone;
- every numeric value is covered by the declared unit contract, the minimum-history rule passes, and dated history rows are unique and monotonic;
- the sidecar is valid JSON whose `provider`, `source_type`, `tier`, `license`, `licensing`, `connector_id`, `dataset_id`, `series_id`, `schema_version`, and `as_of` exactly match the manifest and payload, and whose source URLs obey the automatic-HTTPS/manual-file rule above; and
- the requested subject is inside the manifest's declared coverage.

A non-zero exit, timeout, missing output, multiple outputs, malformed JSON, schema drift, missing or contradictory provenance, short history, or host mismatch publishes no visible data. Failed staging directories are removed. Schema/provenance defects report `schema_failed`; a short-history or cross-provider quality conflict reports `suspect`; a broken canonical chain reports `quarantined`. In the older sentence above, "writes NOTHING" means **nothing crosses the visibility boundary**: a crash can leave a write-once, unreferenced blob or vintage for forensics, but no reader may treat it as committed.

### 7.4 Immutable publication and recoverable pool projection

Production publication first proves which code produced the bytes. `connector_fingerprint` recursively hashes every regular connector file as its sorted POSIX relative path plus bytes, including hidden files and any sourceless bytecode outside generated cache folders; only generated `__pycache__/` trees are excluded. Symlinks and other special files are rejected. The cleanliness gate compares that same exact connector tree with `HEAD`, so modified, deleted, or untracked helpers cannot execute outside the recorded fingerprint. `publisher_contract_fingerprint` hashes `frameworks/connector-publisher-files.json` itself and then each shared publisher file by relative path and bytes in the list's declared order; changing the order changes the contract fingerprint. The production gate requires every connector and publisher-contract file to be tracked in `HEAD` and clean relative to it, requires the checked-out branch to be `main`, requires `HEAD` to equal local `refs/heads/main`, and requires it to equal a resolvable `origin/main` commit. A missing, dangling, or non-commit `origin/main` fails closed; the runner never treats an unknown remote state as reproducible. A dirty, untracked, detached, branch-divergent, or publisher-divergent state is `unreproducible_code`: it is quarantined before the connector process runs. The deployed commit and both fingerprints are frozen into the accepted vintage/current/ledger identity, and readiness must match them exactly.

The first shipped on-disk commit protocol is `commit_protocol_version: 1`. Validated JSON is canonicalized, hashed, and published through five canonical record types:

```text
data/_connectors/blobs/sha256/<first-2>/<content-sha256>.json
data/_connectors/vintages/<dataset_id>/<series_id>/<SUBJECT>/<retrieved-at>_<content-sha256>.json
data/_connectors/commits/<dataset_id>/<series_id>/<SUBJECT>/<vintage-metadata-sha256>.json
data/_connectors/committed_heads/<dataset_id>/<series_id>/<SUBJECT>/<20-digit-sequence>.json
data/_connectors/current/<dataset_id>/<series_id>/<SUBJECT>.json
```

The blob is content-addressed and write-once, so identical payload bytes reuse one blob. Every accepted retrieval still receives a distinct write-once vintage: retrieval time is evidence of when the engine re-observed the source, even when the payload hash did not change. A vintage freezes the stable identities, provider role and priority, complete evidence/licensing contract, release clock, output schema, units, minimum history, source `as_of`, actual `retrieved_at`, payload hash, connector and ordered-publisher fingerprints, deployed commit, provenance, and blob path.

Each vintage has a first-class `vintage_id` of the form `sha256:<64 lowercase hex>`. It is the hash of the canonical complete vintage with only the two recursive copies of `vintage_id` omitted — the top-level field and `provenance.vintage_id`. After calculation, the same ID is copied into both places. `content_sha256` identifies reusable payload bytes; `vintage_id` identifies one accepted retrieval and its frozen evidence context. When changed bytes revise the immediately prior vintage at the same `as_of`, `revision_of` points to that prior **vintage ID**, never merely its content hash. A regressing `as_of` is rejected; an append-only series also rejects changed bytes for an already accepted `as_of`.

History is linked one retrieval at a time, with O(1) work per publish instead of rewriting a growing list. The receipt stores the new sequence, vintage path/metadata hash/ID, content hash and retrieval time, its `prior_head`, and a rolling `chain_sha256`. The new head is `{sequence, path, metadata_sha256, chain_sha256}`; `current` stores only `committed_count` and that `committed_head`, while embedding the complete latest vintage. A full point-in-time audit follows `prior_head` backward and verifies each link.

The write order is strict: blob → vintage → linked receipt → immutable sequence marker → atomic `current` advance → pool projection. The zero-padded, 20-digit marker is a write-once create-if-absent claim on that dataset/series/subject sequence. It is written **before** `current`; the publisher then proves the prior current bytes did not change before swapping the pointer. Competing writers cannot overwrite the same marker with different bytes. A marker without its matching current advance is not ignored as a harmless partial: the old head sees an unexpected next marker (or a missing-current scan finds committed markers), so publication and reads fail closed for repair. Conversely, unclaimed forensic artifacts never become point-in-time history merely because files exist.

Only after `current` advances does the runner materialize the familiar `data/<SUBJECT>/external/<provider>/...` payload and sidecar. That pair is a **projection**, not the system of record. `extract_pool.py` resolves its unique owning v2 manifest, verifies the canonical current/head/receipt/marker/vintage/blob plus the live connector and publisher fingerprints, requires the projected sidecar to equal `current.provenance` exactly, and proves the projected payload/sidecar are the verified current projection. A v2-looking sidecar with no owner, a partial pair, or any mismatch fails extraction. When the canonical chain and deployed fingerprints remain valid, a missing or damaged projection can be rebuilt from the sealed blob without a network fetch; canonical or code-contract drift is quarantined and requires a real refetch or manual re-ingest.

An accepted unchanged pull advances the linked retrieval history with a new vintage and reuses the existing content-addressed blob; while the retrieval is inside its release window, its public outcome is `no_new_release`. Changed content publishes another vintage; a same-`as_of` change is linked as a revision only when `revision_policy` is `revisable`. The first stored observation is labelled `first_observed_vintage`, even when its payload contains older observations: the engine did not possess those bytes at their historical dates. Every later accepted retrieval — changed or unchanged — is a `true_point_in_time` vintage.

### 7.5 Point-in-time reads and fallback disagreement

Use `scripts/connector_vintages.py` for a point-in-time read. Its cutoff is `retrieved_at` — what the engine could actually have known — not source `as_of`, a file mtime, or today's manifest. Current health verifies the linked head in O(1); a historical read walks the receipt chain backward, verifies every sequence marker, receipt hash, vintage ID, path boundary and blob, and then returns only vintages retrieved by the cutoff and still eligible under the release clock frozen in that vintage. Provider role, priority, evidence rights, and release timing therefore come from immutable history; editing a manifest today cannot rewrite yesterday's source choice. `resolve_vintage_id(...)` performs the same full audit before resolving one stable `sha256:...` vintage reference.

The reader chooses one complete eligible provider vintage. It never fills missing rows from another provider and never splices two histories. It uses the primary when an eligible primary vintage exists; otherwise it may choose one explicitly declared fallback by its persisted priority. If more than one primary exists, the provider configuration is `suspect`. If eligible providers publish the same `as_of` but differ after provenance-only fields are removed, the result is structured as `usable: false`, `health: "suspect"`, with each provider, priority, and content hash named. The runner writes `failure_kind: "provider_disagreement"` to the shared ledger. The selected payload may remain visible for diagnosis, but it must not support conviction until the disagreement is resolved.

### 7.6 One health ledger and a closed repair lifecycle

`data/_connectors/run_ledger.ndjson` is the append-only truth for each connector × subject. The runner writes a closed decision/outcome pair; malformed or impossible pairs are ignored rather than allowed to erase the last valid state. Public outcomes are:

- `current` and `no_new_release`: usable inside the manifest's calculated release-arrival window;
- `stalled`: no usable advance by the end of that release window after an attempted fetch;
- `schema_failed`: fetched bytes failed the data/provenance contract;
- `suspect`: the bytes fail a quality or provider-agreement gate;
- `credentials_missing`: a declared key was absent, so no connector process ran;
- `quarantined`: canonical integrity, publisher-code provenance, licensing, projection, or append-only history would be unsafe to trust;
- `manual`, `no_pool`, and `pending`: intentionally not auto-fetched, no subject pool exists, or only a dry-run decision exists; and
- `broken`: the derived state after three consecutive escalating failed sweeps (the connector already retries within each sweep).

`credentials_missing`, `suspect`, and `quarantined` do not spend the generic failure streak: each calls for credentials, evidence reconciliation, or integrity investigation rather than blind code churn. Other failed sweeps become `broken` only after the shared threshold. The watchdog records that state and keeps it visible; a repair must preserve the same stable identities, output meaning, units, release/history policy, evidence/licensing contract, ordered publisher contract, exact-HTTPS-host boundary, and fail-closed behavior. A source that is truly gone is recorded as `source_gone`; data is never fabricated and an incompatible replacement is not smuggled in under the old IDs.

Automatic connector-writing and repair agents are deliberately unavailable in this runtime. A privileged coding agent cannot be contained by prompt instructions, a one-time DNS check, or an operator-set environment assertion; activation requires a separately reviewed OS-, container-, or VM-enforced egress boundary. The cadence fetch runner remains active and continues to update health and the repair ledger. Until an enforceable isolated runner ships, the supported build and repair route is a human-authored `codex/...` branch followed by PR, CI, adversarial review, merge, and a real post-merge refetch. No configuration flag can bypass this boundary.

A repair PR is not proof of recovery. Whether opened manually or, after an isolated runner exists, automatically, it becomes `verified` only after the PR is merged, its merge commit is an ancestor of the deployed commit, and a later real staged `refetched` decision for the affected subject returns `current` or `no_new_release` with a changed connector fingerprint. A later `fresh` row did not execute the repaired code and cannot close the lifecycle. A PR closed without merge releases the repair lock as `assessed`; a merged repair that is still broken after deployment also releases it for another honest attempt. The cockpit, readiness gate, and watchdog all consume this same registry, canonical binding, run ledger, and subject-scoped repair ledger — there is no parallel health truth to drift.

## 7A. The market price feed — `data/_market/` (cross-cutting reference series)

Most external data is ticker-scoped (`data/<TICKER>/external/`). The **market price feed** is not: it is
a shared reference series — index / sector / stock daily closes — that the calibration scoreboard reads
to score calls on a **benchmark-adjusted** basis (a long that merely rode a rising market is not skill,
CLAUDE.md §9) and to anchor a **review / tracking price** for a null-entry call. So it lives once, under
`data/_market/<Provider>/`, on the same §7 file-drop contract (a fetcher WRITES FILES; no engine wiring,
no live engine API call).

- **Format:** long-format CSV, required header fields `date,symbol,close` with optional `volume` (ISO date;
  symbol = index/sector/stock; close = float in the symbol's own currency), one row per `(symbol, date)`.
  An optional `_symbols.json` maps a symbol to `{kind, benchmark, sector, beta}` to enable beta-adjusted
  excess (absent → beta 1.0). The qualified-idea outcome loop additionally requires explicit `exchange`,
  `currency`, and `price_basis: "split_adjusted"`; it never guesses whether a bare close series was adjusted.
  The full contract, with examples, is in `frameworks/MARKET_FEED.md` (kept in `frameworks/`, not under the
  gitignored `data/` pool, so the pool tree carries no tracked files — see that doc's header).
- **The as-of is the latest date IN the data**, never a file mtime (§8 / fix F23).
- **Readers:** `scripts/market_prices.py` (pure, read-only — `close_on`, `total_return`,
  `beta_adjusted_excess` returning BOTH the raw and the beta-adjusted figure). `scripts/calibrate.py`
  reports feed presence and the return basis; `/research:review-decisions` may use
  `close_dated_sourced_on` — which returns `(close, as_of_date, source_provider)` — to establish an
  append-only `tracking_price` for a call whose pool had no price, so the anchor carries its `source`
  and `as_of` (use it, not the bare `close_on`, which returns only the price and would leave the
  required provenance fields unfilled).
- **Graceful absence:** until a feed lands, `market_prices` is `unavailable()` and calibrate falls back
  to the review-time benchmark-relative return each review already computed — and says so. Nothing breaks.

## 8. Hard rules (recap)

- No source = no claim (§3). An external figure cites provider + date + where in the document, like any other source.
- Estimates are labelled estimates, with the vendor's error margin where disclosed (§9–§10).
- A filing beats external data at equal coverage (§4); when an external source contradicts a filing, surface the conflict — the conservative reading wins until primary evidence resolves it.
- Verdict-bearing broker material is stripped per §24 before use.
- `license: subscriber-only` or `licensing.redistribution: derived_only | prohibited` material: cite only what the recorded rights allow; never republish tables/pages. A human label cannot loosen the structured block.
- WILTW remains methodology-only under every filename and provenance route and can never become runtime or GOLD-forecast evidence. Other lawfully held reports may enter only through ordinary ingestion with their real source, tier, licensing, provenance, and any required verdict stripping.
- The as-of comes from inside the document, never from file mtime (fix F23).
- A failed extraction is missing data (fix F03); a non-English external doc is NOT (§27).
