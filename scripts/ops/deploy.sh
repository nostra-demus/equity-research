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

legacy_tunnel_contract() {
  "$PYTHON" -I - "$1" <<'PYLEGACYROLE'
import os, plistlib, stat, sys
path = sys.argv[1]; fd = None
try:
    before = os.lstat(path)
    if (not stat.S_ISREG(before.st_mode) or before.st_uid != os.getuid()
            or before.st_nlink != 1 or before.st_mode & 0o022
            or not 0 < before.st_size <= 1024 * 1024): raise OSError
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    opened = os.fstat(fd); chunks = []; remaining = opened.st_size
    while remaining:
        chunk = os.read(fd, remaining)
        if not chunk: raise OSError
        chunks.append(chunk); remaining -= len(chunk)
    if os.read(fd, 1): raise OSError
    raw = b"".join(chunks); after = os.fstat(fd); named = os.lstat(path)
    identity = lambda s: (s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns,
                          s.st_mode, s.st_uid, s.st_nlink)
    if identity(before) != identity(opened) or identity(opened) != identity(after) \
            or identity(after) != identity(named): raise OSError
    value = plistlib.loads(raw); args = value.get("ProgramArguments")
    if (value.get("Label") != "com.nostradamus.tunnel" or not isinstance(args, list)
            or len(args) != 4 or not isinstance(args[0], str) or not args[0].startswith("/")
            or os.path.basename(args[0]) != "cloudflared"
            or args[1:] != ["tunnel", "run", "nostradamus-engine"]
            or value.get("RunAtLoad") is not True or value.get("KeepAlive") is not True): raise OSError
except (OSError, ValueError, plistlib.InvalidFileException): raise SystemExit(1)
finally:
    if fd is not None: os.close(fd)
PYLEGACYROLE
}

safe_role_value() {
  "$PYTHON" -I - "$1" <<'PYROLEVALUE'
import os, stat, sys
path = sys.argv[1]; fd = None
try:
    before = os.lstat(path)
    if (not stat.S_ISREG(before.st_mode) or before.st_uid != os.getuid()
            or before.st_nlink != 1 or before.st_mode & 0o077 or not 0 < before.st_size <= 32): raise OSError
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    opened = os.fstat(fd); chunks = []; remaining = opened.st_size
    while remaining:
        chunk = os.read(fd, remaining)
        if not chunk: raise OSError
        chunks.append(chunk); remaining -= len(chunk)
    if os.read(fd, 1): raise OSError
    raw = b"".join(chunks); after = os.fstat(fd); named = os.lstat(path)
    identity = lambda s: (s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns,
                          s.st_mode, s.st_uid, s.st_nlink)
    if identity(before) != identity(opened) or identity(opened) != identity(after) \
            or identity(after) != identity(named): raise OSError
    if raw == b"doer\n": print("doer")
    elif raw == b"admin\n": print("admin")
    else: raise OSError
except OSError: raise SystemExit(1)
finally:
    if fd is not None: os.close(fd)
PYROLEVALUE
}

# Role truth takes precedence over legacy topology inference. Admin intent is recorded before demotion removes
# doer-only services, while doer promotion is recorded only after a complete install, so an interrupted
# demotion cannot be undone by stale files. Older doers have no marker yet, so their real, current-user-owned
# tunnel plist remains the migration fallback.
is_doer_host() {
  local role_file="$OPS/role" role_value="" tunnel="$HOME/Library/LaunchAgents/com.nostradamus.tunnel.plist"
  if [ -e "$role_file" ] || [ -L "$role_file" ]; then
    if role_value="$(safe_role_value "$role_file" 2>/dev/null)"; then
      case "$role_value" in doer) return 0 ;; admin) return 1 ;; esac
    fi
    return 1                                                # unsafe/unknown durable truth fails closed as admin
  fi
  legacy_tunnel_contract "$tunnel"
}

# Paid in-process research has one permanent owner: the installed doer whose private writer identity matches
# this host. A serving-only failover is deliberately a doer without that identity. Missing/unsafe identity
# evidence therefore means OFF, never "probably the doer".
is_permanent_automation_owner() {
  local helper="$PROD/scripts/ops/connector-supervisor.py"
  is_doer_host || return 1
  [ -f "$helper" ] && [ ! -L "$helper" ] && [ -O "$helper" ] || return 1
  ENGINE_REPO_ROOT="$PROD" "$PYTHON" -I "$helper" --writer-eligible >/dev/null 2>&1
}

