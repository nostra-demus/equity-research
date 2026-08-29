#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Auto-deploy watcher for app.nostra-demus.com  (com.nostradamus.deploy, ~every 120s)
#
# Keeps autonomous research data current. A non-data change remains inert until a separate short-lived,
# exact-program deployment receipt authorizes it; only then does the watcher fast-forward and reconcile
# what changed:
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
#   • receipt-gated — merge is not deployment; every non-data byte needs an exact, one-shot authorization
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
# launchd supplies only the system directories. npm itself uses `#!/usr/bin/env node`, and a globally
# installed sidecar is discovered by name after provisioning, so resolving npm to an absolute path alone is
# insufficient: npm then fails with `env: node: No such file or directory`, and the new binary stays
# invisible. Keep a caller-supplied custom/virtual-environment path authoritative, then expose both
# supported Homebrew locations before ANY tool discovery. Use system paths only when no PATH was supplied.
export PATH="${PATH:-/usr/bin:/bin:/usr/sbin:/sbin}:/opt/homebrew/bin:/usr/local/bin"
# resolve npm to an absolute path (brew is /opt/homebrew on Apple-Silicon, /usr/local on Intel)
NPM="$(command -v npm 2>/dev/null || true)"; [ -n "$NPM" ] || for c in /opt/homebrew/bin/npm /usr/local/bin/npm; do [ -x "$c" ] && NPM="$c" && break; done; NPM="${NPM:-/opt/homebrew/bin/npm}"
GIT="$(command -v git || echo /usr/bin/git)"
PYTHON="$(command -v python3 || echo /usr/bin/python3)"
OPS="$HOME/.nostra-ops"
LOG="$HOME/Library/Logs/nostradamus-deploy.log"
DEPLOY_LOCK="$OPS/.deploy.flock"
MARK="$OPS/.deployed.sha"   # the SHA the built ui/dist + running engine were last reconciled to
FAILMARK="$OPS/.deploy.failed"                       # "<sha> <epoch>" of the last build/boot that failed (backoff)
SUCCESSMARK="$OPS/.deploy.succeeded"                 # "<sha> <epoch-ms>" of the last healthy lifecycle reconciliation
RUN_BARRIER_DIR="${ENGINE_STATE_DIR:-$PROD/ui/server/.state}"
RUN_BARRIER_LOCK="$RUN_BARRIER_DIR/provider-deploy-barrier.flock"
DEPLOY_INTENT="$RUN_BARRIER_DIR/provider-deploy-pending"
DEPLOY_AUTHORIZATION_DIR="${NOSTRA_DEPLOY_AUTHORIZATION_DIR:-$OPS/deploy-authorizations}"
DEPLOY_AUTHORIZATION_HELPER="${NOSTRA_DEPLOY_AUTHORIZATION_HELPER:-$OPS/deploy-authorization.py}"
FAIL_BACKOFF="${DEPLOY_FAIL_BACKOFF_SECS:-1800}"     # don't re-attempt the SAME failing SHA more often than this
# After an engine restart, poll /api/health before trusting the new code. A commit that BUILDS but throws at
# boot/first request otherwise flaps forever under launchd KeepAlive (the build-failure breaker above never
# sees it). HEALTH_TRIES × HEALTH_INTERVAL ≈ 60s is the boot budget; miss it → auto-rollback to last-good.
HEALTH_TRIES="${DEPLOY_HEALTH_TRIES:-20}"
HEALTH_INTERVAL="${DEPLOY_HEALTH_INTERVAL:-3}"
# The launchd interval already coalesces commits for up to two minutes. Add no further debounce by default:
# production/main convergence is the release contract, and an extra three-minute quiet window made a healthy
# watcher deliberately stale. Operators may still opt into a larger burst window, with MAX_DEFER_SECS as its
# liveness cap. Data-only deltas never debounce (they do not restart the engine).
DEBOUNCE_SECS="${DEPLOY_DEBOUNCE_SECS:-0}"
MAX_DEFER_SECS="${DEPLOY_MAX_DEFER_SECS:-1200}"
HEARTBEAT=3300   # log an "up-to-date" proof-of-life at most ~hourly
mkdir -p "$OPS" "$(dirname "$LOG")"

ts()  { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$LOG"; }
loaded() { launchctl print "gui/$UID_NUM/$1" >/dev/null 2>&1; }

# A queued launch needs proof of a healthy lifecycle transition, not merely the absence of writer intent.
# Keep that proof separate from .deployed.sha: dependency-only repair may finish with the same program SHA,
# while a no-op watcher tick must not mint a new success event. Owner-only temp+rename makes the receipt
# durable without exposing a partially written identity to the engine.
write_deploy_success() {
  local target="$1" now_ms
  valid_git_sha "$target" || return 1
  now_ms="$($PYTHON -I -c 'import time; print(time.time_ns() // 1_000_000)' 2>/dev/null)" || return 1
  case "$now_ms" in ''|*[!0-9]*) return 1 ;; esac
  umask 077
  printf '%s %s\n' "$target" "$now_ms" > "$SUCCESSMARK.tmp" 2>/dev/null \
    && chmod 600 "$SUCCESSMARK.tmp" 2>/dev/null \
    && mv "$SUCCESSMARK.tmp" "$SUCCESSMARK" 2>/dev/null
}

valid_git_sha() { [[ "${1:-}" =~ ^[0-9a-f]{40}$ || "${1:-}" =~ ^[0-9a-f]{64}$ ]]; }

# Publish one durable writer-intent before attempting the lifecycle flock. The current provider/scanner
# lease is allowed to finish, but deploy-barrier.ts refuses every later shared admission while this exact
# owner-only pathname exists. Keeping the original timestamp across launchd retries makes deployment lag
# observable instead of resetting its age every two minutes.
set_deploy_intent() {
  local target="$1" existing="" existing_epoch="" staged
  valid_git_sha "$target" || return 1
  if [ -f "$DEPLOY_INTENT" ] && [ ! -L "$DEPLOY_INTENT" ] && [ -O "$DEPLOY_INTENT" ] \
      && [ "$(stat -f '%Lp:%l' "$DEPLOY_INTENT" 2>/dev/null || true)" = '600:1' ]; then
    read -r existing existing_epoch < "$DEPLOY_INTENT" 2>/dev/null || true
    [ "$existing" = "$target" ] && return 0
  fi
  staged="$(mktemp "$RUN_BARRIER_DIR/.provider-deploy-pending.XXXXXX")" || return 1
  if ! printf '%s %s\n' "$target" "$(date +%s)" > "$staged" \
      || ! chmod 600 "$staged" \
      || ! mv -f "$staged" "$DEPLOY_INTENT"; then
    rm -f "$staged" 2>/dev/null || true
    return 1
  fi
  log "PENDING main ${target:0:9} — draining current provider work; new run admissions are paused"
}

clear_deploy_intent() {
  if [ -e "$DEPLOY_INTENT" ] || [ -L "$DEPLOY_INTENT" ]; then
    rm -f "$DEPLOY_INTENT" 2>/dev/null || {
      log "WARN could not clear provider deploy intent — new runs remain paused"
      return 1
    }
  fi
}

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

