# MODULE_PIPELINE.md — Shared per-module pipeline for research orchestrators

This document defines the **inline pipeline** that every research module follows when invoked by an orchestrator (`/research:full`, `/research:business-model`, `/research:earnings`, and any future module orchestrators).

It exists to keep one source of truth for the per-module discovery → dispatch → persist → verify → fail-fast loop, so that adding a new module or changing the loop logic does not require synchronised edits across three or more command files.

**Who reads this:** the orchestrator command files cite this document. Agents themselves never read it.

---

## Inputs to the pipeline

A calling orchestrator that follows this document must have these values resolved *before* entering the pipeline:

- `<TICKER>` — the ticker argument
- `<DATE>` — `YYYY-MM-DD`, captured from `date +%Y-%m-%d`
- `<MODULE>` — the module name (e.g. `business-model`, `earnings`). Used as a directory name under `.claude/agents/` and as the subfolder name under `analyses/<TICKER>_<DATE>/`.
- `<RUN_ROOT>` — `analyses/<TICKER>_<DATE>` (the top-level run folder; same for every module in the run).
- `<CROSS_MODULE_CONTEXT>` — a string the orchestrator will paste verbatim into every agent's Task message. Use this to surface paths of *already-completed* upstream modules in the same run (e.g. business-model path when running earnings). If no cross-module data applies, set this to the literal string `none`.

The pipeline returns a structured status the orchestrator can act on:
- `agents_run` — list of agent names successfully dispatched and saved
- `agents_failed` — list of agent names where Task call errored or returned no usable content
- `fail_fast_triggered` — boolean, plus the agent name and output-file path if true
- `module_memo` — `succeeded` / `failed` / `skipped (no synthesis)` (the `<MODULE>_memo.md` tier, Step 4.9A)
- `module_dossier` — `succeeded` / `failed` / `skipped (no synthesis)` (the `<MODULE>_dossier.md` tier, Step 4.9B)

---

## Step 1 — Create the module output folder

```
mkdir -p <RUN_ROOT>/<MODULE>
```

This is the only folder this module writes to.

---

## Step 1.5 — Pre-extract the data pool (multi-tab workbooks)

Before any agent reads the pool, normalize it once so no spreadsheet tab is missed. Capital IQ / NSE / broker exports frequently bundle several datasets as TABS inside a single `.xls`/`.xlsx` (one `EstimatesReport.xls` can hold Consensus / Recent Changes / Multiples / Surprise / Trends / Revisions). Legacy `.xls` is OLE2/BIFF and `.xlsx` cells are binary — a filename-only read sees one opaque file and silently drops every tab but the first.

Run the engine's canonical extractor once per run (idempotent — it skips when `_pool_extracts/manifest.json` is newer than every source, so re-running across modules is free):

```
python3 .claude/tools/extract_pool.py "data/<TICKER>/" "<RUN_ROOT>/_pool_extracts"
```

It writes one text extract per workbook tab into `<RUN_ROOT>/_pool_extracts/`, plus `manifest.json` / `manifest.md` inventorying every source, tab, and row×col dimension. The Layer-0 `*-data-triage` agent re-invokes the same script (idempotent) and is responsible for listing every tab as its own inventory row; `verify-evidence` later builds its audit corpus from the same extracts, so the audit greps exactly what the specialists read. The extractor writes only inside `_pool_extracts/`, never into the Google Drive pool.

---

## Step 2 — Discover agents

Use the Glob tool with pattern `.claude/agents/<MODULE>/[0-9][0-9]_*.md`.

For each matched file:

1. Parse the basename to extract:
   - `<NN>` — the two-digit prefix (e.g. `00`, `07`, `99`)
   - `<name>` — the slug between `<NN>_` and `.md` (e.g. `data-triage`, `moat`)
2. Read the file's YAML frontmatter (the block between the first two `---` lines) and extract:
   - `name` — the agent's invocation name (used as `subagent_type` for Task)
   - `layer` — integer layer number; if missing, treat as `999` and warn
   - `fail_fast` — boolean; default `false` if absent

Keep an in-memory list of discovered agents: `{file_path, NN, name, subagent_type, layer, fail_fast}`.

If the glob returns zero matches, STOP this module and report to the caller: "No agents found at `.claude/agents/<MODULE>/[0-9][0-9]_*.md`."

