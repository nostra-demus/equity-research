# Neo4j memory smoke prototype

This is a disposable experiment, not a new source of truth. The Git-backed ledgers and permanent
memory contracts remain authoritative. Neo4j may be deleted and rebuilt at any time.

## What the first smoke test contains

The loader reuses `adapt_repository()` and maps its reviewed legacy envelopes into:

- dedicated `MemoryPrototypeEvent`, `MemoryPrototypeSubject`, and
  `MemoryPrototypeEvidence` nodes;
- `ABOUT`, `CITES`, `DERIVED_FROM`, and `SUPERSEDES` relationships; and
- one metadata-only full-text index.

The 2026-08-21 dry run contains 424 events, 359 subjects, 424 evidence references, 838 `ABOUT`,
424 `CITES`, 7 `DERIVED_FROM`, and 139 `SUPERSEDES` relationships. Only records already classified
`internal` with `permanent` retention are accepted. Payload records, canonical source bytes, and
research prose are deliberately not uploaded in this first test.
Source paths are restricted to the reviewed repository roots, and locators are restricted to
`json` or `line-N`; arbitrary locator text is rejected before any connection is opened.

The credential file stays outside Git, must be owned by the current user, and must have mode `0600`.
The CLI never prints its password and accepts only certificate-validated `neo4j+s://` Aura URIs.
Loading also requires the operator to name the expected Aura instance ID, and it refuses a database
containing foreign nodes. There is no delete or clear command.

## Local commands

Use Python 3.10 or newer for Neo4j Driver 6:

```bash
python3.12 -m venv .venv/neo4j-prototype
.venv/neo4j-prototype/bin/python -m pip install \
  --require-hashes -r scripts/requirements-memory-neo4j.txt

# No network or external write.
PYTHONPATH=scripts .venv/neo4j-prototype/bin/python \
  scripts/memory_neo4j.py dry-run --root .

# Idempotent merge into a dedicated Aura instance.
PYTHONPATH=scripts .venv/neo4j-prototype/bin/python \
  scripts/memory_neo4j.py load --root . \
  --credentials /absolute/private/path/Neo4j-credentials.txt \
  --expected-instance-id YOUR_AURA_INSTANCE_ID

PYTHONPATH=scripts .venv/neo4j-prototype/bin/python \
  scripts/memory_neo4j.py doctor --credentials /absolute/private/path/Neo4j-credentials.txt
```

Search returns only rows marked `internal`, but the `--classification` flag is a filter, not an
authorization system. In this local smoke test, possession of the private Aura credentials is the
access boundary. Do not expose this CLI directly to agents or as a network service.

```bash
PYTHONPATH=scripts .venv/neo4j-prototype/bin/python \
  scripts/memory_neo4j.py search \
  --credentials /absolute/private/path/Neo4j-credentials.txt \
  --classification internal \
  --as-of 2026-08-21T00:00:00Z \
  --valid-at 2026-08-21T00:00:00Z \
  --query "AMZN decision"
```

## Fixed 63-case local benchmark

The production-candidate comparison used the exact Phase 0 corpus: 1,256 files, 55,943,967 bytes,
with SHA-256
`48fab63898c33a5e2d9b5e820c25aed85c7f2e048eaacd2eb7677466ac308a0b`. Rankings were frozen before
the answer fields were read. The same 63 questions and top-five result limit were used for every
retriever. The committed baseline report retains an older observational corpus fingerprint, so the
baseline scorer was rerun on this exact current corpus; its scored results were unchanged.

| Retriever | Complete-evidence recall@5 | Path recall@5 | MRR | Benchmark-listed temporal leakage |
| --- | ---: | ---: | ---: | ---: |
| Phase 0 baseline rerun on the same corpus | 0.523810 | 0.580247 | 0.461111 | 0.714286 |
| Fixed local Neo4j | 0.539683 | 0.567901 | 0.456085 | 0.000000 |
| Matching temporal-aware lexical control | 0.539683 | 0.592593 | 0.473016 | 0.000000 |

The fixed Neo4j run had zero benchmark-listed forbidden-path hits, zero temporal-leakage cases, and
zero protected-path intrusions. Here, zero means only that none of the forbidden paths explicitly
listed by this benchmark appeared. It is not proof that every possible historical edit is dated or
filtered correctly.

Neo4j improved complete-evidence recall and removed the listed time leaks, but path recall and mean
reciprocal rank (MRR, how near the first correct result appears) both fell below the same-corpus
baseline. The matching lexical control also used that exact corpus and did better than both the
baseline and Neo4j on path recall and MRR. This points to the time filter—not the graph database—as
the useful change, so Neo4j was not selected as the Phase 3 retrieval backend.

An earlier Phase 6 metric comparison returned `failed`. Phase 6 now also binds the frozen baseline
and candidate corpus anchors: because the committed baseline snapshot retains an older corpus
fingerprint, this candidate is conservatively reported as `unmeasured`/`corpus-mismatch` there. The
same-current-corpus reruns above remain the evidence for the architectural decision, without
misstating the formal adoption gate.

The temporal-aware lexical control is a benchmark comparison only. It has not been adopted into
production. The next step is to add and retest the same conservative time filter in the current
retriever before changing any production path.

## Scope and cleanup

This smoke test proves connection, deterministic graph shape, idempotent loading, and basic graph
search. The Aura graph remains an optional metadata-only smoke test, not a source of truth or the
Phase 3 backend. Only 42 of the benchmark's 81 evidence rows are represented by its 424 adapters,
and only 26 of 63 cases have every evidence row represented, so Aura's partial graph was not scored
as if it were the full benchmark.

No raw full-corpus text was uploaded to Aura. The 1,256-file projection stayed on the local machine.
The local Neo4j server was stopped after the run. The disposable research-projection database and
its transaction files were purged after exact node deletion and residue checks; the stopped,
ignored local runtime and private credential file remain available for a future metadata-only smoke
test.

The free instance has no backup or SLA and may pause or be removed after inactivity. It must never
become the only holder of evidence. Vector embeddings and the `neo4j-graphrag` hybrid retriever are
also deferred: they add no value to a metadata-only smoke test, and the library's hybrid retriever
does not itself enforce the memory system's time/access filters.
