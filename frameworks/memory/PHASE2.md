# Phase 2 object and provenance lane

This is the reference implementation of the purgeable, content-addressed lane described in
`PERMANENT_MEMORY_ARCHITECTURE_PLAN.md`. It complements the reviewed Git event lane; it does not
replace the existing equity, commodity, or screener ledgers.

## Trust boundary

- `memory-object-manifest/v1` binds exact bytes to a distinct acquisition, source version,
  producer/run/tool lineage, policy, and content digest. A content hash is never used as an
  acquisition or entitlement identity.
- `memory-source/v2`, `memory-extraction-artifact/v1`, and `memory-evidence-span/v2` bind the
  logical source, extraction coordinate system, and evidence locator to complete manifests. The
  store enforces the write order source object → source event → derived object → extraction event
  → evidence event, and repeats the full binding checks on read and rebuild.
- Protected, expiring, and source-policy bytes must live outside Git. Protected objects and event
  records require an injected authenticated cipher and externally held key-encryption key.
- Every public store operation requires an injected authorizer. Source-policy content additionally
  requires a current entitlement resolver; expiry uses an injected timezone-aware clock.
- The local filesystem backend assumes a private `0700` store owned by a dedicated trusted service
  account. It rejects symlinks and path escapes at rest but does not claim isolation from a hostile
  process already running as that same operating-system identity; production deployments must use
  a separate service account and storage boundary.
- Detached Ed25519 intake receipts, public trust-key registries, signed store checkpoints, and
  signed purge receipts have closed contracts and fail-closed verification APIs. The low-level
  local store is an administrative reference primitive; optimistic controlled intake and durable
  write coordination remain Phase 5 work.

## Storage and deletion

`scripts/memory_store.py` writes immutable descriptors, canonical plaintext or authenticated
ciphertext, and separately purgeable wrapped-DEK records under private filesystem modes. Manifest
lineage uses exact `{object_id, acquisition_id, source_version_id, manifest_sha256}` pointers, so
identical bytes acquired under different rights remain independent.

Purge computes the complete event/object derivative closure, authorizes every closure member,
writes policy-safe tombstones, removes managed key envelopes and backups, invokes a mandatory
projection-purge/absence boundary, verifies absence, and commits intent/completion/retirement
proofs. A purge receipt proves only the surfaces inspected by its trusted resolvers. Unknown
external replicas or backups are not silently treated as erased.

Restore accepts only exact, policy-eligible bytes and manifests. Rebuild rejects missing,
unexpected, non-canonical, resurrected, symlinked, wrongly permissioned, or internally
inconsistent store records.

## Exact-byte resolution

`scripts/memory_resolver.py` exposes one resolver contract over both lanes:

- Legacy adapter events resolve from one clean, stage-0, tracked `100644` blob in repository
  `HEAD`; returned bytes come from `git cat-file`, then the locator, digest, and decoded record are
  checked again.
- Phase 2 objects resolve only by the complete acquisition, source-version, manifest-digest, and
  object identity through `MemoryStore`. Manifest locators are provenance and are never fetch
  instructions.

Resolution metadata is content-free and hashable; resolved bytes are kept in a separate immutable
value. Internal legacy evidence is denied unless the local operator explicitly grants it.

## Reproducible checks

Install the reviewed cryptographic dependency lock, then run:

```bash
python3 -m pip install --require-hashes -r scripts/requirements-memory.txt

# Resolve a deterministic real-corpus sample twice from exact Git bytes.
python3 scripts/memory_resolver.py drill \
  --root . \
  --sample-size 16 \
  --authorize-internal-legacy

# Verify an existing local object store without returning retained content.
python3 scripts/memory_store_doctor.py \
  --store /absolute/path/outside/the/repository \
  --authorize-local-owner \
  --expected-manifest-sha256 sha256:<out-of-band-manifest-digest>

# Run every focused contract, crypto, store, resolver, purge, and rebuild regression.
for test in scripts/test_memory_*.py; do python3 "$test"; done
```

Protected stores also require `--master-key-file` and `--key-id`; source-policy stores require an
explicit current status. The doctor emits aggregate, canonical JSON only and refuses missing trust
hooks rather than reporting a partial success. Its expected digest must be retained outside the
store (or replaced later by a verified signed checkpoint); without that anchor a coherent rollback
could look internally consistent, so the doctor refuses to call it healthy.

The CI drill samples both JSON and NDJSON legacy sources and checks two identical metadata rebuild
digests. Synthetic store tests exercise exact source/extraction/evidence chains, distinct rights for
identical bytes, encryption/key separation, authorization before derivation, backup/restore,
concurrent writers, transitive purge, and resurrection detection without committing protected
fixture content to Git.
