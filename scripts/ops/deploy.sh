#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Auto-deploy watcher for app.nostra-demus.com  (com.nostradamus.deploy, ~every 120s)
#
# Keeps the PRODUCTION checkout fast-forwarded to origin/main and rebuilds/restarts
# ONLY what changed:
#   • ui/web/**     -> rebuild ui/dist  (served instantly by the running engine; no restart)
#   • ui/server/**  -> restart the engine (it runs `tsx src/server.ts` straight from source)
#   • package-lock  -> npm ci in that package first
#   • data/docs only (analyses, screener, *.md) -> nothing to rebuild
#
# The rebuild decision tracks a DEPLOYED MARKER ($OPS/.deployed.sha) — the SHA the built ui/dist + running
# engine were last reconciled to — NOT "did this script perform the merge". This matters because the engine
# commits research data into this same checkout and, when origin has moved, rebases onto origin/main first
# (scripts/commit-run.sh), pulling freshly merged CODE into the tree without this watcher ever running its
# fast-forward path. Keying off the marker means "HEAD == origin/main" no longer hides a stale ui/dist: if
# the built artifacts are behind HEAD, we rebuild the delta regardless of how HEAD advanced.
#
# Safe by construction:
#   • ff-only      — never reset/discard; if HEAD is ahead (an unpushed data commit) it SKIPS
#   • skip-if-conflict — the ff path skips only when an incoming commit overlaps a dirty file, or any
#                     non-data (code/ops) file is dirty; it does NOT block on how recently engine DATA was
#                     written (that jammed it against the 24/7 screener). The marker SYNC path needs no
#                     clean tree — it only rebuilds already-present source into ui/dist
#   • marker-gated — rebuild iff the built artifacts are behind HEAD; advance the marker only on success
#   • single-flight — retained-descriptor kernel flock for the entire deploy; crashes release it
#   • always exit 0 — incidents live in the log, not the launchd exit code
# Canonical source: scripts/ops/deploy.sh (installed to ~/.nostra-ops by install-services.sh).
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

PROD="${ENGINE_REPO_ROOT:-$HOME/nostra-prod}"
UID_NUM="$(id -u)"
# resolve npm to an absolute path (launchd has a minimal PATH; brew is /opt/homebrew on Apple-Silicon, /usr/local on Intel)
NPM="$(command -v npm 2>/dev/null || true)"; [ -n "$NPM" ] || for c in /opt/homebrew/bin/npm /usr/local/bin/npm; do [ -x "$c" ] && NPM="$c" && break; done; NPM="${NPM:-/opt/homebrew/bin/npm}"
GIT="$(command -v git || echo /usr/bin/git)"
PYTHON="$(command -v python3 || echo /usr/bin/python3)"
OPS="$HOME/.nostra-ops"
LOG="$HOME/Library/Logs/nostradamus-deploy.log"
DEPLOY_LOCK="$OPS/.deploy.flock"
MARK="$OPS/.deployed.sha"   # the SHA the built ui/dist + running engine were last reconciled to
FAILMARK="$OPS/.deploy.failed"                       # "<sha> <epoch>" of the last build/boot that failed (backoff)
FAIL_BACKOFF="${DEPLOY_FAIL_BACKOFF_SECS:-1800}"     # don't re-attempt the SAME failing SHA more often than this
# After an engine restart, poll /api/health before trusting the new code. A commit that BUILDS but throws at
# boot/first request otherwise flaps forever under launchd KeepAlive (the build-failure breaker above never
# sees it). HEALTH_TRIES × HEALTH_INTERVAL ≈ 60s is the boot budget; miss it → auto-rollback to last-good.
HEALTH_TRIES="${DEPLOY_HEALTH_TRIES:-20}"
HEALTH_INTERVAL="${DEPLOY_HEALTH_INTERVAL:-3}"
# Debounce: each engine rebuild/restart is a ~15-30s "offline" blip in every open cockpit. When a burst of
# code PRs merges in quick succession (a normal build session), deploying each one separately means one blip
# per commit. Instead, hold the rebuild until the newest ui/ (code) commit has been quiet for DEBOUNCE_SECS,
# so a burst collapses into ONE rebuild+restart of the whole delta. Liveness cap: never hold a pending code
# change back longer than MAX_DEFER_SECS even if commits keep trickling in. Data-only deltas never debounce
# (they don't restart the engine).
DEBOUNCE_SECS="${DEPLOY_DEBOUNCE_SECS:-180}"
MAX_DEFER_SECS="${DEPLOY_MAX_DEFER_SECS:-1200}"
HEARTBEAT=3300   # log an "up-to-date" proof-of-life at most ~hourly
mkdir -p "$OPS" "$(dirname "$LOG")"

