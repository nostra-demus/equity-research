# Permanent Memory Architecture Plan

**Status:** Phase 0 and the read-only foundation slice are implemented; Phases 2–6 remain planned

**Date:** 2026-08-20

**Decision:** extend the repositories and ledgers that already exist; do not add a second, opaque "AI memory" system

## Implementation status (2026-08-21)

The repository now includes the first reversible implementation slice described below:

- a machine-readable inventory, four architecture decisions, 63 held-out questions, and a
  deterministic folder/literal-retrieval baseline;
- closed event, source, evidence-span, claim, relationship, and identity-registry contracts;
- lossless read-only adapters over the current equity, commodity, and screener memory stores;
- a deterministic disposable SQLite/FTS projection plus validation, query, and doctor commands; and
- append-only, provenance, temporal, access-control, locator-resolution, and rebuild tests wired into
  CI.

The implemented append-only guard deliberately narrows the immutable Git event lane to
`public`/`internal` events with `permanent` retention. Protected, expiring, and deletion-tombstone
records cannot be committed into an undeletable history; they require the policy-partitioned,
purgeable event/object lane planned for Phase 2.

This foundation is opt-in and read-only: it does not alter historical artifacts or current readers.
It does not yet implement the Phase 2 object-store ingest path, hybrid/vector retrieval, context
packets, controlled canonical writes, remote serving infrastructure, or automated memory-driven
rating changes. Live corpus counts are reported by `python3 scripts/memory.py doctor --root .`; counts
in this plan are dated observations. The separate Phase 0 adapter baseline is a reviewed lower bound
that prevents accidental corpus shrink while allowing new sources and events to increase counts.

## Executive decision

The best permanent memory for this engine is **not a vector database and not a longer prompt**. It is an auditable, versioned evidence and decision system with several projections:

1. an immutable, content-addressed source layer;
2. append-only events for facts, claims, decisions, forecasts, reviews, and corrections;
3. a typed temporal knowledge graph connecting every conclusion to its evidence and every later correction to the conclusion it supersedes;
4. deterministic current-state and calibration projections;
5. hybrid retrieval (structured filters + lexical search + embeddings + graph traversal), followed by evidence-aware reranking;
6. a small, explicitly generated context packet for each agent; and
7. merge-time contracts that make the memory portable across Claude, Codex, other agents, and humans.

Git remains the durable system of record for reviewed schemas, doctrine, and compact permanent
public/internal records. Large sources and every protected or expiring content record live in a
policy-partitioned, content-addressed object/event store whose objects are immutable while retained
but can be purged when policy requires. A rebuildable database serves search and graph queries, but
is never the sole holder of truth. **If the database disappears, the engine must be reconstructable
from the authorized live canonical objects, purgeable event checkpoints, and Git event log.**

This is an evolutionary design. The repository already contains much of the difficult foundation: frozen decision records, append-only corrections and reviews, forecast ledgers, deterministic ledger resolution, provenance sidecars, evidence graphs, calibration output, transaction-safe NDJSON appends, projection manifests, and Git/PR governance. The missing piece is a common memory envelope and index across those islands.

## What “world-class” means here

Permanent means more than “stored forever.” The system must preserve:

- **Identity:** the same issuer, security, metric, claim, source, and forecast have stable IDs across runs and authors.
- **Time:** every record distinguishes when the fact was true (`valid_time`) from when the engine learned or recorded it (`system_time`).
- **Lineage:** a conclusion identifies the exact source bytes, locator, extraction, transformation, agent/run, model/tool version, and upstream claims that produced it.
- **Original meaning:** qualifiers, units, accounting basis, period, scope, source tier, and uncertainty cannot fall off when a claim is summarized.
- **Contradiction:** conflicting claims coexist and are adjudicated; the losing claim is not deleted.
- **Reproducibility:** a commit plus pinned object hashes can reconstruct the context used for a decision.
- **Correction without hindsight:** originals remain frozen; later records supersede or correct them explicitly.
- **Portability:** the write contract is JSON/JSONL plus schemas and ordinary commands, not a vendor-specific conversation store.
- **Selective recall:** agents retrieve the smallest sufficient evidence packet rather than receiving all history.
- **Measured usefulness:** memory is evaluated on answer correctness, citation fidelity, temporal reasoning, contradiction recovery, and investment calibration—not retrieval similarity alone.

