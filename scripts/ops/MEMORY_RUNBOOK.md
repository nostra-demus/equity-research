# Production memory operations

This runbook owns the operational boundary for the equity-research three-layer memory runtime. It
does not change the research constitution, activate a lesson, or promote a playbook. Canonical
promotion still requires a `codex/memory-promotion-*` pull request and the controlled writer.

## Private state and identities

Keep all runtime paths outside Git and owned by the production user. Directories are `0700`; files
and keys are `0600`. Copy `memory-maintenance.json.example` to
`~/.config/nostra-engine/memory-maintenance.json`, replace every placeholder, then set mode `0600`.
Never paste the resulting file into logs, issues, or a pull request.

For a new host, initialize the private read-only shadow boundary with the reviewed bootstrap instead
of creating keys or writer anchors by hand. The command refuses an unverified existing root, generates
raw owner-only keys, creates an empty shadow-only controlled-writer anchor, signs the exact provider
policy, proves one deterministic projection rebuild, and writes all settings atomically to the
owner-only `providers.env`. It does not configure a canonical-writer service or credential and cannot
enable `enforced` mode or activate a lesson/playbook.

```bash
python3 scripts/memory_shadow_bootstrap.py provision \
  --provider-model codex/gpt-5.6-sol \
  --provider-model codex/gpt-5.6-terra \
  --provider-model claude/sonnet
```

Restart the engine after a successful result:

```bash
launchctl kickstart -k "gui/$(id -u)/com.nostradamus.engine"
sleep 5
curl --max-time 10 -fsS http://127.0.0.1:8787/api/memory/runtime | python3 -m json.tool
```

Activation passed only when the response has `available: true`, `mode: shadow`,
`effective_mode: shadow`, and no critical `projection-missing` or runtime alert. A readiness status of
`unmeasured` is expected during shadow collection and does **not** authorize enforced mode. Rerunning the
same provision command is an integrity check and does not rotate keys. `status` re-verifies (or cleanly
rebuilds) the exact shared projection without touching `providers.env`.

Use a different service identity and credential for each role. The shadow bootstrap configures only the
read-only projection/query role and the independently-tokened emergency-quarantine role. Candidate
intake, verification, canonical writing, promotion, and restore remain visibly unconfigured until their
separate production credentials exist; a service-name label alone is not a credential.

| Role | Runtime setting |
|---|---|
| Projection/query | `NOSTRA_MEMORY_PROJECTION_SERVICE_IDENTITY` |
| Candidate intake | `NOSTRA_MEMORY_CANDIDATE_INTAKE_IDENTITY` |
| Independent verification | `NOSTRA_MEMORY_VERIFIER_IDENTITY` |
| Canonical writer | `NOSTRA_MEMORY_WRITER_OWNER` |
| Promotion PR creation | `NOSTRA_MEMORY_PROMOTION_SERVICE_IDENTITY` |
| Emergency quarantine | `NOSTRA_MEMORY_QUARANTINE_SERVICE_IDENTITY` |
| Restore/retirement | `NOSTRA_MEMORY_RESTORE_SERVICE_IDENTITY` |

The quarantine HTTP operation additionally requires a long random
`NOSTRA_MEMORY_QUARANTINE_TOKEN`. It is accepted only in
`x-nostra-memory-quarantine-token`, checked in constant time, origin-checked, and rate-limited. Do
not reuse the publication token or a provider credential.

`NOSTRA_MEMORY_WRITER_OWNER_PATH` is the separate owner-record pathname consumed by projection
preparation. It must never be overloaded with the canonical-writer service identity above.

## Runtime switches

The owner-only control file is `<state_root>/controls/runtime-controls.json`. Do not edit it by
hand. Use `scripts/memory_incident_control.py` so every change is hash-bound, atomic, and has an
append-only audit receipt.