---

## Step 3 — Group agents by layer

Group the discovered agents by their `layer` field. Sort the layer keys ascending (0, 1, 2, …). Each module's `99_*-synthesis.md` typically has the highest layer number and therefore runs last via ascending sort — rely on the sort, not on the specific number.

---

## Step 4 — Execute layers in order

For each layer, in ascending order, perform Step 4A → Step 4B → Step 4C, then advance to the next layer.

### Step 4A — Dispatch agents

Resolve each agent's expected output path once, up front: `<OUTPUT_PATH>` = `<RUN_ROOT>/<MODULE>/<NN>_<name>.md` (from the Step 2 discovery). This is the single canonical destination for that agent's report in every persistence mode below.

**Persistence contract (Modes A / B / C).** These are implementation mechanics only — the output-file contract is identical in all three. Every specialist output must land at `<OUTPUT_PATH>`, clean and complete, regardless of which mode produced it:

- **Mode A — agent self-persists with `Write`.** Used when the specialist has the `Write` tool. It writes the complete clean report to `<OUTPUT_PATH>` and returns only a short status.
- **Mode B — agent self-persists with a `Bash` heredoc.** Used when the specialist lacks `Write` but has `Bash`. It writes the complete clean report to `<OUTPUT_PATH>` with a safe quoted heredoc (creating the parent folder first if needed) and returns only a short status.
- **Mode C — agent returns inline; orchestrator writes (fallback).** Used when the specialist can self-persist with neither tool. It returns its full report inline; the orchestrator strips the confirmation block and writes `<OUTPUT_PATH>` (Step 4B).

Self-persistence (A or B) is preferred for scalability: a large run (dozens of agents in one pass) must not depend on the orchestrator capturing every full report inline and re-writing it. Mode C is the always-available fallback. In every mode the saved file is identical in shape and lands at the same path; the module synthesizer still reads sibling output files from disk, and the master synthesizer still reads the completed run folder from disk.

For every agent in this layer, dispatch a Task tool call with:

- `subagent_type: "<name>"` (the value from the frontmatter)
- User message — assemble the body from `<CROSS_MODULE_CONTEXT>` and the agent's `<OUTPUT_PATH>`:

  **If `<CROSS_MODULE_CONTEXT>` is the literal string `none`:**

  > Analyze ticker <TICKER>. Data pool path: data/<TICKER>/. Today's date: <DATE>. Follow your system prompt and produce your complete report formatted exactly per your REPORT STRUCTURE section. Then persist it to the exact path `<OUTPUT_PATH>` (the folder already exists): if you have the `Write` tool, use it (Mode A); if you do not have `Write` but have `Bash`, write it with a safe quoted heredoc `cat > '<OUTPUT_PATH>' <<'REPORT_EOF'` … `REPORT_EOF` (Mode B). The saved file must contain ONLY your report, starting with its top-level markdown header — no chat-confirmation block, no preamble. After saving, reply with ONLY a short status: a `WROTE: <OUTPUT_PATH>` line plus your one-line Verdict and one-line Biggest finding. If you have NEITHER `Write` nor `Bash`, instead return your COMPLETE report inline as your final message, starting with its header (Mode C) — the orchestrator will save it. Do not write any file other than `<OUTPUT_PATH>`, do not modify sibling files, and do not run git or commit anything — the orchestrator owns all commits.

  **Otherwise, paste `<CROSS_MODULE_CONTEXT>` verbatim as its own sentence before the "Follow your system prompt..." sentence:**

  > Analyze ticker <TICKER>. Data pool path: data/<TICKER>/. Today's date: <DATE>. <CROSS_MODULE_CONTEXT>. Follow your system prompt and produce your complete report formatted exactly per your REPORT STRUCTURE section. Then persist it to the exact path `<OUTPUT_PATH>` (the folder already exists): if you have the `Write` tool, use it (Mode A); if you do not have `Write` but have `Bash`, write it with a safe quoted heredoc `cat > '<OUTPUT_PATH>' <<'REPORT_EOF'` … `REPORT_EOF` (Mode B). The saved file must contain ONLY your report, starting with its top-level markdown header — no chat-confirmation block, no preamble. After saving, reply with ONLY a short status: a `WROTE: <OUTPUT_PATH>` line plus your one-line Verdict and one-line Biggest finding. If you have NEITHER `Write` nor `Bash`, instead return your COMPLETE report inline as your final message, starting with its header (Mode C) — the orchestrator will save it. Do not write any file other than `<OUTPUT_PATH>`, do not modify sibling files, and do not run git or commit anything — the orchestrator owns all commits.