# Prove that the doer's archive writer and engine reader use the same retained Drive directory. The
# installed plists are treated as authority only after stable, owner-only, no-follow reads. Exit 10 means
# the archive contract is sound but the engine needs the one-time migration; every other mismatch fails
# closed without replacing or blanking an installed service. The desired path is captured by the caller and
# is never written to the deploy log.
engine_archive_contract() {
  local archive_plist="$HOME/Library/LaunchAgents/com.nostradamus.news-archive.plist"
  local engine_plist="$HOME/Library/LaunchAgents/com.nostradamus.engine.plist"
  "$PYTHON" -I - "$archive_plist" "$engine_plist" <<'PYENGINEARCHIVE'
import os
import plistlib
import stat
import sys
from xml.parsers.expat import ExpatError


class ContractError(RuntimeError):
    pass


def identity(info):
    return (
        info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_ctime_ns,
        info.st_mode, info.st_uid, info.st_nlink,
    )


def require_safe(info):
    if (
        not stat.S_ISREG(info.st_mode)
        or info.st_uid != os.getuid()
        or info.st_nlink != 1
        or info.st_mode & 0o077
        or not 0 < info.st_size <= 1024 * 1024
    ):
        raise ContractError("unsafe installed plist")


def secure_plist(path, allow_missing=False, allow_legacy_engine_comment=False):
    descriptor = None
    try:
        before = os.lstat(path)
    except FileNotFoundError:
        if allow_missing:
            return None
        raise ContractError("required installed plist is missing")
    except OSError as error:
        raise ContractError("cannot inspect installed plist") from error
    try:
        require_safe(before)
        descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
        opened = os.fstat(descriptor)
        require_safe(opened)
        if identity(opened) != identity(before):
            raise ContractError("installed plist changed during open")
        remaining = opened.st_size
        chunks = []
        while remaining:
            chunk = os.read(descriptor, min(remaining, 64 * 1024))
            if not chunk:
                raise ContractError("short installed plist read")
            chunks.append(chunk)
            remaining -= len(chunk)
        if os.read(descriptor, 1):
            raise ContractError("installed plist grew during read")
        after_fd = os.fstat(descriptor)
        after_path = os.lstat(path)
        require_safe(after_fd)
        require_safe(after_path)
        if identity(after_fd) != identity(before) or identity(after_path) != identity(before):
            raise ContractError("installed plist changed during read")
        raw = b"".join(chunks)
        try:
            value = plistlib.loads(raw)
        except (ValueError, plistlib.InvalidFileException, ExpatError):
            # The historical engine template carried one XML-illegal double hyphen inside a comment.
            # Accept only that exact, single reviewed defect in memory so deploy can inspect and replace
            # the legacy file. Never rewrite it in place and never relax parsing for any other damage.
            legacy = b"`--import tsx`"
            if not allow_legacy_engine_comment or raw.count(legacy) != 1:
                raise
            value = plistlib.loads(raw.replace(legacy, b"`node import flag`"))
        if not isinstance(value, dict):
            raise ContractError("installed plist root is invalid")
        return value
    except (OSError, ValueError, plistlib.InvalidFileException, ExpatError) as error:
        raise ContractError("cannot read installed plist") from error
    finally:
        if descriptor is not None:
            os.close(descriptor)


try:
    archive = secure_plist(sys.argv[1])
    archive_env = archive.get("EnvironmentVariables")
    archive_args = archive.get("ProgramArguments")
    if archive.get("Label") != "com.nostradamus.news-archive" or not isinstance(archive_env, dict):
        raise ContractError("archive service identity is invalid")
    repo_root = archive_env.get("REPO")
    desired = archive_env.get("NEWS_ARCHIVE_DIR")
    if (
        not isinstance(repo_root, str)
        or not os.path.isabs(repo_root)
        or not isinstance(desired, str)
        or not os.path.isabs(desired)
        or len(desired) > 4096
        or "\n" in desired
        or "\r" in desired
        or archive_args != ["/bin/bash", os.path.join(repo_root, "scripts", "ops", "news-archive.sh")]
    ):
        raise ContractError("archive service path contract is invalid")
    engine = secure_plist(sys.argv[2], allow_missing=True, allow_legacy_engine_comment=True)
    if engine is None:
        print(desired)
        raise SystemExit(10)
    engine_env = engine.get("EnvironmentVariables")
    if (
        engine.get("Label") != "com.nostradamus.engine"
        or not isinstance(engine_env, dict)
        or engine_env.get("ENGINE_REPO_ROOT") != repo_root
        or engine.get("WorkingDirectory") != os.path.join(repo_root, "ui", "server")
    ):
        raise ContractError("engine service identity is invalid")
    if engine_env.get("NEWS_ARCHIVE_DIR") == desired:
        raise SystemExit(0)
    print(desired)
    raise SystemExit(10)
except ContractError:
    raise SystemExit(20)
PYENGINEARCHIVE
}

