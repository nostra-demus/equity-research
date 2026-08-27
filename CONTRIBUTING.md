# Contributing

How we keep many people (and AI agents) shipping features into `main` without repeatable conflicts, and with production-level safety. This is the **workflow** manual. `CLAUDE.md` / `AGENTS.md` are the *research* doctrine and deliberately **not** a workflow manual — engineering conventions live here.

## The flow (same for everyone, human or agent)

1. Branch off `main`, make the change, open a PR.
2. CI runs automatically (typecheck + tests), and the standing bot reviewers (CodeQL, Gemini, Codex, Copilot) review it. The engine also runs its own multi-lens adversarial pass. Get it green, and triage every review finding — fix the real ones, record a reasoned won't-fix for the rest.
3. Merge once that bar is clear → the PR enters the **merge queue**.
4. The queue rebases your PR on the latest `main`, re-runs CI, and merges only if still green.

**No human approval is required** (CLAUDE.md/AGENTS.md §28). The quality gate is CI + the automated multi-reviewer adversarial pass, not a person clicking approve — and the engine's PR agent runs that gate and self-merges. Retaining the multiple independent views (each bot reviewer + the engine's own lenses) is exactly what makes a change bulletproof; keep them all.

You never hand-rebase for the normal case, and you never need to know whether your change is "big" or "small" — every PR takes the identical path.

## The engine's PR agent handles the whole PR (no human babysitting)

The engine's PR agent owns a code PR end to end and never needs a human to advance it (§28, "Autonomous merge authority"). It is standing-authorized to:

- **update an out-of-date branch itself** — rebase or merge the latest `main` in, no "Update branch" click needed;
- **resolve merge conflicts itself** — take the correct side, re-run the full local check suite (typecheck + tests + build + eval), and push;
- **run the multi-view adversarial review** — the bot reviewers above plus its own multi-agent lenses — and **triage every finding**: fix the real ones, reply with a reasoned won't-fix for the rest;
- **merge once CI is green and the review is clean.**

The `needs-human` label is advisory context, never a blocker. Don't ping a person to rebase, resolve, or approve — the agent does all of it.

## Permanent production-engineering standard (Claude, Codex, humans)

This section is normative for every code change, regardless of which model, tool, or person performs the
work. A provider change is never permission to change product behavior, weaken safety, or use a different
definition of done.

### Start from the product invariant and trace the whole path

- Write the user-visible outcome and the small set of genuinely allowed differences before choosing an
  implementation. Preserve the outcome across every provider, entry point, device, run kind, retry, resume,
  and terminal state.
- Trace the complete path before editing: browser state → API admission → supervisor/runtime → durable state
  and artifacts → Activity/history → deploy and recovery. Inspect and reuse the existing shared path. A fix
  at only the visible symptom is incomplete when the same defect can survive elsewhere in the path.
- Put variants behind adapters and shared state machines. Do not build parallel Claude/Codex screens,
  provider-only launch logic, ticker/module allowlists, or duplicated prompt/config truth. A newly discovered
  module, swarm, provider, or entry point must inherit the invariant without central rewiring.

### Close the failure class, not one incident

- Reproduce the failure with concrete evidence; identify the lowest shared cause; inspect sibling call sites
  for the same failure class; then add a regression that fails before the repair and passes after it.
- Ban tomorrow's shortcuts: no manual production edit as the final fix, silent fallback, silent model
  substitution, automatic paid retry, permission broadening, unrestricted sandbox, hidden feature flag,
  hard-coded subject/provider exception, fabricated success, or retry loop that merely hides the cause.
- Preserve truth under failure and concurrency. Freeze admitted identity, use one authoritative lifecycle,
  keep append-safe provenance, preserve completed artifacts, and make background work yield at a safe
  boundary to higher-priority reviewed deployment. Cancellation or yielding must await settlement so a
  second writer never overlaps abandoned work.
- Fail closed before authentication, spend, publication, or another irreversible boundary. After admission,
  fail visibly and recoverably: no hidden run, permanent spinner, ambiguous retry, false zero usage, or loss
  of completed work. Never launch a paid canary or second attempt without explicit authorization.

### Prove the state machine, including failure and recovery

- Test the invariant as a matrix, not one happy path: all providers, entry points, run kinds, malformed or
  stale preflight, offline/auth/quota failure, cancellation, resume, mixed-provider continuation, process
  restart, concurrent writer/deploy intent, and required terminal artifacts where applicable.
- Prefer deterministic tests and read-only production diagnostics before any paid canary. Every guard must
  fail loudly if its target disappears; a test that silently scans zero files proves nothing.
- Treat the deployed filesystem and service topology as part of the contract. Provider launch-boundary
  tests must reproduce sanctioned production indirections (including the configured external `data/`
  projection), reject every undeclared or swapped link, and prove the same fixture through every provider.
  A security hardening that passes only against a simplified checkout is not release-ready.
- Run the focused regression, typecheck/build, the complete affected suite, doctrine/instruction-budget
  gates, CI, security analysis, and automated adversarial review. Triage every finding. Never waive a real
  finding merely to merge.

### "Done" means deployed and independently verified

A local pass, commit, PR, merge, or process restart is not completion by itself. A production-affecting fix
is complete only after all applicable evidence exists:

1. the protected PR/merge-queue path is green and every review thread is resolved;
2. the merged commit is proven to be an ancestor of the production checkout (exact `HEAD` is not required
   when legitimate data-only commits have advanced it);
3. the deployer reports its explicit healthy/DONE gate and no pending writer intent remains;
4. live read-only health and contract endpoints show the intended state, with no unauthorized run, retry,
   spend, or unrelated mutation; and
