# Production three-layer research memory

## Status

This document is the reviewed authority and security contract for the production upgrade. The
checked-in schemas and validators are active contract surfaces; production dispatch remains disabled
until the staged rollout reaches its shadow and enforcement gates. Existing decisions, reviews,
corrections, forecasts, source files, calibration outputs, and integrity records stay authoritative
and byte-identical.

The implementation reuses the policy-partitioned store, controlled writer, deterministic adapters,
SQLite/FTS projection, exact-byte resolver, purge receipts, and operational-readiness report. A
remote vector, graph, or database service is out of scope unless measured SLO evidence later proves
the local design inadequate.

## Authority

Memory is subordinate to the research program. Conflicts resolve in this order:

1. `AGENTS.md`, its doctrine twin, module rules, and the canonical source hierarchy.
2. Deterministic schemas, validators, calculations, score caps, and finish gates.
3. Active, independently reviewed procedural playbooks.
4. Active, independently reviewed semantic lessons.
5. Prior episodes and generated historical narrative.

An episode says what happened; it cannot prove a current fact. A semantic lesson can require a
current check or impose a reviewed negative policy; it cannot raise data sufficiency, edge,
confidence, position size, or rating. A playbook organizes work; it cannot relax evidence,
sufficiency, red-flag, cap, abstention, or source rules. A prior success may focus a run but never
creates a positive rating lift.

When an active playbook governs a task, the prompt names its ID and version. Detailed steps live in
the playbook only. General constitutional rules remain in prompts and always outrank the playbook.
CI rejects duplicated detailed procedures and contradictory authority claims before enforcement.

## Write and promotion authority

Analytical agents may write only bounded task outputs, `memory-use/v1` declarations, and inert
candidate suggestions. They cannot write canonical memory, activate a lesson or playbook, mutate the
active set, write Git, or approve their own correction or supersession.

The supervisor validates outputs and use declarations, commits exact output and packet hashes, and
creates deterministic task/run episodes. Independent verifier identities evaluate semantic and
procedural candidates. Public/internal activation uses `codex/memory-promotion-*` branches and pull
requests. The promotion GitHub App may create the branch and PR but cannot push or merge directly to
`main`. Protected memory stays encrypted outside Git; the PR carries only a signed, content-free
activation commitment. Required CI and automated review must pass without an admin bypass.

Candidate author, extraction verifier, applicability reviewer, evidence reviewer, security reviewer,
canonical writer, and promotion author are distinct authority roles. `validate_promotion_bundle`
rejects an author that appears in the verifier or promotion-review set and binds the manifest to the
exact candidate, evaluation, target ID, target schema, and target version.

## Frozen run boundary

One receipt governs one run:

1. Resolve the legal issuer and tradable listing from legal name, venue, currency, and available
   LEI/FIGI/ISIN/MIC+ticker identifiers. A ticker-only or ambiguous match fails.
2. Freeze repository SHA, projection digest, policy clock, provider/model/service identity,
   entitlements, embedding permissions, active playbook versions, and `as_of_system_time`.
3. Verify the production projection, then try one deterministic local rebuild.
4. Create an owner-signed, content-free `research-memory-run-receipt/v1`.
5. Store content packets under the policy-partitioned local state root with owner-only permissions.
6. Stop before paid dispatch if neither snapshot verifies. A verified empty snapshot is valid.

Monolithic, chained, standalone-module, concurrent-sibling, interrupted, and exact-resume paths reuse
the same receipt. Incomplete sibling tasks never enter memory. A deliberate rerun gets a new receipt
linked to the earlier run. A provider switch on resume triggers fresh authorization against the same
pinned snapshot; it cannot change the snapshot.

## Packet and provider boundary

The trusted access scope fixes provider, model, service identity, classifications, source tiers,
entitlement digest, and embedding permissions. A query can narrow these values but cannot widen them.
Mandatory content that the provider cannot receive stops dispatch. Optional unauthorized content is
omitted with a reason that reveals neither protected identifiers nor hidden-corpus counts.

For the same trusted scope, Claude and Codex receive identical canonical packet bytes. Transport
wrappers may differ, packet content may not. Packets contain separate episode, semantic, and
procedure sections. They rank mandatory exact-listing corrections and misses first, then required
playbooks, other exact-listing episodes, semantic lessons, and optional cross-company examples.

