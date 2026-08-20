# Self-Healing Reliability Plan

## Decision

Claude's diagnosis is directionally correct: the common failure is stale operational assumptions, and the right promise is **bounded degradation with explicit loss accounting**, not "always works." The proposed five-item ladder is a good start, but it is not yet safe to implement as written.

Three refinements are essential:

1. Provider model discovery does not prove that the configured credential is entitled, funded, or able to complete the real workload. Use a layered synthetic check, not a model-list check alone.
2. HTTP status alone does not determine permanence. A `404` may mean a retired model, a wrong endpoint, a deployment name, or an account-specific entitlement. Classify the provider's structured error code and message, quarantine the exact configuration fingerprint, and preserve fallback.
3. A static backlog percentage is weaker than a forecast. Alert on **time to either loss boundary**—capacity overflow and age expiry—with 50% as an early floor, not the sole trigger.

This plan therefore builds one reliability control loop around the engine's existing provider, cooldown, budget, diagnostics, and backlog machinery. It does not build a parallel scheduler or monitoring product.

## What the current engine already has

Reuse these seams before adding anything:

- One central `NEWS` configuration and a discovered provider chain.
- Shared provider budgets, rate limiters, cooldown markers, and structured diagnostic rows.
- Separate diagnostics for retry holds, configured allowance exhaustion, provider-reported day limits, rejected credentials, pacing, and unreadable ledgers.
- Consecutive-failure and failure-duration telemetry.
- A durable deferred queue with a hard capacity boundary, an age boundary, trend, and explicit counters for both overflow loss and age-expiry loss.
- A cockpit diagnostics panel and tests for the distinctions above.
- Existing scheduled-service installation patterns under `scripts/ops/` and CI under `.github/`.

The implementation should extend those contracts. A second health-state store, another fallback router, or provider-specific UI logic would create contradictory truths and should be rejected.

## Reliability contract

The finished system must uphold these invariants:

- **No silent loss:** every item is in exactly one terminal or recoverable state: scored, durably deferred, deliberately retired by a documented policy, or counted as lost with a reason.
- **No infinite retry of a standing fault:** a terminal configuration fault is quarantined after bounded evidence and is not retried until its configuration fingerprint changes or a scheduled low-rate probe succeeds.
- **No false provider claims:** engine allowance, provider-reported quota, billing/credit state, model availability, credential entitlement, latency, and workload success remain separate fields.
- **Fallback remains live:** quarantining one provider cannot disable later tiers.
- **Health is workload-specific:** a cheap probe passing does not declare the production triage path healthy unless an equivalent payload and response contract also pass.
- **Every automatic repair is reversible and audited:** old value, new value, evidence, actor, timestamp, expiry, and rollback result are recorded.
- **Configuration has one source of truth:** scheduled checks, runtime calls, diagnostics, and documentation resolve the same provider/model settings.
- **Unknown fails safe:** an unreachable health endpoint is `unknown`, not `healthy`, and does not overwrite the last known good configuration.

## Failure taxonomy and policy

Create one provider-neutral classifier used by every LLM call path. The classifier consumes HTTP status, provider error code/message, headers, timeout phase, and local validation outcome.

| Class | Examples | Runtime action | Retry policy | Operator state |
| --- | --- | --- | --- | --- |
| `auth` | invalid/revoked key | fall through | quarantine after 2 corroborating failures | credential action required |
| `entitlement` | model/account access denied | fall through | quarantine exact provider+model+credential fingerprint | plan/model action required |
| `billing` | credit exhausted, payment required | fall through | no hot-loop; probe near known reset or daily | funding action required |
| `model_terminal` | structured model retired/decommissioned/not found | fall through | quarantine exact model immediately when provider evidence is explicit; otherwise require 2 failures plus failed discovery | replacement required |
| `request_invalid` | context limit, unsupported parameter, malformed schema | do not blame provider | no identical retry; repair/split payload if deterministic | code/config defect |
| `rate_limited` | 429 with reset | fall through or wait within latency budget | respect reset/jitter; never mark credential dead | self-clearing |
| `transient_upstream` | 5xx, overload, connection reset | fall through | bounded exponential backoff with jitter and circuit breaker | self-clearing |
| `timeout` | connect/read/deadline | fall through | bounded retry only if remaining wall clock permits | capacity/latency warning |
| `contract_invalid` | 200 but unusable/malformed scoring response | fall through | bounded retry with repair prompt only once | model incompatibility if repeated |
| `local_state` | corrupt/unreadable budget or queue ledger | preserve data; stop unsafe mutation | no provider retry | storage action required |
| `unknown` | unrecognized response | fall through | conservative bounded retry | needs classification |

