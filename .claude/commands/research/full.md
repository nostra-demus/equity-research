---
description: Run the full equity research workflow on a ticker. Self-discovers modules from .claude/agents/*/99_*-synthesis.md and dispatches each module's pipeline, then the master synthesizer.
argument-hint: TICKER
allowed-tools: Read, Write, Glob, Bash, Task
---

You are the master orchestrator for a self-discovering multi-module equity research workflow. The ticker is `$ARGUMENTS`.

This orchestrator:
1. Discovers modules dynamically (does not hardcode `business-model` / `earnings` / any future module).
2. Writes `RUN_METADATA.md` before any module runs.
3. Runs each module's pipeline inline, using the shared pipeline defined in `frameworks/MODULE_PIPELINE.md`.
4. Continues past per-module fail-fast aborts; aborts the whole run only if **every** module aborts.
5. Invokes the master synthesizer once all modules finish, then generates two more output tiers beside the deep-dive thesis — a ~10-page plain-English colleague `memo.md` and a deterministic, lossless `audit_dossier.md` (every agent and sub-agent output concatenated). Three tiers from one run: memo (share) → `final_thesis.md` (deep dive) → `audit_dossier.md` (audit everything).
6. Makes **two** commits on `main` per run (per repo `CLAUDE.md` git policy: one run-artifacts commit, then one metadata-backfill commit that fills in the commit SHA of the first one). Per-module commits do NOT happen under this orchestrator — they only happen when a module command is invoked standalone.

Execute the steps below in order. Do not skip any.

---

## 1. Resolve today's date

Run `date +%Y-%m-%d` via Bash and capture the result as `<DATE>`. Use this exact string everywhere `<DATE>` appears below.

Also capture `<STARTED_AT>` from `date -u +%Y-%m-%dT%H:%M:%SZ` for the metadata file.

---

## 2. Verify the data pool

Check that `data/$ARGUMENTS/` exists and contains at least one file:

```
ls -1 data/$ARGUMENTS/ 2>/dev/null | head -n 1
```

If the directory is missing or empty, STOP. Tell the user: "No data found at `data/$ARGUMENTS/`. Populate the Drive folder for this ticker and re-run." Do not proceed to any later step.

---

## 3. Create the run root folder

```
mkdir -p "analyses/${ARGUMENTS}_<DATE>"
```

Capture the path `analyses/${ARGUMENTS}_<DATE>` as `<RUN_ROOT>`. Every module and the master synthesizer will write inside this folder. Use `${ARGUMENTS}_<DATE>` (with braces) in Bash to avoid the `$ARGUMENTS_<DATE>` shell-parse ambiguity.

---

## 4. Discover runnable modules

Use the Glob tool with pattern `.claude/agents/*/99_*-synthesis.md`.

For each matched file, extract `<module>` as the parent directory's basename (e.g. `business-model`, `earnings`). A module is "runnable" precisely when it has a `99_*-synthesis.md` agent.

If the glob returns zero matches, STOP and tell the user: "No runnable modules found under `.claude/agents/*/`. Add at least one module with a `99_*-synthesis.md` agent."

### Module ordering (dependency-driven)

For each discovered module, read `depends_on` from its `99_*-synthesis.md` frontmatter — a list of module names it consumes (treat a missing or empty `depends_on` as no dependencies). Ignore any listed dependency that is not itself a discovered runnable module (treat it as absent).

Order the modules by a **topological sort** of that dependency graph: a module runs only AFTER every module in its `depends_on`. Among modules whose dependencies are all already placed, pick the next in **alphabetical order** (stable and deterministic). If a dependency cycle makes a topological order impossible, fall back to alphabetical order and note the cycle in `RUN_METADATA.md`.

(With today's modules this yields: business-model → earnings → balance-sheet-survival → management-governance → valuation. No module name is hardcoded — the order is derived entirely from `depends_on`.)

Capture the ordered list as `<MODULES_PLANNED>`, and keep each module's `depends_on` list (used in step 8A).

---

## 5. Resolve prior run reference

```
ls -1d analyses/${ARGUMENTS}_* 2>/dev/null | sort -r | grep -v "^analyses/${ARGUMENTS}_<DATE>$" | head -n 1
```

Capture the result as `<PRIOR_RUN>`. If empty, set it to the literal string `none`.

---

## 6. Capture repo SHA

```
git rev-parse HEAD
```

Capture the result as `<REPO_SHA>`.

---

## 7. Write RUN_METADATA.md (initial)

Use the Write tool to create `<RUN_ROOT>/RUN_METADATA.md` with the following content (substitute values literally):

```
# Run Metadata

- ticker: $ARGUMENTS
- run_date: <DATE>
- started_at: <STARTED_AT>
- orchestrator: /research:full
- repo_sha: <REPO_SHA>
- data_folder: data/$ARGUMENTS/
- prior_run: <PRIOR_RUN>

## Source files

<one line per file from `ls -1 data/$ARGUMENTS/`>

## Modules planned

<one line per module from <MODULES_PLANNED>>

## Modules completed

(filled in at end of run)

## Modules aborted

(filled in at end of run)

## Synthesizer status

(filled in at end of run)

## Memo status

(filled in at end of run)

## Audit dossier status

(filled in at end of run)

## Commit SHA

(filled in at end of run)
```

---

## 8. Run each module sequentially

For each module in `<MODULES_PLANNED>` (in the order from step 4):

### 8A. Build cross-module context

Build `<CROSS_MODULE_CONTEXT>` for this module from its `depends_on` list (captured in step 4), naming only dependencies that **completed in THIS run**:

1. For each module name `<dep>` in this module's `depends_on`, check whether `<RUN_ROOT>/<dep>/99_<dep>-synthesis.md` exists (i.e. it completed in this run).
2. For each `<dep>` that completed, produce the sentence: `<Dep> cross-module path: <RUN_ROOT>/<dep>/.` — where `<Dep>` is the dependency name with its first letter capitalized (`business-model` → `Business-model`, `earnings` → `Earnings`). This is the label format every dependent agent parses.
3. Join the sentences with a single space to form `<CROSS_MODULE_CONTEXT>`.
4. If this module has no `depends_on`, or none of its dependencies completed in this run, set `<CROSS_MODULE_CONTEXT>` to the literal string `none`.

**Important:** always use the **current run's** paths, never an older run's. Do not fall back to `ls analyses/${ARGUMENTS}_*/<dep>/ | sort -r | head -n 1` here — that is the standalone commands' behavior. Within a `/research:full` run the current run's path is the only correct value, and a dependency that aborted in this run is simply omitted (or yields `none` if it was the only dependency).

### 8B. Invoke the shared pipeline

Follow every step in `frameworks/MODULE_PIPELINE.md` with these inputs:

- `<TICKER>` = `$ARGUMENTS`
- `<DATE>` = the `<DATE>` resolved in step 1
- `<MODULE>` = the current module name
- `<RUN_ROOT>` = the run root from step 3
- `<CROSS_MODULE_CONTEXT>` = the string from step 8A

### 8C. Record outcome

After the shared pipeline returns:

- If `fail_fast_triggered = true`: record this module under "Modules aborted" with a brief note (which agent triggered, output file path). **Continue to the next module — do not abort the whole run.**
- Else, if all expected agents wrote files including the module's `99_*-synthesis.md`: record this module under "Modules completed".
- Else (partial failure with no fail-fast): record under "Modules aborted" with the failed agent names.

---

## 9. Decide whether to invoke master synthesizer

After all modules complete:

- If **at least one** module is in "Modules completed", proceed to step 10.
- If **every** module is in "Modules aborted", skip steps 10–11; jump to step 12 (commit) with `Synthesizer status: skipped (all modules aborted)` written into `RUN_METADATA.md`.

---

## 10. Run the master synthesizer

Dispatch a single Task call:

- `subagent_type: "synthesizer"`
- User message:

  > Synthesize the analyses in <RUN_ROOT>/. Output the final thesis to <RUN_ROOT>/final_thesis.md.

Wait for it to complete. Treat the synthesizer as failed if `<RUN_ROOT>/final_thesis.md` does not exist when it returns.

---

## 10A. Generate the memo and the audit dossier

Run this step only if `<RUN_ROOT>/final_thesis.md` exists (the synthesizer succeeded). If the synthesizer was skipped because every module aborted, skip 10A entirely and record both tiers as `skipped (no final thesis)` in step 11.

These are the other two tiers of the run, written **beside** `final_thesis.md` so the step-12 commit (`git add "analyses/${ARGUMENTS}_<DATE>/"`) picks them up automatically — no extra commit:

- `memo.md` — the ~10-page, plain-English colleague memo (the shareable tier).
- `audit_dossier.md` — the deterministic, lossless concatenation of every artifact in the run (the audit tier).

### 10A.1 — Memo (LLM, via the memo-writer agent)

Dispatch a single Task call:

- `subagent_type: "memo-writer"`
- User message:

  > Read <RUN_ROOT>/final_thesis.md and <RUN_ROOT>/decision_record.json and write the ~10-page colleague memo to <RUN_ROOT>/memo.md.

Wait for it to complete. If `<RUN_ROOT>/memo.md` does not exist when it returns, record the memo as `failed` in step 11 — but do **NOT** fail the run. The memo is a derived convenience tier; `final_thesis.md` is the decision of record.

### 10A.2 — Audit dossier (deterministic, no LLM)

The audit dossier is a mechanical, lossless concatenation — never an LLM rewrite — so nothing can be omitted or paraphrased. Build it with this Bash step. It is read-only on every run artifact, writes only `audit_dossier.md`, is best-effort, and must never abort the run:

```bash
RUN_ROOT="analyses/${ARGUMENTS}_<DATE>" python3 - <<'PY'
import os, glob, re, datetime
RUN = os.environ["RUN_ROOT"]
OUT = os.path.join(RUN, "audit_dossier.md")
def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
def read(p):
    try: return open(p, encoding="utf-8", errors="replace").read()
    except Exception: return None
