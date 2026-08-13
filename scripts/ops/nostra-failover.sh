#!/usr/bin/env bash
# nostra-failover.sh — best-effort automatic failover for the STANDBY node.
#
# Runs every 60s via launchd (com.nostradamus.failover). Watches the shared Cloudflare tunnel;
# if the PRIMARY has been GLOBALLY invisible for K consecutive minutes, it brings this node's
# services up (via install-services.sh) to take over serving app.nostra-demus.com, and stands
# back down the moment the primary reappears. Normal state: dormant — only this monitor runs.
#
# SAFETY — the whole job is to NEVER split-brain (two nodes serving + both committing to main):
#   • FAIL-SAFE: "primary is down" is decided ONLY from Cloudflare's global connector list, and
#     ONLY when the query provably reached Cloudflare (the reply carries the tunnel's ID line).
#     If the query didn't reach Cloudflare (THIS node's internet is down), it does NOTHING —
#     it never takes over on the basis of its own connectivity problems.
#   • HYSTERESIS: the primary must be absent for K FULL minutes (default 10) — longer than any
#     reboot or KeepAlive restart. One reappearance resets the clock.
#   • AUTO-STANDDOWN: as soon as a second connector (the returning primary) appears, this node
#     releases within ~60s. Overlap is bounded to one tick.
#
# LIMITATION: launchd timers don't fire while the Mac is asleep. This node fails over only while
# AWAKE and ONLINE. For true 24/7 failover use an always-on standby, not a laptop.
#
# TEST SAFELY: NOSTRA_FAILOVER_DRYRUN=1 makes activate/standdown LOG what they would do, no exec.
# Pure decision is unit-testable:  nostra-failover.sh --decide <yes|no> <conns> <counter>
#
# Tunables (plist env): NOSTRA_FAILOVER_MINUTES (default 10), NOSTRA_TUNNEL, NOSTRA_FAILOVER_DRYRUN.