Issue every Task call for the layer in a single message so they run concurrently. Wait for all of them to return before moving on to Step 4B.

> **Note on self-persisted reports.** Agents may carry tool sets that differ by module (e.g., in the validation run the business-model specialists had `Write` and used Mode A, while several earnings specialists lacked `Write` and used Mode B via a `Bash` heredoc). The orchestrator does not need to know each agent's tools in advance — the Task message offers all three modes, the agent picks the one it can execute, and Step 4B verifies the file landed correctly either way.

> **Note on cross-module context format.** The caller builds the cross-module context string from the module's `depends_on` list (see `/research:full` step 8A): one sentence per dependency that completed in the run, in the form `<Dep> cross-module path: <PATH>.` — the dependency's module name with its first letter capitalized (e.g. `Business-model cross-module path: …`, `Earnings cross-module path: …`). Agents parse the label(s) for the dependencies they read and ignore the rest. The shared pipeline does NOT add a label of its own — it pastes the caller's string verbatim. A new module declares what it reads via `depends_on` on its `99_*-synthesis.md`; its agents look for those deps' labels.

### Step 4B — Persist (self or orchestrator) and verify every output file

Each agent returns in one of two shapes (per the Step 4A contract): a **short status** because it self-persisted to `<OUTPUT_PATH>` (Mode A or B), or its **full report inline** as the Mode C fallback. The orchestrator owns file IO only in Mode C, but it **verifies** every file in all modes. A chat-confirmation block (Agent / Output / Verdict / Biggest finding) must never end up inside a saved file — Mode A/B agents are told not to include it; Mode C strips it here.

After all of this layer's agents have returned, for each agent (`<OUTPUT_PATH>` = `<RUN_ROOT>/<MODULE>/<NN>_<name>.md`):

**1. Write the file only if the agent returned inline (Mode C).** If the agent self-persisted (Mode A/B), do NOT re-derive the file from its short status — skip straight to verification. For a Mode C inline return:

- Start from the COMPLETE final assistant message returned by that agent's Task call. Within the report body itself, do not edit, summarize, or reformat — preserve every line of substantive content verbatim.
- Strip any leading preamble before the report's first top-level `#` header.
- Strip the trailing chat-confirmation block, applying these rules in order:
  1. Locate the LAST line in the content matching the regex `^Agent:\s*\S+\s*$` (case-sensitive: literal `Agent:`, optional whitespace, a single non-empty token, optional trailing whitespace, end of line).
  2. If such a line exists, inspect the next 5 lines after it. Confirm the block is a real chat-confirmation block by verifying that those 5 lines contain at least one line matching `^(\*\*)?Output:`, at least one matching `^(\*\*)?Verdict:`, and at least one matching `^(\*\*)?Biggest finding:` (case-sensitive labels, optional `**` markdown-bold prefix, order flexible).
  3. If the `Agent:` line is found AND all three companion-label patterns are present, truncate the content to everything BEFORE the matched `Agent:` line. Then trim the truncated tail: repeatedly drop the last line if it is empty, contains only whitespace, contains only `---`, or is a fence line (only three backticks, optionally surrounded by whitespace). Stop when the last line is none of those.
  4. If no `Agent:` line is found OR the companion-label triple is incomplete, use the content unchanged. Do not error.
- Use the Write tool to save the cleaned content to `<OUTPUT_PATH>`. Issue all Mode-C Write calls for the layer in a single message so they run in parallel.

**2. Mandatory verification — run for EVERY expected `<OUTPUT_PATH>`, in all modes.** After the layer's writes/self-persists complete, run a Bash check per file (substituting the actual path):

```
test -s "<output_path>" || echo "FAIL missing-or-empty <output_path>"
wc -c "<output_path>"   # inspect any suspiciously small file (e.g. < 400 bytes)
head -1 "<output_path>" | grep -qE '^#' || echo "WARN no-top-level-header <output_path>"
tail -20 "<output_path>" | grep -qE '^Agent:[[:space:]]+\S+[[:space:]]*$' && echo "WARN stray-confirmation-block <output_path>"
```