# discover modules = run subfolders that carry a 99_*-synthesis.md
mods = {os.path.basename(os.path.dirname(s)): s
        for s in glob.glob(os.path.join(RUN, "*", "99_*-synthesis.md"))}
# run order = topological sort by each module's agent-spec depends_on, alpha tie-break (mirrors step 4)
def deps(m):
    sp = glob.glob(os.path.join(".claude/agents", m, "99_*-synthesis.md"))
    if not sp: return []
    parts = (read(sp[0]) or "").split("---")
    fm = parts[1] if len(parts) >= 3 else ""
    out, lines = [], fm.splitlines()
    for i, ln in enumerate(lines):
        mm = re.match(r"\s*depends_on:\s*(.*)$", ln)
        if not mm: continue
        inline = mm.group(1).strip()
        if inline and inline not in ("|", ">", "[]"):
            out += re.findall(r"[A-Za-z0-9_-]+", inline)
        for ln2 in lines[i+1:]:
            if re.match(r"\s*-\s*\S", ln2): out += re.findall(r"[A-Za-z0-9_-]+", ln2)
            elif re.match(r"\s*\w+\s*:", ln2): break
        break
    return [n for n in out if n in mods]
ordered, remaining = [], set(mods)
while remaining:
    cand = sorted(m for m in remaining if all((d in ordered) or (d not in mods) for d in deps(m)))
    if not cand: cand = sorted(remaining)
    ordered.append(cand[0]); remaining.discard(cand[0])