```bash
python3 scripts/memory_incident_control.py \
  --state-root /absolute/private/memory-runtime --actor emergency-quarantine \
  global-disable

python3 scripts/memory_incident_control.py \
  --state-root /absolute/private/memory-runtime --actor emergency-quarantine \
  layer-disable --layer semantic

python3 scripts/memory_incident_control.py \
  --state-root /absolute/private/memory-runtime --actor emergency-quarantine \
  playbook-quarantine --playbook-id memory-playbook-example --version 2 \
  --reason serious-evidence-error
```

The global switch prevents new memory snapshots and stops a frozen run before another provider
dispatch. Layer and playbook switches are enforced by packet compilation. They cannot hide a
mandatory correction, prior miss, or required playbook: that task stops instead. A version pin is
accepted only when that exact active version exists in the frozen projection.

Candidate intake uses the same control file. The shared guard serializes semantic and procedural
batches, caps the pending queue at 1,000 visible records, and caps intake at 30 batches per minute.

## Maintenance schedule

`install-services.sh --role doer` installs three model-free LaunchAgents:

- `com.nostradamus.memory-observability`: content-free packet/SLO metrics each day at 02:45.
- `com.nostradamus.memory-rebuild`: clean projection rebuild at 03:10 on the first day of each
  month.
- `com.nostradamus.memory-recovery-drill`: disposable full restore and purge drill at 03:30 on the
  second day of January, April, July, and October.

Run either once before enabling its timer:

```bash
python3 scripts/memory_maintenance.py \
  --config "$HOME/.config/nostra-engine/memory-maintenance.json" clean-rebuild

python3 scripts/memory_maintenance.py \
  --config "$HOME/.config/nostra-engine/memory-maintenance.json" recovery-drill
```

The recovery drill requires an externally managed backup with an out-of-band tree digest and store
manifest digest. It copies that backup into a private disposable directory, verifies every protected
store entry through the store doctor, and then creates and purges a synthetic canary across projection,
packet cache, candidate, resume, execution-receipt, and backup lanes. It never mutates the live store.
The temporary restore is deleted before the content-free drill observation is published.

Maintenance observations live under `<state_root>/operations/`. A rebuild or drill failure produces
a non-zero launchd exit and leaves the prior verified observation intact.

Collect content-free packet latency evidence and publish a readiness report only from explicit
evidence files:

```bash
python3 scripts/memory_observability.py collect-performance \
  --state-root /absolute/private/memory-runtime

python3 scripts/memory_observability.py publish-readiness \
  --state-root /absolute/private/memory-runtime \
  --evaluated-at 2026-08-26T00:00:00Z \
  --phase0-baseline frameworks/memory/phase0/baseline-report.json \
  --phase0-candidate /absolute/private/memory-runtime/operations/phase0-candidate-report.json \
  --phase3-synthetic /absolute/private/memory-runtime/operations/phase3-report.json \
  --projection-doctor /absolute/private/memory-runtime/operations/projection-doctor.json \
  --store-doctor /absolute/private/memory-runtime/operations/store-doctor.json \
  --controlled-write /absolute/private/memory-runtime/operations/controlled-write-observation.json \
  --performance /absolute/private/memory-runtime/operations/performance-observation.json \
  --restore-drill /absolute/private/memory-runtime/operations/latest-restore-observation.json \
  --access-audit /absolute/private/memory-runtime/operations/access-audit-observation.json \
  --schema-review /absolute/private/memory-runtime/operations/schema-review-observation.json \
  --rebuild-observation /absolute/private/memory-runtime/operations/latest-rebuild-observation.json \
  --shadow-evaluation /absolute/private/memory-runtime/operations/shadow-evaluation-report.json \
  --shadow-adjudicator-public-key /absolute/external/memory-shadow-adjudicator-ed25519.pub \
  --shadow-adjudicator-key-id memory-shadow-adjudicator
```

Omitted evidence stays `unmeasured`; the publisher never infers a pass. Packet compilation time is
also used as a conservative upper bound for retrieval until a separately instrumented retrieval
span exists.