## Research basis

The design combines findings from several established lines of work rather than treating one paper as a complete architecture:

- **Memory streams, reflection, and planning:** *Generative Agents* separates a raw experience stream from higher-order reflections and retrieves using relevance, recency, and importance. That supports separate episodic events and synthesized knowledge, but its in-simulation memory is not an audit or provenance system ([Park et al., 2023](https://arxiv.org/abs/2304.03442)).
- **Tiered context management:** *MemGPT* treats the prompt window like scarce working memory backed by external storage. That supports an explicit working-context compiler rather than copying the permanent store into prompts ([Packer et al., 2023](https://arxiv.org/abs/2310.08560)).
- **Longitudinal evaluation:** *LongMemEval* tests information extraction, multi-session reasoning, temporal reasoning, knowledge updates, and abstention over long histories. These capabilities should become acceptance tests, not presumed benefits of adding embeddings ([Wu et al., 2024](https://arxiv.org/abs/2410.10813)).
- **Provenance as a graph:** W3C PROV models entities, activities, and agents and relations such as derivation and attribution. Its core vocabulary maps cleanly to source artifacts, extraction activities, and human/agent authorship ([W3C PROV Overview](https://www.w3.org/TR/prov-overview/)).
- **Content-addressed durability:** Git demonstrates durable immutable objects named by content and connected into trees and commits. The memory should use the same principle for raw source bytes and derived artifacts, even when large objects reside outside Git ([Git object model](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects)).
- **Trace correlation:** OpenTelemetry’s trace/span model provides a vendor-neutral way to correlate a run across agents and tools. Trace IDs are operational lineage, not semantic evidence, but they connect the two ([OpenTelemetry Trace API](https://opentelemetry.io/docs/specs/otel/trace/api/)).

These sources motivate components; they do not prove that any particular database product will improve investment outcomes. That must be established by the evaluation programme below.

## Current-state audit

### Strong foundations to retain

| Existing capability | Where it exists | Reuse decision |
|---|---|---|
| Frozen investment decisions and forecast ledger | `frameworks/DECISION_LEDGER.md`, `analyses/*/decision_record.json` | Keep as the authoritative decision-memory contract. |
| Append-only correction and supersession | `frameworks/DECISION_LEDGER.md` §4a, `scripts/ledger_records.py` | Generalize the pattern; never replace it with mutable rows. |
| Outcome reviews and memo deltas | `analyses/*/reviews/`, `/research:review-decisions` | Treat as outcome episodes linked to the original decision. |
| Deterministic calibration feedback | `/research:calibrate`, `analyses/performance/`, `scripts/eval.py` | Preserve as a derived projection; feed it typed resolved forecasts. |
| Evidence-link graph for commodities | `frameworks/commodity/signal_evidence.schema.json`, `scripts/commodity_evidence_links.py` | Promote the useful graph primitives into a cross-engine claim/evidence schema. |
| External-source provenance | `frameworks/EXTERNAL_DATA.md` and provenance sidecars | Reuse its source hierarchy and licensing restrictions. |
| Safe concurrent event writes | `scripts/append-ndjson.sh` | Retain for local append-only logs until a transactional service is justified. |
| Immutable projection binding | `scripts/create_idea_projection_manifest.py` | Extend content hashes to context packets and source objects. |
| Screener thesis, idea, event, conviction, and feedback ledgers | `screener/ledger/**` and `frameworks/screener/*.schema.json` | Map—not rewrite—them into the common envelope. |
| Self-describing modules and swarms | Constitution §26 and agent manifests | Discover memory namespaces and producers rather than hardcoding module names. |
| Code/data governance | Constitution §28 and `CONTRIBUTING.md` | Keep schemas/migrations behind PR review and research events in the controlled data stream. |

### Concrete inventory observed on 2026-08-20

- The repository contains **15** equity `decision_record.json` files and **10** JSON review artifacts under equity run review folders.
- It contains **three dated calibration-summary JSON files** under `analyses/performance/` (plus other performance outputs).
- The tracked research corpus is already material: approximately **79 MiB** in `analyses/`, **254 MiB** in `screener/`, and **1.4 MiB** in `commodity/` in this checkout.
- Research memory is distributed across Markdown, JSON, JSONL/NDJSON, source pools, run metadata, indexes, review files, correction sidecars, and generated site projections.

These are repository observations, not claims about production storage or untracked external data.

### Gaps that prevent permanent cross-agent memory

1. **No universal identity layer.** Ticker and folder names are not enough for issuer changes, multiple listings, ADRs, mergers, metric aliases, or the same claim repeated across runs.
2. **No common record envelope.** Research decisions, screener theses, source evidence, and commodity signals use different otherwise-useful schemas without shared event identity, producer, time, lineage, and supersession fields.
3. **No bitemporal model.** “Published at,” “effective for,” “observed at,” “recorded at,” and “corrected at” are not uniformly represented, so point-in-time reconstruction is fragile.
4. **Claim-level provenance is uneven.** File citations are strong doctrine, but a machine cannot always travel from a final sentence through intermediate summaries to exact source bytes.
5. **Retrieval is folder- and command-centric.** There is no single query contract for “what did we know on date X?”, “show unresolved contradictions,” or “retrieve only audited evidence for this metric.”
6. **Memory quality is not separately measured.** Forecast calibration exists, but there is no benchmark for recall precision, stale-memory leakage, qualifier preservation, or correct abstention.
7. **No explicit retention/security classes.** Licensed external data, personal notes, public filings, and generated summaries need different access, encryption, expiry, and embedding rules.
8. **Derived indexes lack one rebuild contract.** A future vector or graph database could quietly become a second source of truth unless reconstruction and deletion semantics are fixed first.

## Target architecture

```text
Sources / tools / human notes / market data
                    |
                    v
       [1. Immutable object + provenance intake]
          bytes by SHA-256; licence/access policy
                    |
                    v
       [2. Append-only canonical event log]
   source | extraction | claim | decision | outcome | correction
                    |
                    v
       [3. Deterministic validation + normalization]
 IDs, units, time, schema, citations, qualifiers, contradictions
                    |
           +--------+---------+
           |                  |
           v                  v
 [4. Temporal graph]   [5. Search projections]
 relations/lineage      SQL + FTS + vectors
           +---------+--------+
                     v
       [6. Evidence-aware retrieval service]
 ACL -> filters -> hybrid candidates -> graph expansion -> rerank
                     |
                     v
       [7. Versioned context packet compiler]
 task facts + evidence + conflicts + prior decisions + open forecasts
                     |
                     v
          Claude / Codex / human / other agent
                     |
                     v
       New append-only claims, decisions, reviews, and feedback
```

### 1. Canonical event envelope

Every new machine-readable memory record should carry a shared envelope while retaining its domain payload:

```json
{
  "schema": "memory-event/v1",
  "event_id": "evt_<uuidv7>",
  "event_type": "claim.asserted",
  "subject_ids": ["issuer:lei:...", "security:figi:..."],
  "valid_time": {"from": "2026-06-30", "to": null},
  "system_time": "2026-08-20T14:03:00Z",
  "producer": {
    "kind": "agent",
    "name": "earnings-historical-financials",
    "runtime": "codex",
    "model": "recorded-by-adapter",
    "prompt_program_sha": "git:<sha>"
  },
  "run_id": "run_<uuidv7>",
  "trace_id": "<otel-trace-id>",
  "payload": {},
  "evidence_refs": ["evidence:sha256:<digest>#locator"],
  "derived_from": ["evt_<uuidv7>"],
  "supersedes": [],
  "integrity": {"payload_sha256": "<digest>", "signature": null},
  "policy": {"classification": "public", "retention": "permanent", "retain_until": null}
}
```

`event_id` identifies the assertion event; it is never reused. Domain IDs identify the enduring thing. Content hashes identify exact bytes. These three identities must not be conflated.

### 2. Typed domain records

The envelope carries one of a small number of versioned payloads:

- **Source:** document identity, issuer, source tier, publication/filing/effective dates, language, licence, URI, byte hash, MIME type, and extraction status.
- **Evidence span:** source hash plus page/section/table/cell/character locator, verbatim text or value, extraction method, and extraction confidence.
- **Claim:** subject–predicate–object/value, units, currency, accounting standard, period, consolidation/segment scope, qualifier, epistemic status, claim-quality level, and evidence spans.
- **Relationship:** typed edges such as `supports`, `contradicts`, `qualifies`, `derived_from`, `supersedes`, `same_as`, `about`, and `resolved_by`.
- **Decision/forecast:** preserve the current decision-ledger payload and add stable IDs and event links; do not redesign proven fields.
- **Outcome/review:** realized observation, scoring rule, review author, error taxonomy, and links to the exact forecast version.
- **Policy/definition:** canonical metric definitions, source hierarchy, module rules, and schema versions, pinned to the Git commit active for the run.
- **Feedback:** human or machine correction, accept/reject disposition, reason, and the record changed in the next projection.

Free-form narrative remains valuable, but it is a **view over typed claims**, not the only stored representation of the facts it contains.

### 3. Temporal and correction semantics

Use a bitemporal discipline:

- `valid_time`: when the statement applies in the world (for example FY26 or the tenure of a director);
- `system_time`: when the engine first recorded that version.

Never update history in place. A correction appends a new event with `supersedes`; current-state views select the latest valid, authorized event. Point-in-time queries use both clocks. Late-arriving filings therefore improve today’s view without pretending the engine knew them earlier.

For a claim conflict, preserve both claims and append an adjudication event containing:

- the claims compared;
- whether the conflict is definitional, period, scope, extraction, source, or genuine;
- the winning or unresolved status;
- the source-hierarchy rationale; and
- the reviewer and timestamp.

“Unresolved” is a first-class result. Retrieval must show it, not pick the claim with the highest vector score.

### 4. Storage boundaries

| Layer | Recommended role | Authority |
|---|---|---|
| Git | Schemas, migrations, doctrine, manifests, tests, and compact `public`/`internal` events with `permanent` retention | Authoritative immutable lane; CI rejects protected or purgeable content |
| Policy-partitioned content-addressed object/event store | PDFs, images, transcripts, large raw pulls, OCR artifacts, and all licensed/restricted/confidential/expiring records; objects are immutable while retained and physically purgeable | Authoritative live bytes and protected event checkpoints, named by SHA-256 and governed by entitlement/retention |
| Relational store (initially SQLite locally; PostgreSQL when concurrent service use warrants it) | IDs, temporal records, permissions, joins, current-state materializations, full-text indexes | Rebuildable projection |
| Vector index | Semantic candidates over approved evidence spans and claims | Rebuildable, non-authoritative projection |
| Graph projection | Multi-hop lineage, contradiction, entity, and thesis dependencies | Rebuildable; relational edges first, dedicated graph engine only if measured need arises |
| Cache | Context packets and hot queries keyed by all inputs and schema/model versions | Disposable |

Do **not** begin with a graph database or vector vendor. Define canonical events and build a reference projection first. Product choice follows measured scale and query needs.

### 5. Retrieval and context compilation

A query must declare:

- task and requesting module;
- subject/security IDs;
- as-of system time and valid-time window;
- permitted source tiers and classifications;
- reporting basis, currency, metric, and segment where relevant;
- desired record types and maximum token budget.

Retrieval then proceeds in this order:

1. enforce access/licence policy before search;
2. resolve entity IDs and temporal filters;
3. generate candidates independently from exact/structured lookup, lexical search, and embeddings;
4. union and deduplicate by stable claim/evidence ID;
5. expand only relevant graph neighbors (source, qualifiers, contradictions, supersession, upstream build);
6. rerank for task relevance, source quality, time fit, and diversity—not relevance alone;
7. construct a token-budgeted packet with evidence and contradiction coverage;
8. return abstention reasons and missing-data slots alongside results.

The context packet is a versioned artifact with its own hash and manifest. It should contain:

- query contract and as-of timestamp;
- canonical entity/security identity;
- current high-quality facts with exact citations;
- original qualifiers, units, basis, and itemized builds;
- live contradictions and their adjudication status;
- relevant prior decisions and what changed since them;
- open forecasts, kill criteria, and scheduled reviews;
- calibration warnings relevant to the module/thesis type;
- deliberately omitted categories and the token-budget decision;
- source/event IDs so the answer can cite and write back lineage.

No agent may treat retrieved prose as primary evidence merely because another agent wrote it. It must either follow the evidence links or label the result as an upstream synthesis/inference.

### 6. Write path and multi-contributor contract

Every contributor uses the same thin interface, regardless of model vendor:

```text
memory validate <event-or-bundle>
memory append <event-or-bundle> --expected-head <hash>
memory query --spec <query.json> --out <context.json>
memory project --from <checkpoint> --verify
memory doctor
```

The interface may initially be Python scripts, later a local service/MCP server. Its externally visible contract remains JSON Schema plus documented exit codes. Adapters may capture model-specific metadata, but domain payloads cannot require Claude-, Codex-, or provider-only fields.

Writes use optimistic concurrency and idempotency keys. Parallel writers append distinct events; a deterministic projector resolves order by event time plus stable ID and detects incompatible concurrent state transitions. An agent cannot overwrite another agent’s conclusion or a committed decision.

### 7. Trust, security, and deletion

- Classify every source as public, internal, licensed, confidential, or restricted.
- Enforce policy at ingestion and retrieval. Do not embed restricted material into an index with broader access.
- Encrypt remote object/index storage and maintain audited service identities; never store credentials in memory events.
- Record licence expiry and derived-data restrictions. “Permanent” may mean a permanent tombstone and provenance record while protected bytes are deleted.
- Never put protected or expiring verbatim content in Git history. A query filter cannot satisfy a
  deletion obligation when the original bytes remain in commits, SQLite rows, FTS indexes, or
  backups.
- Treat source text as untrusted data. Retrieval content cannot issue tool instructions or override doctrine.
- Sign release/checkpoint manifests when the system spans machines; verify hashes on restore and projection.
- Back up canonical events and objects separately, with periodic restore drills.
- Support cryptographic deletion of restricted bytes while retaining a non-sensitive deletion event and hash, where policy requires it.

## CI invariants by delivery phase

These are the end-state CI invariants. The foundation enforces the envelope, graph, clock, policy,
Git-lane, and deterministic-projection portions that exist today. Exact object-byte resolution,
idempotent controlled writes, and context-packet lineage become enforceable only when their Phase 2,
4, and 5 components land; the foundation does not claim those future checks already exist.

1. Every canonical event validates against a pinned schema.
2. Every event ID and idempotency key is unique.
3. Every evidence reference resolves to an existing object hash and valid locator.
4. Every material claim has evidence or an explicit inference/not-proven status.
5. Claim summaries preserve qualifier, basis, unit, scope, period, and build links.
6. No committed event is edited or deleted; corrections append.
7. `supersedes` graphs are acyclic and their targets exist.
8. Current-state projection is deterministic from a clean checkout/object snapshot.
9. Index deletion and full rebuild produce the same canonical projection digest.
10. A run’s context-packet hash, prompt-program Git SHA, and output hashes are recorded.
11. Restricted records never appear in unauthorized query fixtures or embeddings.
12. All timestamps are timezone-aware; all records distinguish valid time from system time.
13. Git canonical events are only public/internal and permanent; purgeable content is rejected at
    commit time.

## Evaluation programme

Memory quality needs a held-out benchmark derived from real engine failure modes. Before using memory to lift a rating or confidence, test:

| Capability | Example test | Primary metric |
|---|---|---|
| Point fact recall | Retrieve a filed debt maturity from an old run | exact value + correct source locator |
| Temporal reconstruction | “What did the engine know before the earnings release?” | no post-cutoff leakage |
| Knowledge update | A restatement supersedes an earlier figure | corrected answer plus visible history |
| Contradiction handling | Filing and vendor disagree on EBITDA | both named; hierarchy/basis adjudicated |
| Qualifier survival | “No contractual pass-through” travels upward | qualifier retained, no absolute mutation |
| Multi-hop lineage | Target price → EBITDA → segment assumption → filing | complete resolvable chain |
| Entity resolution | ADR and local line | no price/currency/share-class mixing |
| Abstention | Required covenant disclosure absent | correct refusal, no nearest-neighbor invention |
| Access control | Licensed note queried by public role | zero protected-content leakage |
| Cross-agent reproducibility | Claude/Codex use the same context spec | equivalent evidence set and citations |

Track at minimum: evidence precision/recall, citation validity, temporal leakage rate, stale/superseded claim rate, contradiction surfacing recall, qualifier-loss rate, abstention precision/recall, p50/p95 latency, context tokens per task, and cost per successful evidence-backed answer.

Run an A/B shadow evaluation on past decisions: existing folder retrieval versus the new context compiler, with the model and task held fixed. The adoption gate is better evidence correctness and lower serious-error rate, not prettier answers. Continue to measure downstream Brier score and Selected-minus-Rejected performance, but do not attribute investment improvement to memory until enough independent outcomes exist.

## Delivery plan

### Phase 0 — Baseline and freeze semantics (1 week)

- Inventory every producer, schema, ledger, source store, and reader; generate a machine-readable catalogue.
- Build 50–100 held-out memory questions from existing runs, including known bad-extraction, qualifier-loss, temporal, and contradiction failures.
- Write decision records documenting identifier, time, retention, and correction semantics.
- Measure current folder/grep retrieval as the baseline.

**Exit:** catalogue covers all current memory-producing paths; benchmark and baseline report are committed; no runtime behaviour changes.

### Phase 1 — Common envelope and identity registry (1–2 weeks)

- Add `memory-event/v1` and entity/source/evidence/claim schemas.
- Establish namespaces for LEI, FIGI/ISIN, exchange MIC+ticker, internal run, forecast, claim, and source IDs.
- Write adapters for current decision records, reviews, commodity evidence, and screener thesis events without rewriting historical files.
- Validate envelopes and referential integrity in CI.

**Exit:** all new record types can be mapped losslessly; old readers still work; historical artifacts remain byte-identical.

### Phase 2 — Object store and provenance chain (2–3 weeks)

- Hash every ingested source and extraction artifact; write manifests first against the existing filesystem, then add remote object storage if needed.
- Link evidence spans to exact source versions and locators.
- Record run, tool, extraction, prompt-program, and context-packet lineage.
- Add restore and corruption drills.

**Exit:** any sampled material claim resolves to exact bytes; a clean rebuild verifies all hashes.

### Phase 3 — Reference projection and hybrid retrieval (2–4 weeks)

- Build a deterministic SQLite reference projection with FTS and explicit edge tables.
- Add embeddings only for evidence spans/claims that policy permits; keep model/version/dimensions in index metadata.
- Implement query specs, reciprocal-rank-style candidate fusion, evidence-aware reranking, and contradiction expansion.
- Emit immutable context packets with manifests.

**Exit:** benchmark beats baseline on evidence correctness and temporal leakage without unacceptable latency/cost; deleting the database and rebuilding changes no projection digest.

### Phase 4 — Agent integration in shadow mode (2 weeks)

- Provide the same CLI/MCP contract to Claude, Codex, and a minimal third client.
- Start with one high-value read path: synthesizer recall of prior decisions, open forecasts, and relevant corrections.
- Compare old and new context side by side; do not let memory automatically change ratings.
- Capture explicit agent feedback on useful, missing, stale, and contradictory retrievals.

**Exit:** clients receive equivalent evidence sets for the same query; no unauthorized or post-cutoff leakage; human/automated review clears the shadow results.

### Phase 5 — Controlled writes and feedback loop (2–3 weeks)

- Enable validated append writes for new claims and feedback.
- Add idempotency, optimistic concurrency, projection checkpoints, and dead-letter quarantine.
- Resolve forecast outcomes into the existing calibration path; never let retrieval relevance become a confidence score.
- Surface unresolved contradictions and memory health in the cockpit.

**Exit:** concurrent-writer and crash-recovery tests pass; all writes are attributable and reversible through appended correction; calibration reads only eligible, integrity-verified records.

### Phase 6 — Scale only after evidence (ongoing)

- Move the reference projection to PostgreSQL only for measured concurrency/size needs.
- Add a dedicated graph engine only if multi-hop query performance or analyst use demonstrably requires it.
- Partition/hot-cold tier large objects and indexes; retain canonical events.
- Run quarterly benchmark refreshes, restore drills, access audits, and schema-deprecation reviews.

**Exit:** published SLOs are met and each infrastructure addition has a benchmark-backed reason.

## Initial SLOs and operational checks

- 100% of committed canonical events schema-valid and hash-verifiable.
- 100% of material retrieved claims include resolvable evidence or explicit inference status.
- 0 known cross-tenant/licence-policy leaks.
- 0 post-cutoff facts in point-in-time evaluation.
- ≥99.9% successful canonical event appends, excluding rejected invalid writes.
- p95 retrieval under 2 seconds for ordinary issuer queries on the reference corpus; context compilation under 5 seconds.
- Recovery point objective: zero committed-event loss. Recovery time objective: four hours from canonical snapshot/object backup.
- Monthly projection rebuild and quarterly full restore test.

These are engineering targets, not claims about current performance. Rebaseline them after Phase 0.

## Ownership and governance

- **Memory contract owner:** schemas, event semantics, compatibility, migrations.
- **Research doctrine owner:** claim/evidence quality, source hierarchy, qualifier and contradiction rules.
- **Platform owner:** object durability, indexes, backups, access controls, observability.
- **Module owners:** typed payload mappings and domain-specific retrieval tests.
- **Calibration owner:** outcome eligibility and statistical interpretation.

Schema changes are code changes: PR, CI, adversarial review, migration fixture, compatibility note, and rollback. Research events remain data changes under the repository’s existing controlled data stream. A reader must support at least the current and previous major schema during migration; destructive migrations are replaced by new projections.

## Explicit non-goals

- Storing every chat transcript forever.
- Letting embeddings become evidence or truth.
- Giving an autonomous model permission to rewrite prior memory.
- Creating a global “company summary” that silently discards time, scope, and disagreement.
- Optimizing memory for engagement, verbosity, or answer fluency.
- Choosing a fashionable database before the canonical contracts and evaluation exist.
- Training or fine-tuning on licensed/confidential material without a separate lawful policy and approval path.

## First implementation slice

The lean foundation PR adds only:

1. schemas for the common envelope, source, evidence span, claim, and relationship;
2. read-only adapters that map existing equity decisions/reviews/corrections, commodity evidence, and screener ledgers to events;
3. a deterministic local projection and `memory doctor` integrity report;
4. benchmark fixtures for temporal cutoff, contradiction, qualifier survival, lineage, and abstention; and
5. CI checks for schema validity, reference resolution, immutability, and reproducible rebuild.

It should **not** add a production vector database, graph database, UI, or automatic write-back. That slice tests the foundational bet: whether one typed, temporal, provenance-preserving contract can unify what the engine already has without damaging its proven ledgers.

## Final recommendation

Build **institutional memory, not conversational memory**. Preserve raw evidence and irreversible history; make claims typed, temporal, qualified, and traceable; compile narrow working context; measure recall and abstention; and keep every serving database disposable. The repository has already solved much of the governance and decision-ledger problem. The highest-leverage next move is to connect those systems through a common event/provenance contract and a deterministic index—not to create another store of generated summaries.