# Produce an exact, private engine plist for owner=0|1 without printing any EnvironmentVariables (the
# installed file can contain provider secrets). The strict no-follow read and identity checks make the
# staged bytes a trustworthy snapshot; the caller re-checks the exact backup before activation.
render_engine_autonomy_plist() {
  local input="$1" staged="$2" backup="$3" owner="$4"
  "$PYTHON" -I - "$input" "$staged" "$backup" "$owner" <<'PYENGINEAUTONOMY'
import os
import plistlib
import re
import stat
import sys

source, staged_path, backup_path, owner_raw = sys.argv[1:]
if owner_raw not in {"0", "1"}:
    raise SystemExit(2)

def identity(value):
    return (value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns,
            value.st_ctime_ns, value.st_mode, value.st_uid, value.st_nlink)

fd = None
try:
    before = os.lstat(source)
    if (not stat.S_ISREG(before.st_mode) or stat.S_ISLNK(before.st_mode)
            or before.st_uid != os.getuid() or before.st_nlink != 1
            or before.st_mode & 0o022 or not 0 < before.st_size <= 1024 * 1024):
        raise OSError
    fd = os.open(source, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    opened = os.fstat(fd)
    chunks = []
    remaining = opened.st_size
    while remaining:
        chunk = os.read(fd, remaining)
        if not chunk:
            raise OSError
        chunks.append(chunk)
        remaining -= len(chunk)
    if os.read(fd, 1):
        raise OSError
    raw = b"".join(chunks)
    after = os.fstat(fd)
    named = os.lstat(source)
    if identity(before) != identity(opened) or identity(opened) != identity(after) \
            or identity(after) != identity(named):
        raise OSError
finally:
    if fd is not None:
        os.close(fd)

# Historical tracked templates contain human comments with command flags such as `--import`; XML forbids
# a double hyphen inside comments even though macOS plutil accepts it. Comments carry no launchd state, so
# strip them for the strict cross-platform parser while retaining the exact original bytes in `backup`.
parseable = re.sub(br"<!--.*?-->", b"", raw, flags=re.S)
value = plistlib.loads(parseable)
if not isinstance(value, dict) or value.get("Label") != "com.nostradamus.engine":
    raise ValueError("unexpected engine plist")
if not isinstance(value.get("ProgramArguments"), list) or not value["ProgramArguments"]:
    raise ValueError("missing engine executable")
environment = value.get("EnvironmentVariables")
if not isinstance(environment, dict) or any(not isinstance(k, str) or not isinstance(v, str)
                                            for k, v in environment.items()):
    raise ValueError("invalid engine environment")

for key in ("CALL_UPDATE_AUTO_ENABLED", "REVIEW_DISPATCH_ENABLED",
            "INTAKE_AUTO_ANALYZE", "CONVICTION_LOOP_ENABLED"):
    environment[key] = owner_raw
if owner_raw == "1":
    # Preserve the owner's documented off/stream kill-switch. A missing or unknown legacy value safely
    # enters the ordinary due-aware batch mode.
    if environment.get("BRIDGE_MODE") not in {"off", "stream", "batch"}:
        environment["BRIDGE_MODE"] = "batch"
else:
    environment["BRIDGE_MODE"] = "off"
rendered = plistlib.dumps(value, fmt=plistlib.FMT_XML, sort_keys=False)

def write_private(path, payload):
    named = os.lstat(path)
    if (not stat.S_ISREG(named.st_mode) or stat.S_ISLNK(named.st_mode)
            or named.st_uid != os.getuid() or named.st_nlink != 1):
        raise OSError
    out = os.open(path, os.O_WRONLY | os.O_TRUNC | getattr(os, "O_NOFOLLOW", 0))
    try:
        os.fchmod(out, 0o600)
        view = memoryview(payload)
        while view:
            written = os.write(out, view)
            if written <= 0:
                raise OSError
            view = view[written:]
        os.fsync(out)
    finally:
        os.close(out)

write_private(backup_path, raw)
write_private(staged_path, rendered)
PYENGINEAUTONOMY
}

# The old calendar timer and the server dispatcher must never overlap. launchd bootout is asynchronous, so
# prove the label is unloaded before removing its plist. A stubborn job or unsafe pathname fails closed and
# remains visible for the next deploy/diagnosis.
retire_legacy_review_agent() {
  local label=com.nostradamus.hk-review
  local installed="$HOME/Library/LaunchAgents/com.nostradamus.hk-review.plist"
  local attempts="${REVIEW_RETIRE_WAIT_ATTEMPTS:-40}" delay="${REVIEW_RETIRE_WAIT_SECONDS:-0.25}" i
  case "$attempts" in ''|*[!0-9]*) attempts=40 ;; esac
  if loaded "$label"; then
    launchctl bootout "gui/$UID_NUM/$label" >/dev/null 2>&1 || true
    for i in $(seq 1 "$attempts"); do loaded "$label" || break; sleep "$delay"; done
  fi
  if loaded "$label"; then
    log "WARN retired hk-review is still loaded; preserving its plist and refusing automatic-owner migration"
    return 1
  fi
  if [ -e "$installed" ] || [ -L "$installed" ]; then
    if [ -L "$installed" ] || [ ! -f "$installed" ] || [ ! -O "$installed" ]; then
      log "WARN retired hk-review plist is unsafe; refusing removal"
      return 1
    fi
    rm -f "$installed" 2>/dev/null || {
      log "WARN retired hk-review plist could not be removed"
      return 1
    }
  fi
  if [ -e "$installed" ] || [ -L "$installed" ]; then
    log "WARN retired hk-review plist remains after removal"
    return 1
  fi
  return 0
}

