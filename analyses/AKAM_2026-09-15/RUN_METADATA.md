# Run Metadata — targeted integrity correction

- ticker: AKAM
- run_date: 2026-09-15
- run_root: analyses/AKAM_2026-09-15
- orchestrator: Codex desktop targeted maintenance; not a new /research:full execution
- base_repository_sha: d0a0bc233240ea0c76192f65fdfcb72fceb1d6b4
- operating_evidence_and_price_as_of: 2026-09-14
- source_run: analyses/AKAM_2026-09-14 (sealed, unchanged)
- source_inventory: 20 existing pool documents plus 2 separately captured official market-input excerpts (22 documents; 23 hashed input files including one provenance sidecar); no pool source was modified

## Modules completed

- balance-sheet-survival: synthesis — analyses/AKAM_2026-09-15/balance-sheet-survival/99_balance-sheet-survival-synthesis.md; reused original dated synthesis, not newly executed
- business-model: synthesis — analyses/AKAM_2026-09-15/business-model/99_business-model-synthesis.md; reused original dated synthesis, not newly executed
- catalyst: synthesis — analyses/AKAM_2026-09-15/catalyst/99_catalyst-synthesis.md; reused original dated synthesis, not newly executed
- competitive-intel: synthesis — analyses/AKAM_2026-09-15/competitive-intel/99_competitive-intel-synthesis.md; reused original dated synthesis, not newly executed
- earnings: synthesis — analyses/AKAM_2026-09-15/earnings/99_earnings-synthesis.md; reused original dated synthesis, not newly executed
- management-governance: synthesis — analyses/AKAM_2026-09-15/management-governance/99_management-governance-synthesis.md; reused original dated synthesis, not newly executed
- valuation: synthesis — analyses/AKAM_2026-09-15/valuation/99_valuation-synthesis.md; refreshed targeted valuation correction

## Synthesizer status

- succeeded — analyses/AKAM_2026-09-15/final_thesis.md; current task terminal adjudication, with reused upstream evidence

## Modules aborted

- none newly launched; untouched upstream modules were reused

## Derived output status

- Memo status: succeeded — analyses/AKAM_2026-09-15/memo.md; regenerated from final corrected state
- Audit dossier status: succeeded — analyses/AKAM_2026-09-15/audit_dossier.md; existing deterministic lossless assembler

## Integrity gate

- GATE: PASS — combined release live validator, including AA/AB and strict AG; AX prewrite PASS
- Verification: Minor issues, 91/100; 41 math checks and six anchors consistent. Pre-mortem: Survives with haircut, raw50−10=40. Expectations latest v2: Weak, edge25, non-exploitable; no confident-edge contradiction. All canonical audit input hashes validated before sealing.
- Raw conviction 50, cumulative haircut 10, effective confidence 40

## Execution and lineage

- Actual Codex task author metadata is recorded in maintenance_runtime_evidence.json and projected by the existing standalone-maintenance helper. No protected cockpit supervisor receipt is invented.
- Reused module execution is partially observed; maintenance_lineage.json retains original paths and SHA-256 hashes.
- No new production research run, historical record edit or research-memory process was performed.

## Immutable idea admission

- Projection manifest created after final exact-byte audits; manifest digest e184f804a31506282858fcb88bd3fffb0a6d128eea6e88b184e8c6d46c57e007.
- Canonical market evidence capture found history_missing; no provider-bound AKAM history was manufactured.
- Final projection: not_assessable because market history and the 365-day to 90–183-day valuation bridge are absent; independent edge is Weak25/non-exploitable.
- Admission: not_applicable, immutable digest 5d4049ba48ea5a489e20e7ef3a9a3a7e249f41f6c0a00acfafb4c01dc063ee0b.
- Original September14 sealed artifacts remain unchanged; the newer publication replaces the standing record only through its append-only supersession sidecar.