5. the user-facing recovery path is actionable. If any proof is missing, report "merged, deployment pending"
   or the exact blocker — never "all done."

### Make each material lesson durable

Close a material incident in the same reviewed change by updating the canonical contract and a regression
guard. Chat history, operator memory, screenshots, and a one-time verification are evidence, not permanent
memory. Permanent memory is the smallest authoritative repository rule plus an executable check that makes
future drift fail before release. Record external limits honestly: software cannot promise that a provider,
network, subscription, or machine will never fail; it must make those failures bounded, visible,
non-destructive, and recoverable through the same product path.

## Why this prevents the conflicts we kept hitting

- **Merge queue = the cure for "someone merged before me."** When two PRs are both ready, the queue serializes them: it merges #1, then rebases #2 onto the now-updated `main`, re-tests it, and merges only if green. The "falling behind" is handled by the machine, not by you. ([GitHub merge queue docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue))
- **CI re-runs in the queue (on the rebased state).** A PR can't merge if it breaks against *current* `main`, even if it was green when opened. `main` stays green.
- **No shared append-only single-line lists.** Those are "merge magnets" — any two people editing them collide. We auto-discover instead. (The `ui/server` test list used to be one hand-maintained line; it's now `test/run-all.mjs`, which globs `test/*.test.ts`. Adding a test is a new file — zero edits to `package.json`, so it can never conflict.)
- **Zero-touch boundaries (CLAUDE.md/AGENTS.md §26).** Adding a module/sub-agent edits no shared engine file. Extend that everywhere: prefer auto-discovery and per-file fragments over central registries/manifests/index files.
- **Don't commit generated/derived files** (build snapshots, lockfile churn from unrelated installs). They conflict for no reason; regenerate them in CI or `.gitignore` them.

The one thing to reconcile with real judgment: two changes to the **same logic**. The queue + CI will *catch* it (the second PR fails against the updated `main`) — that's correct. The engine's PR agent then reconciles it deliberately (take the correct side, re-run the full check suite), never a silent blend. Keep it rare with good file boundaries.

## Adding a test

Drop a `something.test.ts` file in `ui/server/test/`. That's it — `npm test` (→ `node test/run-all.mjs`) discovers and runs it; CI picks it up automatically.

## One-time GitHub setup (repo admin)

These are the enforcement layer — they bind every contributor. Do them once in **Settings**:

1. **Let CI run once** (merge this PR or push it) so the check named **`ui/server — typecheck + tests`** exists to be selected below.
2. **Settings → Branches → Add branch ruleset (or protect `main`)**:
   - Require a pull request before merging → **Require approvals: 0**. The gate is CI + the automated multi-reviewer adversarial pass (§28), not a human sign-off; the engine's PR agent self-merges a green, reviewed PR. Leave this at 0 — do **not** require human approvals.
   - **Require status checks to pass** → add **`ui/server — typecheck + tests`**.
   - **Require branches to be up to date before merging** (the merge queue satisfies this automatically).
   - **Require linear history** (optional, keeps `main` clean).
   - **Bypass list → the engine's push identity ONLY** — do **not** choose "block all bypassing": the cockpit auto-publishes research **data** to `main` (`commit-run.sh`) and must keep its bypass, per §28. Every push that is not the engine then goes through a PR.

   > **The engine identity (no extra paid seat).** A **GitHub App** with `Contents: write` is the clean choice — a GitHub App does not consume a member seat, and it gates every human (including the owner) for code. Lighter alternative: bypass the account the engine already pushes as (zero setup, but that one human is then not gated for code). Either way the engine still cannot push *code* — `commit-run.sh` stages only data paths (§28).
   >
   > **Step-by-step runbook:** [`scripts/ops/GH_APP_ENGINE_IDENTITY.md`](scripts/ops/GH_APP_ENGINE_IDENTITY.md) — create + install the App, wire the Mac with `scripts/ops/setup-gh-app.sh`, and flip the ruleset bypass (Admin role → App) in two zero-downtime steps. Tooling: `gh-app-token.sh` mints a short-lived installation token; `gh-app-credential.sh` is the git credential helper `commit-run.sh` uses for engine pushes only.
3. **Settings → General → Pull Requests → Enable "Merge queue"** (or in the same ruleset: **Require merge queue**). Set the queue to use the `merge_group` CI (already wired in `ci.yml`).
4. **Settings → Code security and analysis** — enable for production-level safety:
   - **Dependabot alerts** + **Dependabot security updates**.
   - **CodeQL** (default setup) — static security analysis on every PR.
   - **Secret scanning** + **Push protection**.
5. (Optional) Add a **`CODEOWNERS`** file so reviews auto-route to the right people.

## Conventions checklist (humans and agents)

- Branch off latest `main`; open a PR; let CI + the queue do the rebasing.
- No hand-maintained shared lists — auto-discover (tests, modules, routes).
- Don't commit generated artifacts or unrelated lockfile churn.
- Keep a PR to one concern; don't bundle a research run or data into a code PR.
- If you must touch a core shared file, expect a real reconcile — coordinate, don't race two big rewrites of the same file.

## Not yet set up (good follow-ups)

- **Lint**: no ESLint config exists yet; CI does typecheck + tests. Add ESLint + a `lint` CI step when ready.
- **`ui/web` in CI**: the web build needs the data snapshot; add a web typecheck/build job once that's CI-friendly.
- **Make `npm audit` a required (blocking) check** once the tree is clean (it's informational today).