Two safeguards prevent the proposed "permanent failure" fix from becoming a new outage:

- Quarantine keys include provider, base URL, model, credential hash prefix, request-contract version, and relevant parameters. Changing any of them permits a fresh canary.
- A quarantine disables only the affected configuration and workload. It never deletes configuration, rewrites secrets, or suppresses the rest of the fallback chain.

## Delivery plan

### Phase 0 — Incident containment and baseline (same day)

1. Merge the narrow retired-model replacement only after confirming the replacement with the configured credential and a production-shaped triage response.
2. Preserve the current fallback chain and verify that the old model is absent from executable defaults, service templates, and operator docs.
3. Snapshot the last seven days of cycle ledgers: arrivals, scored throughput, deferrals, queue depth, oldest age, overflow loss, age-expiry loss, provider attempts, successful batches, and failure classes.
4. Record current provider configuration fingerprints and known reset windows without secret values.
5. Establish incident acceptance evidence: the primary can score, fallback can score with primary forced unavailable, and new arrivals no longer increase the queue faster than aggregate service.

**Exit:** no uncounted loss is occurring; the replacement path passes an end-to-end canary; the baseline is saved.

### Phase 1 — Canonical error semantics and terminal quarantine (1–2 days)

1. Extract the existing scattered response interpretation into a pure provider-neutral classifier.
2. Preserve provider adapters only for mapping structured provider codes/headers into the canonical evidence object.
3. Replace generic `401/402/403/404 = credential rejected` handling with the taxonomy above. A bare `404` must not automatically mean retirement.
4. Add a durable, atomic quarantine marker beside existing cooldown state. Include configuration fingerprint, class, evidence summary, first/last observed time, probe-after time, and clear reason.
5. Make every call path consult the same quarantine and fall through immediately.
6. Clear quarantine on a successful canary or configuration-fingerprint change. Do not clear it merely because a timer elapsed.
7. Surface terminal/quarantined separately from cooling, pacing, allowance spent, and provider-day-limited.

**Tests:** table-driven classification for every status/error family; ambiguous 404; malformed 200; fingerprint invalidation; cross-process atomicity; primary quarantine with successful fallback; no budget charge before a rejected call where existing reservation semantics permit it.

**Exit:** the retired-model fixture produces at most the bounded confirmation calls, then zero production retries while fallback continues.

### Phase 2 — Scheduled assumption verification (2–3 days)

Implement a single idempotent `provider-doctor` command and call it from both CI/manual diagnostics and the host scheduler.

For each enabled provider, run layered checks:

1. **Configuration:** required fields exist; URL/model syntax and duplicate provider identities are valid.
2. **Discovery:** query the provider's official model/capability endpoint where available. Save source and observation time. Absence is evidence, not sole proof of retirement.
3. **Entitlement canary:** make the smallest billable/non-billable completion allowed by that provider using the configured credential and model.
4. **Contract canary:** periodically send a tiny production-shaped triage batch and validate the actual structured output.
5. **Allowance/billing observation:** ingest only provider-supported usage/reset fields. When no trustworthy usage API exists, report `unknown`; never substitute configured caps and label them provider quota.
6. **Drift comparison:** compare observation with the last known good state and configuration fingerprint.

