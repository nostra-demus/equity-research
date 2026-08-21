# Permanent memory Phase 5: controlled writes and feedback admission

Status: bounded local reference implementation, 2026-08-21.

Phase 5 adds a fail-closed coordinator for validated append-only claim and feedback events, typed
corrections, and an integrity-gated adapter into the existing forecast-calibration path. It does not
install a production service, make its reference NDJSON sink the exclusive Git writer, expose an
agent write tool, update the cockpit, or let retrieval feedback change an investment rating.

## Trust and authorization boundary

A `memory-controlled-write-request/v1` carries content, concurrency, and integrity commitments. It
does not carry authority. `ControlledWriter` requires deployment-owned callables and stable IDs for:

- write authorization for every submission;
- recovery authorization before journal repair, key cleanup, or request decryption;
- review authorization for corrections and feedback promotion/correction;
- exact candidate-provenance verification; and
- authoritative event resolution for `derived_from` and `supersedes` targets outside the local
  sink/store.

A write denial is ephemeral and occurs before coordinator state, the canonical sink, or the
protected store is read or changed. An authorized malformed request may be quarantined, but its
dead letter contains only a closed reason code and fixed content-free reason; it never retains the
event, feedback artifact, validation text, or caller-supplied error detail.

The candidate-provenance verifier must return a closed attestation binding the exact event, policy,
valid time, evidence references and their exact artifact/locator providers, envelope lineage, claim
domain lineage, and derivative-use decision. The coordinator recomputes those commitments and
rejects fabricated evidence, missing or ambiguous lineage, a stale attestation, or policy
laundering. V1 requires a derived claim to retain each parent event's exact storage policy. A
permissive verifier or resolver is outside this reference boundary and must not be used in a
deployment.

## Closed contracts

The public JSON schemas are:

| Contract | Purpose |
|---|---|
| `controlled-write-request-v1.schema.json` | Exact canonical event/feedback capsules, idempotency key, expected head, operation, and protected-store bindings |
| `controlled-write-result-v1.schema.json` | Committed, recovered, replayed, rejected, or quarantined result with head, sink, event, and provenance commitments |
| `controlled-write-dead-letter-v1.schema.json` | Content-free rejection/quarantine descriptor with a closed reason taxonomy |
| `feedback-review-v1.schema.json` | Review of one exact immutable Phase 4 feedback artifact |
| `correction-v1.schema.json` | One append-only replacement of exactly one claim or feedback-review event |
| `forecast-outcome-v1.schema.json` | Integrity-bound realized outcome and exact evidence references |
| `calibration-observation-v1.schema.json` | One eligible, existing-calibration-compatible forecast/outcome pair |

The supported write operations are `claim-append`, `claim-correction`, `feedback-promotion`, and
`feedback-correction`. The event and optional Phase 4 feedback artifact travel as canonical JSON
strings with separate SHA-256 commitments; open embedded subtrees and hash-mismatched capsules fail
closed.

## Routing, coordination, and recovery

Only `public` or `internal` events with `permanent` retention use the injected canonical sink.
Protected, source-policy, expiring, and tombstone-only records use the policy-partitioned Phase 2
`MemoryStore` and require exact object bindings. That route performs an authorized, read-only store
preflight before a durable prepare and revalidates under the store transaction during `put_event`.
Missing, tampered, conflicting, retired, unauthorized, or policy-mismatched objects therefore fail
without creating a prepared write.

The reference `NdjsonCanonicalSink` is a temp-directory-friendly append-only sink backed by
`scripts/append-ndjson.sh`. Its durable instance identity, ownership record, lock, and controlled
head bind one immutable writer state exclusively to that sink. Any configured protected store binds
the same coordinator/configuration under its own ownership record and lock. Writer configuration
commits the state root, canonical sink, optional protected store and journal key, and the injected
verifier/resolver identities. Restarting with a different configuration fails closed. The
controlled head also commits the canonical ledger digest, so an out-of-band append cannot be
mistaken for a coordinator transition. These controls do not make the file a production Git/PR
intake service or stop an unrelated process from changing it; exclusive operating-system/service
ownership must be supplied by the deployment.

The journal, sink head, and protected-store owner are mutually checking local records. They detect
one-sided truncation, drift, and configuration substitution, but they are not an externally
authenticated anti-rollback anchor if a hostile same-account process replaces every local surface
coherently. A production operator must retain a signed checkpoint/head commitment outside this
boundary and verify it during restart and recovery.

Accepted writes use an optimistic `expected_head`, an idempotency key, and a durable
prepare → sink/store → commit journal. Exact replay returns the original result without a second
append; reuse of the key for different request bytes or concurrent use of a stale head is
quarantined. A protected-route prepare stores only authenticated ciphertext under a per-write key;
the key is destroyed after commit/recovery. Recovery requires its own authorization, verifies the
writer configuration, request, route, event, and candidate-provenance commitments again, and then
idempotently completes the sink/store write.

