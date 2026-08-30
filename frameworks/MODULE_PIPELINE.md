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
- `module_memo` — `succeeded` / `failed` / `skipped (no synthesis)` / `skipped (deferred)` (the `<MODULE>_memo.md` tier, Step 4.9A)
- `module_dossier` — `succeeded` / `failed` / `skipped (no synthesis)` (the `<MODULE>_dossier.md` tier, Step 4.9B)

---

## Step 0 — Refuse writes into a sealed run

Before creating a module folder, refreshing extracts, or dispatching an agent, test for
`<RUN_ROOT>/idea_projection_manifest.json` or `<RUN_ROOT>/idea_admission.json`. If either exists, STOP
this module. The ex-ante projection has sealed the run; module output, source extracts, syntheses, and
audits must remain byte-stable. New evidence requires a new dated run. A correction uses the append-only
correction ledger and never deletes the seal. This generic check applies automatically to every current
or future module; no module name is hand-wired.

---

## Step 1 — Create the module output folder

```
mkdir -p <RUN_ROOT>/<MODULE>
```

This is the only folder this module writes to.

---

## Step 1.5 — Pre-extract the data pool (multi-tab workbooks)

Before any agent reads the pool, normalize it once so no spreadsheet tab is missed. Capital IQ / NSE / broker exports frequently bundle several datasets as TABS inside a single `.xls`/`.xlsx` (one `EstimatesReport.xls` can hold Consensus / Recent Changes / Multiples / Surprise / Trends / Revisions). Legacy `.xls` is OLE2/BIFF and `.xlsx` cells are binary — a filename-only read sees one opaque file and silently drops every tab but the first.

Resolve one evidence generation before any filesystem read:

- `<LOGICAL_DATA_PATH>` is always `data/<TICKER>/`. It is the stable label used in citations.
- `<EXTRACT_OUT>` is `<RUN_ROOT>/_pool_extracts`.
- If `NOSTRA_FROZEN_EVIDENCE_ROOT` is set, require all four supervisor bindings: `NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION`, and `NOSTRA_FROZEN_EVIDENCE_ROOT`. This is an isolated, supervisor-verified read capability. **Do not run `extract_pool.py` in this mode** and do not rebuild or revalidate it against any live path. Set `<EXTRACT_OUT>` to `NOSTRA_FROZEN_POOL_OUT_DIR`, `<GENERATION_ROOT>` to `<EXTRACT_OUT>/.extract-generations/$NOSTRA_FROZEN_POOL_GENERATION`, and `<DATA_PATH>` to `NOSTRA_FROZEN_EVIDENCE_ROOT`. Require the evidence root to be the generation's manifest-declared `raw_prefix` inside that exact generation. Any absent, partial, mismatched, symlinked, unreadable, or tampered binding is a hard stop. In this mode `data/<TICKER>/` is **only a logical citation label**: do not `ls`, `find`, `stat`, `grep`, open, or otherwise read it, even as a fallback. Never read the original `<RUN_ROOT>/_pool_extracts/` path or any sibling/projection below it; consume only the provided capability.
- Without a frozen binding (a standalone module), set `<DATA_PATH>` to `<LOGICAL_DATA_PATH>` and run the canonical extractor normally:

  ```bash
  python3 .claude/tools/extract_pool.py "<DATA_PATH>" "<EXTRACT_OUT>"
  ```

  Read the published manifest only to capture its `generation.digest`; set `<GENERATION_ROOT>` to `<EXTRACT_OUT>/.extract-generations/<digest>` and verify that exact generation with the canonical extractor before consuming it.

For both modes, use only `<GENERATION_ROOT>/manifest.json`, `<GENERATION_ROOT>/corpus.txt`, `<GENERATION_ROOT>/ciq_facts.json`, and `<GENERATION_ROOT>/relationships.json`. Resolve every manifest `extract` reference through `<EXTRACT_OUT>` and require its prefix to be exactly `.extract-generations/<digest>/`; never read a mutable fixed-name projection (including the human-facing root `manifest.md`). The immutable raw snapshot at `<DATA_PATH>` is the only raw evidence root in a frozen chain. This preserves one byte-identical evidence set across every module and provider while standalone module commands retain their ordinary live-pool freshness check.

The generation contains one text extract per workbook tab and inventories every source, tab, and row×col dimension. The extractor writes only inside `_pool_extracts/`, never into the Google Drive pool.