Run cadence:

- On startup and on configuration change: configuration, discovery, entitlement, and contract canary.
- Every 15 minutes: cheap availability check only for active/quarantined providers, with jitter.
- Daily: full discovery, entitlement, contract, and allowance observation.
- Weekly: explicit provider documentation/deprecation review only where an official machine-readable source exists; otherwise create a dated manual-review reminder rather than scraping unstable prose.

Outputs:

- Atomic JSON state for the cockpit.
- Append-only NDJSON observation/audit ledger.
- Nonzero CLI exit only for actionable terminal faults or violated data-loss SLOs; `unknown` is a warning unless redundancy is also gone.
- Alert deduplication keyed by provider+fingerprint+class, with open, acknowledged, recovered, and repeated states.

**Exit:** a fixture that retires a model is detected by the next scheduled run, creates one deduplicated incident, quarantines only that model, and recovers after a configured replacement passes its contract canary.

### Phase 3 — Predictive loss-boundary alarms (1–2 days)

Keep the existing queue counters and add prediction rather than another queue monitor.

Compute over explicit 15-minute, 1-hour, 6-hour, and 24-hour windows:

- arrival rate;
- successful scoring/service rate;
- net growth rate;
- oldest and p95 waiting age;
- time to capacity overflow when net growth is positive;
- time to age expiry from the oldest unscored item;
- required throughput to recover within 6, 12, and 24 hours;
- observed overflow and expiry loss, separately.

Alert policy:

- **Info:** 25% full and growing for two windows.
- **Warning:** 50% full, or projected to either loss boundary within 24 hours, or oldest age reaches 50% of its expiry limit.
- **Critical:** 75% full, projected loss within 6 hours, all viable providers unavailable, or any observed loss.
- **Emergency:** 90% full, projected loss within 1 hour, queue unreadable, or observed loss continues for two cycles.

Use hysteresis: open after two consecutive observations except immediate observed loss/unreadable state; recover only after three healthy observations and depth below the lower threshold. Alert payloads must include depth/cap, oldest age/limit, arrivals, service, time-to-loss, active capacity, disabled tiers, observed loss, and the exact remediation.

Automatic protective actions, in order:

1. Increase drain frequency within existing concurrency/rate limits.
2. Stop optional LLM workloads that share constrained providers.
3. Release reserved daily allowance according to an explicit emergency reserve policy.
4. Enable an already-authorized paid tier only within a pre-approved emergency spend ceiling.
5. Never increase the queue cap as a first-line "repair"; that delays capacity loss while worsening age loss and disk risk.

**Exit:** deterministic simulations trigger before both capacity and age loss; recovery does not flap; measured loss counters reconcile to injected losses exactly.

### Phase 4 — Evidence-based budgets and capacity admission (3–5 days)

Do not simply compute governance budget as `step count × one constant`. Steps have different distributions, parallelism, context sizes, and retry behavior.

1. Instrument every module step with input/output tokens, model, elapsed time, attempts, terminal state, and estimated/actual cost.
2. Define per-step resource profiles from the last 20 successful comparable runs where available: p50, p90, and p95 tokens/cost/duration. Until enough samples exist, use a conservative declared default and label it estimated.
3. At launch, discover the actual DAG and compute:
   - expected cost from per-step p50;
   - safe allowance from per-step p95 plus a documented retry reserve;
   - maximum concurrency-aware wall-clock estimate;
   - a separate immutable operator hard ceiling.
4. Admit the run only if expected and safe allowances fit the remaining provider/plan capacity. Otherwise offer an explicit reduced scope, alternate provider, or refusal; do not start a run that is predictably unable to finish.
5. Reforecast after every completed step using actual spend and remaining profiles. Warn at projected exhaustion, not merely at 80% spent.
6. Version profiles by module, step contract hash, model, and context policy so a doubled prompt invalidates stale measurements automatically.