Token ceilings are 3,000 for specialists, 4,000 for module synthesizers, and 6,000 for the master.
Mandatory corrections, unresolved misses, and required playbooks are never truncated. Optional
cross-company semantics leave first. Mandatory overflow fails before dispatch. Compilation must stay
below five seconds p95 and median provider/model-matched steady-state cost overhead must not exceed
25 percent.

## Memory-content security

All retrieved content is untrusted data. `render_untrusted_packet` emits fixed, explicit data
delimiters and JSON-quoted entries beneath an immutable warning. Episode and semantic contracts are
closed and reject instruction/tool fields. Raw legacy prose cannot carry an executable tool route.
Only an active `memory-playbook/v1` may contain ordered procedure steps, and every referenced tool
must be in the reviewed deterministic allowlist in `memory_three_layer_contract.py`.

Canonical hashes are checked before dispatch and after completion. A packet hash confirms the exact
bytes the agent saw; it does not make the content evidence. Evidence remains usable only through its
exact current-run evidence span and the ordinary source hierarchy.

Threats tested at the contract boundary include instruction injection, delimiter spoofing,
fabricated use receipts, provider authority widening, listing collisions, hidden-corpus oracles,
stale/superseded facts, playbook conflicts, non-allowlisted commands, self-promotion, hash tampering,
rollback, and transitive purge failures.

## Layer contracts

### Episodes

`memory-task-episode/v1` records issuer/listing, run/task/agent, provider/model, prompt-program SHA,
output and packet commitments, status, latency, cost, gates, attestation, procedure execution, and
machine-readable errors. `memory-run-episode/v1` aggregates only completed task episodes. Generated
narrative is not canonical truth.

Legacy decisions, reviews, corrections, forecasts, calibration records, and integrity records are
adapted without rewriting or duplicating their original bytes. The 127 historical module syntheses
remain searchable episode evidence only. They are never mined automatically into active facts or
procedures.

### Semantics

`memory-semantic-candidate/v1` is inert. `memory-semantic-lesson/v1` requires supporting and
contradicting evidence, applicability, valid time, ownership, independent verification,
supersession, and a review date within 180 days.

- Exact-issuer: one structured correction or reviewed outcome; issuer/listing scope only.
- Official policy: one authoritative policy source; jurisdiction and valid-time scope required.
- Cross-company empirical: at least five effective observations and five distinct issuers.
- New facts: exact evidence-span resolution and an independent extraction verifier.
- Historical prose: episode search only; never automatic promotion.

### Procedures

`memory-playbook-candidate/v1` is inert. An active `memory-playbook/v1` carries ID/version, owner,
risk, expiry/prior version, exact applicability, inputs, ordered steps, evidence, outputs, prohibited
shortcuts, fallback, abstention, deterministic tools, source episodes, counterexamples, validation
cases, and measured effect.

Mechanical procedures must pass the origin, two held-out cases, and one non-applicable
counterexample. Analytical/high-risk procedures also need a resolved outcome-review case.
Cross-company use requires evidence on at least two issuers. Citation, qualifier, temporal,
abstention, and serious-error metrics cannot regress. Evidence, applicability, and security
reviewers approve independently.

Applicability chooses issuer, then jurisdiction, then sector, then global specificity. Equally
specific conflicts cause abstention. One policy leak, stale-fact use, injection vulnerability, or
serious evidence error quarantines the version immediately. Two ordinary failed executions open a
review/deprecation PR. A playbook never writes a rating; only existing deterministic policy can cap
one.

## Usage verification

Every analytical task returns `memory-use/v1`. It distinguishes used, checked/rejected,
contradicted, and inapplicable records; names current evidence; declares playbook execution or
deviation; and commits candidate suggestions by hash.

The supervisor creates `memory-use-attestation/v1` only after checking output correspondence,
current evidence, playbook steps, undeclared memory use, and canonical hashes. `valid` is the
conjunction of those checks. In enforced mode an invalid declaration invalidates the analytical
output under the existing retry policy. Any unresolved memory-contract failure blocks final Ideas
admission.

## Retention, incident, and recovery boundary

Purge and entitlement withdrawal propagate through canonical objects, projections, lexical/vector
indexes, packet caches, candidate queues, resume directories, backups, and any execution receipt
that contains content. Only policy-permitted content-free hashes, tombstones, and audit receipts may
remain. Resume resolves all packet entries again after purge; stale packets and backups cannot
restore retired data. Controlled-head retirement uses the existing signed reconciliation protocol
and an external checkpoint outside the writer's mutable state.