# collect: final_thesis first, then per module the 99 synthesis, then 00..NN sub-agents ascending
sections, gaps = [], []
ft = os.path.join(RUN, "final_thesis.md")
if os.path.exists(ft): sections.append(("Final Thesis (decision)", "final_thesis.md", ft))
else: gaps.append("final_thesis.md missing")
n_syn = n_sub = 0
for m in ordered:
    files = glob.glob(os.path.join(RUN, m, "*.md"))
    syn = sorted(f for f in files if re.search(r"99_.*-synthesis\.md$", os.path.basename(f)))
    subs = sorted(f for f in files if f not in syn)  # 00_,01_,...,NN_ zero-padded => lexical == numeric
    for f in syn:
        sections.append((f"{m} — module synthesis", os.path.relpath(f, RUN), f)); n_syn += 1
    for f in subs:
        sections.append((f"{m} / {os.path.basename(f)}", os.path.relpath(f, RUN), f)); n_sub += 1
now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
ticker = os.path.basename(RUN).rsplit("_", 1)[0]
H = [f"# Audit Dossier — {ticker}\n",
     "> Deterministic, lossless concatenation of every artifact in this research run — the final thesis, "
     "each module synthesis, and every sub-agent output, in run order. Generated mechanically by "
     "`/research:full` (no LLM rewriting), so nothing is omitted or paraphrased. This is the \"see "
     "everything\" audit tier; the decision lives in `final_thesis.md` and the colleague summary in `memo.md`.\n",
     f"- Generated: {now}",
     f"- Run root: `{RUN}`",
     f"- Module run order: {', '.join(ordered) if ordered else '(none)'}",
     f"- Contents: 1 final thesis + {n_syn} module syntheses + {n_sub} sub-agent outputs = {len(sections)} files"]