Provider allowances should be discovered only when the provider exposes a trustworthy API/header. Configured caps remain explicit policy limits and are never silently raised to a provider maximum.

**Exit:** replay of the governance expansion either derives enough safe allowance or refuses before launch with the shortfall and remediation; a prompt-contract change invalidates the old profile.

### Phase 5 — Data-shape and persistence invariants (2–3 days)

The Wire save failure is related to stale assumptions but is not a provider-health problem. Treat it as a schema-evolution reliability track:

1. Identify one canonical schema/version for every persisted event and API payload.
2. Validate at ingestion boundaries and return field-level errors; never reject late in projection without durable preservation.
3. Add forward migrations and backward-compatible readers for the supported version window.
4. Make writes atomic and idempotent, with a dead-letter/quarantine record containing the original payload and validation reason.
5. Generate or share types from the canonical schema where practical; add a CI drift check where server/client types are intentionally duplicated today.
6. Add golden fixtures for the pre-change, transition-date, and post-change payloads, including timezone/date boundaries.

**Exit:** every historical fixture either saves successfully after migration or is durably quarantined with an actionable reason; none disappears.

### Phase 6 — Failure drills and resilience CI (3–5 days initially, then weekly)

Build deterministic fault injection at the provider adapter and durable-store seams. Do not call real paid providers in CI.

Required scenarios:

- primary model retired while every fallback is healthy;
- primary retired while two fallbacks are out of credit and one times out;
- explicit 401, billing 402, entitlement 403, ambiguous 404, 429 with reset, 5xx, connect timeout, read timeout, malformed 200, and schema-invalid content;
- budget/health ledger corrupted or locked;
- process crash between provider reservation, response, result persistence, and queue acknowledgement;
- two engine processes contend for the same queue and quarantine marker;
- queue crosses 25/50/75/90%, age approaches expiry, clock moves, and arrival spikes;
- configuration changes while a provider is quarantined;
- all free tiers unavailable with paid escalation both authorized and forbidden;
- old Wire payload is written after the schema transition.

Run layers:

- Every PR: pure classifier, state-machine, queue accounting, schema compatibility, and fallback tests.
- Nightly: multi-process integration and accelerated backlog simulations.
- Weekly: a staging game day that deliberately disables one tier and proves alert delivery, fallback, recovery, and audit evidence.
- Quarterly: restore the provider/queue state from backup on a clean machine and measure recovery time.

Every drill produces a machine-readable report and fails if it violates an invariant, loses an uncounted item, exceeds the spend ceiling, repeats a quarantined call, or fails to recover after the injected fault is removed.

## Observability and operator UX

Extend the existing pipeline diagnostics rather than creating a separate dashboard. The summary should answer, without interpretation:

- Are new items being durably accepted?
- Is the queue growing, and when will either loss boundary be reached?
- Which providers can complete the production contract now?
- Which are paced, cooling, provider-day-limited, allowance-limited, quarantined, credential-rejected, billing-blocked, or unknown?
- What automatic action was taken, what remains manual, and what did it cost?
- Has any item been lost or retired unscored today, by which boundary, and how many?

Add one top-level reliability state derived from strict precedence: `LOSS` → `AT_RISK` → `DEGRADED` → `HEALTHY` → `UNKNOWN`. Never average a critical loss signal into a reassuring composite score.

## SLOs and acceptance gates

Initial SLOs, to be recalibrated from the Phase 0 baseline:

- 100% of accepted news items have a reconstructable lifecycle state.
- 0 uncounted drops.
- 100% of capacity and age-expiry losses emit a critical alert in the same cycle.
- Terminal provider configurations stop production retries within two calls, or immediately when an explicit provider retirement code is present.
- Healthy fallback begins within one batch after primary quarantine.
- Scheduled drift detection finds a test retirement within 24 hours; startup/config-change detection within 5 minutes.
- Queue warning precedes projected loss by at least 6 hours when the observed rates make that mathematically possible.
- Provider health alerts deduplicate to one open incident per configuration fingerprint and failure class.
- Automatic paid escalation cannot exceed its explicit daily and per-incident ceilings.