Its best-effort `<GENERATION_ROOT>/ciq_facts.json` is a **deterministic, source-bound facts sidecar** of the key CIQ numbers (net debt, total debt, EBITDA, OCF, FCF, interest coverage, EV/EBITDA + own-history percentile, P/E, segments, geography, margin trend, consensus, surprise, revisions, insider net buy/sell, institutional concentration and trend), each marked `present` (with an exact `source_ref` = the sheet/row/period it came from), `unknown`, or `missing` — a number is never fabricated. Specialists cite its `present` facts as the authoritative READ of the CIQ workbook for the numbers it covers (see the dispatch note in Step 4A) — the §4 source hierarchy still decides which SOURCE wins (a filing beats the vendor export) — and `verify-evidence` cross-checks the finished thesis against it. If the file is absent (no CIQ workbooks, or the extractor could not build it), agents fall back to their own sourced read — it is an aid, never a dependency.

Its best-effort `<GENERATION_ROOT>/relationships.json` is a **deterministic supply-chain graph** parsed from any Capital IQ **Suppliers / Customers** export in the pool. For each disclosed relationship it records the named counterparty, its exchange listing and GICS industry, the exact filing that disclosed it, WHICH side disclosed it (a counterparty naming the company in its OWN filing is a materiality signal the company's filing cannot give), and whether the counterparty is a genuine outside party or an entity inside the company's own group — derived from the export's structure, not from a name guess. It also carries the export's own `scope_notes` (these views cover only *recently disclosed* relationships, usually a two-year window, for *current subsidiaries*) and an intra-group concentration read that feeds the related-party question. It is a §4 tier-5 vendor export: cite it as such, never as a filing, and never let a `likely_group` entity be read as arm's-length. A pool with no relationship export yields a valid EMPTY graph — that is the honest answer "no supplier/customer list has been provided", not a failure. The cockpit's Ideas board projects the same file as its chain lane.

**Language is not a data gap (CLAUDE.md §27).** Every specialist reads the pool's non-English extracts by translating the material facts into English (figures verbatim, §5/§15) — a non-English filing is not a data gap. A filing in the company's home language is a full source at the tier its type earns — never a missing input, a source-quality downgrade, or a governance-opacity flag. Only a FAILED extraction (corrupt / encrypted / illegible) is a real gap.

**External data rides the same manifest (frameworks/EXTERNAL_DATA.md).** Documents under `<DATA_PATH>/external/` (cited logically as `data/<TICKER>/external/`) — paid alt-data panels, expert-call notes, channel checks, broker research, paid-API pulls — are extracted like any pool doc, and their manifest rows carry `external: true`, a pool-relative `path`, and a `provenance` object folded in from each doc's `<file>.source.json` sidecar (provider, source_type, §4 tier, as-of, license). The sidecar itself is metadata, never a source row. Specialists cite these documents at the tier the provenance maps to — an alt-data panel is a tier-5 vendor estimate with its stated error margin, an expert call is a tier-9 user-collected note — never as a filing, and never in place of a filing's own number.

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
   - `emits_signal_evidence` — boolean; default `false` if absent
   - `signal_families` — inline JSON string array; REQUIRED and non-empty when
     `emits_signal_evidence: true`. Ownership is generic frontmatter, never a central module list.
   - `memory_profile` — the closed profile required by `frameworks/MEMORY_RUNTIME.md` for research
     analytical agents. Preserve it generically; do not maintain a central memory-agent list.

Keep an in-memory list of discovered agents:
`{file_path, NN, name, subagent_type, layer, fail_fast, emits_signal_evidence, signal_families,
memory_profile, agent_key}` where `agent_key` is `<MODULE>/<NN>_<filename-slug>`.

If the glob returns zero matches, STOP this module and report to the caller: "No agents found at `.claude/agents/<MODULE>/[0-9][0-9]_*.md`."

---

## Step 3 — Group agents by layer

Group the discovered agents by their `layer` field. Sort the layer keys ascending (0, 1, 2, …). Each module's `99_*-synthesis.md` typically has the highest layer number and therefore runs last via ascending sort — rely on the sort, not on the specific number.

---

## Step 4 — Execute layers in order

For each layer, in ascending order, perform Step 4A → Step 4B → Step 4C, then advance to the next layer.

### Step 4A — Dispatch agents

Resolve each agent's expected output path once, up front: `<OUTPUT_PATH>` = `<RUN_ROOT>/<MODULE>/<NN>_<name>.md` (from the Step 2 discovery). This is the single canonical destination for that agent's report in every persistence mode below.

When `emits_signal_evidence: true`, also resolve `<SIGNAL_OUTPUT_PATH>` =
`<RUN_ROOT>/<MODULE>/<NN>_<name>.signals.json`. Append this sentence to that agent's Task message:

> Your frontmatter declares `emits_signal_evidence: true`. In addition to the markdown report, write the strict SignalEvidence sidecar described by `.claude/agents/commodity/MODULE_RULES.md` §8 to exactly `<SIGNAL_OUTPUT_PATH>`, using only your declared `signal_families`. These are the only two files you may write.

For a non-emitting agent, do not supply a signal path and do not ask for a sidecar.

**Persistence contract (Modes A / B / C).** These are implementation mechanics only — the output-file contract is identical in all three. Every specialist output must land at `<OUTPUT_PATH>`, clean and complete, regardless of which mode produced it. An emitting agent must also land valid JSON at `<SIGNAL_OUTPUT_PATH>`:

- **Mode A — agent self-persists with `Write`.** Used when the specialist has the `Write` tool. It writes the complete clean report to `<OUTPUT_PATH>` and returns only a short status.
- **Mode B — agent self-persists with a `Bash` heredoc.** Used when the specialist lacks `Write` but has `Bash`. It writes the complete clean report to `<OUTPUT_PATH>` with a safe quoted heredoc (creating the parent folder first if needed) and returns only a short status.
- **Mode C — agent returns inline; orchestrator writes (fallback).** Used when the specialist can self-persist with neither tool. It returns its full report inline; the orchestrator strips the confirmation block and writes `<OUTPUT_PATH>` (Step 4B).

An emitting agent must use Mode A or B for its JSON sidecar. If it has neither `Write` nor `Bash`, mark
that agent failed rather than trying to extract JSON from the inline markdown report.

Self-persistence (A or B) is preferred for scalability: a large run (dozens of agents in one pass) must not depend on the orchestrator capturing every full report inline and re-writing it. Mode C is the always-available fallback. In every mode the saved file is identical in shape and lands at the same path; the module synthesizer still reads sibling output files from disk, and the master synthesizer still reads the completed run folder from disk.

**Resume — skip agents already completed on disk (idempotent re-dispatch).** Before dispatching this layer, run `node scripts/agent-output-validity.mjs "<OUTPUT_PATH>"`. Exit 0 is the **single mechanical authority** to reuse the markdown file: it is a real non-empty file, starts with one top-level `#` header, has no NUL byte or unclosed fenced block, and has no stray `Agent: <name>` confirmation line in its last 20 lines. If it passes, the agent finished in a prior attempt — **REUSE it and do NOT re-dispatch it**. Do not add a subjective second “looks truncated” test at resume time: prose quality is adjudicated by the synthesis, and a hidden judgment here can widen a cockpit-approved exact paid scope after launch. For an emitting agent, reuse additionally requires `<SIGNAL_OUTPUT_PATH>` to exist, be non-empty, parse as a JSON object, carry `schema_version: 1`, and match the agent's frontmatter `name` in `owner_orb`; otherwise re-dispatch it. When `NOSTRA_MEMORY_MODE=enforced`, reuse additionally requires `frameworks/MEMORY_RUNTIME.md` Step 4 to return `attested: true` for the exact `agent_key` and run-root-relative output; otherwise re-dispatch it. In `shadow`, record an unattested reuse but do not widen the paid scope. Dispatch only agents whose required output set is missing or fails those checks. The cockpit imports this same validator when it counts reusable orbs, so “N will run” and the pipeline's skip decision cannot diverge. This makes a module that broke partway through — a crash, a machine restart, a cancelled run — continue from where it stopped instead of redoing every specialist. It is the agent-level twin of `/research:full` step 8's module-level skip ("a module whose `99_*-synthesis.md` is present is reused"), and it applies identically in every swarm (research / screener / commodity) because it is keyed only on the `<RUN_ROOT>/<MODULE>/<NN>_<slug>.md` filename pattern — no agent or module name is ever hardcoded (CLAUDE.md §26).

Two invariants keep this safe:
- **A fresh run is unaffected.** A first run has an empty module folder, so nothing matches and every agent runs. The check bites ONLY on a re-dispatch into an already-populated folder — i.e. a resume.
- **A corrupt file is never silently kept.** A mid-write crash can leave a file that exists but is truncated or malformed; it FAILS the Step 4B checks and is re-run. Reuse requires a *valid* file, not merely a present one.

To force a clean re-run of one agent (a deliberate refresh, not a resume), use `/research:rerun <MODULE> <AGENT> <TICKER>` — it dispatches its target agent directly and does NOT pass through this step, so it regenerates unconditionally — or delete that agent's `<OUTPUT_PATH>` before re-launching the module. A reused agent still counts as present for Step 4B verification (its file already passed) and for Step 4C fail-fast (which reads the triage file from disk regardless of whether it was just written or reused).

For every agent in this layer that was NOT reused above, dispatch a Task tool call with:

Before issuing any Task call, follow `frameworks/MEMORY_RUNTIME.md` Step 1 for each non-reused research
agent. Compile packets before paid dispatch, in parallel where possible. In `enforced`, a compilation
failure stops that Task before spend. Append the exact rendered packet plus the Step-2 obligations to the
Task message below. Commodity and screener agents do not use this equity runtime yet.

When `NOSTRA_EXACT_MODULE_RESUME=1` and the non-reused agent is a **specialist** (never the `99`
synthesis), first clear only that agent's exact
`<OUTPUT_PATH>` and, when supplied, exact `<SIGNAL_OUTPUT_PATH>` before its one Task dispatch. Never
clear a reused agent's path, never use a glob, and never remove a parent directory. This prevents an
invalid remnant from an earlier interrupted attempt surviving when the newly reviewed Task errors before
it can replace the file. Run `node scripts/agent-output-validity.mjs --quarantine-exact "<OUTPUT_PATH>"
"<SIGNAL_OUTPUT_PATH>"` (omit the second argument when no signal path was supplied). The helper rejects
anything outside the child-only `NOSTRA_EXACT_MODULE_RUN_ROOT`, `NOSTRA_EXACT_MODULE_NAME`, and
`NOSTRA_EXACT_MODULE_WRITABLE_ORBS` receipt supplied by the server. It also rejects `99`, reused orbs,
mismatched markdown/sidecar pairs, directories, and unsafe parents. If it fails, stop before dispatching
that orb or the `99` synthesis. The `99` path is never deleted by this helper; exact staging already removes
the old synthesis. A separate `NOSTRA_EXACT_MODULE_SYNTHESIS_ORBS` receipt below binds cleanup of the
current discovered synthesis only; a specialist receipt can never authorize it.

- `subagent_type: "<name>"` (the value from the frontmatter)
- User message — assemble the body from `<CROSS_MODULE_CONTEXT>` and the agent's `<OUTPUT_PATH>`:

  **If `<CROSS_MODULE_CONTEXT>` is the literal string `none`:**

  > Analyze ticker <TICKER>. Data pool filesystem path: <DATA_PATH>. Cite it logically as data/<TICKER>/; when frozen, never read the live logical path. Today's date: <DATE>. If `<GENERATION_ROOT>/ciq_facts.json` exists, it is a deterministic, source-bound facts sidecar mechanically parsed from the CIQ workbooks: for any headline number it reports with `status: present`, cite its `value` + `source_ref` as the authoritative READ of that workbook and reconcile your own read to it (a material gap means a misread — flag it, never override it silently). The §4 source hierarchy still governs which SOURCE wins — an audited filing beats the vendor workbook, but cite the filing for the filing's own number (§5), never the vendor figure under a filing's name. Use your own sourced read where a fact is `unknown`/`missing` or the file is absent — this pins the shared numbers, it does not replace your analysis. If `<GENERATION_ROOT>/relationships.json` exists, it is a deterministic supply-chain graph parsed from the pool's Capital IQ Suppliers/Customers exports: named counterparties with their listing and industry, the filing that disclosed each relationship and which side disclosed it, and whether each is a genuine outside party or an entity inside the company's own group. Read it as the tier-5 vendor export it is (never as a filing), honour its `scope_notes` (these views cover only recently disclosed relationships, not the full supplier base), and never treat a `likely_group` entity as arm's-length. Documents under `<DATA_PATH>/external/` (cited logically as `data/<TICKER>/external/`) are external research (alt-data panels, expert calls, channel checks, broker notes; their manifest rows carry `provenance` from a `.source.json` sidecar): cite each at the §4 tier its provenance maps to per `frameworks/EXTERNAL_DATA.md`, labelled with provider + as-of date (an estimate carries the vendor's stated error margin), never as a filing and never in place of a filing's own number. Follow your system prompt and produce your complete report formatted exactly per your REPORT STRUCTURE section. Then persist it to the exact path `<OUTPUT_PATH>` (the folder already exists): if you have the `Write` tool, use it (Mode A); if you do not have `Write` but have `Bash`, write it with a safe quoted heredoc `cat > '<OUTPUT_PATH>' <<'REPORT_EOF'` … `REPORT_EOF` (Mode B). The saved file must contain ONLY your report, starting with its top-level markdown header — no chat-confirmation block, no preamble. After saving, reply with ONLY a short status: a `WROTE: <OUTPUT_PATH>` line plus your one-line Verdict and one-line Biggest finding. If you have NEITHER `Write` nor `Bash`, instead return your COMPLETE report inline as your final message, starting with its header (Mode C) — the orchestrator will save it. Do not write any file other than `<OUTPUT_PATH>` and, only when supplied, `<SIGNAL_OUTPUT_PATH>`; do not modify sibling files, and do not run git or commit anything — the orchestrator owns all commits.

  **Otherwise, paste `<CROSS_MODULE_CONTEXT>` verbatim as its own sentence before the "Follow your system prompt..." sentence:**

  > Analyze ticker <TICKER>. Data pool filesystem path: <DATA_PATH>. Cite it logically as data/<TICKER>/; when frozen, never read the live logical path. Today's date: <DATE>. If `<GENERATION_ROOT>/ciq_facts.json` exists, it is a deterministic, source-bound facts sidecar mechanically parsed from the CIQ workbooks: for any headline number it reports with `status: present`, cite its `value` + `source_ref` as the authoritative READ of that workbook and reconcile your own read to it (a material gap means a misread — flag it, never override it silently). The §4 source hierarchy still governs which SOURCE wins — an audited filing beats the vendor workbook, but cite the filing for the filing's own number (§5), never the vendor figure under a filing's name. Use your own sourced read where a fact is `unknown`/`missing` or the file is absent — this pins the shared numbers, it does not replace your analysis. If `<GENERATION_ROOT>/relationships.json` exists, it is a deterministic supply-chain graph parsed from the pool's Capital IQ Suppliers/Customers exports: named counterparties with their listing and industry, the filing that disclosed each relationship and which side disclosed it, and whether each is a genuine outside party or an entity inside the company's own group. Read it as the tier-5 vendor export it is (never as a filing), honour its `scope_notes` (these views cover only recently disclosed relationships, not the full supplier base), and never treat a `likely_group` entity as arm's-length. Documents under `<DATA_PATH>/external/` (cited logically as `data/<TICKER>/external/`) are external research (alt-data panels, expert calls, channel checks, broker notes; their manifest rows carry `provenance` from a `.source.json` sidecar): cite each at the §4 tier its provenance maps to per `frameworks/EXTERNAL_DATA.md`, labelled with provider + as-of date (an estimate carries the vendor's stated error margin), never as a filing and never in place of a filing's own number. <CROSS_MODULE_CONTEXT>. Follow your system prompt and produce your complete report formatted exactly per your REPORT STRUCTURE section. Then persist it to the exact path `<OUTPUT_PATH>` (the folder already exists): if you have the `Write` tool, use it (Mode A); if you do not have `Write` but have `Bash`, write it with a safe quoted heredoc `cat > '<OUTPUT_PATH>' <<'REPORT_EOF'` … `REPORT_EOF` (Mode B). The saved file must contain ONLY your report, starting with its top-level markdown header — no chat-confirmation block, no preamble. After saving, reply with ONLY a short status: a `WROTE: <OUTPUT_PATH>` line plus your one-line Verdict and one-line Biggest finding. If you have NEITHER `Write` nor `Bash`, instead return your COMPLETE report inline as your final message, starting with its header (Mode C) — the orchestrator will save it. Do not write any file other than `<OUTPUT_PATH>` and, only when supplied, `<SIGNAL_OUTPUT_PATH>`; do not modify sibling files, and do not run git or commit anything — the orchestrator owns all commits.

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
node scripts/agent-output-validity.mjs "<output_path>" || echo "FAIL invalid-agent-output <output_path>"
wc -c "<output_path>"   # diagnostic only; size never overrides the validator either way
```

The shared validator is authoritative for the saved markdown mechanics in BOTH Step 4A reuse and Step 4B persistence. It checks: (a) a real, non-empty regular file; (b) one top-level `#` header at the start, not whitespace/preamble or `##`; (c) no NUL byte and no unclosed backtick/tilde fence; and (d) no stray chat-confirmation `Agent:` line in the last 20 lines. Do not silently strengthen or weaken these rules in prose: the server uses the same function to price exact resumes.

For every emitting agent, also verify `<SIGNAL_OUTPUT_PATH>` before advancing:

```
python3 - "<signal_output_path>" "<frontmatter-name>" <<'PY'
import json, sys
p, owner = sys.argv[1:]
d = json.load(open(p, encoding="utf-8"))
assert isinstance(d, dict) and d.get("schema_version") == 1
assert d.get("owner_orb") == owner and isinstance(d.get("signals"), list)
PY
```

The deterministic run-level compiler performs the deeper ownership, provenance, expiry, correlation,
contradiction and validation-registry checks. This local check only proves the expected sidecar landed
and is structurally readable.

**2A. Mandatory memory-use verification for research analytical agents.** After the markdown and any
signal sidecar pass, extract the agent's closed `memory-use-draft/v1` block and follow
`frameworks/MEMORY_RUNTIME.md` Step 3. Do not save the draft in the run folder. In `enforced`, a missing
or invalid attestation makes the analytical output invalid and sends it through this step's existing
retry/quarantine policy; it cannot be counted as a successful orb. In `shadow`, preserve the report and
record the receipt failure. Audit, parity, memo, and dossier roles never receive or attest memory.

**3. Recovery — do not advance to the next layer until every expected file passes.**

**Exact-resume paid-scope override.** When `NOSTRA_EXACT_MODULE_RESUME=1`, each non-reused orb gets
exactly ONE Task dispatch. Do not re-dispatch an agent, and do not ask an emitting agent for a second
signal-sidecar Task, when its first Task errors or its saved output fails verification. A deterministic
Mode-C cleanup/re-Write from the already-returned bytes is allowed because it makes no paid Task call;
otherwise mark that orb failed immediately, carry it as a declared gap, and continue. A Task error counts
as failure even if it left a file behind. For a **specialist**, on any such failure—or when either the
markdown validator or a required signal-sidecar check still fails—remove BOTH exact canonical artifacts supplied to that agent:
`<OUTPUT_PATH>` and, when present, `<SIGNAL_OUTPUT_PATH>`. Use only those already-resolved paths, with no
glob and no sibling or parent-directory removal. Invoke the same `--quarantine-exact` helper used before
dispatch; its successful exit is the absence proof. If it fails, fail closed: do not advance to another
layer, run `99`, or publish the module. This quarantine is mandatory because a truncated file under its
canonical name could otherwise
be read as evidence by a later agent or the synthesis even though the orb was recorded as failed. Reused
artifacts never enter this cleanup. The synthesis therefore sees a true missing input and applies the
declared-gap rule below. This is what keeps the cockpit's reviewed `willRun` count literal at the paid
boundary without letting a failed paid attempt contaminate the conclusion. A later user retry may resume
the still-missing orb under a newly reviewed plan. The ordinary one-recovery rules below apply only when
`NOSTRA_EXACT_MODULE_RESUME` is not `1`.

If the one exact `99` Task itself errors — even when it left a superficially valid file — or its markdown
fails the shared validator, do not call the specialist quarantine helper. Instead run exactly:

```
node scripts/agent-output-validity.mjs --quarantine-exact-synthesis "<99_OUTPUT_PATH>"
```

This separate helper accepts only the current synthesis stem in the child-only
`NOSTRA_EXACT_MODULE_SYNTHESIS_ORBS` receipt, under the exact bound run root and module. If cleanup fails,
fail closed. In either case, stop before sidecar extraction, commit, or publication and do not dispatch
another Task. A later click sees the synthesis as missing and can retry only the summary under a new
reviewed scope.

- Stray confirmation block (Mode C) → re-apply the strip rules to that agent's returned content and re-Write the file. (Mode A/B) → ask that agent to re-persist a clean file.
- Missing / empty / truncated → **re-dispatch that agent and tell it to SELF-PERSIST again (Mode A/B),
  writing its report incrementally in appended blocks.** Do NOT ask it to return the report inline.
  *(Why: inline recovery pulls the agent's whole report through the orchestrator's context. For the
  large forensic reports — measured at 39k–134k output tokens — that is not a survivable instruction,
  and it was the recovery path itself that parked modules mid-run. Inline (Mode C) recovery is
  permitted ONLY for an agent that has neither `Write` nor `Bash`, whose reports are small by
  construction.)*
- Missing, malformed, or owner-mismatched signal sidecar → ask the emitting agent to re-persist ONLY
  `<SIGNAL_OUTPUT_PATH>` from the evidence already in its report, following commodity `MODULE_RULES.md`
  §8. Do not invent rows in the orchestrator. One failed recovery marks the agent failed.

Track which agents in the layer succeeded and which failed. An agent **failed** if (a) its Task call returned an error, (b) it returned no usable report content (refusal, empty message), or (c) its `<OUTPUT_PATH>` still fails verification after a recovery attempt.

**A failed agent does not park the module — it becomes a declared gap.** After ONE recovery attempt,
stop retrying that agent, record it as failed, and CONTINUE to the next layer and on to the `99`
synthesis. The synthesis MUST name every failed agent, treat its checklist items as **Not proven from
available data**, and apply the data-sufficiency cap that absence earns (root doctrine §11, §22) — a
module that is honest about a missing orb is a result; a module that produces nothing at all is not.
*(Why this rule exists: with an unsurvivable recovery and a "do not advance" gate, a single unwritable
report stopped the entire module for ever. Measured: INDIAMART management-governance 2026-08-19, and
the same silhouette in ORCL business-model 2026-08-14 and TSLA earnings 2026-07-24 — every one of them
burned real budget, produced no synthesis, and required a human to notice.)*

This never overrides Step 4C: a `fail_fast` agent (the `00` triage) that returns an **Insufficient**
verdict still aborts the module, because that is a reasoned verdict on the evidence, not a lost file.

**4. Checkpoint the layer to git before dispatching the next one (best-effort).**

Once this layer's files have passed verification, commit them immediately:

```
bash scripts/commit-run.sh "Checkpoint: <TICKER> <MODULE> layer <N>" -- "<RUN_ROOT>/<MODULE>/"
```

This is **best-effort and must NEVER abort the module** — a failed or contended commit is logged and the
pipeline carries on; the caller's final commit sweeps up anything a checkpoint missed. Re-committing an
unchanged folder is a no-op, so a checkpoint that races the final commit is harmless.

*(Why: modules used to commit ONLY at the very end, after every layer passed. A module that stalled at
layer 2 therefore committed NOTHING — the orb files sat on the engine's disk, real work already paid
for, invisible to git and to anything reading committed state. Measured: INDIAMART
management-governance 2026-08-19 burned roughly $70 across four attempts and left a run folder holding
nothing but `agent_metrics`. Checkpointing per layer means a stall costs you the layer in flight, never
the whole run, and a resumed run skips everything already on disk.)*

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

**Deferred-memo mode (skip this sub-step).** You are in deferred-memo mode if ANY of these is true: (a) the orchestrator that invoked this pipeline told you to defer the module memo — the monolithic `/research:full` does, in its step 8B; (b) the marker file `<RUN_ROOT>/.defer_module_memos` exists (check with `test -f "<RUN_ROOT>/.defer_module_memos"`; the per-module-chain `/research:full` writes it); or (c) the one-launch environment flag is set (check with `test "${NOSTRA_DEFER_MODULE_MEMO:-}" = "1"`). For (a) and (b), the full run batches all module memos at the end, off the per-module critical path (the monolithic run in its Step 10A.0; the chain in its master step, `/research:rerun` Step 9A), so the memo is generated identically later. Case (c) belongs only to the cockpit's one-click unfinished-orb route: its reviewed paid scope is the module graph itself, so the optional shareable memo leaf is intentionally absent until a later ordinary module/full run regenerates it. If NONE holds — a standalone `/research:<module>` run or a normal `/research:rerun` — generate the memo inline as below, so the module stays self-sufficient. In every case, deferral suppresses ONLY the memo: always still do Step 4.9B (the deterministic dossier) regardless.

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

### Step 4.9C — Persist the synthesis's labelled sidecar exports (generic, any module)

Some modules' `99_*-synthesis.md` emit machine-readable exports as fenced code blocks, each **labelled with a target filename** (e.g. a `governance_summary.json`, a `people_register.csv`) — the synthesis names the file the block should be written to, alongside the block. These structured sidecars are a first-class module output, not a derived tier, and they must be written on EVERY run that produced a synthesis — a full `/research:full` run, a standalone `/research:<module>` run, or a `/research:rerun` — never only when a module's own standalone command happens to extract them. This step makes that extraction part of the shared pipeline so it is zero-touch for any current or future module (CLAUDE.md §26): whatever filenames a module's synthesis labels, the pipeline writes them; nothing here is hardcoded to a specific module or a specific filename.

Run this step whenever `<RUN_ROOT>/<MODULE>/99_*-synthesis.md` exists (resolve it via Glob; do not hardcode the name). It runs independently of deferred-memo mode — always do it. It is **best-effort**: a failure is recorded for the caller but never aborts the module.

Read the resolved `99_*-synthesis.md` and scan it for fenced code blocks that are each labelled with a target filename (the label may be the fence info-string, an immediately preceding line, or the enclosing bullet/heading that names the file — e.g. a `` ```json `` block introduced by a `governance_summary.json` label). For every such labelled block, write the block's verbatim contents to `<RUN_ROOT>/<MODULE>/<filename>` under that exact filename (the module folder already exists). Do NOT invent, reorder, or reformat the contents — persist exactly what the synthesis emitted. Skip (and record as a missing output) any block the synthesis marked "pending" or left un-labelled; a block whose label is not a plain filename is not persisted. Overwrite an existing same-named file from this run's synthesis. The Step 4.9B module dossier concatenates only `*.md` artifacts, so these `.json`/`.csv` sidecars are never swept into it, and the subsequent `git add` of the module folder (owned by the caller) picks up whatever sidecars were written.

If extraction fails for any block, record that filename as `failed`/missing and continue — never abort the module over a structured sidecar.

---

## Step 5 — Return status to the caller

After all layers complete (or after a fail-fast abort), the pipeline ends. The caller is expected to:

- Inspect the returned status and decide on commits / further dispatch / synthesis.
- Handle any per-module logging, summary reporting, or cross-module path propagation.

Beyond the best-effort per-layer checkpoint in Step 4B.4 — which exists so a stalled module never loses
work it already did — this document says nothing about git or downstream synthesis: the FINAL commit,
the module's place in a larger run, and all downstream synthesis remain the caller's responsibility.

---

## Hard rules (apply regardless of caller)

- Do not hardcode any agent name. Every agent invocation, output filename, and layer assignment is derived from the discovered files and their frontmatter.
- Adding a new file like `.claude/agents/<MODULE>/13_supply-chain.md` with `layer: 2` in its frontmatter must require zero changes to this pipeline — it should automatically be picked up, run in layer 2, and written to `<RUN_ROOT>/<MODULE>/13_supply-chain.md`.
- The pipeline writes files only inside `<RUN_ROOT>/<MODULE>/`. It does not touch other module folders or the run-root itself.

### Claim fidelity on the way up (CLAUDE.md §3) — binds every `99_*-synthesis` and every memo tier

Findings get shorter as they climb: sub-agent → module synthesis → module memo → master thesis → scorecard line. That compression is the point of the layering, and it is also where the engine's worst errors are made — not by inventing anything, but by dropping what made an upstream finding *true*. Four failure shapes recur, and each is checkable in one pass:

| Shape | What it looks like | What the restating layer must do |
|---|---|---|
| **Qualifier dropped** | `no *contractual* pass-through, though hedging and mix absorb ~38%` → `no pass-through` | Carry the qualifier, or quote the longer form. A hedged finding may not be compressed into an absolute |
| **Basis dropped** | `maximum daily balance ÷ year-end cash = 57%` → `57% of cash` | Carry the basis label every time the figure appears (§15 matched-basis) |
| **Build dropped** | `6.3bn factoring + 10.0bn bills + 8.7bn supplier-finance ≈ 25bn` → `~25bn of factoring and supplier finance` | Carry the itemised components wherever the total is quoted (§15 aggregates travel with their build) |
| **Verdict hardened** | `eroding on the gross-margin line, offset below it` → `moat erosion confirmed` | Keep the verdict word the upstream evidence supports; `confirmed` / `proven` / `no` / `none` require that strength of evidence |

Each `99_*-synthesis` runs one explicit pass over its own Specialist Roll-Up before publishing: for every claim it is carrying upward, check it against the four rows above and against the sub-agent's own words. A synthesis is an adjudication, not a compression — where the short form cannot carry the truth, publish the long form. The same check applies to the module memo (Step 4.9A) and to anything the master synthesizer lifts from a module.
