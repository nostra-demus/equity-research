# Pre-Flight Data-Readiness Gate + Warnings Panel — DESIGN (not yet built)

**Status: DESIGN ONLY — logged for a later combined audit/build.** This is an engine + UI feature (`ui/server`, `ui/web`, `extract_pool.py`, decision schema), a larger class than the prompt-level deep-dive fixes. Do NOT build piecemeal; audit + build as one reviewed unit.

## Why this exists (the live incident)
A full TMCV run launched from the cockpit and proceeded looking normal, but the triage had detected — and only recorded in a markdown file — that (a) all 8 PDFs failed to extract (`pdftotext` not installed) and (b) the audited-report PDFs were the **Passenger Vehicles** entity (BSE:500570), not the **Commercial Vehicles** ticker. The engine *detected* both; the **cockpit surfaced neither**. A user watching the UI saw a healthy run that was actually degraded and pointed at the wrong entity's filings.

Root cause: the cockpit has alert tiers for **run-level** conflicts (overlapping runs, spawn failure) and **module-level `Insufficient`** (hard fail-fast), but **no surfacing for the data tier** — extraction failures, `Partial` verdicts, and data-sanity conflicts live in `manifest.json` + the triage markdown and are never elevated. (`fs-watcher.ts` acts only on `Insufficient`; the extractor is deliberately "tolerant — never aborts".)

## The two-phase model
| Phase | When | Cost | Catches |
|---|---|---|---|
| **A — Deterministic pre-flight** | on launch, before any agent spawns | ~1s, no LLM | extraction failures (pdftotext/corrupt/zero-text), missing/zero files, no current price |
| **B — Triage gate** | Layer-0 triage runs, then PAUSE before Layer 1 | 1 cheap `claude` call | entity mismatch, jurisdiction, Sufficient/Partial/Insufficient, data-sanity conflicts |

- Phase A Blocker → stop immediately, never reach the LLM (a missing system binary must stop the user at the door, not be "worked around").
- Phase B ≥ Degrade → pause and surface the panel.
- **Clean runs pass invisibly** — zero friction on the happy path.

## Severity classes (the critical addition)
Not all "Partial" is equal — the gate must classify each issue:
- **BLOCKER** — wrong-direction / garbage if proceeded: wrong entity, zero usable data, no price for a valuation. Proceeding requires **explicit typed acknowledgment** (e.g. "I understand I'm valuing TMCV using Passenger-Vehicles / BSE:500570 filings") — never one-click.
- **DEGRADE** — same-direction, weaker: missing transcripts, some PDFs unreadable, no covenant disclosure. One-click "Proceed degraded" is legitimate, **with caps**.
- **INFO** — note only (e.g. a duplicate file).

Each issue is also tagged `fixable_by_user` (install poppler / re-upload a file) vs **inherent** (a private peer with no public financials) — only fixable issues offer "Fix & re-check".

## `ReadinessReport` schema (the comprehensible error list)
```jsonc
{ "runId": "...", "ticker": "TMCV", "phase": "A|B", "verdict": "clean|degrade|blocked",
  "issues": [ {
     "id": "...", "severity": "blocker|degrade|info",
     "class": "extraction|entity|sufficiency|price|stale|duplicate",
     "message": "All 8 PDFs failed to extract",          // plain English
     "evidence": "pdftotext not installed; manifest 8/19 status:fail",
     "fixable_by_user": true,
     "suggested_fix": "brew install poppler, or the engine's pypdf fallback (DD-16)",
     "affected_modules": ["earnings","balance-sheet-survival","management-governance"],
     "cap_if_proceeded": "valuation confidence <=55; no audited financials"
  } ] }
```

## Backend events + pause state
`readiness-checking` → `readiness-report` (carries the issues) → run enters **`awaiting-readiness-decision`** (no agents running — cheap to hold; persists until the user decides, with a long idle timeout that cancels) → user decides → `readiness-resolved`.

## UI panel (severity-aware actions)
Shown only when issues exist. Issues grouped **Blocker → Degrade → Info**; each row: message · evidence · suggested fix · affected modules · *the cap that will apply*. Actions:
- **[Fix & re-check]** — user updated the data pool → re-runs **Phase A** (and Phase B only if the pool's mtime/hash changed, so an unchanged pool isn't needlessly re-triaged). Offered for `fixable_by_user` issues.
- **[Proceed degraded]** — enabled only when **no Blockers remain**. For a Blocker it is replaced by **[Override blocker…]** which requires typed acknowledgment. Either path writes the override trace (below) and proceeds **with caps applied**.
- **[Cancel]** — discards the partial run folder.

