# Production memory operations

This runbook owns the operational boundary for the equity-research three-layer memory runtime. It
does not change the research constitution, activate a lesson, or promote a playbook. Canonical
promotion still requires a `codex/memory-promotion-*` pull request and the controlled writer.

## Private state and identities

Keep all runtime paths outside Git and owned by the production user. Directories are `0700`; files
and keys are `0600`. Copy `memory-maintenance.json.example` to
`~/.config/nostra-engine/memory-maintenance.json`, replace every placeholder, then set mode `0600`.
Never paste the resulting file into logs, issues, or a pull request.

Use a different service identity and credential for each role:

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
  --performance /absolute/private/memory-runtime/operations/performance-observation.json \
  --restore-drill /absolute/private/memory-runtime/operations/latest-restore-observation.json
```

Omitted evidence stays `unmeasured`; the publisher never infers a pass. Packet compilation time is
also used as a conservative upper bound for retrieval until a separately instrumented retrieval
span exists.

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
