# Permanent memory foundation

This directory contains the vendor-neutral components for permanent research memory. Historical
equity, commodity, and screener ledgers remain authoritative and byte-identical. The adapter presents
those records through one canonical envelope; SQLite and every retrieval index remain disposable
projections rather than sole holders of evidence. Phases 0–6 remain the bounded reference foundation.
`THREE_LAYER_MEMORY.md` and the three-layer contract bundle define the staged production upgrade;
production dispatch stays off until its shadow and enforcement gates pass.

## Implemented scope

- Closed JSON contracts for events, sources, evidence spans, claims, relationships, identities, and
  non-content tombstones.
- Semantic validation for IDs, bitemporal clocks, hashes, policies, evidence, and supersession.
- Lossless deterministic adapters for the current decision, review, correction, commodity, screener,
  idea, thesis, conviction, and structured calibration-summary stores.
- Deterministic loading of clean, tracked Git-lane events under `memory/events/`; dirty, untracked,
  symlinked, or policy-ineligible files fail closed.
- A deterministic SQLite + FTS5 projection with explicit event, identity, claim, relationship,
  artifact, and evidence-locator tables.
- Point-in-time queries with classification filtering applied before results are returned.
- A read-only integrity doctor that rebuilds twice and compares logical projection digests.
- Append-only guards for future canonical files under `memory/events/`.
- A held-out Phase 0 benchmark and deterministic folder/literal-retrieval baseline.
- Closed Phase 2 contracts for object manifests, signed intake receipts, trust keys, source
  acquisitions, extraction artifacts, exact evidence spans, store checkpoints, and purge receipts.
- A policy-partitioned local reference store with exact acquisition/version lineage, authenticated
  protected content, managed backup/restore, transitive purge, rollback-anchored diagnostics, and
  deterministic rebuilds.
- A composite exact-byte resolver for clean Git-backed legacy sources and complete Phase 2 object
  manifests, plus a deterministic live-corpus resolution drill.
- A closed query contract, policy-first hybrid retrieval reference, exact-evidence verification,
  and immutable context packets/manifests over the disposable projection. Embeddings are optional,
  local, and injected; retrieval scores never become evidence or confidence.
- A read-only shadow CLI and bounded STDIO MCP server with one equivalent contract for synthetic
  Codex-, Claude-, and generic-client protocol harnesses, plus inert feedback artifacts.
- Closed claim, correction, reviewed-feedback, forecast-outcome, and calibration-observation
  contracts, together with a fail-closed reference controlled writer. The writer uses injected
  write/review/recovery authorizers, an injected exact candidate-provenance verifier, and an
  injected authoritative-event resolver; it tests optimistic concurrency, exact replay,
  append-only correction, crash recovery, protected-store preflight, and store-orphan recovery.
- A closed, read-only operational-readiness report that recomputes benchmark and SLO results from
  supplied observations and keeps missing production evidence explicitly `unmeasured`.
- Closed production contracts for query v2, separated context packets, frozen run receipts,
  supervisor-attested memory use, task/run episodes, semantic candidates/lessons, procedural
  candidates/playbooks/evaluations/executions, provider policy, and PR-bound promotion manifests.
- Cross-field fail-closed checks for authority narrowing, role token ceilings, mandatory-memory
  overflow, exact-listing identity, 180-day semantic review, empirical promotion floors,
  independent promotion, deterministic-tool allowlists, playbook validation cases, and untrusted
  packet rendering.
- A frozen 40-case three-layer acceptance corpus covering prior misses, corrections, semantic
  applicability, cross-company isolation, playbook match/conflict, qualifier survival, and
  abstention. It supplements rather than replaces the pinned 63-case Phase 0 benchmark.
- A production projection manager that binds a clean SQLite rebuild to an exact repository SHA,
  conservative issuer/listing registry, controlled-writer owner, and owner-signed external
  checkpoint; exact provider-policy narrowing; and registry-backed transitive runtime purge hooks.
- A deterministic production-candidate ranker for the exact pinned 63-case corpus, a closed scorer
  for the additional 40 three-layer cases, and a pre-registered 100-task live paired-shadow
  evaluator with exact provider-packet parity and material-claim lineage accounting.
- A maximum-30-day Ed25519 release activation that binds fresh operational evidence, independently
  signed runtime-benchmark and shadow-adjudication reports, and approved provider/models. Enforced
  mode checks it before snapshot preparation and immediately before paid dispatch; no synthetic,
  stale, or unmeasured report can activate the runtime. The promotion-service clock supplies the
  creation time, and the release, benchmark, and adjudication keys must be pairwise distinct.