No phase ships on code coverage alone. It ships only with an incident replay demonstrating the relevant failure and the expected audit trail.

## Rollout and rollback

1. Ship observation-only classification and doctor output first; compare new classes with existing behavior for 48 hours.
2. Enable quarantine for explicit retirement and invalid-auth evidence only; keep a kill switch that reverts to existing bounded cooldown behavior.
3. Add remaining terminal classes after fixture and live-shadow agreement.
4. Enable alerts without automation; tune from a week of rates.
5. Enable protective actions one at a time, each behind a separate flag and spend ceiling.
6. Enable evidence-derived budgets in advisory mode for at least five complete runs before admission becomes enforcing.
7. Keep schema migrations backward-readable for the declared support window.

Rollback disables automatic actions, not telemetry or loss accounting. Never roll back by deleting quarantine, queue, audit, or migration evidence.

## Ownership and runbooks

Assign named ownership before implementation:

- Provider adapters/classifier/quarantine: engine backend owner.
- Queue forecasts/loss accounting: news scheduler owner.
- Diagnostics/alerts: cockpit owner.
- Budget profiles/admission: launcher/research-run owner.
- Schema compatibility: owning producer and consumer jointly.
- Provider funding and paid-escalation ceiling: operator/business owner; this cannot be solved in code.

Create short runbooks for retired model, rejected credential, exhausted credit, all tiers unavailable, queue time-to-loss critical, corrupt ledger, schema quarantine, and emergency paid escalation. Each runbook must state detection evidence, safe automated action, manual action, verification, rollback, and post-incident data to retain.

## Priority and realistic effort

| Priority | Work | Effort | Why |
| --- | --- | --- | --- |
| P0 | Phase 0 containment | same day | stop current loss and prove the replacement |
| P0 | Phase 1 classification/quarantine | 1–2 days | ends futile retries without breaking fallback |
| P0 | Phase 3 predictive loss alarms | 1–2 days | warns before both real loss boundaries |
| P1 | Phase 2 provider doctor | 2–3 days | detects drift before runtime and on config change |
| P1 | Phase 5 persistence/schema invariants | 2–3 days | prevents the Wire failure class and preserves rejected data |
| P1 | Phase 4 derived budgets/admission | 3–5 days | prevents predictable mid-run starvation |
| P2 | Phase 6 initial resilience harness | 3–5 days | converts claimed recovery into repeatedly proven recovery |

The first production-safe tranche is Phases 0, 1, and 3—not a broad autonomous self-modifier. Phase 2 follows immediately. Budget derivation and chaos drills should not block stopping live data loss, but neither should be dropped from the programme.

## Explicit non-goals

- Guaranteeing availability when every authorized provider lacks credit or capacity.
- Scraping provider marketing pages and silently rewriting production model configuration.
- Automatically purchasing credit or raising spend limits.
- Treating a successful `/models` response as production health.
- Retrying a malformed request against every provider without first deciding whether the request itself is invalid.
- Hiding loss by enlarging retention/capacity or relabeling expired items as ordinary drops.
- Building a second scheduler, budget ledger, provider registry, or diagnostics surface.

## Final recommendation

Approve Claude's core thesis, but change the build order and specification:

1. Contain and prove the current fix.
2. Canonicalize error semantics and quarantine exact terminal configurations.
3. Forecast and alert on both queue loss boundaries.
4. Add layered scheduled canaries and honest allowance observations.
5. Make persistence schemas migratable and rejected writes durable.
6. Derive run admission from versioned empirical resource profiles plus immutable hard ceilings.
7. Continuously rehearse the failure matrix.

That is the credible version of "self-healing": the engine detects stale beliefs, fails over quickly, preserves every recoverable item, accounts for every loss, performs only bounded authorized repairs, and proves those properties repeatedly.
