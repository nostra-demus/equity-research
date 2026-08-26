# Permanent memory Phase 6: operational evidence before scale

Status: bounded read-only reference implementation, 2026-08-21.

Phase 6 turns existing verification output and explicit operational observations into one
deterministic, content-free readiness report. It does not perform maintenance, schedule a recurring
task, mutate production state, provision infrastructure, or convert a benchmark result into an
investment-performance claim.

## Public contract

`operational-readiness-report-v1.schema.json` is recursively closed. Every result uses only the
statuses `met`, `failed`, and `unmeasured`, carries content-free normalized measurements and input
digests, and has a SHA-256 commitment over the complete report body. The fixed Python surface is:

```python
report = build_operational_readiness_report(
    evaluated_at=trusted_clock,
    phase0_baseline_report=committed_baseline,
    phase0_candidate_report=optional_exact_63_case_candidate,
    phase3_synthetic_report=optional_phase3_fixture_report,
    projection_doctor_report=optional_phase1_doctor_report,
    store_doctor_report=optional_phase2_doctor_report,
    controlled_write_observation=optional_write_observation,
    performance_observation=optional_performance_observation,
    restore_drill_observation=optional_restore_observation,
    access_audit_observation=optional_access_observation,
    schema_review_observation=optional_schema_review,
    scale_comparisons=optional_comparative_measurements,
)
verify_operational_readiness_report(report)
raw = operational_report_bytes(report)
```

All observation objects are exact, closed runtime contracts. Their schemas and fields are:

| Input schema | Required content-free fields |
|---|---|
| `memory-controlled-write-reliability/v1` | measurement window, valid append attempts, successful appends, rejected invalid writes, committed-event loss count |
| `memory-performance-observation/v1` | measurement window, issuer-query count, retrieval p95 milliseconds, context-compilation p95 milliseconds |
| `memory-restore-drill-observation/v1` | performed time, full-restore completion, recovery milliseconds, committed-event loss count |
| `memory-access-audit-observation/v1` | measurement window, completion, known policy leaks, post-cutoff fact count |
| `memory-schema-deprecation-review/v1` | reviewed time, completion, overdue schema count |
| `memory-scale-comparison/v1` | candidate, workload digest, sample size, reference/candidate SLO result, correctness regressions, known policy leaks |

Unknown fields fail closed, preventing notes, retrieved text, credentials, paths, or protected source
content from being copied into the operational report. Each accepted input is reduced to a canonical
SHA-256 commitment and its bounded aggregate measurements. These digests prove byte integrity, not
authorship: the operator must obtain reports and observations from authenticated runners or an
otherwise trusted out-of-band channel.

## Production adoption is not the synthetic gate

The production-adoption row remains `unmeasured` unless a candidate report evaluates the exact 63
held-out Phase 0 cases, binds the reviewed benchmark digest, preserves the same case IDs and
categories, and uses the exact same corpus as the reviewed baseline. Each Phase 0 report must carry
the closed corpus anchor (`sha256`, `total_bytes`, and positive `unique_files_considered`). Phase 6
copies both normalized corpus anchors into the report and records whether they match. A mismatch is
reported as `comparison: corpus-mismatch` with `status: unmeasured`; it is never scored as a metric
win or loss, while the candidate report digest, corpus anchor, and normalized metrics remain visible
for audit. A passing candidate with a matching corpus must:

- have no regression in complete evidence recall, path recall, or mean reciprocal rank;
- strictly improve at least one of those metrics; and
- have zero protected-path intrusions, temporal forbidden-path hits, and temporal-leakage cases.

The Phase 3 synthetic benchmark has its own row and
`counts_as_production_adoption: false`. It can prove its bounded deterministic fixture gate; it
cannot substitute for the repository-wide 63-case adoption measurement, model-held-constant shadow
review, or downstream investment outcomes.

The Phase 3 input is not trusted merely because `gate.passed` is true. Phase 6 requires the exact
closed report/case/metric/gate/aggregate/latency shapes emitted by
`memory_retrieval_benchmark.py`, recomputes aggregate recall and MRR, derives every leakage,
contradiction, lineage, rebuild, non-regression, and strict-improvement failure from the case rows,
and requires the supplied gate result to match those findings.

## Anchored operational evidence