# Full installs serialize role/connector transitions on this same lease. Deploy already owns fd8 (deploy)
# then fd9 (repository), so taking fd7 here preserves the global deploy -> repository -> autonomy order and
# prevents a manual role change from racing the owner decision or engine plist replacement.
acquire_research_owner_lock() {
  local lock="$OPS/connector-autonomy.lock"
  [ ! -L "$lock" ] || return 1
  umask 077
  exec 7>>"$lock" || return 1
  if "$PYTHON" -I - "$lock" 15000 7<&7 <<'PYRESEARCHOWNERLOCK'
import fcntl
import os
import stat
import sys
import time

path = sys.argv[1]
deadline = time.monotonic() + int(sys.argv[2]) / 1000
try:
    opened = os.fstat(7)
    named = os.lstat(path)
    if (not stat.S_ISREG(opened.st_mode) or stat.S_ISLNK(named.st_mode)
            or opened.st_uid != os.getuid() or opened.st_nlink != 1
            or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
    os.fchmod(7, 0o600)
    while True:
        try:
            fcntl.flock(7, fcntl.LOCK_EX | fcntl.LOCK_NB)
            break
        except BlockingIOError:
            if time.monotonic() >= deadline:
                raise OSError
            time.sleep(0.05)
    locked = os.fstat(7)
    named = os.lstat(path)
    if (locked.st_uid != os.getuid() or locked.st_nlink != 1 or locked.st_mode & 0o077
            or (locked.st_dev, locked.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
except OSError:
    raise SystemExit(3)
PYRESEARCHOWNERLOCK
  then
    return 0
  fi
  exec 7>&-
  return 1
}
release_research_owner_lock() { exec 7>&-; }

# Reconcile only the installed engine LaunchAgent after this code merges. Do not invoke the full installer
# from deploy (it would replace the running deploy/watchdog scripts). The prior file is retained until the
# new service is loaded and healthy; on a non-owner, failure still keeps the disabled plist in place so a
# rollback can never resurrect a paid duplicate.
migrate_engine_autonomy_v1() {
  local agents="$HOME/Library/LaunchAgents"
  local installed="$agents/com.nostradamus.engine.plist"
  local marker="$OPS/.engine-autonomy-v1" owner=0 desired staged backup marker_stage i activated=0 replaced=0
  is_permanent_automation_owner && owner=1
  desired="version=1;owner=$owner"
  if [ ! -f "$installed" ] || [ -L "$installed" ] || [ ! -O "$installed" ]; then
    log "WARN engine automatic-owner migration requires a safe installed engine plist"
    return 1
  fi
  staged="$(mktemp "$agents/.com.nostradamus.engine.plist.staged.XXXXXX")" || return 1
  backup="$(mktemp "$agents/.com.nostradamus.engine.plist.backup.XXXXXX")" || {
    rm -f "$staged" 2>/dev/null || true
    return 1
  }
  if ! render_engine_autonomy_plist "$installed" "$staged" "$backup" "$owner"; then
    rm -f "$staged" "$backup" 2>/dev/null || true
    log "WARN engine automatic-owner migration refused the installed plist"
    return 1
  fi
  if cmp -s "$installed" "$staged" \
      && [ "$(cat "$marker" 2>/dev/null || true)" = "$desired" ] \
      && loaded com.nostradamus.engine; then
    rm -f "$staged" "$backup" 2>/dev/null || true
    return 0
  fi
  # No installer or operator may have changed the path after the secure snapshot.
  if ! cmp -s "$installed" "$backup"; then
    rm -f "$staged" "$backup" 2>/dev/null || true
    log "WARN engine plist changed during automatic-owner staging; retrying next deploy"
    return 1
  fi
  launchctl bootout "gui/$UID_NUM/com.nostradamus.engine" >/dev/null 2>&1 || true
  for i in $(seq 1 40); do loaded com.nostradamus.engine || break; sleep 0.25; done
  if loaded com.nostradamus.engine || ! cmp -s "$installed" "$backup"; then
    rm -f "$staged" "$backup" 2>/dev/null || true
    log "WARN engine did not unload cleanly or its plist changed; prior service/file preserved"
    return 1
  fi
  if mv "$staged" "$installed"; then
    replaced=1
  fi
  if [ "$replaced" = 1 ] && chmod 600 "$installed"; then
    for i in 1 2 3 4 5 6; do
      launchctl bootstrap "gui/$UID_NUM" "$installed" >/dev/null 2>&1 && break
      sleep 0.5
    done
    launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" >/dev/null 2>&1 || true
    if loaded com.nostradamus.engine && health_gate; then activated=1; fi
  fi
  if [ "$activated" = 1 ]; then
    rm -f "$backup" 2>/dev/null || true
    marker_stage="$(mktemp "$OPS/.engine-autonomy-v1.staged.XXXXXX")" || return 1
    if ! printf '%s\n' "$desired" > "$marker_stage" \
        || ! chmod 600 "$marker_stage" || ! mv "$marker_stage" "$marker"; then
      rm -f "$marker_stage" 2>/dev/null || true
      log "WARN engine automatic owner is active but its migration marker could not be stored"
      return 1
    fi
    log "engine automatic owner active: owner=$owner; legacy hk-review retired"
    return 0
  fi

  launchctl bootout "gui/$UID_NUM/com.nostradamus.engine" >/dev/null 2>&1 || true
  for i in $(seq 1 40); do loaded com.nostradamus.engine || break; sleep 0.25; done
  if [ "$owner" = 0 ]; then
    # Fail closed: never restore a legacy plist that may hardcode paid loops ON on an admin/failover host.
    if [ "$replaced" != 1 ] && [ -f "$staged" ]; then
      mv "$staged" "$installed" 2>/dev/null && replaced=1
    fi
    [ "$replaced" != 1 ] || chmod 600 "$installed" 2>/dev/null || true
    if [ "$replaced" = 1 ]; then
      for i in 1 2 3 4 5 6; do
        launchctl bootstrap "gui/$UID_NUM" "$installed" >/dev/null 2>&1 && break
        sleep 0.5
      done
      launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" >/dev/null 2>&1 || true
    fi
    rm -f "$backup" "$staged" 2>/dev/null || true
    log "ALERT disabled engine plist could not become healthy; paid loops remain OFF and deploy will retry"
    return 1
  fi
  if loaded com.nostradamus.engine || ! mv "$backup" "$installed"; then
    log "ALERT engine automatic-owner activation failed and exact prior plist could not be restored"
    return 1
  fi
  chmod 600 "$installed" 2>/dev/null || true
  for i in 1 2 3 4 5 6; do
    launchctl bootstrap "gui/$UID_NUM" "$installed" >/dev/null 2>&1 && break
    sleep 0.5
  done
  launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" >/dev/null 2>&1 || true
  if ! loaded com.nostradamus.engine || ! health_gate; then
    log "ALERT engine automatic-owner activation and rollback both failed"
  else
    log "WARN engine automatic-owner activation failed; exact prior service restored"
  fi
  rm -f "$staged" 2>/dev/null || true
  return 1
}

reconcile_research_owner() {
  local rc=0
  acquire_research_owner_lock || {
    log "WARN automatic-owner transition lease is busy or unsafe"
    return 1
  }
  retire_legacy_review_agent || rc=1
  [ "$rc" != 0 ] || migrate_engine_autonomy_v1 || rc=1
  release_research_owner_lock
  return "$rc"
}

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
  local supervisor_helper="$PROD/scripts/ops/connector-supervisor.py"
  local staged claim desired_interval source_isolated changed=0 orphan_count=0
  is_doer_host || return 0                                # gate every install/claim/activation path, not just absence
  # One private identity owns the connector config path across plist deletion,
  # upgrades, and custom provider directories. This helper is executed only
  # after main/origin/dirty gates under the repository mutation lease.
  if [ ! -f "$supervisor_helper" ] || [ -L "$supervisor_helper" ]; then
    log "WARN connector-agent migration helper is missing or unsafe"
    return 1
  fi
  if ! ENGINE_REPO_ROOT="$PROD" "$PYTHON" -I "$supervisor_helper" --writer-eligible; then
    log "connector-agent migration skipped — this host is not the configured connector writer"
    return 0
  fi
  carried_config="$(ENGINE_REPO_ROOT="$PROD" "$PYTHON" -I \
    "$supervisor_helper" --read-config-identity 2>/dev/null || true)"
  [ -z "$carried_config" ] || providers_dir="$carried_config"
  if ! ENGINE_REPO_ROOT="$PROD" NOSTRA_ENGINE_CONFIG_DIR="$providers_dir" \
      "$PYTHON" -I "$supervisor_helper" --ensure-config-identity \
      || ! providers_dir="$(ENGINE_REPO_ROOT="$PROD" "$PYTHON" -I \
        "$supervisor_helper" --read-config-identity)"; then
    log "WARN connector-agent migration could not prove the canonical config identity"
    return 1
  fi
  providers_env="$providers_dir/providers.env"
  # Production data/ is a Drive-pool symlink. If Drive is absent, the clobber guard can conservatively leave
  # an empty real directory in its place; activating RunAtLoad there would turn that outage placeholder into
  # a local connector pool. Defer every connector activation until the canonical symlink resolves/readable.
  if [ ! -L "$PROD/data" ] || [ ! -d "$PROD/data" ] || [ ! -r "$PROD/data" ]; then
    log "connector-agent reconciliation deferred — canonical Drive data pool is unavailable"
    return 0
  fi
  if [ ! -e "$installed" ] && [ ! -L "$installed" ]; then
    orphan_count="$(find "$agents" -maxdepth 1 -type d \
      -name '.com.nostradamus.connectors.plist.credential-claim-*' 2>/dev/null | wc -l | tr -d ' ')"
    if [ "$orphan_count" = 0 ]; then
      # A legacy doer can pre-date the connector plist entirely. Migration used to treat that same shape as
      # an admin, so every feed stayed never_run forever. Use the reviewed installer path to add ONLY this
      # service. `--only connectors` does not replace the deploy/watchdog script that may be executing now.
      log "connector-agent missing on doer — installing only the connector service"
      if ! ENGINE_REPO_ROOT="$PROD" NOSTRA_ROLE=doer /bin/bash \
          "$PROD/scripts/ops/install-services.sh" --role doer --only connectors >>"$LOG" 2>&1; then
        log "WARN connector-agent doer self-install failed"
        return 1
      fi
      if [ ! -f "$installed" ] || [ -L "$installed" ] || [ ! -O "$installed" ]; then
        log "WARN connector-agent doer self-install did not leave a safe installed plist"
        return 1
      fi
      printf '%s\n' 'interval=900;credentials=providers_env;isolated=1' > "$marker.tmp" 2>/dev/null \
        && mv "$marker.tmp" "$marker" 2>/dev/null || true
      log "connector-agent installed on legacy doer: 15m due-aware scheduler active"
      return 0                                            # installer already validated and loaded the exact template
    fi
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
# There is exactly one pool authority: the owner-only identity seeded by an explicit NOSTRA_POOL on first
# install, or by the currently resolving production data symlink on upgrade.  Never fall back to a hardcoded
# Drive account after that identity exists; doing so could silently move the writer to a second pool.
POOL_IDENTITY="$OPS/pool-root"
read_pool_identity() {
  "$PYTHON" -I - "$POOL_IDENTITY" <<'PYPOOLIDENTITY'
import os
import stat
import sys

path = sys.argv[1]
descriptor = None
try:
    before = os.lstat(path)
    if (not stat.S_ISREG(before.st_mode) or before.st_uid != os.getuid()
            or before.st_nlink != 1 or before.st_mode & 0o077
            or not 1 < before.st_size <= 4096):
        raise OSError
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    opened = os.fstat(descriptor)
    raw = os.read(descriptor, opened.st_size + 1)
    after = os.fstat(descriptor)
    named = os.lstat(path)
    if ((opened.st_dev, opened.st_ino, opened.st_size, opened.st_mtime_ns,
         opened.st_ctime_ns, opened.st_uid, opened.st_nlink)
            != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns,
                after.st_ctime_ns, after.st_uid, after.st_nlink)
            or (opened.st_dev, opened.st_ino, opened.st_size, opened.st_mtime_ns,
                opened.st_ctime_ns, opened.st_uid, opened.st_nlink)
            != (named.st_dev, named.st_ino, named.st_size, named.st_mtime_ns,
                named.st_ctime_ns, named.st_uid, named.st_nlink)):
        raise OSError
    text = raw.decode("utf-8")
    if not text.endswith("\n") or "\n" in text[:-1] or not text[:-1].startswith("/"):
        raise OSError
    target = os.path.realpath(text[:-1])
    target_stat = os.stat(target)
    if (not stat.S_ISDIR(target_stat.st_mode) or target_stat.st_uid != os.getuid()
            or not os.access(target, os.R_OK | os.X_OK) or target != text[:-1]):
        raise OSError
    print(target)
except (OSError, UnicodeError):
    raise SystemExit(1)
finally:
    if descriptor is not None:
        os.close(descriptor)
PYPOOLIDENTITY
}
seed_pool_identity() {
  "$PYTHON" -I - "$POOL_IDENTITY" "$PROD/data" "${NOSTRA_POOL:-}" <<'PYSEEDPOOL'
import os
import stat
import sys
import tempfile

identity, data_path, explicit = sys.argv[1:]
if os.path.lexists(identity):
    raise SystemExit(0)
candidate = explicit or data_path
if not os.path.isabs(candidate) or (not explicit and not os.path.islink(data_path)):
    raise SystemExit(1)
try:
    target = os.path.realpath(candidate)
    target_stat = os.stat(target)
    if (not stat.S_ISDIR(target_stat.st_mode) or target_stat.st_uid != os.getuid()
            or not os.access(target, os.R_OK | os.X_OK)):
        raise OSError
    parent = os.path.dirname(identity)
    before = os.lstat(parent)
    descriptor = os.open(parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(descriptor)
        if (not stat.S_ISDIR(opened.st_mode) or opened.st_uid != os.getuid()
                or (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino)):
            raise OSError
        os.fchmod(descriptor, 0o700)
    finally:
        os.close(descriptor)
    staged_fd, staged = tempfile.mkstemp(prefix=".pool-root.seed.", dir=parent)
    try:
        os.fchmod(staged_fd, 0o600)
        os.write(staged_fd, (target + "\n").encode("utf-8"))
        os.fsync(staged_fd)
        os.close(staged_fd); staged_fd = -1
        try:
            os.link(staged, identity, follow_symlinks=False)
        except FileExistsError:
            pass
    finally:
        if staged_fd >= 0: os.close(staged_fd)
        try: os.unlink(staged)
        except OSError: pass
except OSError:
    raise SystemExit(1)
PYSEEDPOOL
}
ensure_data_symlink() {
  local d="$PROD/data" extra bak pool=""
  # Seed once from explicit/current safe topology using this installed reviewed deploy script. Never execute
  # mutable production working-tree code before the deploy lease/main/dirty gates.
  seed_pool_identity >/dev/null 2>&1 || true
  pool="$(read_pool_identity 2>/dev/null || true)"
  [ -n "$pool" ] || { log "WARN data-guard: canonical pool identity unavailable — leaving data/ as-is"; return 0; }
  if [ -L "$d" ]; then
    [ "$(cd "$d" 2>/dev/null && pwd -P)" = "$pool" ] \
      || log "WARN data-guard: data symlink conflicts with canonical pool identity — NOT touching"
    return 0
  fi
  [ -e "$pool" ] || { log "WARN data-guard: canonical pool unavailable (Drive signed out?) — leaving data/ as-is"; return 0; }
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
  # Never synthesize a wholly absent data path: only the known, inspected empty clobber directory above is
  # recoverable without operator ambiguity.
  [ -e "$bak" ] 2>/dev/null \
    && ln -s "$pool" "$d" 2>/dev/null \
    && log "data-guard: restored data -> canonical Drive pool symlink" \
    || { [ -e "$d" ] || log "WARN data-guard: data path absent — manual topology repair required"; }
}

# ---- whole-deploy single-flight ----
# fd 8 survives the short Python helper because flock belongs to the shared open-file description.
# The kernel releases it on every shell exit/crash, so a long npm/build/health cycle can never be
# "reclaimed" by age and overlapped by another deploy. A launchd tick that finds it held simply skips.
umask 077
[ ! -L "$DEPLOY_LOCK" ] || { log "WARN unsafe deploy single-flight lock"; exit 0; }
exec 8>>"$DEPLOY_LOCK" || { log "WARN cannot open deploy single-flight lock"; exit 0; }
if ! "$PYTHON" -I - "$DEPLOY_LOCK" 8<&8 <<'PYDEPLOYLOCK'
import fcntl
import os
import stat
import sys

try:
    opened = os.fstat(8); named = os.lstat(sys.argv[1])
    if (not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.getuid()
            or opened.st_nlink != 1 or stat.S_ISLNK(named.st_mode)
            or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
    os.fchmod(8, 0o600)
    fcntl.flock(8, fcntl.LOCK_EX | fcntl.LOCK_NB)
    locked = os.fstat(8); named = os.lstat(sys.argv[1])
    if (locked.st_uid != os.getuid() or locked.st_nlink != 1 or locked.st_mode & 0o077
            or (locked.st_dev, locked.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
except (BlockingIOError, OSError):
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
  [ ! -L "$GITLOCK" ] || { GITLOCK=""; return 1; }
  umask 077
  exec 9>>"$GITLOCK" || { GITLOCK=""; return 1; }
  if "$PYTHON" -I - "$GITLOCK" 15000 9<&9 <<'PYLOCK'
import fcntl
import os
import stat
import sys
import time

path = sys.argv[1]
deadline = time.monotonic() + int(sys.argv[2]) / 1000
try:
    opened = os.fstat(9); named = os.lstat(path)
    if (not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.getuid()
            or opened.st_nlink != 1 or stat.S_ISLNK(named.st_mode)
            or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
    os.fchmod(9, 0o600)
    while True:
      try:
        fcntl.flock(9, fcntl.LOCK_EX | fcntl.LOCK_NB)
        break
      except BlockingIOError:
        if time.monotonic() >= deadline:
            raise OSError
        time.sleep(0.05)
    locked = os.fstat(9); named = os.lstat(path)
    if (locked.st_uid != os.getuid() or locked.st_nlink != 1 or locked.st_mode & 0o077
            or (locked.st_dev, locked.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
except OSError:
    raise SystemExit(3)
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
  local staged
  staged="$(mktemp "$OPS/.git-status.XXXXXX")" || return 0
  if ! "$GIT" status --porcelain=v1 -z --untracked-files=normal > "$staged" 2>/dev/null; then
    rm -f "$staged" 2>/dev/null || true
    return 0
  fi
  "$PYTHON" -I - "$staged" <<'PYDIRTY'
import sys

raw = open(sys.argv[1], "rb").read()
fields = raw.split(b"\0")
if fields and fields[-1] == b"": fields.pop()
index = 0
while index < len(fields):
    record = fields[index]
    if len(record) < 4 or record[2:3] != b" ": raise SystemExit(0)
    code, path = record[:2], record[3:]
    paths = [path]
    if b"R" in code or b"C" in code:
        index += 1
        if index >= len(fields): raise SystemExit(0)
        paths.append(fields[index])
    for encoded in paths:
        try: value = encoded.decode("utf-8", "strict")
        except UnicodeError: raise SystemExit(0)
        if not (value.startswith("analyses/") or value.startswith("screener/")):
            raise SystemExit(0)
    index += 1
raise SystemExit(1)
PYDIRTY
  local rc=$?
  rm -f "$staged" 2>/dev/null || true
  [ "$rc" -eq 0 ]
}

# Narrow portable test hook: returns 0 when deployment must be blocked and 1
# only when every dirty old/new path is inside the append-only data roots.
if [ "${1:-}" = --test-render-engine-autonomy ]; then
  [ "$#" = 5 ] || exit 2
  render_engine_autonomy_plist "$2" "$3" "$4" "$5"
  exit $?
elif [ "${1:-}" = --test-retire-review-agent ]; then
  [ "$#" = 1 ] || exit 2
  retire_legacy_review_agent
  exit $?
elif [ "${1:-}" = --check-dirty ]; then
  cd "$PROD" 2>/dev/null || exit 0
  has_nondata_dirty
  exit $?
elif [ "$#" -gt 0 ]; then
  exit 2
fi

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
  for opsscript in watchdog.sh deploy.sh housekeeping.sh connector-supervisor.py; do
    case "$changed" in
      *scripts/ops/$opsscript*)
        staged_ops="$(mktemp "$OPS/.$opsscript.staged.XXXXXX")" \
          && cp "$PROD/scripts/ops/$opsscript" "$staged_ops" 2>/dev/null \
          && chmod 700 "$staged_ops" && mv "$staged_ops" "$OPS/$opsscript" \
          && log "  refreshed ops/$opsscript (self-update)" \
          || { rm -f "${staged_ops:-}" 2>/dev/null || true; failed=1; log "  WARN could not refresh ops/$opsscript"; } ;;
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
    log "SKIP service reconciliation because a dirty non-data (code/ops) file is present (§28)"
    exit 0
  fi
  if ! reconcile_research_owner; then
    log "WARN engine automatic-owner reconciliation failed — leaving the deployed marker unchanged for retry"
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
  # Saved-research recovery publishes a synthetic commit parented only to current origin/main so private
  # checkout ancestry can never leak. If origin moved concurrently, local HEAD and origin legitimately
  # diverge even though every local committed byte is now present in the shared tree. Prove that exact
  # condition before converging. reset --keep refuses rather than overwriting any concurrent worktree edit.
  local_delta_shared=0
  if "$PYTHON" -I - "$PROD" "$LOCAL" "$REMOTE" <<'PYSHARED'
import subprocess, sys
repo, local, remote = sys.argv[1:]
def run(args, raw=False):
    value = subprocess.run(['git', '-C', repo, *args], check=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL).stdout
    return value if raw else value.decode().strip()
try:
    base = run(['merge-base', local, remote])
    paths = [p.decode() for p in run(['diff', '--no-renames', '--name-only', '-z', base, local], True).split(b'\0') if p]
    if not paths: raise SystemExit(1)
    def entry(commit, path):
        rows = [r for r in run(['ls-tree', '-z', commit, '--', path], True).split(b'\0') if r]
        if not rows: return None
        if len(rows) != 1: raise SystemExit(1)
        meta, name = rows[0].split(b'\t', 1)
        if name.decode() != path: raise SystemExit(1)
        return tuple(meta.decode().split())
    if any(entry(local, path) != entry(remote, path) for path in paths): raise SystemExit(1)
except (subprocess.CalledProcessError, ValueError):
    raise SystemExit(1)
PYSHARED
  then
    local_delta_shared=1
  fi
  if [ "$local_delta_shared" = 1 ] && "$GIT" diff --cached --quiet -- \
      && "$GIT" reset --keep "$REMOTE" >/dev/null 2>&1; then
    log "HEAL converged isolated saved-research publication ${LOCAL:0:9} -> ${REMOTE:0:9} without overwriting worktree changes"
    LOCAL="$REMOTE"
  else
    log "SKIP HEAD not an ancestor of origin/main (unpushed or worktree-conflicting local commit) local=${LOCAL:0:9} remote=${REMOTE:0:9}"
    exit 0
  fi
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

# The fast-forwarded, reviewed source is now immutable under fd 9. Retire the duplicate review timer, then
# activate the one-owner engine and connector contracts before advancing any deployed marker. A failure
# leaves the marker in place so the next tick retries; deploy never full-reinstalls or restarts itself.
if ! reconcile_research_owner; then
  log "WARN engine automatic-owner reconciliation failed after fast-forward — leaving the deployed marker unchanged for retry"
  exit 0
fi
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
