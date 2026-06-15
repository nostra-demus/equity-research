# Engine push identity — the GitHub App that publishes research data to `main`

**Goal (CLAUDE.md/AGENTS.md §28, two lanes, one repo):**

- **Data** — the engine's research output (`analyses/**`, `screener/**`, `analyses/tracking/**`) — must reach `main` **with zero friction, for every user**, exactly as it does today.
- **Code** — engine source, the prompt-program, scripts, CI, docs — must go through **PR → CI → review** for **everyone, including the repo owner**.

The `main` ruleset enforces "PR required" for all pushes. The engine keeps publishing data by being the ruleset's **sole bypass actor** — and that actor is a **GitHub App**, not a human account. A GitHub App:

- **costs no member seat**, and
- gates **every human** (you included) for code, because the bypass belongs to the App, not to "admins".

The App still cannot push *code*: `commit-run.sh` only ever `git add -- <data pathspecs>`. To make the engine push code you'd have to edit a caller of `commit-run.sh` — which is itself a reviewed code change.

---

## Current state vs target

| | Bypass actor on `main` ruleset | Engine pushes data? | Humans gated for code? |
|---|---|---|---|
| **Today** | Admin **role** (`RepositoryRole` 5) | ✅ (it pushes as `ceekay-munshot`, an admin) | ❌ any admin can push code direct to main |
| **Target** | the **App** only (`Integration`) | ✅ (pushes as the App) | ✅ everyone, incl. owner, must PR for code |

> Until the flip, **nothing is broken** — data flows because the engine pushes as an admin. The flip closes the "admins skip review for code" hole.

---

## Phase A — create the GitHub App (browser, ~5 min)

Org-owned so it survives any one person leaving.

1. Go to **https://github.com/organizations/nostra-demus/settings/apps** → **New GitHub App**.
2. **Name:** `nostra-engine` (or similar). **Homepage URL:** anything (e.g. `https://app.nostra-demus.com`).
3. **Webhook:** **uncheck "Active"** (the engine doesn't receive webhooks).
4. **Repository permissions:**
   - **Contents → Read and write**  ← the only one that matters.
   - (Metadata → Read-only is added automatically.)
   - Leave everything else "No access".
5. **Where can this app be installed?** → **Only on this account**.
6. **Create GitHub App.**
7. On the App's page, note the **App ID** (a number).
8. Scroll to **Private keys → Generate a private key**. A `.pem` downloads — keep it safe; you'll hand it to the setup script and can then delete the download.

## Phase B — install it on the repo (browser, ~1 min)

1. App page → **Install App** (left nav) → **Install** on **nostra-demus**.
2. **Only select repositories → `equity-research`** → **Install**.

That's all the browser work. The **installation id** is auto-discovered by the setup script, or you can read it later from the install URL (`.../installations/<INSTALLATION_ID>`).

## Phase C — wire the engine on the Mac (one command)

On the machine that runs the engine (the one with the launchd agents):

```bash
cd /Users/chiraagkapil/equity-research
scripts/ops/setup-gh-app.sh --app-id <APP_ID> --key ~/Downloads/nostra-engine.*.private-key.pem
```

It writes `~/.config/nostra-engine/` (env + key, mode 600, **outside the repo**), auto-discovers the installation id, then **self-tests**: it mints a token and confirms the App has `Contents: write` and can reach the repo over git. It prints the **App id to use as the ruleset bypass actor**. It does **not** touch the ruleset.

After this, `commit-run.sh` automatically pushes as the App (it routes git's credentials through `scripts/ops/gh-app-credential.sh` for that one process only — global/interactive git is untouched). You can delete the downloaded `.pem`.

## Phase D — flip the ruleset (two steps, zero downtime)

Do this **only after Phase C self-test passed.** Two steps so data never stops flowing:

**D1 — ADD the App as a bypass actor (keep Admin for now):**

```bash
# APP_ID = the App id from Phase A / the setup output
gh api -X PUT repos/nostra-demus/equity-research/rulesets/17683955 \
  --input - <<JSON
{ "bypass_actors": [
    { "actor_id": 5,        "actor_type": "RepositoryRole", "bypass_mode": "always" },
    { "actor_id": <APP_ID>, "actor_type": "Integration",    "bypass_mode": "always" }
] }
JSON
```

**D2 — prove the engine pushes as the App** while it's a bypass actor: let one real research/screener data commit land (or run any small engine action that calls `commit-run.sh`). Confirm it appears on `origin/main`. The commit's author/committer will show the App (e.g. `nostra-engine[bot]`).

**D3 — REMOVE the Admin bypass (App becomes sole bypass):**

```bash
gh api -X PUT repos/nostra-demus/equity-research/rulesets/17683955 \
  --input - <<JSON
{ "bypass_actors": [
    { "actor_id": <APP_ID>, "actor_type": "Integration", "bypass_mode": "always" }
] }
JSON
```

## Phase E — verify both lanes

```bash
# 1) DATA lane still open for the engine — engine data commits keep landing on main (watch git log).
# 2) CODE lane now closed for humans, incl. owner: a direct code push to main must be REJECTED.
git -C /tmp/scratch-clone checkout -b probe && echo x >> README.md && git commit -am probe
git push origin HEAD:main    # EXPECT: rejected — "Changes must be made through a pull request."
```

If (2) is rejected and (1) keeps flowing, the two-lane split is live.

---

## Break-glass / rollback

You are an **org owner**, so you can always recover:

- **Emergency direct push to main:** GitHub → repo **Settings → Rules → `main — code lane`** → set **Enforcement: Disabled** (or re-add your account/Admin to the bypass list), push, then re-enable.
- **Full rollback to today's behavior:** put the Admin bypass back (re-run D1's JSON but with only the `RepositoryRole` entry), and remove `~/.config/nostra-engine/` so `commit-run.sh` reverts to pushing as your account.
- **Rotate the key:** generate a new private key on the App page, re-run `setup-gh-app.sh` with it, delete the old key from the App page.

## How it works (for the next maintainer)

- `gh-app-token.sh` — mints a ~1h installation token (openssl RS256 JWT → installation-token API), cached in `~/.config/nostra-engine/.token-cache`. No long-lived secret in git.
- `gh-app-credential.sh` — a git credential helper that returns `x-access-token` + that token, **only** for `github.com`.
- `commit-run.sh` — when `~/.config/nostra-engine/github-app.env` exists, injects that helper via `GIT_CONFIG_*` **for its own process only** (never global config), so engine pushes = the App and human git = the human.
- Ruleset id `17683955` (`main — code lane`); bypass actor for a GitHub App is `actor_type: "Integration"`, `actor_id: <App ID>`.