- The Phase 1 doctor report must show a healthy non-empty projection. Its command contract performs
  two clean rebuilds and verifies one logical digest; the Phase 6 report retains the report and
  projection digests.
- The Phase 2 store doctor must report two deterministic rebuilds and
  `checks.external_anchor: verified`. A self-consistent store without the external expected-manifest
  anchor fails rather than becoming its own rollback authority.
- Controlled-write reliability excludes rejected invalid writes from the success-rate denominator.
  A loss of any committed event fails its evidence row independently of append availability.
- RPO is met only when both controlled-write and restore observations report zero committed-event
  loss. Missing either side is `unmeasured`.
- The projection doctor report does not contain an authenticated run time. It proves rebuild
  correctness, but the monthly rebuild-cadence SLO remains `unmeasured`; callers must not relabel a
  replayed report as a fresh drill.
- The material-claim-lineage SLO remains `unmeasured` in v1 because neither the Phase 0 file
  retrieval report nor the Phase 3 synthetic fixture measures every material production retrieval.

## Fixed SLOs

The report encodes the architecture plan's initial targets and operational cadences directly rather
than accepting caller-selected thresholds:

| SLO | Target |
|---|---:|
| Canonical event schema/hash integrity | 100% |
| Material retrieved claim evidence or explicit inference | 100% |
| Known policy leaks | 0 |
| Post-cutoff facts | 0 |
| Successful valid canonical appends | at least 99.9% |
| Ordinary issuer retrieval p95 | under 2,000 ms |
| Context compilation p95 | under 5,000 ms |
| Committed-event loss RPO | 0 |
| Full-restore RTO | at most 14,400,000 ms (four hours) |
| Projection rebuild | monthly (31-day operational bound) |
| Full restore, benchmark refresh, access audit, schema review | quarterly (92-day operational bound) |

An overall result is `failed` when any measured required component fails, `met` only when every
required component is measured and met, and otherwise `unmeasured`. Thus a green synthetic fixture
cannot hide missing adoption, production-lineage, cadence, or restore evidence.

## Scale decision rule

The report always emits decisions for PostgreSQL, a dedicated graph engine, a vector index, and a
remote object store. With no comparative measurement the actions are respectively `stay-sqlite` and
`do-not-add`. An action can become `consider-*` only when all of the following are measured:

1. the reference system misses the workload SLO;
2. the candidate meets it on a non-empty sample;
3. the candidate introduces no correctness regressions; and
4. the candidate has no known policy leak.

`consider-*` is an evidence-backed review signal, not permission to provision or migrate. If the
SQLite reference already meets the SLO, expansion remains unjustified even when an alternative is
faster. Graph, vector, remote-storage, and PostgreSQL products therefore remain deferred until a
real workload establishes need.

## Read-only CLI

The CLI reads bounded regular non-symlink JSON files, emits one canonical report on stdout, and has
no output-path or scheduling option:

```bash
PYTHONPATH=scripts python3 scripts/memory_operations.py report \
  --evaluated-at 2026-08-21T12:00:00Z \
  --phase0-baseline frameworks/memory/phase0/baseline-report.json \
  --phase0-candidate /trusted/phase0-candidate-report.json \
  --phase3-synthetic /trusted/phase3-synthetic-report.json \
  --projection-doctor /trusted/projection-doctor-report.json \
  --store-doctor /trusted/store-doctor-report.json \
  --controlled-write-observation /trusted/write-reliability.json \
  --performance-observation /trusted/performance.json \
  --restore-drill-observation /trusted/restore-drill.json \
  --access-audit-observation /trusted/access-audit.json \
  --schema-review-observation /trusted/schema-review.json \
  --shadow-evaluation /trusted/shadow-evaluation-report.json \
  --shadow-adjudicator-public-key /external/shadow-adjudicator-ed25519.pub \
  --shadow-adjudicator-key-id memory-shadow-adjudicator
```

Exit codes are `0` for `met`, `1` for `failed`, `2` for `unmeasured`, and `4` for refused malformed
evidence. Tests use temporary files and in-memory synthetic observations only; they neither schedule
automation nor touch a production object store, projection, event stream, or canonical sink.

Run the focused gate from the repository root:

```bash
PYTHONPATH=scripts python3 scripts/test_memory_operations.py
```