reconcile_engine_archive_launchagent() {
  local installer="$PROD/scripts/ops/install-services.sh" desired_archive_dir="" contract_rc
  is_doer_host || return 0
  desired_archive_dir="$(engine_archive_contract)"
  contract_rc=$?
  if [ "$contract_rc" -eq 0 ]; then
    return 0
  fi
  if [ "$contract_rc" -ne 10 ] || [ -z "$desired_archive_dir" ]; then
    log "WARN engine archive reader reconciliation could not prove the installed archive/engine contract"
    return 1
  fi
  [ -f "$installer" ] && [ ! -L "$installer" ] \
    || { log "WARN engine archive reader installer is missing or unsafe"; return 1; }
  log "engine archive reader missing or drifted — reconciling only the engine service"
  if ! ENGINE_REPO_ROOT="$PROD" NEWS_ARCHIVE_DIR="$desired_archive_dir" NOSTRA_ROLE=doer \
      /bin/bash "$installer" --role doer --only engine >>"$LOG" 2>&1; then
    log "WARN engine archive reader service reconciliation failed"
    return 1
  fi
  if ! engine_archive_contract >/dev/null 2>&1; then
    log "WARN engine archive reader service did not retain the exact archive contract"
    return 1
  fi
  health_gate || { log "WARN engine became unhealthy after archive reader reconciliation"; return 1; }
  log "engine archive reader active on the retained Drive archive"
  return 0
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

# Continuously reconcile the local OmniRoute sidecar from reviewed source. A tracked plist by itself never
# updates ~/Library/LaunchAgents, and normal deploys intentionally do not rerun the full service installer.
# This narrow path pins/provisions one reviewed package version on both engine roles, proves the supervised
# loopback and production scorer contract, then enables the provider. The fingerprint makes healthy ticks
# no-ops; a template/contract/binary change or unloaded job re-enters the wait/retry/verification contract.
reconcile_omniroute_launchagent() {
  local label=com.nostradamus.omniroute
  local installer="$PROD/scripts/ops/install-services.sh"
  local template="$PROD/scripts/ops/$label.plist"
  local contract_helper="$PROD/scripts/ops/omniroute-service-contract.sh"
  local smoke="$PROD/scripts/ops/omniroute-smoke.sh"
  local env_setter="$PROD/scripts/ops/set-private-env.py"
  local installed="$HOME/Library/LaunchAgents/$label.plist"
  local marker="$OPS/.omniroute-launchagent-v1"
  local disabled_marker="$OPS/.omniroute-engine-disabled-v1"
  local retry_file="$OPS/.omniroute-retry"
  local providers_dir="${NOSTRA_ENGINE_CONFIG_DIR:-$HOME/.config/nostra-engine}"
  local providers_env="$providers_dir/providers.env"
  local omniroute_db="$HOME/.omniroute/storage.sqlite"
  local binary="" binary_probe="" contract_hash="" descriptor_probe="" role=admin desired="" service_pid=""
  local listener_pids="" retry_until="" now="" smoke_result="" smoke_status="" marker_staged=""
  local smoke_started="" required_model="" retry_seconds="${NOSTRA_OMNIROUTE_RETRY_SECS:-900}"
  local revalidate_seconds="${NOSTRA_OMNIROUTE_REVALIDATE_SECS:-21600}"

  if [ ! -f "$installer" ] || [ -L "$installer" ] || [ ! -f "$template" ] || [ -L "$template" ] \
      || [ ! -f "$contract_helper" ] || [ -L "$contract_helper" ] \
      || [ ! -f "$smoke" ] || [ -L "$smoke" ] \
      || [ ! -f "$env_setter" ] || [ -L "$env_setter" ]; then
    log "WARN omniroute-agent reconciliation source is missing or unsafe"
    return 1
  fi
  # shellcheck disable=SC1090
  source "$contract_helper"
  # Move only the retired managed default to the reviewed aggregate free route. The private helper is
  # atomic/fail-closed and deliberately preserves any other operator-owned model or combo unchanged.
  if ! "$PYTHON" -I "$env_setter" migrate-default-model --file "$providers_env" >/dev/null 2>&1; then
    log "WARN omniroute-agent could not safely migrate its managed model default"
    return 1
  fi
  case "$retry_seconds" in ''|*[!0-9]*) retry_seconds=900 ;; esac
  [ "$retry_seconds" -ge 300 ] 2>/dev/null || retry_seconds=300
  [ "$retry_seconds" -le 86400 ] 2>/dev/null || retry_seconds=86400
  case "$revalidate_seconds" in ''|*[!0-9]*) revalidate_seconds=21600 ;; esac
  [ "$revalidate_seconds" -ge 3600 ] 2>/dev/null || revalidate_seconds=3600
  [ "$revalidate_seconds" -le 86400 ] 2>/dev/null || revalidate_seconds=86400

  omniroute_flag_matches() {
    "$PYTHON" -I "$env_setter" matches --file "$providers_env" \
      --key NEWS_OMNIROUTE_ENABLED --value "$1" >/dev/null 2>&1
  }
  omniroute_set_flag() {
    "$PYTHON" -I "$env_setter" set --file "$providers_env" \
      --key NEWS_OMNIROUTE_ENABLED --value "$1" >/dev/null 2>&1
  }
  omniroute_descriptor_fingerprint() {
    "$PYTHON" -I "$env_setter" fingerprint --file "$providers_env" 2>/dev/null
  }
  omniroute_state_fingerprint() {
    "$PYTHON" -I "$env_setter" state-fingerprint --file "$providers_env" 2>/dev/null
  }
  omniroute_engine_pid() {
    launchctl list 2>/dev/null \
      | awk '$3 == "com.nostradamus.engine" && $1 ~ /^[0-9]+$/ { print $1; exit }'
  }
  omniroute_schedule_retry() {
    local reason="$1" retry_deadline retry_staged=""
    retry_deadline="$(( $(date +%s) + retry_seconds ))"
    retry_staged="$(mktemp "$OPS/.omniroute-retry.XXXXXX" 2>/dev/null || true)"
    if [ -n "$retry_staged" ] \
        && printf '%s %s\n' "$retry_deadline" "$reason" > "$retry_staged" 2>/dev/null \
        && chmod 600 "$retry_staged" 2>/dev/null \
        && mv "$retry_staged" "$retry_file" 2>/dev/null; then
      log "WARN omniroute-agent $reason; retry deferred ${retry_seconds}s"
      return 0
    fi
    [ -z "$retry_staged" ] || rm -f "$retry_staged" 2>/dev/null || true
    log "WARN omniroute-agent $reason; could not persist retry backoff"
    return 1
  }
  omniroute_disable() {
    local state_probe="" engine_pid="" proof="" staged=""
    # Exact zero plus a proof tied to this engine PID is the only no-restart path. Missing, duplicate, one,
    # changed descriptor, a prior failed kickstart, and an engine relaunch all re-enter the fail-closed restart.
    if ! omniroute_flag_matches 0; then
      if ! omniroute_set_flag 0; then
        # The setter is atomic, but a killed helper can make its observed outcome ambiguous. Reload whatever
        # durable state exists before returning failure; never leave the previously-running engine untouched.
        rm -f "$disabled_marker" 2>/dev/null || true
        launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" 2>>"$LOG" || true
        health_gate || true
        log "WARN omniroute-agent could not safely disable its private engine flag"
        return 1
      fi
    fi
    state_probe="$(omniroute_state_fingerprint 2>/dev/null || true)"
    engine_pid="$(omniroute_engine_pid)"
    proof="$state_probe:$engine_pid"
    if [ -n "$state_probe" ] && [ -n "$engine_pid" ] && [ -f "$disabled_marker" ] \
        && [ ! -L "$disabled_marker" ] && [ "$(cat "$disabled_marker" 2>/dev/null || true)" = "$proof" ] \
        && health_gate; then
      return 0
    fi
    rm -f "$disabled_marker" 2>/dev/null || true
    if ! launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" 2>>"$LOG" || ! health_gate; then
      log "WARN engine did not recover cleanly after disabling OmniRoute"
      return 1
    fi
    engine_pid="$(omniroute_engine_pid)"
    [ -n "$state_probe" ] && [ -n "$engine_pid" ] || return 1
    proof="$state_probe:$engine_pid"
    staged="$(mktemp "$OPS/.omniroute-disabled.XXXXXX" 2>/dev/null || true)"
    if [ -z "$staged" ] || ! printf '%s\n' "$proof" > "$staged" 2>/dev/null \
        || ! chmod 600 "$staged" 2>/dev/null || ! mv "$staged" "$disabled_marker" 2>/dev/null; then
      [ -z "$staged" ] || rm -f "$staged" 2>/dev/null || true
      return 1
    fi
    log "omniroute-agent disabled while its service contract is being repaired"
  }
  omniroute_revert_enable() {
    local reason="$1"
    if ! omniroute_set_flag 0; then
      log "ALERT omniroute-agent could not safely revert its private enable flag"
      omniroute_schedule_retry "${reason}-disable-failed"
      return 1
    fi
    rm -f "$disabled_marker" 2>/dev/null || true
    if ! omniroute_disable; then
      log "ALERT engine did not recover cleanly after reverting OmniRoute enable"
      omniroute_schedule_retry "${reason}-engine-recovery-failed"
      return 1
    fi
    omniroute_schedule_retry "$reason"
    return 1
  }
  omniroute_quiesce_unhealthy() {
    local i
    launchctl bootout "gui/$UID_NUM/$label" >/dev/null 2>&1 || true
    for i in 1 2 3 4 5 6 7 8; do
      loaded "$label" || return 0
      sleep 0.25
    done
    log "WARN omniroute-agent unhealthy launchd job could not be quiesced"
    return 1
  }
  omniroute_running_pid() {
    launchctl list 2>/dev/null \
      | awk -v wanted="$label" '$3 == wanted && $1 ~ /^[0-9]+$/ { print $1; exit }'
  }
  omniroute_listener_owned_by() {
    local owner="$1" candidate parent hop
    # `-iTCP:20128` alone also matches 0.0.0.0. Parse lsof's machine format and admit only the literal
    # 127.0.0.1 endpoint promised by the service contract.
    listener_pids="$(lsof -nP -Fpn -iTCP:20128 -sTCP:LISTEN 2>/dev/null \
      | awk '/^p[0-9]+$/{pid=substr($0,2)} $0 == "n127.0.0.1:20128" && pid != "" {print pid}' || true)"
    [ -n "$listener_pids" ] || return 1
    for candidate in $listener_pids; do
      parent="$candidate"
      for hop in 1 2 3 4 5 6 7 8; do
        [ "$parent" = "$owner" ] && return 0
        parent="$(ps -o ppid= -p "$parent" 2>/dev/null | awk '{print $1}')"
        [ -n "$parent" ] || break
      done
    done
    return 1
  }

  binary="$(command -v omniroute 2>/dev/null || true)"
  case "$binary" in /*) [ -x "$binary" ] || binary="" ;; *) binary="" ;; esac
  if [ -n "$binary" ]; then
    binary_probe="$(nostra_probe_omniroute_binary "$PYTHON" "$binary" 2>/dev/null || true)"
    [ -n "$binary_probe" ] || binary=""
  fi
  # Include every reviewed executable/config/parser surface used by the proof. Data-only commits do not
  # invalidate this digest, but any scorer-contract change forces one new two-pass 12-row proof before re-enable.
  contract_hash="$("$PYTHON" -I - \
      "$template" "$contract_helper" "$smoke" "$env_setter" "$PROD/scripts/ops/omniroute-smoke.ts" \
      "$PROD/ui/server/src/config.ts" "$PROD/ui/server/src/news/triage/groq.ts" 2>/dev/null <<'PYOMNICONTRACT'
import hashlib
import os
import stat
import sys

digest = hashlib.sha256()
try:
    for path in sys.argv[1:]:
        info = os.lstat(path)
        if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode):
            raise OSError
        with open(path, "rb") as handle:
            digest.update(handle.read())
        digest.update(b"\0")
    print(digest.hexdigest())
except OSError:
    raise SystemExit(1)
PYOMNICONTRACT
)" || contract_hash=""
  [ -n "$contract_hash" ] || { log "WARN omniroute-agent could not fingerprint its reviewed contract"; return 1; }
  descriptor_probe="$(omniroute_descriptor_fingerprint 2>/dev/null || true)"
  if [ -n "$descriptor_probe" ] && [ -n "$binary" ]; then
    desired="$contract_hash:$descriptor_probe:$binary:$binary_probe"
  fi

  # Healthy ticks avoid the large /v1/models catalog and the 12-row scorer request, but still execute the
  # pinned-version probe, revalidate binary/plist identity, and require the launchd-descended listener plus
  # OmniRoute's cheap exact /healthz response. A crashed or hijacked :20128 can never stay marked enabled.
  service_pid="$(omniroute_running_pid)"
  if [ -n "$desired" ] \
      && nostra_omniroute_marker_fresh "$PYTHON" "$marker" "$desired" "$revalidate_seconds" \
      && [ -n "$service_pid" ] \
      && nostra_validate_omniroute_plist "$PYTHON" "$installed" "$binary" \
      && omniroute_flag_matches 1 \
      && "$PYTHON" -I "$env_setter" no-log-key-healthy --file "$providers_env" \
        --database "$omniroute_db" >/dev/null 2>&1 \
      && omniroute_listener_owned_by "$service_pid" \
      && nostra_omniroute_healthz_healthy "$PYTHON" \
      && omniroute_listener_owned_by "$service_pid" \
      && [ "$(omniroute_running_pid)" = "$service_pid" ]; then
    return 0
  fi

  # A previously enabled route must be switched off before package/service repair. Never leave the engine
  # sending work to a known-mismatched or dead local gateway.
  if ! omniroute_disable; then
    omniroute_schedule_retry private-env-disable-failed
    return 1
  fi
  if [ -z "$descriptor_probe" ]; then
    omniroute_schedule_retry effective-descriptor-invalid
    return 1
  fi
  is_doer_host && role=doer
  # A missing/wrong executable must not leave an already-installed KeepAlive job crash-looping during the
  # package retry window. Use the executable-gated narrow installer to verify unload + stale-plist removal.
  if [ -z "$binary" ] \
      && { [ -e "$installed" ] || [ -L "$installed" ] || loaded "$label"; }; then
    if ! ENGINE_REPO_ROOT="$PROD" /bin/bash "$installer" \
        --role "$role" --only omniroute >>"$LOG" 2>&1; then
      omniroute_schedule_retry stale-service-removal-failed
      return 1
    fi
  fi
  now="$(date +%s)"
  retry_until="$(awk 'NR == 1 && $1 ~ /^[0-9]+$/ {print $1}' "$retry_file" 2>/dev/null || true)"
  if [ -n "$retry_until" ] && [ "$now" -lt "$retry_until" ]; then
    return 0
  fi

  # Self-provision the one reviewed CLI version. Output is discarded so npm cannot echo ambient details;
  # the post-install executable probe, not npm's exit code, is authoritative.
  if [ -z "$binary" ]; then
    log "omniroute-agent provisioning exact package omniroute@$NOSTRA_OMNIROUTE_REQUIRED_VERSION"
    if ! "$PYTHON" -I - "$NPM" "omniroute@$NOSTRA_OMNIROUTE_REQUIRED_VERSION" <<'PYOMNIINSTALL'
import subprocess
import sys

npm, package = sys.argv[1:]
try:
    result = subprocess.run(
        [npm, "install", "--global", package], stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=600, check=False,
    )
    raise SystemExit(0 if result.returncode == 0 else 1)
except (OSError, subprocess.SubprocessError):
    raise SystemExit(1)
PYOMNIINSTALL
    then
      omniroute_schedule_retry package-provision-failed
      return 1
    fi
    hash -r
    binary="$(command -v omniroute 2>/dev/null || true)"
    case "$binary" in /*) [ -x "$binary" ] || binary="" ;; *) binary="" ;; esac
    binary_probe="$(nostra_probe_omniroute_binary "$PYTHON" "$binary" 2>/dev/null || true)"
    if [ -z "$binary" ] || [ -z "$binary_probe" ]; then
      omniroute_schedule_retry installed-package-failed-version-proof
      return 1
    fi
    desired="$contract_hash:$descriptor_probe:$binary:$binary_probe"
  fi

  log "omniroute-agent reconciliation: role=$role version=$NOSTRA_OMNIROUTE_REQUIRED_VERSION"
  if ! ENGINE_REPO_ROOT="$PROD" /bin/bash "$installer" --role "$role" --only omniroute >>"$LOG" 2>&1; then
    omniroute_schedule_retry service-install-failed
    return 1
  fi
  # Re-probe after the installer to close a package-replacement race and validate the exact installed plist.
  if [ "$(nostra_probe_omniroute_binary "$PYTHON" "$binary" 2>/dev/null || true)" != "$binary_probe" ] \
      || ! nostra_validate_omniroute_plist "$PYTHON" "$installed" "$binary"; then
    omniroute_schedule_retry post-install-contract-failed
    return 1
  fi

  # Do not confuse a loaded label or a different process occupying :20128 with a healthy supervised router.
  # First establish the exact launchd-owned listener. The authenticated catalog probe follows only after the
  # private no-log client key is present, so no dummy/public management credential is ever needed.
  service_pid=""
  for _wait in 1 2 3 4 5 6; do
    service_pid="$(omniroute_running_pid)"
    if [ -n "$service_pid" ] \
        && omniroute_listener_owned_by "$service_pid" \
        && nostra_omniroute_healthz_healthy "$PYTHON" \
        && omniroute_listener_owned_by "$service_pid" \
        && [ "$(omniroute_running_pid)" = "$service_pid" ]; then
      break
    fi
    service_pid=""
    sleep 1
  done
  if [ -z "$service_pid" ]; then
    omniroute_quiesce_unhealthy || true
    omniroute_schedule_retry loopback-service-health-failed
    return 1
  fi

  # OmniRoute stores bodies by default. Provision/adopt one database-backed key with no_log=1 and write only
  # that raw key + id into the engine's owner-only providers file. The helper never prints either value and
  # tightens the sidecar data directory/database permissions before touching them.
  if ! "$PYTHON" -I "$env_setter" ensure-no-log-key --file "$providers_env" \
      --database "$omniroute_db" >/dev/null 2>&1; then
    omniroute_schedule_retry no-log-client-key-provision-failed
    return 1
  fi
  descriptor_probe="$(omniroute_descriptor_fingerprint 2>/dev/null || true)"
  required_model="$("$PYTHON" -I "$env_setter" model --file "$providers_env" 2>/dev/null || true)"
  if [ -z "$descriptor_probe" ] || [ -z "$required_model" ]; then
    omniroute_schedule_retry effective-descriptor-invalid
    return 1
  fi
  desired="$contract_hash:$descriptor_probe:$binary:$binary_probe"
  if ! nostra_omniroute_models_healthy "$PYTHON" "$required_model" 20128 "$providers_env" \
      || ! omniroute_listener_owned_by "$service_pid" \
      || [ "$(omniroute_running_pid)" != "$service_pid" ]; then
    omniroute_schedule_retry authenticated-model-catalog-failed
    return 1
  fi

  # The expensive, real proof: two consecutive complete production-size batches through the production
  # descriptor/prompt/parser. One lucky free-model response is not enough to activate or renew the marker.
  # The shared runner publishes only a tiny sanitized verdict and bounds each call at the 105-second ops cap.
  smoke_started="$("$PYTHON" -I -c 'import datetime as d; print(d.datetime.now(d.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"))')"
  smoke_result="$(mktemp "$OPS/.omniroute-smoke.XXXXXX")" || return 1
  chmod 600 "$smoke_result" 2>/dev/null || true
  if ! nostra_run_omniroute_smoke_pair "$PYTHON" "$smoke" "$smoke_result" 105; then
    smoke_status="$("$PYTHON" -I - "$smoke_result" <<'PYOMNISTATUS'
import json, sys
try:
    value = json.loads(open(sys.argv[1], encoding="utf-8").read())
    status = value.get("httpStatus")
    print(status if isinstance(status, int) and 100 <= status <= 599 else "failed")
except Exception:
    print("failed")
PYOMNISTATUS
)"
    rm -f "$smoke_result" 2>/dev/null || true
    omniroute_schedule_retry "scorer-smoke-${smoke_status}"
    return 1
  fi
  if ! "$PYTHON" -I - "$smoke_result" <<'PYOMNIVERIFY'
import json, sys
try:
    value = json.loads(open(sys.argv[1], encoding="utf-8").read())
    if (value.get("ok") is not True or value.get("rows") != 12
            or value.get("expectedRows") != 12 or value.get("passes") != 2):
        raise ValueError
except Exception:
    raise SystemExit(1)
PYOMNIVERIFY
  then
    rm -f "$smoke_result" 2>/dev/null || true
    omniroute_schedule_retry scorer-smoke-contract-failed
    return 1
  fi
  rm -f "$smoke_result" 2>/dev/null || true

  # The successful pair itself is the end-to-end privacy proof: every new call-log row for this key must be
  # metadata-only, with no request/response/pipeline artifact and no legacy detailed-log row.
  if ! "$PYTHON" -I "$env_setter" verify-no-body-log --file "$providers_env" \
      --database "$omniroute_db" --after "$smoke_started" >/dev/null 2>&1; then
    omniroute_schedule_retry scorer-body-persistence-proof-failed
    return 1
  fi

  if [ "$(omniroute_running_pid)" != "$service_pid" ] \
      || ! omniroute_listener_owned_by "$service_pid" \
      || ! nostra_omniroute_healthz_healthy "$PYTHON" \
      || [ "$(omniroute_running_pid)" != "$service_pid" ]; then
    omniroute_schedule_retry service-changed-during-scorer-smoke
    return 1
  fi
  if [ "$(omniroute_descriptor_fingerprint 2>/dev/null || true)" != "$descriptor_probe" ] \
      || ! "$PYTHON" -I "$env_setter" no-log-key-healthy --file "$providers_env" \
        --database "$omniroute_db" >/dev/null 2>&1; then
    omniroute_schedule_retry descriptor-changed-during-scorer-smoke
    return 1
  fi

  # Stage the non-secret health marker before enabling. It is published only after the restarted engine is
  # healthy; if either publication fails, revert the flag so no unproven route survives the transaction.
  marker_staged="$(mktemp "$OPS/.omniroute-marker.XXXXXX" 2>/dev/null || true)"
  if [ -z "$marker_staged" ] || ! printf '%s\n%s\n' "$desired" "$(date +%s)" > "$marker_staged" 2>/dev/null \
      || ! chmod 600 "$marker_staged" 2>/dev/null; then
    [ -z "$marker_staged" ] || rm -f "$marker_staged" 2>/dev/null || true
    omniroute_schedule_retry health-marker-stage-failed
    return 1
  fi
  if ! omniroute_set_flag 1; then
    rm -f "$marker_staged" 2>/dev/null || true
    omniroute_revert_enable private-env-enable-failed
    return 1
  fi
  rm -f "$disabled_marker" 2>/dev/null || true
  if ! launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" 2>>"$LOG" || ! health_gate; then
    rm -f "$marker_staged" 2>/dev/null || true
    omniroute_revert_enable engine-health-failed-after-enable
    return 1
  fi
  if [ "$(omniroute_running_pid)" != "$service_pid" ] \
      || ! omniroute_listener_owned_by "$service_pid" \
      || ! nostra_omniroute_healthz_healthy "$PYTHON" \
      || [ "$(omniroute_running_pid)" != "$service_pid" ]; then
    rm -f "$marker_staged" 2>/dev/null || true
    omniroute_revert_enable service-health-failed-after-enable
    return 1
  fi
  if ! mv "$marker_staged" "$marker" 2>/dev/null \
      || ! nostra_omniroute_marker_fresh "$PYTHON" "$marker" "$desired" "$revalidate_seconds"; then
    rm -f "$marker_staged" 2>/dev/null || true
    omniroute_revert_enable health-marker-publish-failed
    return 1
  fi
  rm -f "$retry_file" 2>/dev/null || true
  log "omniroute-agent active: exact $NOSTRA_OMNIROUTE_REQUIRED_VERSION; two 12-row scorers proven; no-body key proven; engine healthy"
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

# A §28 DATA path — the only paths commit-run.sh admits into the autonomous publication lane. Anything
# else is reviewed code/prompt/ops state and must retain the provider lifecycle barrier.
is_data_path() { case "$1" in analyses/*|screener/*|commodity/*|watchlist/*) return 0 ;; *) return 1 ;; esac; }

# provider_barrier_delta_required <base> <target> — rc 0 when a provider admission barrier is required.
# A proven ancestor delta containing only autonomous research data is inert to the running program and must
# not show an "engine updating" banner or block new runs. Missing objects, rewritten history, malformed paths,
# and every code/prompt/ops path fail closed to the barrier. NUL-delimited enumeration keeps unusual names
# from changing classification.
provider_barrier_delta_required() {
  local base="${1:-}" target="${2:-}" paths classification
  valid_git_sha "$base" && valid_git_sha "$target" || return 0
  "$GIT" cat-file -e "$base^{commit}" 2>/dev/null || return 0
  "$GIT" cat-file -e "$target^{commit}" 2>/dev/null || return 0
  "$GIT" merge-base --is-ancestor "$base" "$target" 2>/dev/null || return 0
  paths="$(mktemp "$OPS/.provider-delta.XXXXXX")" || return 0
  if ! "$GIT" diff --name-only -z "$base" "$target" > "$paths" 2>/dev/null; then
    rm -f "$paths" 2>/dev/null || true
    return 0
  fi
  if ! classification="$($PYTHON -I - "$paths" <<'PYPROVIDERDELTA'
import sys

raw = open(sys.argv[1], "rb").read()
parts = raw.split(b"\0")
if parts and parts[-1] == b"": parts.pop()
if not parts:
    print("none")
    raise SystemExit
allowed = ("analyses/", "screener/", "commodity/", "watchlist/")
for encoded in parts:
    try: path = encoded.decode("utf-8", "strict")
    except UnicodeError:
        print("barrier")
        raise SystemExit
    if not path.startswith(allowed):
        print("barrier")
        raise SystemExit
print("data")
PYPROVIDERDELTA
)"; then
    rm -f "$paths" 2>/dev/null || true
    return 0
  fi
  rm -f "$paths" 2>/dev/null || true
  case "$classification" in
    none|data) return 1 ;;
    *) return 0 ;;
  esac
}

# deploy_authorization_allows <target> — print the exact reviewed commit and return 0 only when an
# owner-issued, unexpired receipt proves that <target>'s complete non-data program is byte-for-byte the
# approved program. The target may have moved past the approved commit only through autonomous research
# data commits. Missing helpers/receipts, stale receipts, rewritten history, malformed JSON, and later code
# all fail closed. Nothing sensitive is stored in the receipt.
deploy_authorization_allows() {
  local target="${1:-}" output approved
  valid_git_sha "$target" || return 1
  [ -f "$DEPLOY_AUTHORIZATION_HELPER" ] && [ ! -L "$DEPLOY_AUTHORIZATION_HELPER" ] \
    || return 1
  output="$($PYTHON -I "$DEPLOY_AUTHORIZATION_HELPER" check \
    --repo "$PROD" --state-dir "$DEPLOY_AUTHORIZATION_DIR" --target "$target" 2>/dev/null)" \
    || return 1
  approved="$(printf '%s\n' "$output" | awk -F= '/^AUTHORIZED_COMMIT=/{print $2; exit}')"
  valid_git_sha "$approved" || return 1
  printf '%s\n' "$approved"
}

consume_deploy_authorization() {
  local target="${1:-}" approved="${2:-}"
  valid_git_sha "$target" && valid_git_sha "$approved" || return 1
  "$PYTHON" -I "$DEPLOY_AUTHORIZATION_HELPER" consume \
    --repo "$PROD" --state-dir "$DEPLOY_AUTHORIZATION_DIR" \
    --target "$target" --approved-commit "$approved" >/dev/null 2>&1
}

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
        if not value.startswith(("analyses/", "screener/", "commodity/", "watchlist/")):
            raise SystemExit(0)
    index += 1
raise SystemExit(1)
PYDIRTY
  local rc=$?
  rm -f "$staged" 2>/dev/null || true
  [ "$rc" -eq 0 ]
}

# Codex Desktop can import project-local Claude agents into `.codex/agents/*.toml`. Production must never
# be one of those writable project targets: the generated files are not reviewed Git objects, so the normal
# non-data dirty gate correctly blocks them. Keep this detector read-only and path-exact. It does not delete,
# move, allowlist, or otherwise weaken the dirty gate; it only turns a generic refusal into an actionable
# alert. If a future reviewed commit intentionally tracks one of these paths, it is no longer contamination.
has_untracked_codex_import() {
  local path
  for path in \
    .codex/agents/memo-writer.toml \
    .codex/agents/module-memo-writer.toml \
    .codex/agents/provider-parity-adjudicator.toml
  do
    if { [ -e "$path" ] || [ -L "$path" ]; } \
        && ! "$GIT" ls-files --error-unmatch -- "$path" >/dev/null 2>&1; then
      return 0
    fi
  done
  return 1
}

log_codex_import_blocker() {
  has_untracked_codex_import || return 0
  log "CAUSE Codex external-agent import recreated an untracked .codex/agents helper in production — disable external-agent-import-sync; the §28 dirty gate remains closed"
}

# Narrow portable test hook: returns 0 when deployment must be blocked and 1
# only when every dirty old/new path is inside the append-only data roots.
if [ "${1:-}" = --check-dirty ]; then
  cd "$PROD" 2>/dev/null || exit 0
  has_nondata_dirty
  exit $?
elif [ "${1:-}" = --check-codex-import-contamination ]; then
  cd "$PROD" 2>/dev/null || exit 1
  has_untracked_codex_import
  exit $?
elif [ "${1:-}" = --check-engine-archive ]; then
  engine_archive_contract
  exit $?
elif [ "${1:-}" = --check-provider-barrier-delta ] && [ "$#" -eq 3 ]; then
  cd "$PROD" 2>/dev/null || exit 0
  provider_barrier_delta_required "$2" "$3"
  exit $?
elif [ "${1:-}" = --check-deploy-authorization ] && [ "$#" -eq 2 ]; then
  cd "$PROD" 2>/dev/null || exit 1
  deploy_authorization_allows "$2" >/dev/null
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
  for opsscript in watchdog.sh deploy.sh deploy-authorization.py housekeeping.sh connector-supervisor.py; do
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
    if [ "$(cat "$MARK" 2>/dev/null || true)" = "$target" ]; then
      write_deploy_success "$target" || log "  WARN could not persist healthy deployment receipt"
      rm -f "$FAILMARK" 2>/dev/null || true
    fi
  else
    printf '%s %s\n' "$target" "$(date +%s)" > "$FAILMARK.tmp" 2>/dev/null && mv "$FAILMARK.tmp" "$FAILMARK" 2>/dev/null || true
  fi
}

# Keep the extractor's managed Python environment aligned with its reviewed requirements. This function is
# reached only after deploy owns the exclusive provider lifecycle barrier, so no admitted research process
# can be using the venv while it is repaired. setup-tools' import probe is instant when the environment is
# healthy; its bounded pip fallback runs only when a dependency is actually missing. A failure never
# restarts the engine or advances the release marker, and FAILMARK prevents a package-index outage from
# hammering production every watcher tick.
reconcile_extractor_python_deps() {
  local target="$1"
  # Older/minimal installations (and deploy contract fixtures) do not carry the Chain parser. There is no
  # extractor dependency contract to reconcile until that reviewed tool exists in the checkout.
  [ -f "$PROD/.claude/tools/relationship_graph.py" ] || return 0
  log "  verify extractor python deps"
  if ( cd "$PROD" && .claude/tools/setup-tools.sh --python-only ) >>"$LOG" 2>&1; then
    rm -f "$FAILMARK" 2>/dev/null || true
    return 0
  fi
  printf '%s %s\n' "$target" "$(date +%s)" > "$FAILMARK.tmp" 2>/dev/null \
    && mv "$FAILMARK.tmp" "$FAILMARK" 2>/dev/null || true
  log "  WARN extractor python dependency repair failed — engine stays live; no restart or marker advance"
  return 1
}

# Read-only preflight used before the provider barrier. When the managed venv is stale, publish deploy
# intent even if source/marker SHAs already match (for example, the first tick after an older deploy.sh
# fast-forwarded the commit that introduced this repair). Existing runs drain normally; later admissions
# yield until the exclusive repair has had one chance to run.
extractor_python_deps_ready() {
  local py="$PROD/.claude/tools/.venv/bin/python"
  [ -f "$PROD/.claude/tools/relationship_graph.py" ] || return 0
  [ -x "$py" ] || return 1
  "$py" -I - <<'PYEXTRACTORREADY' >/dev/null 2>&1
import openpyxl
import pypdf
import xlrd
from striprtf.striprtf import rtf_to_text
PYEXTRACTORREADY
}
CLEAR_DEPLOY_INTENT_ON_EXIT=0
deploy_cleanup() {
  gitlock_release
  [ "$CLEAR_DEPLOY_INTENT_ON_EXIT" = 1 ] && clear_deploy_intent
  exec 8>&-
}
trap deploy_cleanup EXIT

cd "$PROD" 2>/dev/null || { log "FATAL cannot cd $PROD"; exit 0; }

# ---- provider-neutral run/deploy barrier -----------------------------------------------------------
# Every admitted Claude/Codex run and every scanner/Ideas lifecycle holds a SHARED flock on this stable
# inode; a whole chained run keeps one across the child-transition/capacity gaps too. Deployment takes the
# EXCLUSIVE side before touching the checkout, dependencies, feature flags, or launchctl. This is an atomic
# kernel boundary, not a status
# poll: a run cannot enter after a "no active runs" check but before kickstart. Busy means defer the entire
# deploy unchanged until the run ends. Unexpected path/ownership state also fails closed.
case "$RUN_BARRIER_DIR" in /*) ;; *) log "WARN provider deploy barrier requires an absolute state directory"; exit 0 ;; esac
if [ -e "$RUN_BARRIER_DIR" ] || [ -L "$RUN_BARRIER_DIR" ]; then
  if [ -L "$RUN_BARRIER_DIR" ] || [ ! -d "$RUN_BARRIER_DIR" ] || [ ! -O "$RUN_BARRIER_DIR" ]; then
    log "WARN unsafe provider deploy barrier directory — refusing deployment"
    exit 0
  fi
else
  mkdir -p "$RUN_BARRIER_DIR" 2>/dev/null || { log "WARN cannot create provider deploy barrier directory"; exit 0; }
fi
chmod 700 "$RUN_BARRIER_DIR" 2>/dev/null || { log "WARN cannot protect provider deploy barrier directory"; exit 0; }

# Writer priority. Fetching updates only the remote-tracking ref and is serialized with data publication; it
# never changes the production checkout or running process. We need the actual target object before pausing
# admissions so an unmerged or merely merged code PR cannot manufacture an "engine updating" incident.
# Only a valid exact-program deployment receipt may publish writer intent for a non-data delta. Autonomous
# data-only deltas retain their ordinary publication lane and require no production authorization.
if ! gitlock_acquire; then
  log "SKIP repository mutation in progress before deploy authorization preflight"
  exit 0
fi
if ! "$GIT" fetch --quiet origin main 2>"$OPS/.fetch.err"; then
  gitlock_release
  log "WARN git fetch failed before deploy authorization preflight: $(tail -1 "$OPS/.fetch.err" 2>/dev/null)"
  exit 0
fi
gitlock_release
CURRENT_BRANCH_HINT="$("$GIT" symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
LOCAL_HINT="$("$GIT" rev-parse HEAD 2>/dev/null || true)"
MARKER_HINT="$(cat "$MARK" 2>/dev/null || true)"
REMOTE_HINT="$("$GIT" rev-parse origin/main 2>/dev/null || true)"
HINT_AUTHORIZED_COMMIT=""
if [ "$CURRENT_BRANCH_HINT" != main ]; then
  clear_deploy_intent
elif valid_git_sha "$REMOTE_HINT" && valid_git_sha "$LOCAL_HINT"; then
  intent_needed=0 authorization_required=0
  if [ "$REMOTE_HINT" != "$LOCAL_HINT" ] \
      && provider_barrier_delta_required "$LOCAL_HINT" "$REMOTE_HINT"; then
    authorization_required=1
  fi
  if [ "$MARKER_HINT" != "$LOCAL_HINT" ]; then
    if ! valid_git_sha "$MARKER_HINT" \
        || provider_barrier_delta_required "$MARKER_HINT" "$LOCAL_HINT"; then
      authorization_required=1
    fi
  fi
  if [ "$authorization_required" = 1 ]; then
    if HINT_AUTHORIZED_COMMIT="$(deploy_authorization_allows "$REMOTE_HINT")"; then
      intent_needed=1
    else
      clear_deploy_intent
      log "BLOCKED production program differs from deployed state but no valid exact-program deployment authorization exists for ${REMOTE_HINT:0:9}"
      exit 0
    fi
  fi
  # Dependency drift has its own health signal: an old deploy process may have advanced both checkout and
  # marker before the newly-reviewed deploy code could run. Keep writer priority until the venv is healthy.
  if [ "$intent_needed" = 0 ] && ! extractor_python_deps_ready; then
    intent_needed=1
  fi
  # A known broken target is deliberately held on last-good during FAIL_BACKOFF. It cannot make progress by
  # pausing the scanner, so do not publish writer intent for that terminal release state.
  if [ "$intent_needed" = 1 ] && [ -f "$FAILMARK" ]; then
    read -r _hint_failed_sha _hint_failed_at < "$FAILMARK" 2>/dev/null || true
    case "${_hint_failed_at:-}" in
      ''|*[!0-9]*) ;;
      *)
        if [ "${_hint_failed_sha:-}" = "$REMOTE_HINT" ] \
            && [ "$(( $(date +%s) - _hint_failed_at ))" -lt "$FAIL_BACKOFF" ]; then
          intent_needed=0
        fi ;;
    esac
  fi
  # A dirty code/ops path is a terminal preflight blocker, not an in-progress deployment. Check it before
  # publishing writer intent so the healthy cockpit stays available and never claims an update is being
  # installed when the deployer already knows it must refuse. The same check remains under the final
  # repository lease below as the race-closing enforcement gate.
  if [ "$intent_needed" = 1 ] && has_nondata_dirty; then
    clear_deploy_intent
    log_codex_import_blocker
    log "BLOCKED reviewed deployment ${REMOTE_HINT:0:9} before admission pause — production checkout has a dirty non-data (code/ops) path (§28)"
    exit 0
  fi
  if [ "$intent_needed" = 1 ]; then
    set_deploy_intent "$REMOTE_HINT" \
      || log "WARN could not publish provider deploy intent — this tick still attempts the lifecycle lock"
  else
    clear_deploy_intent
  fi
fi
[ ! -L "$RUN_BARRIER_LOCK" ] || { log "WARN unsafe provider deploy barrier lock"; exit 0; }
exec 10>>"$RUN_BARRIER_LOCK" || { log "WARN cannot open provider deploy barrier lock"; exit 0; }
"$PYTHON" -I - "$RUN_BARRIER_LOCK" 10<&10 <<'PYRUNBARRIER'
import fcntl
import os
import stat
import sys

try:
    opened = os.fstat(10); named = os.lstat(sys.argv[1])
    if (not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.getuid()
            or opened.st_nlink != 1 or stat.S_ISLNK(named.st_mode)
            or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
    os.fchmod(10, 0o600)
    try:
        fcntl.flock(10, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        raise SystemExit(3)
    locked = os.fstat(10); named = os.lstat(sys.argv[1])
    if (locked.st_uid != os.getuid() or locked.st_nlink != 1 or locked.st_mode & 0o077
            or (locked.st_dev, locked.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
except OSError:
    raise SystemExit(4)
PYRUNBARRIER
barrier_rc=$?
if [ "$barrier_rc" -ne 0 ]; then
  exec 10>&-
  if [ "$barrier_rc" -eq 3 ]; then
    if [ -e "$DEPLOY_INTENT" ] || [ -L "$DEPLOY_INTENT" ]; then
      log "DEFER current cockpit lifecycle is draining for pending main — new provider admissions remain paused"
    else
      log "DEFER active cockpit run owns the provider deploy barrier — checkout and engine left unchanged"
    fi
  else
    log "WARN provider deploy barrier could not be proven safe — refusing deployment"
  fi
  exit 0
fi
# This invocation now owns the exclusive lifecycle boundary. Clear writer intent on every later exit—success,
# reviewed rollback, or failure—so a broken release cannot freeze scanning. The exclusive descriptor itself
# continues to exclude new runs until this process exits.
CLEAR_DEPLOY_INTENT_ON_EXIT=1

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
AUTHORIZED_CODE_COMMIT=""
authorization_required=0
if [ "$LOCAL" != "$REMOTE" ] && provider_barrier_delta_required "$LOCAL" "$REMOTE"; then
  authorization_required=1
fi
if [ "$MARKER" != "$REMOTE" ]; then
  if ! valid_git_sha "$MARKER" || provider_barrier_delta_required "$MARKER" "$REMOTE"; then
    authorization_required=1
  fi
fi
if [ "$authorization_required" = 1 ]; then
  if ! AUTHORIZED_CODE_COMMIT="$(deploy_authorization_allows "$REMOTE")"; then
    log "BLOCKED fetched production program differs from deployed state but exact-program authorization is absent, stale, or mismatched for ${REMOTE:0:9}"
    exit 0
  fi
  if [ -n "$HINT_AUTHORIZED_COMMIT" ] && [ "$HINT_AUTHORIZED_COMMIT" != "$AUTHORIZED_CODE_COMMIT" ]; then
    log "BLOCKED deployment authorization changed between preflight and locked verification"
    exit 0
  fi
fi

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
    log_codex_import_blocker
    log "SKIP service reconciliation because a dirty non-data (code/ops) file is present (§28)"
    exit 0
  fi
  if ! reconcile_engine_archive_launchagent; then
    log "WARN engine archive reader remains unreconciled — leaving the deployed marker unchanged for retry"
    exit 0
  fi
  if ! migrate_connector_launchagent_v2; then
    log "WARN connector-agent reconciliation failed — leaving the deployed marker unchanged for retry"
    exit 0
  fi
  reconcile_omniroute_launchagent \
    || log "WARN omniroute-agent remains unreconciled; optional sidecar will retry next deploy tick"
  dependency_repair_needed=0
  extractor_python_deps_ready || dependency_repair_needed=1
  if ! reconcile_extractor_python_deps "$LOCAL"; then
    log "WARN extractor dependencies remain unreconciled — leaving the deployed marker unchanged for retry"
    exit 0
  fi
  # The checkout is level with origin/main — but that does NOT mean the BUILT artifacts are current.
  # The engine commits research data into THIS worktree and, when origin has moved, rebases onto
  # origin/main before pushing (scripts/commit-run.sh) — which pulls freshly MERGED CODE into the checkout
  # without deploy.sh ever running its fast-forward path. So a code PR can land in the working tree while
  # the old ui/dist is still being served. Reconcile against the deployed marker, not against origin.
  if [ "$MARKER" = "$LOCAL" ]; then
    if [ "$dependency_repair_needed" = 1 ]; then
      write_deploy_success "$LOCAL" || log "  WARN could not persist healthy dependency-repair receipt"
    fi
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
    log_codex_import_blocker
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
  if [ -n "$AUTHORIZED_CODE_COMMIT" ] && [ "$(cat "$MARK" 2>/dev/null || true)" = "$target" ]; then
    consume_deploy_authorization "$target" "$AUTHORIZED_CODE_COMMIT" \
      && log "  consumed one-shot deployment authorization for ${AUTHORIZED_CODE_COMMIT:0:9}" \
      || log "  WARN deployed program is healthy but its one-shot authorization receipt could not be consumed"
  fi
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
  log_codex_import_blocker
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
if ! reconcile_engine_archive_launchagent; then
  log "WARN engine archive reader reconciliation failed after fast-forward — leaving the deployed marker unchanged for retry"
  exit 0
fi
if ! migrate_connector_launchagent_v2; then
  log "WARN connector-agent reconciliation failed after fast-forward — leaving the deployed marker unchanged for retry"
  exit 0
fi
reconcile_omniroute_launchagent \
  || log "WARN omniroute-agent remains unreconciled after fast-forward; optional sidecar will retry next deploy tick"
if ! reconcile_extractor_python_deps "$REMOTE"; then
  log "WARN extractor dependency reconciliation failed after fast-forward — leaving the deployed marker unchanged for retry"
  exit 0
fi

# Rebuild from the DEPLOYED marker (not merely from the old LOCAL) so any pre-existing dist staleness heals
# in the same pass; fall back to LOCAL when there is no usable marker.
build_base="$LOCAL"
[ -n "$MARKER" ] && "$GIT" merge-base --is-ancestor "$MARKER" "$REMOTE" 2>/dev/null && build_base="$MARKER"
CHANGED="$("$GIT" diff --name-only "$build_base" "$REMOTE" 2>/dev/null)"
reconcile_build "$CHANGED" "$REMOTE"
if [ -n "$AUTHORIZED_CODE_COMMIT" ] && [ "$(cat "$MARK" 2>/dev/null || true)" = "$REMOTE" ]; then
  consume_deploy_authorization "$REMOTE" "$AUTHORIZED_CODE_COMMIT" \
    && log "  consumed one-shot deployment authorization for ${AUTHORIZED_CODE_COMMIT:0:9}" \
    || log "  WARN deployed program is healthy but its one-shot authorization receipt could not be consumed"
fi
gitlock_release
log "DONE ${REMOTE:0:9}"
exit 0