Production identities are split across read-only query, candidate intake, independent verification,
controlled writing, GitHub promotion, emergency quarantine, and restore/retirement. Operations
provide a global kill switch, per-layer and per-playbook switches, bounded last-known-good fallback,
immediate quarantine, version-pinned rollback, batching/rate limits, and alerts. Monthly clean
rebuilds and quarterly restore/purge drills are required evidence, not calendar claims.

## Compatibility and gates

V1 contracts and `GET /api/memory` remain compatible. New runtime/candidate/lesson/playbook views
expose curated metadata and lineage only. Raw protected text never crosses the UI boundary. Runtime
modes are `off`, `shadow`, and `enforced`.

The pinned 63-case Phase 0 benchmark must not regress and must improve at least one retrieval metric
with zero protected-path intrusion and zero post-cutoff facts. `three-layer-benchmark-v1.json` freezes
40 additional cases. Provider parity, live paired-shadow, cost/latency, long-term calibration, purge,
restore, and operational-readiness gates are defined by the delivery plan and remain blocking until
measured.

`scripts/memory_phase0_candidate.py` is the production-candidate ranker for the exact frozen Phase 0
corpus. It sees only the question, declared roots, and corpus bytes. Its current deterministic result
non-regresses every retrieval measure, strictly improves recall and reciprocal rank, and removes all
seven temporal forbidden-path hits without a protected-path intrusion. The reviewed baseline remains
immutable; readiness compares a freshly generated candidate report with that baseline.

The 40-case scorer accepts only a complete, closed runtime result set before it reads the scoring
fields. Synthetic CI can prove the scorer but cannot satisfy release evidence. A production result
must declare `runtime-held-out`, pass every case, and contain no forbidden record, false-current-
evidence use, qualifier loss, temporal leak, protected leak, or non-applicable procedure execution.

Live A/B release evidence is pre-registered with fixed thresholds. Every observation binds the exact
preregistration, prompt program, source pool, memory snapshot, access scope, canonical packet bytes,
provider/model, outputs, costs, and independent adjudicator. Baseline and memory outputs must have
the same contradiction, prior-defense, and abstention opportunity counts. Provider approval is
limited to Claude/Codex model pairs that received byte-equivalent packets in complete parity groups.
The preregistration also freezes the self-discovered analytical-agent roster. Global enforcement
cannot activate until every current specialist, module synthesizer, and master synthesizer appears
in the shadow sample; adding a new profiled agent invalidates an older activation until it is tested.

Enforced mode requires a current Ed25519-signed `memory-enforcement-activation/v1`. The activation
binds a fully met operational-readiness report, the passing runtime 40-case report, the passing
production-shadow report, and its exact approved provider/model set. It lives for at most 30 days.
The supervisor verifies it before snapshot work and again immediately before every paid dispatch;
missing, expired, tampered, synthetic, stale, or provider-mismatched evidence stops before spend.
Shadow mode never treats the activation as a pass and remains non-blocking.

## Production projection and lifecycle implementation

`scripts/memory_runtime.py` is the production read boundary. It reuses the reviewed repository
loader and deterministic SQLite projection; it is not a second canonical store. It accepts a
production projection only when the SQLite logical digest, current repository SHA, conservative
identity-registry digest, controlled-writer owner commitment, and an Ed25519 checkpoint held outside
writer-mutable state all agree. The checkpoint also commits the controlled head, which is reread
after preparation so a concurrent write cannot enter the frozen snapshot halfway through. Otherwise
it makes one clean rebuild attempt, signs and rereads the
new external checkpoint, and fails before dispatch if that cannot be proved. Runtime directories,
key files, owner records, checkpoints, and derived files are owner-only and no-follow.

The identity backfill reads only structured decision fields. Legal name, exact venue-to-MIC mapping,
currency, ticker, and any available LEI/FIGI/ISIN must agree. Unknown prose venues and listing
collisions remain excluded with diagnostics; ticker-only lookup is not exposed. The legacy adapter
now includes each structured `analyses/performance/*_calibration_summary.json` byte-for-byte as an
`equity_calibration_summary` episode.

Provider authorization validates `memory-provider-policy/v1`, requires one exact
provider/model/service match, and permits only a narrower classification/source-tier scope. Failure
codes reveal no protected record IDs or hidden counts. `RuntimeLifecycle` registers every runtime
derivative under an allowlisted lane and supplies the purge/absence hooks used by the existing
policy-partitioned store. A retirement deletes every registered projection, packet-cache, candidate,
resume, execution-receipt, and runtime-backup path and permanently blocks re-registration for that
event. Content-free path commitments may remain in the tombstone.
