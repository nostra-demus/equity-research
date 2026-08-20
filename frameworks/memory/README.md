# Permanent memory foundation

This directory contains the vendor-neutral, read-only foundation for permanent research memory.
Historical equity, commodity, and screener ledgers remain authoritative and byte-identical. The
adapter presents those records through one canonical envelope; the SQLite database is a disposable
projection and is never the sole holder of evidence.

## Implemented scope

- Closed JSON contracts for events, sources, evidence spans, claims, relationships, identities, and
  non-content tombstones.
- Semantic validation for IDs, bitemporal clocks, hashes, policies, evidence, and supersession.
- Lossless deterministic adapters for the current decision, review, correction, commodity, screener,
  idea, thesis, and conviction stores.
- Deterministic loading of clean, tracked Git-lane events under `memory/events/`; dirty, untracked,
  symlinked, or policy-ineligible files fail closed.
- A deterministic SQLite + FTS5 projection with explicit event, identity, claim, relationship,
  artifact, and evidence-locator tables.
- Point-in-time queries with classification filtering applied before results are returned.
- A read-only integrity doctor that rebuilds twice and compares logical projection digests.
- Append-only guards for future canonical files under `memory/events/`.
- A held-out Phase 0 benchmark and deterministic folder/literal-retrieval baseline.

The implementation deliberately does not provide canonical-event writes, a production object store,
embeddings, a remote graph database, context-packet generation, or agent-triggered write-back. Those
remain later phases in `PERMANENT_MEMORY_ARCHITECTURE_PLAN.md`.

## Authority and paths

- Existing ledger/source files are authoritative inputs to the legacy adapters.
- Future reviewed `public`/`internal`, `permanent` canonical events may belong under
  `memory/events/` as immutable JSON or append-only canonical NDJSON. The immutability guard rejects
  every licensed/restricted/confidential, source-policy, expires, or tombstone-only record because
  Git history cannot satisfy physical deletion. The Phase 2 purgeable event/object lane owns those
  records. This slice does not create either lane or write events.
- Exact source bytes are identified by SHA-256. An evidence reference is valid only when both its
  digest and locator have declared, point-in-time, policy-safe providers in the projection. The
  doctor additionally verifies exact bytes for every legacy adapter source. A typed remote/object
  source resolver is Phase 2, so the projection API alone does not prove that arbitrary typed URIs
  are currently retrievable.
- Projection databases may be deleted at any time and rebuilt from authoritative inputs.

Projection files contain the canonical payloads needed for local search, including any protected
events supplied directly to the library. They must stay inside the same authorized boundary as
their inputs and be destroyed/rebuilt when policy changes. `source-policy` records fail closed and
are not returned without the external entitlement/status resolver planned for Phase 2. Filtering a
SQLite result is not a substitute for purging protected source bytes.

`tombstone-only` is not a generic retention label. It is accepted only on a closed
`memory-tombstone/v1` payload that names and supersedes exactly one event. Tombstones carry closed
reason and basis codes plus, at most, an opaque UUID/SHA-256 basis identifier; free-form deletion
reasons and source content are forbidden.

`integrity.payload_sha256` protects the canonical payload; it is not a signature over the envelope.
Whole-event integrity comes from canonical Git/object bytes, `event_sha256`, and the out-of-band
projection digest. Event signatures are required to be `null` in v1 because this slice has no key
registry or signature-verification trust store; accepting an unverified signature would create a
false authenticity claim.

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
`phase0/benchmark.json` contains held-out questions, while `phase0/baseline-report.json` records the
deterministic pre-index baseline. See `phase0/README.md` for refresh rules.