Each saved file must: (a) **exist and be non-empty** (`test -s`); (b) **contain substantive markdown** — it starts with a top-level `#` header, not whitespace or a stray status line; (c) **not be obviously truncated** — it ends on a complete section/line, not mid-sentence or inside an unclosed code fence; (d) have **no stray chat-confirmation block** in its last 20 lines.

**3. Recovery — do not advance to the next layer until every expected file passes.**

- Stray confirmation block (Mode C) → re-apply the strip rules to that agent's returned content and re-Write the file. (Mode A/B) → ask that agent to re-persist a clean file.
- Missing / empty / truncated → ask that agent to return its COMPLETE report inline (or re-run the agent), then strip and write it as Mode C to `<OUTPUT_PATH>`.

Track which agents in the layer succeeded and which failed. An agent **failed** if (a) its Task call returned an error, (b) it returned no usable report content (refusal, empty message), or (c) its `<OUTPUT_PATH>` still fails verification after a recovery attempt.

### Step 4C — Fail-fast post-processing

For any agent in this layer with `fail_fast: true` (today only the per-module data-triage agent in Layer 0):

- Read the triage output file (self-persisted in Mode A/B or orchestrator-written in Mode C, and verified in Step 4B) at `<RUN_ROOT>/<MODULE>/<NN>_<name>.md`.
- Test for an "insufficient" verdict with this case-insensitive, markdown-tolerant Bash check (exit 0 = match): `grep -iqE 'verdict[*_:[:space:]]*insufficient([[:space:]]+data)?' "<RUN_ROOT>/<MODULE>/<NN>_<name>.md"`. *(fix F06 — the trailing `data` is now OPTIONAL.)* The character class `[*_:[:space:]]*` between "verdict" and "insufficient" tolerates any asterisks, underscores, colons, and whitespace, and "insufficient" is anchored immediately after the verdict label, so `**Verdict:** Insufficient`, `**Verdict:** Insufficient data`, `Verdict: Insufficient — refuse to rate`, and `_Verdict_ insufficient` all match — while the menu line `**Verdict:** Sufficient / Partial / Insufficient` does NOT (the label is followed by "Sufficient", not "Insufficient", and the class cannot cross letters). This is now aligned with the cockpit watcher's matcher (`ui/server/src/verdict.ts` `extractTriageStatus`, which already keys on a bare "insufficient"), so the orchestrator and the UI can never again disagree on whether a module aborted. Each `00`-triage template must still render a SINGLE chosen verdict line (not the three-option menu) so this check is unambiguous.
- If the regex matches, the **module aborts**: do not dispatch any later layer for this module. Return control to the caller with `fail_fast_triggered = true`, the agent name, and the output-file path. **It is the caller's responsibility to decide what happens next** (abort the whole run, or continue with other modules).

If no fail-fast trigger fires (or the layer has no fail-fast agents), proceed to the next layer.

---

## Step 4.9 — Build the module's other two tiers (module memo + module dossier)