## Override semantics (the other critical addition)
"Proceed/Override" must leave an indelible trace, or it manufactures false confidence (violates CLAUDE.md §1/§11):
- `RUN_METADATA.md` + `decision_record.json` gain a `readiness_override` block: `{ issues:[...], severity, acknowledged: <text>, decided_at }`.
- `final_thesis.md` carries a top banner: *"⚠ Ran on overridden Partial data: [list]"*.
- The decision **ledger** flags the thesis so the calibration loop knows it rested on overridden data.
- Confidence **caps already propagate** today (triage → synthesis), so a degraded run is already analytically honest in its scores — Override does NOT bypass the caps; it proceeds *with* them, and just records that a human accepted the gaps.

## Engine touch-points (build map)
- `extract_pool.py` → add `--readiness-json` (summarize manifest fail-rows + file-count / price / zero-text checks into Phase-A issues). The per-file fail status already exists (`{status:"fail",error}`).
- `ui/server/launcher.ts` → run Phase A pre-spawn; add the `awaiting-readiness-decision` pause; gate Layer-1 dispatch on the decision.
- `ui/server/fs-watcher.ts` → pause + surface on `Partial`, not only abort on `Insufficient`.
- `ui/server/server.ts` → `POST /api/runs/:id/readiness-decision { action: recheck|proceed|cancel, ack? }`.
- `ui/server/types.ts` → `ReadinessReport` + the new events.
- `ui/web` → the panel + SSE/event handling + the typed-ack modal for Blockers.
- `frameworks/DECISION_LEDGER.md` + decision_record schema → the `readiness_override` field; an eval check that an overridden run carries the stamp.

## Build order (when greenlit)
1. **Phase-A deterministic gate** first — highest value, catches the pdftotext/corrupt/zero-file class before any token spend. (Reduced in likelihood by DD-16, but still the right gate.)
2. **Phase-B triage pause + the panel** — surfaces entity/sufficiency.
3. **Override trace + ledger flag + eval check** — closes the false-confidence hole.

## Related, already shipped
- **DD-16** (committed): `extract_pool.py` now has a pure-Python `pypdf` fallback (auto-bootstrapped in the venv) so PDF extraction no longer hard-depends on poppler — this *reduces* the most common Phase-A failure cause but does not replace the gate (corrupt files, wrong entity, no price still need surfacing).

---

## Related future-hardening gap: no crash / shutdown / sleep resume for long runs

**Logged for the combined engine-robustness audit (not yet built).**

A full `/research:full` run is a long chain (~80 agents across 6 modules + the master synthesis) driven by **local child processes** (the cockpit backend `execa`-spawns the `claude` CLI per step) with the run tracked **in-memory only** (`new Map`, no persistence). Consequences:
- **Shutdown / restart** kills every process; the backend returns with no memory of the in-flight run. There is **no resume** — completed *agent outputs* persist on disk (per-agent checkpointing), but the *orchestration* (which module/agent runs next) is not persisted or recoverable.
- **Sleep / lid-close**, and especially **network loss** (e.g. driving, plane), breaks in-flight agents — their Anthropic API calls drop/time out — and can leave **orphaned processes** that wake and fail, plus a backend that still believes a run is "running" (zombie state).
- Live incident (2026-06-09): a TMCV run was in progress when the operator needed to close the lid and lose connectivity; the run had to be cancelled because it could not survive either condition.

**What a fix looks like (design sketch):**
1. **Persist run state** to disk — a `run-state.json` per run root recording the ordered step list, each step's status (`done`/`running`/`pending`), the run kind/ticker/date, and the last-completed step. Write it after each step completes (cheap; the per-agent output already exists as the source of truth).
2. **Resume command / API** — on backend start, scan `analyses/*/run-state.json` for runs whose status is `running` but whose process is gone; offer **[Resume]** in the cockpit. Resume = re-derive the step list, skip steps whose outputs already exist on disk (idempotent), and dispatch from the first incomplete step. This dovetails with the existing per-agent persistence — a completed agent file IS its checkpoint.
3. **Zombie reconciliation** — on start, any in-memory-less "running" run with no live child is marked `interrupted`, not `running`, so the UI is honest.
4. **Sleep/offline guard (optional)** — detect network loss / imminent sleep and **pause** the chain at the next step boundary (no new agent dispatched) rather than letting an in-flight agent fail mid-call; surface a "paused — connectivity lost" state with a one-click resume.

**Scope:** engine-side (`ui/server` launcher + a `run-state.json` writer + a resume endpoint + cockpit UI). Same review-before-build discipline as the readiness gate; audit and build the two together as the "engine-robustness" unit (readiness gate + resume).