## Release evidence and enforced mode

Generate the Phase 0 candidate report under the private state root. It runs the reviewed ranker on
the exact 63-case pinned corpus; do not edit or copy the frozen baseline.

```bash
python3 scripts/memory_phase0_candidate.py \
  --output /absolute/private/memory-runtime/operations/phase0-candidate-report.json
```

Before the first live pair, freeze the evaluation mode, providers, models, clock, and fixed release
thresholds. Record each independently adjudicated observation through the CLI so it is hash-bound
to that exact preregistration and stored owner-only.

```bash
python3 scripts/memory_shadow_evaluation.py preregister \
  --evaluation-id memory-shadow-eval-2026q3 \
  --mode production-shadow --registered-at 2026-08-26T00:00:00Z \
  --provider-model codex/gpt-5.5 --provider-model claude/claude-opus \
  --output /absolute/private/memory-runtime/operations/shadow-preregistration.json

python3 scripts/memory_shadow_evaluation.py record \
  --preregistration /absolute/private/memory-runtime/operations/shadow-preregistration.json \
  --input /absolute/private/memory-runtime/shadow-intake/pair-0001-draft.json \
  --output /absolute/private/memory-runtime/shadow-observations/pair-0001.json

python3 scripts/memory_shadow_evaluation.py evaluate \
  --preregistration /absolute/private/memory-runtime/operations/shadow-preregistration.json \
  --observation /absolute/private/memory-runtime/shadow-observations/pair-0001.json \
  --adjudicator-private-key /absolute/external/memory-shadow-adjudicator-ed25519.seed \
  --adjudicator-key-id memory-shadow-adjudicator \
  --adjudicator-id independent-shadow-adjudicator \
  --attested-at 2026-08-26T00:01:00Z \
  --output /absolute/private/memory-runtime/operations/shadow-evaluation-report.json
```

The evaluation command needs every observation (at least 100); repeat `--observation` for the closed
set. Its preregistration freezes the self-discovered analytical roster, and the gate remains closed
until the sample covers every specialist, module synthesizer, and master synthesizer. Separately run
the real packet compiler/retriever against all 40 held-out cases, without giving it
expected/forbidden fields, then score the closed result:

```bash
python3 scripts/memory_three_layer_benchmark.py \
  --candidate /absolute/private/memory-runtime/operations/three-layer-candidate-results.json \
  --runtime-private-key /absolute/external/memory-benchmark-runner-ed25519.seed \
  --runtime-key-id memory-benchmark-runner \
  --runtime-runner-id production-memory-benchmark-runner \
  --attested-at 2026-08-26T00:00:00Z \
  --output /absolute/private/memory-runtime/operations/three-layer-benchmark-report.json
```

Only after the readiness, 40-case, shadow, and provider-parity gates all pass may the independent
release identity create a short-lived activation. The private key stays outside the mutable runtime
state; runtime receives only the public key.

```bash
python3 scripts/memory_enforcement.py activate \
  --readiness /absolute/private/memory-runtime/operations/readiness-report.json \
  --three-layer /absolute/private/memory-runtime/operations/three-layer-benchmark-report.json \
  --shadow /absolute/private/memory-runtime/operations/shadow-evaluation-report.json \
  --private-key /absolute/external/memory-enforcement-ed25519.seed \
  --public-key /absolute/external/memory-enforcement-ed25519.pub \
  --benchmark-public-key /absolute/external/memory-benchmark-runner-ed25519.pub \
  --benchmark-key-id memory-benchmark-runner \
  --adjudicator-public-key /absolute/external/memory-shadow-adjudicator-ed25519.pub \
  --adjudicator-key-id memory-shadow-adjudicator \
  --key-id memory-enforcement-release \
  --expires-at 2026-09-20T00:00:00Z \
  --output /absolute/private/memory-runtime/operations/enforcement-activation.json
```