After all layers have completed (and only if the module did NOT abort via fail-fast), build the two remaining module tiers so every module is self-sufficient: a **module memo** (the short, plain-English shareable read) and a **module dossier** (the deterministic, lossless concatenation of this module's artifacts). Together with the `99_*-synthesis.md` (the deep-dive tier), these are the three module-level outputs, mirroring at the module level the run-level memo / final thesis / audit dossier.

Run this step only if `<RUN_ROOT>/<MODULE>/` contains a `99_*-synthesis.md` (i.e. the synthesis layer produced a file). If the module aborted in Step 4C, skip Step 4.9 entirely. Both sub-steps are **best-effort**: a failure here is recorded for the caller but must NEVER abort the module — the `99` synthesis is the module's decision of record.

Resolve the module's synthesis filename via Glob on `<RUN_ROOT>/<MODULE>/99_*-synthesis.md` (do not hardcode it). The two new files are named generically: `<RUN_ROOT>/<MODULE>/<MODULE>_memo.md` and `<RUN_ROOT>/<MODULE>/<MODULE>_dossier.md`. These names deliberately do NOT match the `[0-9][0-9]_*.md` agent pattern, so they are never mistaken for a specialist output.

### Step 4.9A — Module memo (LLM, via the `module-memo-writer` agent)

Dispatch a single Task call:

- `subagent_type: "module-memo-writer"`
- User message:

  > Read `<RUN_ROOT>/<MODULE>/99_<...>-synthesis.md` and write the module memo to `<RUN_ROOT>/<MODULE>/<MODULE>_memo.md`. Condense only what the synthesis already carries — do not add new analysis, numbers, or evidence, and do not change its verdict, scores, or caps. The saved file must start with its `#` header and contain no chat-confirmation block. Do not write any other file and do not run git.

Wait for it. Verify `<RUN_ROOT>/<MODULE>/<MODULE>_memo.md` exists and is non-empty (`test -s`). If it does not, record the module memo as `failed` and continue — do NOT abort the module.

### Step 4.9B — Module dossier (deterministic, no LLM)

The module dossier is a mechanical, lossless concatenation — never an LLM rewrite — of this module's artifacts: the `99` synthesis first, then the `00_…NN_` specialist outputs in ascending order. It EXCLUDES `*_memo.md` and `*_dossier.md` so it never includes itself or the module memo. Build it with this Bash step (read-only on every artifact, writes only `<MODULE>_dossier.md`, best-effort — never abort the module):

```bash
RUN_ROOT="<RUN_ROOT>" MODULE="<MODULE>" python3 - <<'PY'
import os, glob, re, datetime
RUN = os.environ["RUN_ROOT"]; MOD = os.environ["MODULE"]
MDIR = os.path.join(RUN, MOD)
OUT = os.path.join(MDIR, f"{MOD}_dossier.md")
def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
def read(p):
    try: return open(p, encoding="utf-8", errors="replace").read()
    except Exception: return None
files = glob.glob(os.path.join(MDIR, "*.md"))
# never include the dossier or the memo in the dossier
files = [f for f in files if not re.search(r"_(memo|dossier)\.md$", os.path.basename(f))]
syn  = sorted(f for f in files if re.search(r"99_.*-synthesis\.md$", os.path.basename(f)))
subs = sorted(f for f in files if f not in syn)  # 00_,01_,...,NN_ zero-padded => lexical == numeric
sections, gaps = [], []
for f in syn:  sections.append((f"{MOD} — module synthesis", os.path.basename(f), f))
for f in subs: sections.append((f"{MOD} / {os.path.basename(f)}", os.path.basename(f), f))
if not syn: gaps.append("99 synthesis missing")
now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
ticker = os.path.basename(RUN).rsplit("_", 1)[0]
H = [f"# {MOD} Module Dossier — {ticker}\n",
     "> Deterministic, lossless concatenation of every artifact in this module — the module synthesis "
     "and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is "
     "omitted or paraphrased. This is the module's \"see everything\" tier; the module's decision lives "
     f"in `99_*-synthesis.md` and the short read in `{MOD}_memo.md`.\n",
     f"- Generated: {now}",
     f"- Module folder: `{os.path.relpath(MDIR, RUN)}`",
     f"- Contents: {len(syn)} module synthesis + {len(subs)} specialist outputs = {len(sections)} files"]
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

If the script errors for any reason, record the module dossier as `failed` and continue — never abort the module over a derived tier.

---

## Step 5 — Return status to the caller

After all layers complete (or after a fail-fast abort), the pipeline ends. The caller is expected to:

- Inspect the returned status and decide on commits / further dispatch / synthesis.
- Handle any per-module logging, summary reporting, or cross-module path propagation.

This document deliberately says nothing about git, commits, or downstream synthesis — those are the caller's responsibility.

---

## Hard rules (apply regardless of caller)

- Do not hardcode any agent name. Every agent invocation, output filename, and layer assignment is derived from the discovered files and their frontmatter.
- Adding a new file like `.claude/agents/<MODULE>/13_supply-chain.md` with `layer: 2` in its frontmatter must require zero changes to this pipeline — it should automatically be picked up, run in layer 2, and written to `<RUN_ROOT>/<MODULE>/13_supply-chain.md`.
- The pipeline writes files only inside `<RUN_ROOT>/<MODULE>/`. It does not touch other module folders or the run-root itself.