if gaps: H.append(f"- Assembly notes: {'; '.join(gaps)}")
H.append("\n## Table of Contents\n")
for title, src, _ in sections:
    H.append(f"- [{title}](#{slug(title)}) — `{src}`")
parts = ["\n".join(H)]
for title, src, path in sections:
    body = read(path)
    if body is None:
        gaps.append(f"unreadable: {src}"); body = "_(file could not be read)_"
    parts.append(f"\n\n---\n\n## {title}\n\n_Source: `{src}`_\n\n{body.rstrip()}\n")
open(OUT, "w", encoding="utf-8").write("\n".join(parts))
print(f"WROTE {OUT} ({len(sections)} sections, {os.path.getsize(OUT)} bytes)"
      + (f"; gaps: {'; '.join(gaps)}" if gaps else ""))
PY
```

If the script errors for any reason, record the audit dossier as `failed` in step 11 and continue — never abort the run over the audit tier.

---

## 11. Update RUN_METADATA.md (final)

Rewrite `<RUN_ROOT>/RUN_METADATA.md` via the Write tool to fill in the placeholder sections. Read the current file first, then issue a single Write call with the full new content. (This command does not have access to the Edit tool — see the `allowed-tools` frontmatter.) Fill in:

- "Modules completed": list (one per line)
- "Modules aborted": list with brief note per entry (one per line)
- "Synthesizer status": `succeeded` (if `final_thesis.md` exists), `failed` (if it does not), or `skipped (all modules aborted)`
- "Memo status": `succeeded` (if `memo.md` exists), `failed`, or `skipped (no final thesis)`
- "Audit dossier status": `succeeded` (if `audit_dossier.md` exists), `failed`, or `skipped (no final thesis)`
- "Commit SHA": leave as `(to be filled after commit)` — you'll patch it post-commit in step 12.

---

## 12. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs.

```
git add "analyses/${ARGUMENTS}_<DATE>/"
git commit -m "Research run: ${ARGUMENTS} <DATE>"
git push origin main
```

Capture the commit SHA from `git rev-parse HEAD` and patch the "Commit SHA" field in `RUN_METADATA.md` by rewriting that file via the Write tool (read it, substitute the SHA in place of `(to be filled after commit)`, write the full new content). Do not use `git commit --amend` — per `CLAUDE.md` spirit, prefer new commits over amends. Add the SHA patch as a follow-up commit:

```
git add "analyses/${ARGUMENTS}_<DATE>/RUN_METADATA.md"
git commit -m "Backfill commit SHA in RUN_METADATA for ${ARGUMENTS} <DATE>"
git push origin main
```

(The two-commit approach is intentional: it keeps the run-artifacts commit clean of metadata about itself.)

---

## 13. Report

Print a final summary to the user containing:

- Number of modules discovered and their names
- Per-module status: `completed` / `aborted (fail-fast at <agent>)` / `aborted (failures: <names>)`
- Whether the master synthesizer ran and whether `final_thesis.md` exists
- The three output tiers and their paths: `<RUN_ROOT>/memo.md` (~10-page colleague memo), `<RUN_ROOT>/final_thesis.md` (deep-dive thesis), `<RUN_ROOT>/audit_dossier.md` (full audit concatenation) — noting any that were skipped or failed
- The two commit SHAs pushed to `origin/main`

---

## Hard rules

- Do not hardcode any module name. Run order (step 4) and cross-module context (step 8A) are both derived from each module's `depends_on:` frontmatter — adding a module requires only its files plus its `depends_on` list, with zero edits to this orchestrator.
- Adding a new module — e.g. dropping `.claude/agents/valuation/` with specialists and a `99_valuation-synthesis.md` — must require zero changes to this orchestrator beyond optionally updating the ordering rule in step 4 if cross-module dependencies need it.
- Never invoke another slash command from within this command. The shared pipeline is followed *inline* via the instructions in `frameworks/MODULE_PIPELINE.md`; the standalone module commands at `.claude/commands/research/<module>.md` are NOT called.
- Exactly two commits per run: one run-artifacts commit and one metadata-backfill commit that fills in the commit SHA of the first. Per-module commits do not happen here.
