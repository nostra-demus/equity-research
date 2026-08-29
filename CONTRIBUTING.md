# Contributing

How we keep many people (and AI agents) shipping features into `main` without repeatable conflicts, and with production-level safety. This is the **workflow** manual. `CLAUDE.md` / `AGENTS.md` are the *research* doctrine and deliberately **not** a workflow manual — engineering conventions live here.

## The flow (same for everyone, human or agent)

1. Branch off `main`, make the change, open a PR.
2. CI runs automatically (typecheck + tests), and the standing bot reviewers (CodeQL, Gemini, Codex, Copilot) review it. The engine also runs its own multi-lens adversarial pass. Get it green, and triage every review finding — fix the real ones, record a reasoned won't-fix for the rest.
3. Stop with an open, green, reviewed PR and report: `PR ready; not merged or deployed`.
4. Only after the user explicitly authorizes that specific PR's merge in the current conversation may it enter the **merge queue**. That human-authorized merge is the release decision: after the exact resulting `main` push passes all five required jobs, the production watcher may deploy it automatically under its one-shot local receipt. Direct/manual production operations remain separately authorized.

PR CI and adversarial review prove that a PR is ready; they never authorize merge (CLAUDE.md/AGENTS.md §28). The user's explicit instruction for the specific PR is mandatory. After that authorized merge, a separate push workflow re-tests the exact merge result; only its five-job success may authorize automatic deployment. Retaining the multiple independent views makes the recommendation stronger, but never replaces either gate.

You never hand-rebase for the normal case, and you never need to know whether your change is "big" or "small" — every PR takes the identical path.

## The engine's PR agent prepares the whole PR, then stops

The engine's PR agent owns preparation and review of a code PR end to end. It is authorized to:

- **update an out-of-date branch itself** — rebase or merge the latest `main` in, no "Update branch" click needed;
- **resolve merge conflicts itself** — take the correct side, re-run the full local check suite (typecheck + tests + build + eval), and push;
- **run the multi-view adversarial review** — the bot reviewers above plus its own multi-agent lenses — and **triage every finding**: fix the real ones, reply with a reasoned won't-fix for the rest;
- **keep updating the same PR** until CI is green and the review is clean.

It is not authorized to merge, deploy, or issue a manual deployment receipt. The PR remains open until the user explicitly names that PR and asks for its merge in the current conversation. "Continue", "go ahead", "fix it", "done?", an implementation request, and an earlier request to open a PR are not merge authority. Once an authorized human merges that PR, the exact all-green `main` push may deploy automatically without an agent taking a production action. Manual deployment/bootstrap, restart, configuration changes, and run launch/retry/resume/cancel still require explicit authorization for that exact action. Without it, production access is read-only.

## Permanent production-engineering standard (Claude, Codex, humans)

This section is normative for every code change, regardless of which model, tool, or person performs the
work. A provider change is never permission to change product behavior, weaken safety, or use a different
definition of done.

### Protect authority and environment boundaries

- The default delivery target is an open pull request, not `main` and not production. A coding task includes
  local or staging implementation, tests, CI, reviewer triage, and updates to the same PR. It does not include
  merge or deployment.
- Merge is the human release boundary: it needs explicit authorization in the current conversation for the
  specific PR. The automatic watcher may cross the deployment boundary only after re-proving the exact merge
  result through all five required `main` push jobs. Manual/bootstrap deployment and every other production
  action remain separate exact authorizations. Never infer merge authority from urgency or generic continuation.
- Test in an isolated worktree and local or staging environments. Production may be inspected read-only for
  diagnosis. Do not deploy, restart services, change flags/configuration, or launch, retry, resume, cancel, or
  mutate a production run without exact authorization. Ongoing runs belong to their operators.

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
  finding merely to declare the PR ready.

### "Done" is scoped to the authority granted

A code task without explicit merge authority is complete when the open PR is green, reviewed, tested
on local or staging, and reported as `PR ready; not merged or deployed`. Merge and deployment are later,
protected stages; a human-authorized merge delegates only the exact all-green automatic release described
below, not any manual production action. If the user explicitly authorizes a production-affecting change, that later task
is complete only after all applicable evidence exists:

1. the user explicitly authorized the specific PR merge (and separately authorized any manual production action);
2. the protected PR/merge-queue path is green and every review thread is resolved;
3. the merged commit is proven to be an ancestor of the production checkout (exact `HEAD` is not required
   when legitimate data-only commits have advanced it);
4. the deployer reports its explicit healthy/DONE gate and no pending writer intent remains;
5. live read-only health and contract endpoints show the intended state, with no unauthorized run, retry,
   spend, or unrelated mutation; and
6. the user-facing recovery path is actionable. If any proof is missing, report "merged, deployment pending"
   or the exact blocker — never "all done."

### A merge deploys only after exact five-job push CI