set -uo pipefail   # NOT -e: a monitor must never die mid-tick
TUNNEL="${NOSTRA_TUNNEL:-nostradamus-engine}"
K="${NOSTRA_FAILOVER_MINUTES:-10}"
DRYRUN="${NOSTRA_FAILOVER_DRYRUN:-0}"
PROD="${ENGINE_REPO_ROOT:-$HOME/nostra-prod}"
NEWS_ARCHIVE_DIR="${NEWS_ARCHIVE_DIR:-$HOME/Library/CloudStorage/GoogleDrive-ceekay@muns.io/My Drive/equity-research-data/news-archive}"
LA="$HOME/Library/LaunchAgents"
OPS="$HOME/.nostra-ops"
STATE="$OPS/failover.state"
BLIND="$OPS/failover.blind"
LOG="${NOSTRA_FAILOVER_LOG:-$HOME/Library/Logs/nostradamus-failover.log}"
UIDN="$(id -u)"
PYTHON="$(command -v python3 2>/dev/null || true)"; PYTHON="${PYTHON:-/usr/bin/python3}"
GIT="$(command -v git 2>/dev/null || true)"; GIT="${GIT:-/usr/bin/git}"
DEPLOY_LOCK="$OPS/.deploy.flock"
CONNECTOR_AUTONOMY_LOCK="$OPS/connector-autonomy.lock"
LOCK_WAIT_SECONDS="${NOSTRA_FAILOVER_LOCK_WAIT_SECONDS:-10}"
case "$LOCK_WAIT_SECONDS" in ''|*[!0-9]*) LOCK_WAIT_SECONDS=10;; esac
[ "$LOCK_WAIT_SECONDS" -ge 1 ] && [ "$LOCK_WAIT_SECONDS" -le 60 ] || LOCK_WAIT_SECONDS=10
STOP_TRIES="${NOSTRA_FAILOVER_STOP_TRIES:-40}"
case "$STOP_TRIES" in ''|*[!0-9]*) STOP_TRIES=40;; esac
[ "$STOP_TRIES" -ge 1 ] && [ "$STOP_TRIES" -le 80 ] || STOP_TRIES=40
mkdir -p "$OPS" "$(dirname "$LOG")"
log(){ printf '%s %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$*" >> "$LOG"; }

# ── pure decision, unit-testable: prints "<ACTION> <newcounter>" ───────────────
decide(){
  local active="$1" conns="$2" counter="$3"
  if [ "$active" = yes ]; then
    if [ "$conns" -ge 2 ]; then echo "STANDDOWN 0"; else echo "STAY 0"; fi
  else
    if [ "$conns" -eq 0 ]; then
      counter=$((counter+1))
      if [ "$counter" -ge "$K" ]; then echo "ACTIVATE $counter"; else echo "WAIT $counter"; fi
    else
      echo "DORMANT 0"
    fi
  fi
}
[ "${1:-}" = "--decide" ] && { decide "$2" "$3" "$4"; exit 0; }

activate(){
  if [ "$DRYRUN" = 1 ]; then log "DRYRUN ACTIVATE — would run install-services.sh"; return; fi
  # A crashed/partial install must be distinguishable from a real doer. Full install publishes `doer` only
  # after every service verifies; until then the next monitor tick sees admin + local services and cleans up.
  if ! persist_admin_role; then
    log "ACTIVATE ABORTED: could not persist safe pre-activation admin role"
    return 1
  fi
  if ! acquire_standdown_locks; then
    log "ACTIVATE ABORTED: transition leases unavailable"
    return 1
  fi
  # The installer acquires autonomy itself after deploy -> repository. Release
  # only fd7 and retain the first two leases while it reads reviewed source.
  exec 7>&-
  if ! reviewed_prod_source || ! remove_connector_writer; then
    exec 9>&-; exec 8>&-
    log "ACTIVATE ABORTED: production source is unreviewed or stale connector writer could not be fenced"
    return 1
  fi
  log "ACTIVATE: primary absent >= ${K} min — taking over via install-services.sh"
  # The connector pool has one permanently configured writer (the dedicated
  # Mac Pro). UI/tunnel failover must never install or promote a second data
  # writer, even while it temporarily serves the cockpit.
  ENGINE_REPO_ROOT="$PROD" NEWS_ARCHIVE_DIR="$NEWS_ARCHIVE_DIR" \
    NOSTRA_INSTALL_CONNECTORS=0 bash "$PROD/scripts/ops/install-services.sh" >> "$LOG" 2>&1
  local rc=$?
  exec 9>&-
  exec 8>&-
  if [ "$rc" -eq 0 ] && [ "$(installed_role_state)" = doer ]; then
    log "ACTIVATE: install-services.sh verified the doer role"
    return 0
  fi
  log "ACTIVATE FAILED: install-services.sh exit=$rc or did not publish doer — removing partial services"
  # Restore the conservative marker before the rollback transaction; the
  # failed installer may have published doer just before returning nonzero.
  persist_admin_role || log "ACTIVATE FAILED: could not restore admin before rollback"
  stand_down "failed activation rollback"
  return 1
}

# Stand-down must win as one transaction over every path that can install or restart the connector service.
# Lock order is global: deploy, repository mutation, then connector autonomy. Retained descriptors make leases
# crash-safe; no PID file can go stale. The same inode/owner checks used by installer/watchdog keep a
# symlink or foreign lock file from becoming permission to mutate service state.
acquire_standdown_locks(){
  [ ! -L "$DEPLOY_LOCK" ] && [ ! -L "$CONNECTOR_AUTONOMY_LOCK" ] || return 1
  umask 077
  exec 8>>"$DEPLOY_LOCK" || return 1
  if ! "$PYTHON" -I - "$DEPLOY_LOCK" "$LOCK_WAIT_SECONDS" 8<&8 <<'PYDEPLOYLOCK'
import fcntl
import os
import stat
import sys
import time

path = sys.argv[1]
deadline = time.monotonic() + int(sys.argv[2])
try:
    opened = os.fstat(8)
    named = os.lstat(path)
    if (not stat.S_ISREG(opened.st_mode) or stat.S_ISLNK(named.st_mode)
            or opened.st_uid != os.getuid() or opened.st_nlink != 1
            or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
    os.fchmod(8, 0o600)
    while True:
        try:
            fcntl.flock(8, fcntl.LOCK_EX | fcntl.LOCK_NB)
            break
        except BlockingIOError:
            if time.monotonic() >= deadline:
                raise OSError
            time.sleep(0.05)
    locked = os.fstat(8)
    named = os.lstat(path)
    if (not stat.S_ISREG(locked.st_mode) or stat.S_ISLNK(named.st_mode)
            or locked.st_uid != os.getuid() or locked.st_nlink != 1
            or (locked.st_dev, locked.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
except OSError:
    raise SystemExit(3)
PYDEPLOYLOCK
  then
    exec 8>&-
    return 1
  fi

  local gitlock
  gitlock="$($GIT -C "$PROD" rev-parse --git-path nostra-engine-mutation.flock 2>/dev/null)" \
    || { exec 8>&-; return 1; }
  case "$gitlock" in /*) ;; ?*) gitlock="$PROD/$gitlock" ;; *) exec 8>&-; return 1;; esac
  [ ! -L "$gitlock" ] || { exec 8>&-; return 1; }
  exec 9>>"$gitlock" || { exec 8>&-; return 1; }
  if ! "$PYTHON" -I - "$gitlock" "$LOCK_WAIT_SECONDS" 9<&9 <<'PYREPOLOCK'
import fcntl, os, stat, sys, time
path = sys.argv[1]; deadline = time.monotonic() + int(sys.argv[2])
try:
    opened = os.fstat(9); named = os.lstat(path)
    if (not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.getuid()
            or opened.st_nlink != 1 or opened.st_mode & 0o077
            or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)): raise OSError
    os.fchmod(9, 0o600)
    while True:
        try: fcntl.flock(9, fcntl.LOCK_EX | fcntl.LOCK_NB); break
        except BlockingIOError:
            if time.monotonic() >= deadline: raise OSError
            time.sleep(0.05)
except OSError: raise SystemExit(3)
PYREPOLOCK
  then
    exec 9>&-; exec 8>&-; return 1
  fi

  exec 7>>"$CONNECTOR_AUTONOMY_LOCK" || { exec 9>&-; exec 8>&-; return 1; }
  if ! "$PYTHON" -I - "$CONNECTOR_AUTONOMY_LOCK" "$LOCK_WAIT_SECONDS" 7<&7 <<'PYAUTONOMYLOCK'
import fcntl
import os
import stat
import sys
import time

path = sys.argv[1]
deadline = time.monotonic() + int(sys.argv[2])
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
    if (not stat.S_ISREG(locked.st_mode) or stat.S_ISLNK(named.st_mode)
            or locked.st_uid != os.getuid() or locked.st_nlink != 1
            or (locked.st_dev, locked.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
except OSError:
    raise SystemExit(3)
PYAUTONOMYLOCK
  then
    exec 7>&-
    exec 9>&-
    exec 8>&-
    return 1
  fi
}

release_standdown_locks(){ exec 7>&-; exec 9>&-; exec 8>&-; }

persist_admin_role(){
  local staged
  staged="$(mktemp "$OPS/.role.staged.XXXXXX")" || return 1
  if ! printf '%s\n' admin > "$staged" || ! chmod 600 "$staged" || ! mv "$staged" "$OPS/role"; then
    rm -f "$staged" 2>/dev/null || true
    return 1
  fi
}

legacy_tunnel_contract(){
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

safe_role_value(){
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

installed_role_state(){
  local role_file="$OPS/role" value="" tunnel="$LA/com.nostradamus.tunnel.plist"
  if [ -e "$role_file" ] || [ -L "$role_file" ]; then
    if value="$(safe_role_value "$role_file" 2>/dev/null)"; then
      case "$value" in doer|admin) printf '%s\n' "$value"; return;; esac
    fi
    printf '%s\n' unsafe
    return
  fi
  if legacy_tunnel_contract "$tunnel"; then
    printf '%s\n' legacy_doer
  else
    printf '%s\n' absent
  fi
}

service_loaded(){ launchctl print "gui/$UIDN/$1" >/dev/null 2>&1; }

remove_connector_writer(){
  local plist="$LA/com.nostradamus.connectors.plist" i
  launchctl bootout "gui/$UIDN/com.nostradamus.connectors" >/dev/null 2>&1 || true
  for i in $(seq 1 "$STOP_TRIES"); do
    service_loaded com.nostradamus.connectors || break
    launchctl bootout "gui/$UIDN/com.nostradamus.connectors" >/dev/null 2>&1 || true
    sleep 0.25
  done
  service_loaded com.nostradamus.connectors && return 1
  rm -f "$plist" 2>/dev/null || return 1
  [ ! -e "$plist" ] && [ ! -L "$plist" ]
}

reviewed_prod_source(){
  local top branch head remote status
  top="$($GIT -C "$PROD" rev-parse --show-toplevel 2>/dev/null)" || return 1
  branch="$($GIT -C "$PROD" symbolic-ref --quiet --short HEAD 2>/dev/null)" || return 1
  head="$($GIT -C "$PROD" rev-parse HEAD 2>/dev/null)" || return 1
  remote="$($GIT -C "$PROD" rev-parse origin/main 2>/dev/null)" || return 1
  [ "$top" = "$(cd "$PROD" 2>/dev/null && pwd -P)" ] \
    && [ "$branch" = main ] && [ "$head" = "$remote" ] || return 1
  # Failover executes the full installer and every sourced ops helper. Any
  # working-tree difference is therefore unreviewed executable input.
  status="$($GIT -C "$PROD" status --porcelain=v1 --untracked-files=normal 2>/dev/null)" || return 1
  [ -z "$status" ]
}

# Stop the two processes capable of creating/restarting service state. This is used only after durable admin
# intent is visible. It breaks a stuck pre-existing deploy lease before the bounded lock retry below.
quiesce_recovery_agents(){
  local label i still
  for label in com.nostradamus.watchdog com.nostradamus.deploy; do
    launchctl bootout "gui/$UIDN/$label" >/dev/null 2>&1 || true
  done
  for i in $(seq 1 "$STOP_TRIES"); do
    still=0
    for label in com.nostradamus.watchdog com.nostradamus.deploy; do
      if service_loaded "$label"; then
        still=1
        launchctl bootout "gui/$UIDN/$label" >/dev/null 2>&1 || true
      fi
    done
    [ "$still" -eq 0 ] && return 0
    sleep 0.25
  done
  return 1
}

# Lease failure must still stop every process capable of serving, ingesting, or committing. Keep the plists
# as retry witnesses (only the locked transaction below removes them), but boot out every known/loaded Nostra
# job except this monitor and verify best-effort. This covers external ingest, news, and all hk-* jobs too.
emergency_stop_services(){
  local labels="" seen="" label f i still=0
  for f in "$LA"/com.nostradamus.*.plist; do
    [ -e "$f" ] || [ -L "$f" ] || continue
    label="$(basename "$f" .plist)"
    [ "$label" = com.nostradamus.failover ] || labels="$labels $label"
  done
  for label in $(launchctl list 2>/dev/null | awk '/com\.nostradamus\./{print $3}'); do
    [ "$label" = com.nostradamus.failover ] || labels="$labels $label"
  done
  for label in $labels; do
    case " $seen " in *" $label "*) continue;; esac
    seen="$seen $label"
    launchctl bootout "gui/$UIDN/$label" >/dev/null 2>&1 || true
  done
  for i in $(seq 1 "$STOP_TRIES"); do
    still=0
    for label in $seen; do
      if service_loaded "$label"; then
        still=1
        launchctl bootout "gui/$UIDN/$label" >/dev/null 2>&1 || true
      fi
    done
    [ "$still" -eq 0 ] && return 0
    sleep 0.25
  done
  return 1
}

# Stop every installed/loaded Nostra service except this failover monitor, then remove only plists whose job
# is proven absent. A failed bootout keeps its plist so the next 60-second tick can retry; success is never
# logged while a known job remains live. `-L` includes dangling links, which `-e` alone silently misses.
remove_autonomous_services(){
  local labels="com.nostradamus.watchdog com.nostradamus.deploy" seen="" label f i still=0 incomplete=0
  for f in "$LA"/com.nostradamus.*.plist; do
    [ -e "$f" ] || [ -L "$f" ] || continue
    label="$(basename "$f" .plist)"
    [ "$label" = com.nostradamus.failover ] || labels="$labels $label"
  done
  for label in $(launchctl list 2>/dev/null | awk '/com\.nostradamus\./{print $3}'); do
    [ "$label" = com.nostradamus.failover ] || labels="$labels $label"
  done
  for label in $labels; do
    case " $seen " in *" $label "*) continue;; esac
    seen="$seen $label"
    launchctl bootout "gui/$UIDN/$label" >/dev/null 2>&1 || true
  done
  for i in $(seq 1 "$STOP_TRIES"); do
    still=0
    for label in $seen; do
      if service_loaded "$label"; then
        still=1
        launchctl bootout "gui/$UIDN/$label" >/dev/null 2>&1 || true
      fi
    done
    [ "$still" -eq 0 ] && break
    sleep 0.25
  done
  for f in "$LA"/com.nostradamus.*.plist; do
    [ -e "$f" ] || [ -L "$f" ] || continue
    label="$(basename "$f" .plist)"
    [ "$label" = com.nostradamus.failover ] && continue
    if service_loaded "$label"; then
      incomplete=1
    else
      rm -f "$f" || incomplete=1
    fi
  done
  for label in $seen; do service_loaded "$label" && incomplete=1; done
  [ "$incomplete" -eq 0 ]
}

stand_down(){
  if [ "$DRYRUN" = 1 ]; then log "DRYRUN STANDDOWN — would bootout all services + remove their plists (keep failover)"; return; fi
  local reason="${1:-primary is back}" removed=0
  log "STANDDOWN: $reason — releasing"
  # Publish conservative intent immediately. An already-running transition may finish once, but every new
  # deploy/watchdog/connector-only check now refuses autonomy, and the leases below synchronize that survivor.
  if ! persist_admin_role; then
    log "STANDDOWN DEFERRED: could not persist admin role — no service state changed"
    return 1
  fi
  if ! acquire_standdown_locks; then
    log "STANDDOWN: transition busy — stopping recovery agents before one bounded retry"
    quiesce_recovery_agents || log "STANDDOWN: watchdog/deploy did not confirm stopped before lock retry"
    if ! acquire_standdown_locks; then
      # Reduce split-brain immediately even if a foreign/unsafe lock prevents the complete transaction.
      # Plists remain as retry witnesses; the next monitor tick sees admin + local jobs and retries cleanup.
      if emergency_stop_services; then
        log "STANDDOWN INCOMPLETE: transition lease stayed unavailable; all autonomous jobs stopped, plist cleanup will retry"
      else
        log "STANDDOWN INCOMPLETE: transition lease stayed unavailable and at least one autonomous job did not confirm stopped; cleanup will retry"
      fi
      return 1
    fi
  fi
  # Reassert admin after the prior lease owner has finished: a full installer that was already past its role
  # check may have published doer just before releasing the autonomy lease.
  if ! persist_admin_role; then
    log "STANDDOWN INCOMPLETE: could not reassert admin under the transition leases"
    release_standdown_locks
    return 1
  fi
  remove_autonomous_services && removed=1
  release_standdown_locks
  if [ "$removed" -ne 1 ]; then
    log "STANDDOWN INCOMPLETE: at least one service is still loaded or its plist could not be removed — cleanup will retry"
    return 1
  fi
  log "STANDDOWN: verified dormant"
}

# Allows the transition functions to be exercised without running a Cloudflare tick.
if [[ "${BASH_SOURCE[0]}" != "$0" ]]; then
  return 0
fi

# ── one tick ──────────────────────────────────────────────────────────────────
counter=$(cat "$STATE" 2>/dev/null || echo 0); case "$counter" in ''|*[!0-9]*) counter=0;; esac
blind=$(cat "$BLIND" 2>/dev/null || echo 0); case "$blind" in ''|*[!0-9]*) blind=0;; esac

# heartbeat writer — the log is quiet when steady, so this file is how you SEE the monitor is alive
# and what it currently sees (nostra-status.sh surfaces it). Now ALSO written on the blind/no-cert
# paths, so a standby that can't see anything looks different from a healthy dormant one.
hb(){ printf '%s decision=%s active=%s connectors=%s counter=%s/%s blind=%s dryrun=%s\n' \
  "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$1" "${2:-?}" "${3:-?}" "${4:-$counter}" "$K" "$blind" "$DRYRUN" \
  > "$HOME/.nostra-ops/failover.status" 2>/dev/null || true; }

local_services_present(){
  local f
  for f in "$LA"/com.nostradamus.*.plist; do
    [ -e "$f" ] || [ -L "$f" ] || continue
    case "$f" in */com.nostradamus.failover.plist) continue;; esac
    return 0
  done
  launchctl list 2>/dev/null \
    | awk '/com\.nostradamus\./ && $3 !~ /\.failover$/{found=1} END{exit !found}'
}

tunnel_contract_present(){
  local tunnel="$LA/com.nostradamus.tunnel.plist"
  legacy_tunnel_contract "$tunnel" && service_loaded com.nostradamus.tunnel
}

# Local inconsistency is sufficient evidence for conservative cleanup and needs no Cloudflare decision.
# Run this before certificate/network exits: a running tunnel keeps serving when cert.pem is missing, and an
# interrupted activation must not keep committing merely because this monitor is temporarily blind.
role_state="$(installed_role_state)"
local_present=no; local_services_present && local_present=yes
tunnel_present=no; tunnel_contract_present && tunnel_present=yes
cleanup_reason=""
case "$role_state:$local_present" in
  admin:yes|unsafe:yes|absent:yes) cleanup_reason="incomplete local transition";;
esac
case "$role_state:$tunnel_present" in
  doer:no|legacy_doer:no) cleanup_reason="doer lost its loaded tunnel service contract";;
esac
if [ -n "$cleanup_reason" ]; then
  log "LOCAL CLEANUP: $cleanup_reason — no cloud decision required"
  cleanup_active=yes
  stand_down "$cleanup_reason" && cleanup_active=no
  hb CLEANUP "$cleanup_active" 0 0
  exit 0
fi
active="$tunnel_present"

if [ ! -f "$HOME/.cloudflared/cert.pem" ]; then
  log "ERROR: ~/.cloudflared/cert.pem is missing — cannot query tunnel info (counter held at $counter)"
  hb NOCERT
  exit 0
fi
info=$(cloudflared tunnel info "$TUNNEL" 2>/dev/null || true)
# FAIL-SAFE: trust the reply ONLY if it provably reached Cloudflare (carries the tunnel ID line).
# A network failure yields empty/partial stdout with no ID line → we do nothing.
if ! printf '%s\n' "$info" | grep -qE '^ID:[[:space:]]'; then
  blind=$((blind + 1)); echo "$blind" > "$BLIND"
  # A permanently-blind standby (its OWN network down) offers NO protection — it can neither see the
  # primary nor take over. That silence is itself a fact worth surfacing: warn on the first blind tick
  # and every ~10 after, and keep the heartbeat fresh so nostra-status.sh shows BLIND, not a stale tick.
  if [ "$blind" -eq 1 ] || [ $((blind % 10)) -eq 0 ]; then
    log "STANDBY BLIND for ${blind} tick(s) — can't reach Cloudflare (own network down); cannot see the primary or take over. NO ACTION (counter held at $counter)."
  fi
  hb BLIND
  exit 0
fi
[ "$blind" -ne 0 ] && { log "standby regained sight after ${blind} blind tick(s)"; echo 0 > "$BLIND"; blind=0; }
conns=$(printf '%s\n' "$info" | grep -cE '^[0-9a-f]{8}-[0-9a-f]{4}-' || true)

result=$(decide "$active" "$conns" "$counter")
action=${result%% *}; newcounter=${result##* }
echo "$newcounter" > "$STATE"

# always-fresh heartbeat (blind=0 here — we provably reached Cloudflare this tick).
hb "$action" "$active" "$conns" "$newcounter"

case "$action" in
  ACTIVATE)  log "decision ACTIVATE (active=$active conns=$conns counter=$newcounter)"; activate ;;
  STANDDOWN) log "decision STANDDOWN (active=$active conns=$conns)"; stand_down ;;
  WAIT)      log "primary absent — waiting ${newcounter}/${K} min (conns=$conns)" ;;
  DORMANT|STAY) : ;;
esac
exit 0
