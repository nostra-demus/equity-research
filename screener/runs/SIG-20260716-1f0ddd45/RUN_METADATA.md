# Run Metadata — SIG-20260716-1f0ddd45

- Signal ID: SIG-20260716-1f0ddd45
- Date: 2026-07-16
- Started: 2026-07-16T05:17:31Z
- Finished: 2026-07-16T10:56:00Z (approx, orchestration wall-clock)
- Repo SHA (at run start): c3616c0d23b2491578007fa8a5e97ae4d2b30898

## Headline

Iran threatens to close more vital seaways as US renews blockade — South China Morning Post, 2026-07-16.

## Modules planned

signal-gate → thesis-structure → edge-definition → candidate-surfacing (derived via topo-sort of `depends_on`, discovered from `.claude/agents/screener/*/99_*-synthesis.md`).

## Modules completed

- **signal-gate** — completed. Layers: 00_intake-gate0 (Gate 0 pass, Grade A source, no ledger duplicate) → 01_relevance-events-entities (material, 0.85 confidence, macro_only issuer linkage) → 02_novelty-context (novelty 0.85, new_event) / 03_generic-media-detector (is_generic_media=false) → 99_signal-gate-synthesis (materiality 50/100, PARK).

## Modules stopped at

- Pipeline stopped after **signal-gate**: routing `PARK` is in `routing.terminal`, and `intake.json.override_promote` is `false` (no human override). `thesis-structure`, `edge-definition`, and `candidate-surfacing` did NOT run.

## Final routing

**PARK** — materiality 50/100 (40-69 band). Primary issuer is a sovereign/military actor (Iran / IRGC) with no listed company or ticker (issuer_linkage: macro_only), and the sole source (South China Morning Post, Tier 2 in the scoring breakdown despite Grade-A gate status) is uncorroborated by a second on-list wire.

## Thesis ID

None — thesis-structure did not run.

## Candidate count

None — candidate-surfacing did not run.