Set `NOSTRA_MEMORY_ENFORCEMENT_PUBLIC_KEY`, `NOSTRA_MEMORY_ENFORCEMENT_KEY_ID`,
`NOSTRA_MEMORY_BENCHMARK_PUBLIC_KEY`, `NOSTRA_MEMORY_BENCHMARK_KEY_ID`,
`NOSTRA_MEMORY_SHADOW_ADJUDICATOR_PUBLIC_KEY`, and
`NOSTRA_MEMORY_SHADOW_ADJUDICATOR_KEY_ID`. The activation, readiness, three-layer, and shadow paths default to the filenames above under
`<state_root>/operations/`; override them with `NOSTRA_MEMORY_ENFORCEMENT_ACTIVATION`,
`NOSTRA_MEMORY_ENFORCEMENT_READINESS`, `NOSTRA_MEMORY_ENFORCEMENT_THREE_LAYER`, and
`NOSTRA_MEMORY_ENFORCEMENT_SHADOW` only when the private-state layout differs. Set
`NOSTRA_MEMORY_MODE=enforced` last. An absent, expired, altered, unmeasured, synthetic, or
provider/model-mismatched activation stops before paid dispatch. Never weaken this gate to start a
run. Readiness evidence older than 24 hours and shadow evidence older than 30 days cannot mint a new
activation. The promotion service sets `created_at` from its own UTC clock; callers cannot backdate
it. The release signer, benchmark runner, and shadow adjudicator public keys and key IDs must be
pairwise distinct. A run whose final paid dispatch occurred before expiry may still finalize afterward.

## Cockpit and alerts

The existing `GET /api/memory` contract stays compatible. The production engine also exposes:

- `GET /api/memory/runtime`
- `GET /api/memory/runs/:runId`
- `GET /api/memory/lessons`
- `GET /api/memory/playbooks`
- `GET /api/memory/candidates`
- `POST /api/memory/playbooks/quarantine`

All reads are `no-store`, bounded, metadata-only, and omit protected wrappers. The Memory Explorer
shows layer counts, packets, used/rejected/contradicted items, executions, deviations, candidates,
promotions, quarantines, SLOs, and configured identity roles. It alerts on the global switch,
disabled layers, local playbook quarantines, failed or unmeasured readiness, blocked/partial runs,
and a large promotion backlog.

The legacy `memory-ui/1` Explorer read is pre-warmed when the control plane starts. Its latest
curated, verified response is atomically persisted at `<engine_state>/memory-ui/verified-read.json`
inside an owner-only directory and file (`0700` / `0600`) on the Unix production hosts. Windows
keeps the bounded live reader but disables durable hydration because Node cannot prove that Unix
owner-only mode boundary there. Restart hydration rechecks ownership,
link count, mode, size, schema, internal counts, and the response digest before serving it. Missing,
expired, future-dated, corrupt, hard-linked, or symlinked state is ignored and a bounded live rebuild
is attempted. A cold projection command has a one-minute ceiling inside the browser's 65-second
Memory budget. The fixed last-known-good deadline is never extended by a failed refresh. The Explorer
searches a bounded newest-first working set; older records remain in canonical memory, so corpus
growth cannot turn the UI response into an unbounded payload or make the endpoint unavailable merely
because the history passed a display limit.

## Incident order

1. Activate the narrowest local switch that removes the unsafe content. Use the global switch for
   uncertain scope.
2. Confirm `/api/memory/runtime` reports the switch and effective mode.
3. Preserve content-free audit receipts and relevant task/run episode IDs.
4. Open the governed correction, quarantine, supersession, or deprecation pull request.
5. Rebuild and verify the projection; do not restore retired content from an old packet or backup.
6. Remove the local switch only after canonical status, purge propagation, and provider policy are
   verified.

No operator may use these controls to create a positive rating lift, weaken evidence rules, or turn
an agent-authored candidate into active memory.