ts()  { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$LOG"; }
loaded() { launchctl print "gui/$UID_NUM/$1" >/dev/null 2>&1; }

# One-time + continuously idempotent connector LaunchAgent migration. PR1 changes the connector scheduler
# from six-hourly to a due-aware fifteen-minute floor and moves every declared CONNECTOR_* secret out of the
# installed plist into ~/.config/nostra-engine/providers.env. Merely changing the tracked template does not
# update an already-installed LaunchAgent: deploy.sh is the only reviewed path guaranteed to run after a
# merge. Reconcile just this plist atomically, validate it before replacement, then re-bootstrap only this
# label so the new interval/environment are active. Never print a secret value (only key names are parsed).
migrate_connector_launchagent_v2() {
  local agents="$HOME/Library/LaunchAgents"
  local installed="$agents/com.nostradamus.connectors.plist"
  local source="$PROD/scripts/ops/com.nostradamus.connectors.plist"
  local marker="$OPS/.connector-launchagent-v2"
  local providers_dir="${NOSTRA_ENGINE_CONFIG_DIR:-$HOME/.config/nostra-engine}"
  local providers_env="$providers_dir/providers.env"
  local secret_helper="$PROD/scripts/ops/migrate-connector-secrets.py"
  local load_contract="$PROD/scripts/ops/service-load-contract.sh"
  local staged claim desired_interval source_isolated changed=0 orphan_count=0
  if [ ! -e "$installed" ] && [ ! -L "$installed" ]; then
    orphan_count="$(find "$agents" -maxdepth 1 -type d \
      -name '.com.nostradamus.connectors.plist.credential-claim-*' 2>/dev/null | wc -l | tr -d ' ')"
    [ "$orphan_count" = 0 ] && return 0                 # admin/non-doer host: nothing to migrate
  fi
  case "$providers_dir" in
    /*) ;;
    *) log "WARN connector-agent migration requires an absolute NOSTRA_ENGINE_CONFIG_DIR"; return 1 ;;
  esac
  if { [ -e "$installed" ] || [ -L "$installed" ]; } \
    && { [ -L "$installed" ] || [ ! -f "$installed" ] || [ ! -O "$installed" ]; }; then
    log "WARN connector-agent migration refused a symlink, non-file, or foreign-owned installed plist"
    return 1
  fi
  [ -f "$source" ] || { log "WARN connector-agent migration source template is missing"; return 1; }
  [ -f "$PROD/scripts/ops/migrate-connector-launchagent.py" ] \
    || { log "WARN connector-agent LaunchAgent migration helper is missing"; return 1; }
  [ -f "$secret_helper" ] && [ -f "$load_contract" ] \
    || { log "WARN connector-agent credential transaction helpers are missing"; return 1; }
  # shellcheck disable=SC1090
  source "$load_contract"
  PYTHON_BIN="$PYTHON"
  desired_interval="$(/usr/libexec/PlistBuddy -c 'Print :StartInterval' "$source" 2>/dev/null || true)"
  [ "$desired_interval" = 900 ] || {
    log "WARN connector-agent migration refused unexpected source StartInterval '$desired_interval'"
    return 1
  }
  source_isolated="$(/usr/libexec/PlistBuddy -c 'Print :ProgramArguments:2' "$source" 2>/dev/null || true)"
  [ "$source_isolated" = -I ] || {
    log "WARN connector-agent migration refused a source template without isolated Python"
    return 1
  }
  # Strict runtime loading requires the config directory and optional provider file to be real, current-user
  # owned, and private even when this old plist contains no credential to migrate.
  if [ -e "$providers_dir" ] || [ -L "$providers_dir" ]; then
    if [ -L "$providers_dir" ] || [ ! -d "$providers_dir" ] || [ ! -O "$providers_dir" ]; then
      log "WARN connector-agent migration refused unsafe connector config directory"
      return 1
    fi
  else
    ( umask 077; mkdir -p "$providers_dir" ) 2>/dev/null || return 1
  fi
  chmod 700 "$providers_dir" 2>/dev/null || return 1
  if [ -e "$providers_env" ] || [ -L "$providers_env" ]; then
    if [ -L "$providers_env" ] || [ ! -f "$providers_env" ] || [ ! -O "$providers_env" ]; then
      log "WARN connector-agent migration refused unsafe providers.env"
      return 1
    fi
    chmod 600 "$providers_env" 2>/dev/null || return 1
  fi
  # The helper atomically moves the exact installed inode into a private 0700 directory beside the public
  # pathname. From here until commit/restore, no caller may overwrite or remove `$installed` directly.
  if ! claim="$(nostra_claim_connector_plist "$secret_helper" "$installed" "$providers_env")" \
    || [ -z "$claim" ] || [ ! -f "$claim" ]; then
    log "WARN connector-agent migration could not claim/preserve the exact installed plist"
    return 1
  fi
  if [ "$(basename "$claim")" = prior-absent ]; then
    if ! nostra_commit_connector_claim "$secret_helper" "$claim" "$installed" "$providers_env" absent; then
      log "WARN connector-agent could not reconcile its orphan prior-absence transaction: $claim"
      return 1
    fi
    log "connector-agent reconciled an orphan prior-absence transaction"
    return 0
  fi
  staged="$(mktemp "$agents/.com.nostradamus.connectors.plist.XXXXXX")" || {
    if ! nostra_restore_connector_claim "$secret_helper" "$claim" "$installed" "$providers_env" >/dev/null 2>&1; then
      log "WARN connector staging failed and exact prior plist remains retained at $claim"
    fi
    return 1
  }
  if ! cp "$claim" "$staged"; then
    rm -f "$staged"
    if ! nostra_restore_connector_claim "$secret_helper" "$claim" "$installed" "$providers_env" >/dev/null 2>&1; then
      log "WARN connector copy failed and exact prior plist remains retained at $claim"
    fi
    return 1
  fi
  chmod 600 "$staged" 2>/dev/null || true
  # Apply the executable contract through the cross-platform tested helper. It
  # accepts only the exact historical/new command shapes, adds `-I`, strips
  # already-preserved connector keys, and sets the interval/source atomically.
  if ! "$PYTHON" "$PROD/scripts/ops/migrate-connector-launchagent.py" \
    --plist "$staged" --repo-root "$PROD" --config-dir "$providers_dir" \
    --interval "$desired_interval" >/dev/null
  then
    rm -f "$staged"
    if ! nostra_restore_connector_claim "$secret_helper" "$claim" "$installed" "$providers_env" >/dev/null 2>&1; then
      log "WARN rejected connector transform left exact prior plist retained at $claim"
    fi
    log "WARN connector-agent migration refused an unknown installed executable contract"
    return 1
  fi
  cmp -s "$claim" "$staged" || changed=1
  if ! plutil -lint "$staged" >/dev/null 2>&1; then
    rm -f "$staged"
    if ! nostra_restore_connector_claim "$secret_helper" "$claim" "$installed" "$providers_env" >/dev/null 2>&1; then
      log "WARN invalid connector staging left exact prior plist retained at $claim"
    fi
    log "WARN connector-agent migration produced an invalid staged plist"
    return 1
  fi

  # A clean on-disk file may still be loaded with the old interval/environment. The marker is written only
  # after a successful re-bootstrap, so the first v2 deploy always reloads once; later runs are no-ops.
  if [ "$changed" = 0 ] \
     && [ "$(cat "$marker" 2>/dev/null || true)" = 'interval=900;credentials=providers_env;isolated=1' ] \
     && launchctl print "gui/$UID_NUM/com.nostradamus.connectors" >/dev/null 2>&1; then
    rm -f "$staged"
    if ! nostra_restore_connector_claim "$secret_helper" "$claim" "$installed" "$providers_env"; then
      log "WARN unchanged connector claim could not be restored; exact plist retained at $claim"
      return 1
    fi
    return 0
  fi
  if ! nostra_activate_connector_plist com.nostradamus.connectors "$staged" "$installed" \
      "$PROD" "$providers_dir" "$agents" "gui/$UID_NUM" \
      "$claim" "$secret_helper" "$providers_env"; then
    log "WARN connector-agent v2 activation failed; exact pre-migration plist was restored or retained in its private claim"
    return 1
  fi
  printf '%s\n' 'interval=900;credentials=providers_env;isolated=1' > "$marker.tmp" 2>/dev/null \
    && mv "$marker.tmp" "$marker" 2>/dev/null || true
  log "connector-agent migration active: 15m due-aware scheduler; isolated Python; LaunchAgent CONNECTOR_* keys removed"
  return 0
}

# keep the log bounded
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG" 2>/dev/null || echo 0)" -gt 4000 ]; then
  tail -n 800 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi

# ---- data-pool symlink guard (defense-in-depth) ----
# The research pool `data/` is a symlink into Google Drive (gitignored — scripts/ops/MIGRATION.md). A stray
# TRACKED file under data/ once let a checkout/reset materialise data/ as a real dir, REPLACING the symlink
# with an empty folder — the cockpit then read it as "0 companies" while Drive was perfectly healthy. The
# root cause (a tracked data/_market/README.md) is now removed (relocated to frameworks/MARKET_FEED.md); this
# re-asserts the invariant each cycle so a manual slip or a future stray tracked path SELF-HEALS. It is
# deliberately timid: it only acts when data/ is NOT a symlink, only self-heals the known clobber shape
# (empty, or just the legacy _market scaffold), NEVER deletes (backs up), and NEVER wedges the deploy.
POOL="${NOSTRA_POOL:-$HOME/Library/CloudStorage/GoogleDrive-ceekay@muns.io/My Drive/equity-research-data}"
ensure_data_symlink() {
  local d="$PROD/data" extra bak
  [ -L "$d" ] && return 0                              # already a symlink — nothing to do
  [ -e "$POOL" ] || { log "WARN data-guard: pool '$POOL' absent (Drive signed out?) — leaving data/ as-is"; return 0; }
  if [ -d "$d" ]; then
    extra="$(ls -A "$d" 2>/dev/null | grep -vxE '_market|\.DS_Store' | head -n 1)"
    [ -n "$extra" ] && { log "WARN data-guard: $d is a non-symlink dir with unexpected content ('$extra') — NOT touching (manual review)"; return 0; }
    # Back the clobbered dir up OUTSIDE the worktree (a sibling of $PROD, same filesystem → atomic rename).
    # If we parked it inside $PROD (e.g. $PROD/data.plain-bak-*) the untracked backup would be seen by
    # has_nondata_dirty (git status --porcelain sees untracked files, and it is not a §28 data path), which
    # would then SKIP every subsequent deploy forever — the guard would fix the symlink but wedge releases.
    bak="${PROD%/}-dataclobber-bak-$(date +%Y%m%d-%H%M%S)"
    mv "$d" "$bak" 2>/dev/null || { log "WARN data-guard: could not move stray $d aside — leaving as-is"; return 0; }
    log "data-guard: moved clobbered empty data dir aside to $bak (outside the worktree so the dirty-gate never wedges)"
  fi
  ln -s "$POOL" "$d" 2>/dev/null && log "data-guard: restored data -> Drive pool symlink" || log "WARN data-guard: failed to create data symlink"
}

# ---- whole-deploy single-flight ----
# fd 8 survives the short Python helper because flock belongs to the shared open-file description.
# The kernel releases it on every shell exit/crash, so a long npm/build/health cycle can never be
# "reclaimed" by age and overlapped by another deploy. A launchd tick that finds it held simply skips.
exec 8>>"$DEPLOY_LOCK" || { log "WARN cannot open deploy single-flight lock"; exit 0; }
if ! "$PYTHON" - 8<&8 <<'PYDEPLOYLOCK'
import fcntl

try:
    fcntl.flock(8, fcntl.LOCK_EX | fcntl.LOCK_NB)
except BlockingIOError:
    raise SystemExit(3)
PYDEPLOYLOCK
then
  exec 8>&-
  exit 0
fi

# ---- shared repository-mutation flock (engine commits + tracked-ledger appends) ----
# commit-run.sh and append-ndjson.sh use the same persistent file in this worktree's Git directory.
# Python applies flock on fd 9, then exits; this shell retains the locked open-file description until
# gitlock_release closes it. There is no PID probing, stale deletion, ownerless crash window, or TMPDIR
# split-brain. Bounded wait: if the engine holds it we skip this cycle and retry in ~120s.
GITLOCK=""
gitlock_acquire() {
  local top
  [ -n "$GITLOCK" ] && return 0
  top="$("$GIT" -C "$PROD" rev-parse --show-toplevel 2>/dev/null)" || return 1
  GITLOCK="$("$GIT" -C "$top" rev-parse --git-path nostra-engine-mutation.flock 2>/dev/null)"
  case "$GITLOCK" in /*) ;; ?*) GITLOCK="$top/$GITLOCK" ;; *) GITLOCK=""; return 1 ;; esac
  exec 9>>"$GITLOCK" || { GITLOCK=""; return 1; }
  if "$PYTHON" - 15000 9<&9 <<'PYLOCK'
import fcntl
import sys
import time

deadline = time.monotonic() + int(sys.argv[1]) / 1000
while True:
    try:
        fcntl.flock(9, fcntl.LOCK_EX | fcntl.LOCK_NB)
        break
    except BlockingIOError:
        if time.monotonic() >= deadline:
            raise SystemExit(3)
        time.sleep(0.05)
PYLOCK
  then
    return 0
  fi
  exec 9>&-
  GITLOCK=""
  return 1
}
gitlock_release() { [ -n "$GITLOCK" ] && exec 9>&-; GITLOCK=""; }

# A §28 DATA path — the only paths the engine ever writes into this checkout (analyses/**, screener/**,
# analyses/tracking/**). Anything else dirty is an unexpected/unreviewed edit and must block a release.
is_data_path() { case "$1" in analyses/tracking/*|analyses/*|screener/*) return 0 ;; *) return 1 ;; esac; }

# has_nondata_dirty — rc 0 if the working tree holds ANY dirty path (modified, staged, OR untracked) that is
# not a §28 data path. Built on `git status --porcelain` rather than `git diff`, because `git diff` is blind
# to UNTRACKED files — and a build compiles the working tree, so an untracked `ui/web/x.ts` would otherwise
# be baked into the live bundle with no PR/CI/review. Gitignored paths (ui/dist, node_modules) don't appear.
has_nondata_dirty() {
  local line path
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    path="${line:3}"          # strip the "XY " porcelain status prefix
    path="${path##* -> }"     # a rename prints "old -> new"; keep the destination
    is_data_path "$path" || return 0
  done < <("$GIT" status --porcelain 2>/dev/null)
  return 1
}

# code_settling <base> <target> — rc 0 (DEFER the rebuild) when the base..target delta contains a ui/web or
# ui/server change (the only paths that trigger a dist rebuild or engine restart — the offline blip) AND the
# most recent such commit landed < DEBOUNCE_SECS ago. This coalesces a rapid burst of code merges into ONE
# rebuild instead of one restart per commit. Keyed on git commit timestamps of the CODE paths only, so the
# 24/7 engine data commits (analyses/**, screener/**) that also advance origin/main never reset the timer.
# Liveness: once the OLDEST un-deployed code commit is >= MAX_DEFER_SECS old, stop deferring and build.
# rc 1 (PROCEED) when the delta has no code, or the code has settled, or the liveness cap has tripped.
code_settling() {
  local base="$1" target="$2" newest oldest now
  newest="$("$GIT" log -1 --format=%ct "$base".."$target" -- ui/web ui/server 2>/dev/null)"
  [ -z "$newest" ] && return 1                                   # data/docs-only delta — nothing to debounce
  now="$(date +%s)"
  oldest="$("$GIT" log --format=%ct "$base".."$target" -- ui/web ui/server 2>/dev/null | tail -1)"
  [ -n "$oldest" ] && [ "$(( now - oldest ))" -ge "$MAX_DEFER_SECS" ] && return 1   # liveness cap reached — build now
  [ "$(( now - newest ))" -lt "$DEBOUNCE_SECS" ] && return 0     # newest code commit still within the quiet window
  return 1
}

# health_gate — after an engine (re)start, wait until it answers /api/health with ok:true. rc 0 the moment
# it's healthy; rc 1 if it never comes up within the budget. A boot-broken commit refuses :8787 continuously
# (launchd re-exits it every ThrottleInterval), so this returns 1 within ~HEALTH_TRIES×HEALTH_INTERVAL s. Uses
# the same curl probe watchdog.sh does (curl is on the launchd PATH; the engine binds 127.0.0.1:8787, no Access).
health_gate() {
  local i
  for i in $(seq 1 "$HEALTH_TRIES"); do
    curl -fsS --max-time 3 "http://127.0.0.1:8787/api/health" 2>/dev/null | grep -q '"ok":true' && return 0
    sleep "$HEALTH_INTERVAL"
  done
  return 1
}

# rollback_to_mark <bad-sha> — the engine failed to come healthy on <bad-sha>. Roll the prod worktree back to
# the last-good marker ($MARK) and restart, so the SITE stays up on known-good code while a human fixes main.
# Safe by construction — refuses unless the rewind loses NOTHING: $MARK must be an ancestor of HEAD (a true
# rewind, not a sideways jump) AND HEAD must be an ancestor of origin/main (every commit being undone is
# already published on the remote, so no unpushed engine DATA commit is lost — it stays on origin/main and the
# worktree simply sits on last-good until a FIX supersedes the bad SHA). This is the ONLY `git reset --hard` in
# the deploy path: a deliberate rollback-to-last-good, never the ff path's forbidden discard. Residual: a few
# minutes of UNCOMMITTED dirty screener data may be reset here — acceptable to keep the public site up, and
# regenerable from the ledgers; committed data is safe on origin. Runs AFTER the caller released the git lock,
# so it re-takes it around the reset.
rollback_to_mark() {
  local bad="$1" good head
  good="$(cat "$MARK" 2>/dev/null || true)"
  if [ -z "$good" ] || [ "$good" = "$bad" ]; then
    log "  ROLLBACK IMPOSSIBLE — no distinct last-good marker; the site stays on the flapping engine. FIX ${bad:0:9} on main."
    return 1
  fi
  # reconcile_build is called only while this deploy owns the repository lease. Keeping that same lease
  # through reset, rebuild, restart, and health verification prevents a commit/rebase from changing the
  # rollback source under npm. Never self-reacquire fd9 here.
  if [ -z "$GITLOCK" ]; then
    log "  ROLLBACK refused — caller does not hold the repository mutation lock"
    return 1
  fi
  head="$("$GIT" rev-parse HEAD 2>/dev/null)"
  if ! "$GIT" merge-base --is-ancestor "$good" "$head" 2>/dev/null \
     || ! "$GIT" merge-base --is-ancestor "$head" origin/main 2>/dev/null; then
    log "  ROLLBACK REFUSED — unsafe (last-good ${good:0:9} not strictly behind HEAD ${head:0:9}, or HEAD has unpushed commits)"
    return 1
  fi
  log "  ROLLBACK git reset --hard ${good:0:9} — undoing boot-broken ${bad:0:9}"
  "$GIT" reset --hard "$good" >>"$LOG" 2>&1
  # rebuild the rolled-back tree and restart so the engine is immediately back on last-good code
  ( cd "$PROD/ui/web" && "$NPM" run build ) >>"$LOG" 2>&1 || log "  WARN rebuild after rollback failed"
  launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" 2>>"$LOG" || log "  WARN engine kickstart after rollback failed"
  if health_gate; then log "  ROLLBACK ok — engine healthy on last-good ${good:0:9}"
  else log "  ALERT engine STILL unhealthy after rollback to ${good:0:9} — manual intervention needed"; fi
  return 0
}

# reconcile_build <changed-file-list> <target-sha> — rebuild ui/dist and/or restart the engine for the
# changed files, self-update the installed ops scripts, then record <target-sha> as the deployed marker.
# <target-sha> is the commit whose source the caller actually built (captured under the git lock), so the
# marker can never record a SHA newer than what was compiled. Shared by BOTH the fast-forward merge path AND
# the "checkout advanced without a deploy merge" sync path, so the built artifacts get rebuilt whenever they
# fall behind HEAD — no matter how HEAD advanced.
reconcile_build() {
  local changed="$1" target="$2" web=0 server=0 weblock=0 serverlock=0 ci_ok=1 failed=0 f fsha fts
  # Circuit breaker: if this EXACT target already failed to build recently, don't hammer it every ~120s.
  # (Without this, a structurally-broken commit on main would hot-loop npm build + engine restarts forever.)
  if [ -f "$FAILMARK" ]; then
    read -r fsha fts < "$FAILMARK" 2>/dev/null || true
    if [ "${fsha:-}" = "$target" ] && [ "$(( $(date +%s) - ${fts:-0} ))" -lt "$FAIL_BACKOFF" ]; then
      log "  SKIP rebuild of ${target:0:9} — a prior build failed <${FAIL_BACKOFF}s ago; backing off"
      return 0
    fi
  fi
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    case "$f" in
      ui/web/package-lock.json|ui/web/package.json)        weblock=1; web=1 ;;
      ui/server/package-lock.json|ui/server/package.json)  serverlock=1; server=1 ;;
      ui/web/*)     web=1 ;;
      ui/server/*)  server=1 ;;
    esac
  done <<< "$changed"

  if [ "$web" = 1 ]; then
    # A failed ui/web `npm ci` must block the build+marker (mirror the server side): building against half-
    # installed deps could emit a broken bundle and then record it as "deployed".
    if [ "$weblock" = 1 ]; then log "  npm ci ui/web (deps changed)"; ( cd "$PROD/ui/web" && "$NPM" ci ) >>"$LOG" 2>&1 || { failed=1; log "  WARN ui/web npm ci failed — skipping build"; }; fi
    if [ "$failed" = 0 ]; then
      log "  rebuild ui/dist"
      if ( cd "$PROD/ui/web" && "$NPM" run build ) >>"$LOG" 2>&1; then log "  ui/dist rebuilt — live"; else log "  WARN ui/web build failed"; failed=1; fi
    fi
  fi

  if [ "$server" = 1 ] && [ "$failed" = 0 ]; then
    ci_ok=1
    if [ "$serverlock" = 1 ]; then
      log "  npm ci ui/server (deps changed)"
      # If deps fail to install, DON'T restart: a kickstart would bring the engine up against broken/half-
      # installed node_modules and take the site DOWN. Leaving the running process untouched keeps prod UP
      # on its current (in-memory) version until the lockfile is fixed — strictly safer than restarting blind.
      ( cd "$PROD/ui/server" && "$NPM" ci ) >>"$LOG" 2>&1 || { ci_ok=0; failed=1; log "  WARN ui/server npm ci failed — NOT restarting; engine stays up on its current deps. Fix it, then: launchctl kickstart -k gui/$UID_NUM/com.nostradamus.engine"; }
    fi
    if [ "$ci_ok" = 1 ]; then
      log "  restart engine (server code changed)"
      if launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" 2>>"$LOG"; then
        # Trust the new code only once it answers /api/health. A commit that builds but boot-fails would
        # otherwise flap forever — instead, auto-rollback to last-good and stamp $FAILMARK (via failed=1) so
        # the top-level guard won't re-deploy this SHA until a fix supersedes it.
        if health_gate; then
          log "  engine healthy after restart"
        else
          log "  ALERT engine failed /api/health within $(( HEALTH_TRIES * HEALTH_INTERVAL ))s of restarting onto ${target:0:9} — rolling back"
          rollback_to_mark "$target"
          failed=1
        fi
      else
        log "  WARN engine kickstart failed"; failed=1
      fi
    fi
  fi

  # self-update the installed ops shell scripts when they change on main (atomic temp+mv; safe mid-run).
  # These scripts read their paths from env (ENGINE_REPO_ROOT/REPO) at runtime, so a straight copy is
  # portable across machines / usernames — no per-host path rewriting is needed.
  for opsscript in watchdog.sh deploy.sh housekeeping.sh; do
    case "$changed" in
      *scripts/ops/$opsscript*)
        cp "$PROD/scripts/ops/$opsscript" "$OPS/$opsscript.tmp" 2>/dev/null \
          && chmod +x "$OPS/$opsscript.tmp" && mv "$OPS/$opsscript.tmp" "$OPS/$opsscript" && log "  refreshed ops/$opsscript (self-update)" ;;
    esac
  done

  [ "$web" = 0 ] && [ "$server" = 0 ] && log "  (data/docs only — no rebuild)"

  # Advance the marker only when every attempted build/restart succeeded (record exactly the SHA we built,
  # written atomically so a crash mid-write can't truncate it). On failure, stamp $FAILMARK so the circuit
  # breaker above can back the same SHA off instead of hot-looping.
  if [ "$failed" = 0 ]; then
    printf '%s\n' "$target" > "$MARK.tmp" 2>/dev/null && mv "$MARK.tmp" "$MARK" 2>/dev/null || log "  WARN could not persist deployed marker"
    rm -f "$FAILMARK" 2>/dev/null || true
  else
    printf '%s %s\n' "$target" "$(date +%s)" > "$FAILMARK.tmp" 2>/dev/null && mv "$FAILMARK.tmp" "$FAILMARK" 2>/dev/null || true
  fi
}
trap 'gitlock_release; exec 8>&-' EXIT

cd "$PROD" 2>/dev/null || { log "FATAL cannot cd $PROD"; exit 0; }

ensure_data_symlink   # re-assert data/ -> Drive pool symlink before any git op / build (defense-in-depth)

# One repository lease spans fetch/ref resolution, any fast-forward, the complete source read/build,
# restart/health decision, and marker publication. This makes <target> an immutable build input: an engine
# data commit that loses a push race cannot rebase newer ui/** into the checkout while npm is reading it.
if ! gitlock_acquire; then
  log "SKIP engine repository mutation in progress (shared lock held) — retry next cycle"
  exit 0
fi

# ---- fetch (serialized with every other repository mutation) ----
# route fetch stderr to a side file so git's gc/maintenance warnings never pollute the deploy log;
# only surface it when the fetch actually fails.
"$GIT" fetch --quiet origin main 2>"$OPS/.fetch.err" || { log "WARN git fetch failed: $(tail -1 "$OPS/.fetch.err" 2>/dev/null)"; exit 0; }

LOCAL="$("$GIT" rev-parse HEAD 2>/dev/null)"
REMOTE="$("$GIT" rev-parse origin/main 2>/dev/null)"
[ -n "$LOCAL" ] && [ -n "$REMOTE" ] || { log "WARN cannot resolve revs"; exit 0; }
CURRENT_BRANCH="$("$GIT" symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
[ "$CURRENT_BRANCH" = main ] || {
  log "SKIP production checkout is not on main (found '${CURRENT_BRANCH:-detached}')"
  exit 0
}
MARKER="$(cat "$MARK" 2>/dev/null || true)"   # SHA the built ui/dist + running engine were last reconciled to

# Don't re-deploy a SHA we just rolled back FROM. After an auto-rollback, HEAD sits on last-good while
# origin/main still points at the boot-broken commit — the ff path below would otherwise fast-forward the
# worktree right back onto it and re-trigger the crash-loop. If origin/main IS the recently-failed target
# (within the backoff window), hold on last-good; a real FIX is a NEW sha, so it misses this guard and deploys.
if [ -f "$FAILMARK" ]; then
  read -r _fsha _fts < "$FAILMARK" 2>/dev/null || true
  if [ "${_fsha:-}" = "$REMOTE" ] && [ "$(( $(date +%s) - ${_fts:-0} ))" -lt "$FAIL_BACKOFF" ]; then
    log "SKIP origin/main ${REMOTE:0:9} matches a recently-failed deploy (rolled back) — staying on last-good until a fix supersedes it"
    exit 0
  fi
fi

if [ "$LOCAL" = "$REMOTE" ]; then
  # Only execute tracked migration helpers after the shared repository lease,
  # main/origin identity check, and the §28 clean-code gate. This guarantees
  # the helper bytes cannot change between review, execution, and service
  # activation, even on an otherwise up-to-date deploy tick.
  if has_nondata_dirty; then
    log "SKIP connector-agent reconciliation because a dirty non-data (code/ops) file is present (§28)"
    exit 0
  fi
  if ! migrate_connector_launchagent_v2; then
    log "WARN connector-agent reconciliation failed — leaving the deployed marker unchanged for retry"
    exit 0
  fi
  # The checkout is level with origin/main — but that does NOT mean the BUILT artifacts are current.
  # The engine commits research data into THIS worktree and, when origin has moved, rebases onto
  # origin/main before pushing (scripts/commit-run.sh) — which pulls freshly MERGED CODE into the checkout
  # without deploy.sh ever running its fast-forward path. So a code PR can land in the working tree while
  # the old ui/dist is still being served. Reconcile against the deployed marker, not against origin.
  if [ "$MARKER" = "$LOCAL" ]; then
    # built artifacts already match HEAD — heartbeat at most ~hourly so the log proves the watcher is alive
    hb_age=999999
    [ -f "$LOG" ] && hb_age=$(( $(date +%s) - $(stat -f %m "$LOG" 2>/dev/null || echo 0) ))
    [ "$hb_age" -ge "$HEARTBEAT" ] && log "OK up-to-date ${LOCAL:0:9}"
    exit 0
  fi
  if [ -z "$MARKER" ]; then
    # Fresh install — no baseline yet. Adopt HEAD (the running engine + current ui/dist are presumed in sync;
    # the installer rebuilds then seeds this) rather than risk a surprise rebuild/restart; future deltas heal
    # from here. Written atomically.
    printf '%s\n' "$LOCAL" > "$MARK.tmp" 2>/dev/null && mv "$MARK.tmp" "$MARK" 2>/dev/null || true
    log "INIT deployed marker set to ${LOCAL:0:9} (no rebuild — fresh baseline)"
    exit 0
  fi
  force_full=0
  if ! "$GIT" merge-base --is-ancestor "$MARKER" "$LOCAL" 2>/dev/null; then
    # Marker present but NOT an ancestor of HEAD (history rewritten / force-push, or a corrupt marker). We
    # can't trust that the built artifacts match HEAD, so force a FULL rebuild rather than silently adopting a
    # possibly-stale dist — adopting would re-open the very bug this marker exists to close.
    force_full=1
    log "WARN deployed marker ${MARKER:0:9} not an ancestor of HEAD ${LOCAL:0:9} — forcing full rebuild"
  fi
  # Built artifacts are behind the checkout — reconcile. Take the shared git lock so we read a CONSISTENT
  # tree (the engine may be mid-rebase in this same worktree) and stamp exactly what we build; skip if the
  # engine holds it. No fast-forward / run-quiet wait is needed — the source is already committed and a build
  # only writes ui/dist.
  if ! gitlock_acquire; then
    log "SKIP engine git commit in progress (shared lock held) — retry next cycle"
    exit 0
  fi
  # §28: a build compiles the WORKING TREE, so refuse if any non-data (code/ops) file is dirty — tracked OR
  # untracked — otherwise an unreviewed local edit would be baked into the live bundle. Dirty engine DATA is
  # fine (it never affects the build).
  if has_nondata_dirty; then
    gitlock_release
    log "SKIP built behind HEAD but a dirty non-data (code/ops) file is present (incl. untracked) — refusing to bake unreviewed code into a release (§28) — retry next cycle"
    exit 0
  fi
  target="$("$GIT" rev-parse HEAD 2>/dev/null)"
  [ -n "$target" ] || { gitlock_release; log "WARN cannot resolve HEAD under lock — retry next cycle"; exit 0; }
  # Debounce: if the code that's behind is still landing in a burst, hold the rebuild (one blip, not many).
  if [ "$force_full" != 1 ] && code_settling "$MARKER" "$target"; then
    gitlock_release
    log "DEFER built ${MARKER:0:9} behind HEAD ${target:0:9} but newest ui/ commit < ${DEBOUNCE_SECS}s ago — coalescing burst, retry next cycle"
    exit 0
  fi
  if [ "$force_full" = 1 ]; then
    CHANGED=$'ui/web/\nui/server/'   # force both a dist rebuild and an engine restart
  else
    CHANGED="$("$GIT" diff --name-only "$MARKER" "$target" 2>/dev/null)"
  fi
  log "SYNC built ${MARKER:0:9} behind HEAD ${target:0:9} (checkout advanced outside deploy) — reconciling"
  reconcile_build "$CHANGED" "$target"
  gitlock_release
  log "DONE ${target:0:9}"
  exit 0
fi

# origin/main must CONTAIN HEAD (pure fast-forward). If HEAD is ahead — a local data commit not
# yet pushed — skip; the next push reconciles. Never reset.
if ! "$GIT" merge-base --is-ancestor HEAD origin/main 2>/dev/null; then
  log "SKIP HEAD not an ancestor of origin/main (unpushed local commit?) local=${LOCAL:0:9} remote=${REMOTE:0:9}"
  exit 0
fi

# Debounce a burst of code merges into a single rebuild+restart (each restart is a ~15-30s offline blip in
# every open cockpit). Measured against the deployed marker when it's an ancestor of origin, else HEAD.
# Data-only incoming deltas never defer (code_settling returns proceed) — they fast-forward as before.
db_base="$LOCAL"; [ -n "$MARKER" ] && "$GIT" merge-base --is-ancestor "$MARKER" "$REMOTE" 2>/dev/null && db_base="$MARKER"
if code_settling "$db_base" "$REMOTE"; then
  log "DEFER ${LOCAL:0:9} -> ${REMOTE:0:9} — newest ui/ commit < ${DEBOUNCE_SECS}s ago; coalescing burst, retry next cycle"
  exit 0
fi

# take the shared git lock so a concurrent engine data commit can't dirty the tree between this check and
# the merge (or collide on .git/index.lock mid-merge). Skip the cycle if the engine is mid-commit.
if ! gitlock_acquire; then
  log "SKIP engine git commit in progress (shared lock held) — retry next cycle"
  exit 0
fi

# Don't fight an in-flight run — but don't get PERMANENTLY stuck on stale engine-written data either.
# The engine writes TRACKED data (screener board/ledger) into this same worktree, so the old "skip on ANY
# dirty tracked file" guard would jam the deploy forever the moment one such write sat uncommitted (seen
# 2026-06-19: prod stuck 3 commits behind for hours while board/ledger were dirty, because the engine
# couldn't push them). Two checks:
#
# (1) §28 — never fast-forward + rebuild over an unreviewed code/ops edit. The engine only ever writes the
#     §28 data pathspecs (analyses/**, screener/**, analyses/tracking/**), so ANY other dirty path — tracked
#     OR untracked — is an unexpected local edit and must keep the conservative skip. has_nondata_dirty uses
#     `git status --porcelain`, so it sees untracked files too (git diff does not) — closing the hole where
#     an untracked .ts under ui/ would be compiled into the live bundle.
if has_nondata_dirty; then
  gitlock_release
  log "SKIP working tree dirty — non-data (code/ops) file present (incl. untracked) — refusing to bake unreviewed code into a release (§28) — retry next cycle"
  exit 0
fi
# (2) All dirty paths are engine DATA now. The only real hazard to a CODE fast-forward is an incoming
#     commit that ALSO touches a file currently dirty in the tree — a genuine ff conflict. Skip exactly that.
#     A non-overlapping, data-only dirty tree is ALWAYS safe to fast-forward over, EVEN while the engine is
#     actively writing it: `git merge --ff-only` only updates files in the incoming diff (never the dirty
#     data files) and refuses to clobber a locally-modified tracked file as the backstop; and the rebuild
#     compiles ui/web SOURCE, not data — a half-written data file can't reach the bundle.
#
#     We deliberately do NOT also gate on "a dirty data file was written in the last N seconds" (the old
#     RUN_QUIET_SECS guard). The 24/7 screener rewrites TRACKED data (screener/board/*.json,
#     screener/ledger/themes.ndjson) on essentially every cycle, so a dirty data file is PERMANENTLY a few
#     minutes old — that guard never saw its 15-min quiet window and jammed the deploy indefinitely
#     (2026-06-27: the whole globe set + engine PRs sat merged-but-not-live for ~an hour, prod stuck behind
#     main, because board/ledger were continuously dirty). Overlap + ff-only's own refusal-to-clobber are
#     the correct and sufficient guards; recency added no safety a code ff actually needs, only the jam.
if ! "$GIT" diff --quiet 2>/dev/null; then
  dirty="$("$GIT" diff --name-only 2>/dev/null)"
  incoming="$("$GIT" diff --name-only HEAD origin/main 2>/dev/null)"
  overlap="$(comm -12 <(printf '%s\n' "$dirty" | sort -u) <(printf '%s\n' "$incoming" | sort -u) 2>/dev/null)"
  if [ -n "$overlap" ]; then
    gitlock_release
    log "SKIP working tree dirty — incoming ff also changes a dirty file — retry next cycle"
    exit 0
  fi
  log "PROCEED tree dirty but all dirty files are non-overlapping engine data — ff is safe (ff-only refuses to clobber)"
fi

log "DEPLOY ${LOCAL:0:9} -> ${REMOTE:0:9}"
"$GIT" merge --ff-only origin/main >"$OPS/.merge.out" 2>&1; mrc=$?
# keep the changed-file summary, drop git's gc/maintenance noise
grep -vE 'gc\.log|loose objects|Auto packing|git help gc|Please correct|Automatic cleanup|^warning:|^$' "$OPS/.merge.out" >> "$LOG" 2>/dev/null || true
if [ "$mrc" -ne 0 ]; then
  log "WARN ff-only merge failed (rc=$mrc) — retry next cycle"
  exit 0
fi

# The fast-forwarded, reviewed source is now immutable under fd 9. Activate
# its connector service contract before advancing any deployed marker; a
# failure leaves the old service and marker in place so the next tick retries.
if ! migrate_connector_launchagent_v2; then
  log "WARN connector-agent reconciliation failed after fast-forward — leaving the deployed marker unchanged for retry"
  exit 0
fi

# Rebuild from the DEPLOYED marker (not merely from the old LOCAL) so any pre-existing dist staleness heals
# in the same pass; fall back to LOCAL when there is no usable marker.
build_base="$LOCAL"
[ -n "$MARKER" ] && "$GIT" merge-base --is-ancestor "$MARKER" "$REMOTE" 2>/dev/null && build_base="$MARKER"
CHANGED="$("$GIT" diff --name-only "$build_base" "$REMOTE" 2>/dev/null)"
reconcile_build "$CHANGED" "$REMOTE"
gitlock_release
log "DONE ${REMOTE:0:9}"
exit 0