The production watcher may fetch `origin/main` and may fast-forward autonomous research-data-only deltas.
It must not fast-forward, build, restart, reconcile services, or pause provider admissions for a code,
prompt, workflow, doctrine, or ops delta until `scripts/ops/deploy-authorization.py` independently verifies a
completed successful `push` workflow for `main` and all five exact jobs: `ui-server`, `eval-contracts`,
`tools-tests`, `ui-web`, and `edge`. It then issues a short-lived one-shot local receipt binding that workflow
run, its head SHA, and a deterministic digest of every non-data Git object. Later data-only commits may trail
that SHA without invalidating it; any later non-data byte requires its own exact push workflow. The deployer
rechecks the receipt after fetching and while holding the repository mutation lock, appends the outcome to an
owner-only hash-chained audit ledger, and consumes the receipt only after the healthy deployed marker reaches
the verified target. It never trusts a PR badge, an earlier workflow, or one aggregate status.

Autonomous data publication has the same boundary. `scripts/commit-run.sh` may publish a synthetic merge to
remote `main`, but it must never rebase, merge, reset, or check out newer remote code into the production
worktree. Pure data pushes are excluded from release CI and must not cancel a code workflow, publish update
intent, rebuild, restart, or pause admissions.

The manual receipt command is break-glass/bootstrap only and requires separate explicit production authority:

```sh
~/.nostra-ops/deploy-authorization.py authorize \
  --repo "$HOME/nostra-prod" \
  --state-dir "$HOME/.nostra-ops/deploy-authorizations" \
  --commit <FULL_MERGE_SHA> \
  --authorization-reference "PR #<NUMBER>: explicit production deployment approval" \
  --authorized-by "<OWNER_LOGIN>"
```

The first release that introduces exact push-CI deployment is a deliberate bootstrap, not an automatic rollout:
the already-installed watcher knows only the old manual-receipt rule. With separate explicit production
authorization, grant the GitHub App read-only Actions access, issue one manual receipt for the exact merge,
run and verify one deployment, and confirm the new watcher/helper and audit ledger are installed. Every later
human-authorized green merge follows the automatic exact-push-CI path.

### Make each material lesson durable

Close a material incident in the same reviewed change by updating the canonical contract and a regression
guard. Chat history, operator memory, screenshots, and a one-time verification are evidence, not permanent
memory. Permanent memory is the smallest authoritative repository rule plus an executable check that makes
future drift fail before release. Record external limits honestly: software cannot promise that a provider,
network, subscription, or machine will never fail; it must make those failures bounded, visible,
non-destructive, and recoverable through the same product path.

## Why this prevents the conflicts we kept hitting

- **Merge queue = the cure for "someone merged before me" after authorization.** Once the user explicitly authorizes a specific PR, the queue serializes it with other authorized changes, rebases it on current `main`, re-tests it, and merges only if still green. ([GitHub merge queue docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue))
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
   - Require a pull request before merging, at least one approving review, and **Require review from Code Owners**. `.github/CODEOWNERS` names the designated owner; a bot or another collaborator cannot satisfy this gate. CI and bot review are readiness evidence; they do not replace the user's explicit authorization (§28).
   - Enable dismissal of stale approvals and require approval of the most recent push, so an approval cannot survive changed bytes.
   - The coding agent must use a separate non-owner GitHub App/account for branch pushes and PR updates. Never give that identity admin or ruleset-bypass authority. An agent using the owner's own credential is technically indistinguishable from the owner and defeats owner-only approval.
   - **Require status checks to pass** → add **`ui/server — typecheck + tests`**.
   - **Require branches to be up to date before merging** (the merge queue satisfies this automatically).
   - **Require linear history** (optional, keeps `main` clean).
   - Neither the coding identity nor the repository-owner role may bypass the code ruleset. If cockpit research **data** publication needs a bypass identity for `commit-run.sh`, use the separate engine GitHub App and never reuse it as code-merge authority (§28).

   > **The engine identity (no extra paid seat).** A **GitHub App** with `Contents: write` is the required choice — a GitHub App does not consume a member seat, and it gates every human (including the owner) for code. Do **not** instead grant code-ruleset bypass to the human account the engine already pushes as: that leaves that one human ungated for code, which the no-bypass rule directly above forbids — the App path is what keeps the owner gated. The engine still cannot push *code* either way — `commit-run.sh` stages only data paths (§28).
   >
   > **Step-by-step runbook:** [`scripts/ops/GH_APP_ENGINE_IDENTITY.md`](scripts/ops/GH_APP_ENGINE_IDENTITY.md) — create + install the App, wire the Mac with `scripts/ops/setup-gh-app.sh`, and flip the ruleset bypass (Admin role → App) in two zero-downtime steps. Tooling: `gh-app-token.sh` mints a short-lived installation token; `gh-app-credential.sh` is the git credential helper `commit-run.sh` uses for engine pushes only.
3. **Settings → General → Pull Requests → Enable "Merge queue"** (or in the same ruleset: **Require merge queue**). Set the queue to use the `merge_group` CI (already wired in `ci.yml`).
4. **Settings → Code security and analysis** — enable for production-level safety:
   - **Dependabot alerts** + **Dependabot security updates**.
   - **CodeQL** (default setup) — static security analysis on every PR.
   - **Secret scanning** + **Push protection**.
5. Keep **`.github/CODEOWNERS`** mandatory and verify the ruleset requires Code Owner review. The file alone routes review; the ruleset is what makes it a merge gate.

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
