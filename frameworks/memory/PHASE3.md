# Permanent memory Phase 3: retrieval and context packets

Phase 3 adds a deterministic, read-only context compiler over the disposable SQLite
projection. Canonical events, exact source bytes, and Phase 2 object manifests remain the
authorities. Retrieval scores and context packets do not become evidence or confidence.

## Trust boundary and order of operations

`scripts/memory_retrieval.py` enforces this order:

1. Parse the closed `memory-query-spec/v1` contract and intersect its requested
   classifications/source tiers with a trusted, out-of-band `AccessScope`. A query can
   narrow authority but cannot grant it.
2. Open one read-only SQLite transaction and verify the caller-supplied projection digest.
   The verifier hashes canonical relational rows and reads FTS5's ordinary shadow content
   rows only to preserve the existing logical digest. It never runs the global FTS virtual
   table, tokenizer, vocabulary, or `MATCH` operation.
3. Apply classification, retention, system-time, valid-time, licence, entitlement, and
   source-tier rules. The launcher-owned policy evaluation clock must be at or after the
   query's system-time cutoff, so a historical knowledge query cannot backdate current licence
   or retention authority. `source-policy` rows must cross the trusted exact resolver boundary.
4. Resolve material evidence to exact bytes. Only content-free resolution metadata may
   continue into a packet.
5. Copy only the authorized, live, resolved candidate text into a fresh in-memory FTS5
   table. The optional injected embedder receives that same eligible set and nothing else.
6. Fuse structured, lexical, and optional embedding ranks with deterministic RRF; apply
   evidence/source-quality/time/qualifier reranking; expand bounded contradiction,
   qualification, supersession, evidence, and upstream-lineage neighbors; then enforce the
   deterministic context-token budget.

The compiler ignores the projection's global FTS index for retrieval. Protected or
source-policy text is never submitted to a candidate FTS tokenizer or embedder before its
policy and exact-byte checks succeed.

## Public contracts

- `frameworks/memory/query-spec-v1.schema.json` is the closed query contract. It requires
  task/module, query text, subjects, system-time cutoff, valid-time window, classifications,
  source tiers, record/event types, reporting basis, currency, metric, segment, result
  limit, and context-token budget.
- `frameworks/memory/context-packet-v1.schema.json` is the closed, immutable packet. Its
  content hash excludes the ID/hash wrapper, and the UUIDv5 packet ID derives from that
  content hash, avoiding a hash cycle. Typed payloads use their closed domain schemas;
  arbitrary legacy records are carried as canonical JSON text plus its SHA-256 commitment,
  not as an open protocol-owned object.
- `frameworks/memory/context-packet-manifest-v1.schema.json` is the separate closed
  manifest. It commits packet bytes, query hash, projection digest, compiler/token-estimator
  versions, embedding model metadata, evaluation time, event/evidence lineage, and exact
  object acquisition/version/manifest pointers. It contains no protected text or source
  bytes.

The stable Python surface is:

```python
query = QuerySpec.from_dict(query_json)
result = compile_context_packet(
    database_path,
    expected_projection_digest=trusted_digest,
    query=query,
    access_scope=trusted_scope,
    evidence_verifier=verifier,
    evaluated_at="2026-08-21T00:00:00Z",
    embedder=optional_local_embedder,
)
verify_context_packet(result.packet, result.manifest)
```

`ContextPacketResult` carries `packet`, `manifest`, canonical `packet_bytes`, and
`packet_sha256`. `build_context_packet_object_manifest` adapts those bytes and all exact
upstream object pointers to `memory-object-manifest/v1` with `object_kind=context-packet`,
so a packet can use the Phase 2 `MemoryStore` lane. Cross-acquisition upstream pointers are
preserved. Its output classification and retention must be a conservative intersection of
every included event and exact-object resolution policy. The adapter verifies that
intersection, rejects `tombstone-only` objects, and rejects mixed `source-policy` plus
`expires` lineage because it has no persistable retention intersection.

## Exact resolver requirement

Material evidence cannot be served from projection assertions alone.

- Legacy adapter events may be passed directly through `CompositeMemoryResolver`, which
  reads exact clean `HEAD` bytes and verifies their digest/locator. Every legacy adapter
  event is material: without an explicit exact verifier it is omitted, even though the
  projection contains an authorized canonical-text capsule.
- Typed events use `CompositeEvidenceVerifier` plus a
  `ClosedEvidenceManifestCorpus`. The corpus must bind the consuming event to complete
  `memory-object-manifest/v1` records (or complete legacy evidence events). A hash-only
  pointer is rejected because `MemoryStore.find_object` requires object ID, acquisition ID,
  source-version ID, and manifest hash derived from the full manifest.
- `CompositeEvidenceVerifier` sends each complete manifest through
  `CompositeMemoryResolver`, which performs the exact MemoryStore lookup and byte hash.
  Every declared evidence ref must be covered. Direct v2 object IDs, content hashes,
  acquisition IDs, and source-version IDs are checked again by the compiler.
- Missing corpus entries, retired objects, entitlement denial, locator mismatch, wrong
  manifest identity, corrupt bytes, or incomplete v2 lineage produce an exact omission
  reason and never a citation. If all candidates fail, the packet contains a closed
  abstention reason.

The production coordinator must construct the corpus from an authenticated event/object
checkpoint. A locator string is provenance only and is never fetched by the compiler.

## Embeddings and deterministic ranking

Embeddings are optional and injected; this implementation has no network model or vector
vendor dependency. The provider must pin provider/model/version/dimensions and return
finite vectors of exactly that dimension. Source rights must allow embedding, and the
trusted access scope must authorize the candidate classification. Bad vector counts,
dimensions, values, or provider failures fail closed.

RRF uses `k=60` with event-ID ascending tie breaks. Evidence-aware bonuses are integer
micros so ordering does not depend on floating-point score serialization. Cosine values are
used only to order embedding candidates. They are never emitted as truth, evidence quality,
or investment confidence.

## Verification and benchmark gate

Run the focused deterministic/adversarial gate:

```bash
PYTHONPATH=scripts python3 scripts/test_memory_retrieval.py
```

The committed synthetic fixture proves:

- zero protected-marker and post-cutoff event leakage;
- exact omission/abstention when a verifier, full manifest corpus, entitlement, or v2
  object identity is missing;
- contradiction and exact object-lineage coverage;
- byte-identical packet and manifest output across two independently rebuilt projections;
- hybrid aggregate recall/MRR no lower than the structured+lexical reference; and
- one designated semantic fixture improves MRR from `0.0` to `1.0`.

`scripts/memory_retrieval_benchmark.py` records p50/p95 compilation latency as
informational data, not a machine-sensitive unit-test gate. The Phase 0 63-case repository
baseline remains the adoption benchmark; the synthetic Phase 3 gate does not by itself
claim that the production benchmark or downstream investment outcomes improved.

## Explicit non-goals

- No remote/vector/graph database, network embedding call, automatic write-back, rating
  change, or confidence adjustment.
- No use of similarity as evidence.
- No unresolved or full object bytes in packets or packet manifests. Packets contain only
  selected authorized event payload fields, including permitted evidence excerpts;
  packet classification and retention are derived conservatively from every included
  entry and exact-object lineage policy, while byte verification remains behind the
  resolver boundary.
- No silent fallback from unresolved exact lineage to projection prose.
- No inference that a faster or more fluent answer improves investment performance.
