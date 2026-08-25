# Governed Procedural Memory

Procedural memory stores reviewed ways of working. It is not generated narrative and it is not a
source of company facts. The authority order, source hierarchy, current-evidence requirements, rating
caps, abstention rules, and deterministic gates always outrank a playbook.

## Records

The closed public contracts are:

1. `memory-playbook-candidate/v1` — inert procedure proposal and applicability.
2. `memory-playbook-evaluation/v1` — exact replay cases, regression flags, and three independent
   reviewers.
3. `memory-playbook/v1` — active, versioned, expiring procedure or its quarantined/deprecated state.
4. `memory-playbook-execution/v1` — one task's ordered execution and packet/canonical commitments.
5. `memory-promotion-manifest/v1` — signed PR authorization for activation, supersession, or
   deprecation.

Episode and semantic records reject instruction-like fields. Only an active playbook may carry ordered
steps. Each step can name only an allowlisted deterministic tool; free-form shell commands are never
eligible.

## Promotion

The candidate author cannot review, promote, correct, or supersede the candidate. Evidence,
applicability, and security reviewers must be distinct from each other and the author. Each produces a
protocol-separated signature over the exact candidate hash, replay-case hash, role, identity, decision,
and time. Evaluation and promotion reverify those signatures from the operator trust map. Mechanical
procedures pass the origin, two held-out cases, and a non-applicable counterexample. Analytical
procedures that can affect a thesis also require a resolved outcome review. Cross-company procedures
cover at least two issuers. Any citation, qualifier, temporal, abstention, serious-error, metric, or
security regression rejects the bundle.

The promotion service may create a `codex/memory-promotion-*` branch, push that branch, open a draft
PR, add the signed content-free commitment plus ID/version prompt references, and mark it ready. It has
no merge operation and never pushes `main`. Activation is possible only after the exact commitment is
present in the PR merge commit and that commit is in `origin/main`.

## Matching and execution

Applicability is closed over agent/module, issuer/listing, sector, jurisdiction, accounting standard,
metric, and source type. Runtime priority is issuer-specific, jurisdiction-specific, sector-specific,
then global. A more specific match wins. Equal-specificity disagreement for one `procedure_key` causes
abstention before dispatch.

The execution receipt proves:

- exact run, task, packet, query, and projection;
- playbook ID, version, and canonical content hash;
- active canonical hash before and after execution;
- every step in reviewed order, its allowlisted tool, inputs, output, and current evidence;
- deviations and incident codes.

One policy leak, stale-fact use, prompt injection, or serious evidence error triggers immediate local
quarantine through the dedicated emergency identity. Two ordinary failures for the same version require
a deprecation PR. A new active version must explicitly supersede the prior canonical event and increment
the version by one.

## Operations

```bash
python3 scripts/memory_procedural_cli.py seed-initial --help
python3 scripts/memory_procedural_cli.py candidate-intake --help
python3 scripts/memory_procedural_cli.py review --help
python3 scripts/memory_procedural_cli.py evaluate --help
python3 scripts/memory_procedural_cli.py open-promotion-pr --help
python3 scripts/memory_procedural_cli.py activation-request --help
python3 scripts/memory_procedural_cli.py execution-receipt --help
python3 scripts/memory_procedural_cli.py verify-execution --help
python3 scripts/memory_procedural_cli.py quarantine-request --help
python3 scripts/memory_procedural_cli.py open-deprecation-pr --help
python3 scripts/memory_procedural_cli.py status-request --help
python3 scripts/memory_procedural_cli.py status --help
```

All queue paths must be outside the repository and owner-only. Licensed, confidential, and restricted
state requires the protected key options. CLI results expose content-free commitments rather than raw
protected records. `--review-trust` is an owner-only JSON object from each distinct reviewer key ID to
its public-key file; evidence, applicability, and security approvals must use three different keys. The
cockpit receives curated metadata and lineage only.

`scripts/memory_playbook_drift.py` is the CI/runtime authority gate. Run it without a projection for
repository profile and doctrine checks. Run it with the frozen projection, digest, and as-of time before
readying or dispatching active playbooks so stale references, missing references, duplicated detailed
steps, and auditor memory leakage fail closed.