The local production integration, supervisor boundary, cockpit, incident controls, and release gates
are implemented. The exact 63-case production-candidate benchmark is reproducible and passes its
non-regression, strict-improvement, temporal, and protected-path gates. Production enforcement still
cannot be activated from repository fixtures: it remains correctly blocked until operators supply
the pre-registered live 100-task Claude/Codex shadow sample and current authenticated readiness,
write, latency, restore, purge, access, and review-cadence observations. Reviewed feedback is
auditable but cannot create a rating, confidence, sufficiency, or position-size lift. Dedicated
remote vector/graph infrastructure and automated memory-driven rating changes remain deferred.

## Authority and paths

- Existing ledger/source files are authoritative inputs to the legacy adapters.
- Future reviewed `public`/`internal`, `permanent` canonical events may belong under
  `memory/events/` as immutable JSON or append-only canonical NDJSON. The immutability guard rejects
  every licensed/restricted/confidential, source-policy, expires, or tombstone-only record because
  Git history cannot satisfy physical deletion. The Phase 2 purgeable event/object reference lane
  owns those records outside Git; see `frameworks/memory/PHASE2.md`.
- Exact source bytes are identified by SHA-256. An evidence reference is valid only when both its
  digest and locator have declared, point-in-time, policy-safe providers in the projection. The
  doctor additionally verifies exact bytes for every legacy adapter source. The Phase 2 resolver
  uses full acquisition/version/manifest identities for object-store reads and never interprets a
  typed locator as a fetch instruction. The projection API alone still does not prove byte
  availability; retrieval must call the resolver boundary.
- Projection databases may be deleted at any time and rebuilt from authoritative inputs.
- The Phase 3 compiler is read-only. Its trusted access scope, projection digest, policy clock, and
  exact-evidence verifier are launcher-owned inputs; a query may narrow but never grant authority.
  A context packet is a derived artifact with complete lineage, not a new source of truth.
- The Phase 4 MCP surface is shadow-only. It exposes no write tool, cannot change ratings, and does
  not promote feedback.
- The Phase 5 `NdjsonCanonicalSink` is a local reference sink, not an assertion that arbitrary
  appends to its ledger have passed repository Git/PR governance. A production integration must
  provide trusted authorizers, exact provenance and authoritative-event resolution, stable sink and
  store identities, and exclusive controlled-write ownership for every canonical route. Phase 5's
  explicit `reconcile_retirement` transition can advance the controlled head after an exact purge
  or elapsed expiry only when an injected verifier authenticates a signed proof bound to the exact
  earlier protected commits. It journals prepare, head transition, and commit, and recovers exactly
  once after a crash without restoring retired content. Unexplained loss and source-policy denial
  still fail closed. The mutually checking local journal/head records and injected verification
  hook are not themselves the production signing service or an anti-rollback checkpoint kept
  outside the service-account boundary.

Projection files contain the canonical payloads needed for local search, including any protected
events supplied directly to the library. They must stay inside the same authorized boundary as
their inputs and be destroyed/rebuilt when policy changes. `source-policy` records fail closed and
are not returned without an injected current entitlement/status resolver. Filtering a SQLite
result is not a substitute for purging protected source bytes.

`tombstone-only` is not a generic retention label. It is accepted only on a closed
`memory-tombstone/v1` payload that names and supersedes exactly one event. Tombstones carry closed
reason and basis codes plus, at most, an opaque UUID/SHA-256 basis identifier; free-form deletion
reasons and source content are forbidden.

`integrity.payload_sha256` protects the canonical payload; it is not a signature over the envelope.
Whole-event integrity comes from canonical Git/object bytes, `event_sha256`, and the out-of-band
projection digest. Event signatures remain required to be `null` in v1. Phase 2 adds detached,
purpose-limited signatures for intake receipts, checkpoints, and purge receipts instead of
pretending the original envelope signature field was authenticated.

Query result packets confirm that the caller-supplied digest matched but do not echo the global
projection digest. The packet's `result_sha256` covers only the requested/effective query and its
authorized rows, avoiding a hidden-corpus change oracle in lower-classification outputs.

## Commands

Run from the repository root:

```bash
# Adapt every currently supported legacy record, then validate the bundle.
python3 scripts/memory.py adapt --root . --format ndjson --output /tmp/legacy-memory.ndjson
python3 scripts/memory.py validate /tmp/legacy-memory.ndjson

# Build or verify a disposable local projection.
python3 scripts/memory.py project --root . --database /tmp/research-memory.sqlite
python3 scripts/memory.py doctor --root .

# Query. Access defaults to public; non-public classes must be explicitly granted.
python3 scripts/memory.py query \
  --database /tmp/research-memory.sqlite \
  --expected-digest <digest-from-the-project-command> \
  --classification internal \
  --subject entity:internal:legacy-example

# Reproduce the Phase 0 report and run all memory-focused regressions.
python3 scripts/memory_baseline.py --check
for test in scripts/test_memory_*.py; do python3 "$test"; done

# Run the later-phase focused gates independently.
PYTHONPATH=scripts python3 scripts/test_memory_retrieval.py
PYTHONPATH=scripts python3 scripts/test_memory_shadow_schemas.py
PYTHONPATH=scripts python3 scripts/test_memory_shadow.py
PYTHONPATH=scripts python3 scripts/test_memory_mcp_server.py
PYTHONPATH=scripts python3 scripts/test_memory_phase5_contract.py
PYTHONPATH=scripts python3 scripts/test_memory_controlled_write.py
PYTHONPATH=scripts python3 scripts/test_memory_phase5_projection_retrieval.py
PYTHONPATH=scripts python3 scripts/test_memory_store_preflight.py
PYTHONPATH=scripts python3 scripts/test_memory_store_orphan_recovery.py
PYTHONPATH=scripts python3 scripts/test_memory_operations.py
PYTHONPATH=scripts python3 scripts/test_memory_three_layer_contract.py
PYTHONPATH=scripts python3 scripts/test_memory_runtime.py
PYTHONPATH=scripts python3 scripts/test_memory_phase0_candidate.py
PYTHONPATH=scripts python3 scripts/test_memory_three_layer_benchmark.py
PYTHONPATH=scripts python3 scripts/test_memory_shadow_evaluation.py
PYTHONPATH=scripts python3 scripts/test_memory_enforcement.py

# Emit the exact pinned-corpus production-candidate report. Runtime evidence belongs in
# the owner-only state root, never the repository.
python3 scripts/memory_phase0_candidate.py \
  --output /absolute/private/memory-runtime/operations/phase0-candidate-report.json

# Prepare the production projection. The Ed25519 seed and public key are raw 32-byte,
# owner-only files; the signed checkpoint must live outside the mutable state root.
python3 scripts/memory_runtime_cli.py prepare \
  --root . --state-root <private-runtime-state> \
  --checkpoint <external-checkpoint.json> \
  --writer-owner <controlled-writer-owner.json> \
  --writer-head <controlled-writer-head.json> \
  --private-key <owner-only-ed25519-seed> \
  --public-key <owner-only-ed25519-public-key> \
  --key-id research-memory-checkpoint-v1

# Install the exact cryptographic runtime and prove exact-byte resolution twice.
python3 -m pip install --require-hashes -r scripts/requirements-memory.txt
python3 scripts/memory_resolver.py drill \
  --root . \
  --sample-size 16 \
  --authorize-internal-legacy

# Validate every canonical-memory history transition since a trusted base.
python3 scripts/memory_immutability.py --repo . --base <trusted-ancestor-commit> --head HEAD
```

Every command writes machine-readable JSON to standard output where practical and exits non-zero on
contract or integrity failure. Keep the projection digest emitted by `project` outside the SQLite
file and pass it back to `query`; this prevents a modified database from self-attesting to a forged
digest. `memory.py query` never grants a classification implicitly: it is a local trusted-operator
tool, and callers must pass only classifications they are independently authorized to receive.
`adapt`, `project`, and `doctor` also require the reviewed Phase 0 adapter baseline and refuse an
unexpected source/event-count decrease; this prevents a wrong working directory from producing a
plausible empty projection.

The Git guard checks every parent/child transition from the explicit trusted base, not merely the
final tree. A newly appended event's `system_time` must fall between the parent and recording commit
clocks, preventing a current PR from inserting facts into pre-base point-in-time history. Commit
clocks are a repository receipt boundary, not a cryptographic timestamp; a signed intake receipt is
part of the later controlled-writer phase.

## Design records and evaluation

`phase0/catalogue.json` inventories current stores, schemas, producers, and readers.
`phase0/decisions.json` freezes identity, time, policy, and correction semantics.
`phase0/benchmark.json` contains held-out questions, `phase0/corpus-manifest.json` pins the exact
files and bytes those questions are ranked over, and `phase0/baseline-report.json` records the
deterministic pre-index baseline. Pinning the corpus is what keeps a routine research publish into a
live `analyses/**` run folder from moving a score and turning `main` red. See `phase0/README.md` for
refresh and re-freeze rules.

The phase-specific trust boundaries and focused verification commands are documented in
`PHASE2.md`, `PHASE3.md`, `PHASE4.md`, `PHASE5.md`, and `PHASE6.md`.
The production authority, provider, security, promotion, retention, and release boundaries are in
`THREE_LAYER_MEMORY.md`. Public schema aliases resolve into
`three-layer-contracts.schema.json`; `scripts/memory_three_layer_contract.py` adds the cross-document
and temporal checks JSON Schema alone cannot express.

Production service identities, incident switches, metadata-only cockpit routes, monthly clean
rebuilds, and quarterly disposable restore/purge drills are operated through
`scripts/ops/MEMORY_RUNBOOK.md`.