Phase 2 store writes use exact write intents. Process-kill fixtures cover the atomic temporary file,
key envelope, ciphertext/content, and descriptor boundaries. An exact retry completes a known
intent; tampered or unattributed orphan bytes remain corruption and are never adopted.

`current_head` re-resolves every committed protected `EventRef` under current policy and fails
closed when one is no longer live. An unexplained missing, unauthorized, or retired reference
therefore stops the writer. `reconcile_retirement` is the only exception: after a separately
authorized verifier authenticates a signed, content-free proof, it binds the exact earlier
protected-store references and event hashes into a journaled retirement prepare → controlled-head
transition → commit. The accepted proof is either an exact Phase 2 purge receipt whose removed-event
scope matches the controlled commits and carries policy-safe tombstones, or an elapsed `expires`
policy whose per-event `retain_until` values match the committed references. Crash recovery repeats
the authorization and proof verification and completes the same transition exactly once. The old
event IDs remain reserved, the original write and retirement transition remain in point-in-time
history, and retired bytes are never read or restored.

The injected retirement verifier is the signed-checkpoint trust boundary. In production it must
verify the signature outside the writer's mutable local state and, for purge, authenticate the Phase
2 completion proof and absence checks. A caller-supplied receipt alone is not authority. Source-policy
entitlement withdrawal is still fail-closed rather than auto-reconciled because this narrow contract
does not yet define a durable signed withdrawal proof. The local journal/head pair is also not an
external anti-rollback anchor; deployments still need the externally retained signed checkpoint
described above.

## Corrections and point-in-time history

`claim.corrected` and `feedback.corrected` envelopes carry `memory-correction/v1`. A correction:

- supersedes exactly one event of the matching domain;
- keeps the target subject and exact storage policy;
- contains a hash-bound replacement in the matching closed schema;
- has a later system clock and explicit authority/evidence; and
- cannot form a second correction branch from the same predecessor.

The canonical correction envelope remains immutable history. The projection retains those raw bytes
and indexes a separately derived effective payload. Point-in-time retrieval therefore returns the
original before the correction clock and the replacement plus raw correction provenance after it.
A `memory-tombstone/v1` remains the distinct, content-free deletion path and is not treated as a
typed replacement payload.

## Feedback has no investment effect

A feedback promotion must bind the exact sealed Phase 4 artifact: feedback ID, content hash,
context-packet ID, packet hash, query hash, and reviewed item indices are recomputed. Accepted
feedback may be marked `reviewed-signal-only`; rejected or needs-work feedback has no retrieval
effect. In every case the schema fixes:

```json
{
  "rating_effect": "none",
  "confidence_effect": "none",
  "calibration_effect": "none"
}
```

The reference projection makes reviewed feedback auditable. It does not automatically rerank
retrieval, tune weights, change confidence, update ratings, or surface a cockpit control.

## Forecast calibration admission

`forecast_source_commitment` accepts only exact canonical decision-record bytes carried by a valid
`decision.recorded` event and the closed verified integrity result produced by the existing ledger
path. A mandatory out-of-band integrity verifier must attest to that exact event, record, and
integrity tuple.

`eligible_forecast_outcome` then requires the exact forecast to occur once in the authoritative
ledger, enforces status/window/observation/as-of clocks, validates the outcome payload commitment,
and requires a second out-of-band attestor to bind the exact unsigned outcome, evidence references,
resolved-evidence commitment, and trusted `as_of`. It delegates probability/result matching to
`calibrate.match_resolved_forecasts` and emits `memory-calibration-observation/v1` only when the
existing join produces exactly one result. A caller-authored `integrity.status: verified` alone is
never admission evidence.

## Verification

Run the focused reference gates from the repository root:

```bash
PYTHONPATH=scripts python3 scripts/test_memory_phase5_contract.py
PYTHONPATH=scripts python3 scripts/test_memory_controlled_write.py
PYTHONPATH=scripts python3 scripts/test_memory_phase5_projection_retrieval.py
PYTHONPATH=scripts python3 scripts/test_memory_store_preflight.py
PYTHONPATH=scripts python3 scripts/test_memory_store_orphan_recovery.py
```

The tests are synthetic and temporary-directory only. They cover closed shapes, exact provenance,
authorization order, sanitized dead letters, idempotency, optimistic concurrency, sink ownership,
configuration drift, correction point-in-time behavior, store preflight, signed purge/expiry
retirement replay, rollback detection, and crash/orphan recovery.
They do not measure production append reliability, prove service-level exclusivity, call a real
model, approve feedback, supply a production signing/checkpoint service, update the cockpit, or
demonstrate a rating/calibration improvement.
