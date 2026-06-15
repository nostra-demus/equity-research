# Contributing

How we keep many people (and AI agents) shipping features into `main` without repeatable conflicts, and with production-level safety. This is the **workflow** manual. `CLAUDE.md` / `AGENTS.md` are the *research* doctrine and deliberately **not** a workflow manual — engineering conventions live here.

## The flow (same for everyone, human or agent)

1. Branch off `main`, make the change, open a PR.
2. CI runs automatically (typecheck + tests). Get it green + one review.
3. Click **merge** → the PR enters the **merge queue**.
4. The queue rebases your PR on the latest `main`, re-runs CI, and merges only if still green.

You never hand-rebase for the normal case, and you never need to know whether your change is "big" or "small" — every PR takes the identical path.

## Why this prevents the conflicts we kept hitting

- **Merge queue = the cure for "someone merged before me."** When two PRs are both ready, the queue serializes them: it merges #1, then rebases #2 onto the now-updated `main`, re-tests it, and merges only if green. The "falling behind" is handled by the machine, not by you. ([GitHub merge queue docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue))
- **CI re-runs in the queue (on the rebased state).** A PR can't merge if it breaks against *current* `main`, even if it was green when opened. `main` stays green.
- **No shared append-only single-line lists.** Those are "merge magnets" — any two people editing them collide. We auto-discover instead. (The `ui/server` test list used to be one hand-maintained line; it's now `test/run-all.mjs`, which globs `test/*.test.ts`. Adding a test is a new file — zero edits to `package.json`, so it can never conflict.)
- **Zero-touch boundaries (CLAUDE.md/AGENTS.md §26).** Adding a module/sub-agent edits no shared engine file. Extend that everywhere: prefer auto-discovery and per-file fragments over central registries/manifests/index files.
- **Don't commit generated/derived files** (build snapshots, lockfile churn from unrelated installs). They conflict for no reason; regenerate them in CI or `.gitignore` them.

The one thing no tool can (or should) auto-resolve: two people changing the **same logic**. The queue + CI will *catch* it (the second PR fails and a human reconciles) — that's correct. Keep it rare with good file boundaries; never let a tool silently blend conflicting logic.

## Adding a test

Drop a `something.test.ts` file in `ui/server/test/`. That's it — `npm test` (→ `node test/run-all.mjs`) discovers and runs it; CI picks it up automatically.

## One-time GitHub setup (repo admin)

These are the enforcement layer — they bind every contributor. Do them once in **Settings**:

1. **Let CI run once** (merge this PR or push it) so the check named **`ui/server — typecheck + tests`** exists to be selected below.
2. **Settings → Branches → Add branch ruleset (or protect `main`)**:
   - Require a pull request before merging → **Require approvals: 1** (raise later).
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
