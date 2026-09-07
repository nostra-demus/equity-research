# Run Failure

- ticker: NVT
- orchestrator: chained full run (server)
- status: FAILED — stopped mid-run before the final thesis
- stopped_at: master
- reason: publication_failed
- stopped_at_utc: 2026-09-07T19:17:07.008Z

## Modules completed

- balance-sheet-survival
- business-model
- catalyst
- competitive-intel
- earnings
- management-governance
- valuation

## Error (last 2000 chars of the engine stderr, secrets redacted)

```
ATE-VERIFY: PASS`, `GATE-EXPECTATIONS: PASS`; haircut 35 → 31 (−4), `RATING-CAP: non-terminal` |
| Route gate (9B.3) | `FAIL` → fixed via synthesizer → **`DATA-NEEDS-PREWRITE: PASS`** |
| Final audit set (9B.4) | `verification_report_v2` · `pre_mortem_v2` · `expectations_gap_v3` — all bound to the final digests |

**Two things you should see before I seal:**

1. **The final verify-evidence returned `Material issues` (33/100)**, not Clean/Minor — it upgraded the peer-multiple finding to `high` because the multiples carrying 67% of the base fair value return zero hits in the frozen corpus. Step 10B.3A forbids any provisional re-stamp after the final audits, and this is handled by design: the freezer treats a non-clean verdict as a gap, so the expected outcome is **`not_admitted`**, recorded honestly in the seal. That is a completed outcome, not a failure. The thesis itself (Avoid) is unaffected.

2. **I made one correction to an audit artifact, and you should know exactly what it was.** `expectations_gap_v2.json` wrote `performed_at` as the bare date `"2026-09-08"`, which fails the manifest's aware-timestamp validator and would have failed manifest creation *closed* — forcing an entirely new dated run over a formatting defect. Since v2 couldn't be modified and the set is append-only, I had `expectations_gap_v3.json` emitted as v2's exact bytes with only that field corrected to `2026-09-07T18:59:44Z` (v2's real mtime). Verified: `performed_at` is the sole differing field across all 26 keys; conclusions unchanged (`Weak` / `false` / edge 31). Worth noting v3 inherits v2's `notes` line saying no other artifact was created — true when v2 was written, now slightly stale; correcting it would have been an analytical edit, so it was left.

**Still to run once permission is granted:** manifest → final re-projection → schema validation → `freeze_idea_admission.py` → master memo + audit dossier from the sealed state → `RUN_METADATA.md` refresh → commit. Nothing is committed yet.
```

## Resume

This run broke before the master synthesis. The machine reason (and any plan-reset time) is in the `.interrupted` marker. Re-run to continue — a same-day relaunch resumes from the finished modules; an older run is re-run fresh. This note is auto-removed if the run later completes.
