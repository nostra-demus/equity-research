#!/usr/bin/env bash
# Self-healing watchdog for app.nostra-demus.com. Runs every ~60s under launchd
# (com.nostradamus.watchdog). It covers the failure modes launchd KeepAlive can't:
#   - a non-launchd process squatting :8787 (KeepAlive keeps EADDRINUSE-ing)
#   - the engine "up" but serving BROKEN content (the blank page: HTML returned for the JS bundle)
#   - the cloudflared tunnel being unreachable
# Local failures repair after 2 consecutive checks. A public/tunnel failure gets one immediate repair,
# then a convergence cooldown prevents repeated tunnel restarts from extending an edge rollout flap.
# Every check/incident/repair is logged to ~/Library/Logs/nostradamus-watchdog.log ("keep a track").
set -uo pipefail

# Pure decision helper. Keeping this above the source guard lets the test exercise cooldown boundaries
# without running the watchdog (and therefore without touching launchctl or the network).
tunnel_heal_cooldown_remaining() {
  local now_raw="${1:-}" last_raw="${2:-}" cooldown_raw="${3:-}"
  local now last cooldown elapsed
  case "$now_raw" in ''|*[!0-9]*) return 2;; esac
  case "$last_raw" in ''|*[!0-9]*) return 2;; esac
  case "$cooldown_raw" in ''|*[!0-9]*) return 2;; esac
  now=$((10#$now_raw)); last=$((10#$last_raw)); cooldown=$((10#$cooldown_raw))
  elapsed=$((now - last))
  # No prior heal, an expired/disabled cooldown, or a backwards clock step all permit one heal.
  # A heal after a clock step rewrites the timestamp, avoiding an accidentally unbounded suppression.
  if [ "$last" -eq 0 ] || [ "$elapsed" -lt 0 ] || [ "$elapsed" -ge "$cooldown" ]; then
    printf '0\n'
  else
    printf '%s\n' "$((cooldown - elapsed))"
  fi
}

# Pure connector-service classifier. The 15-minute scheduler gets three missed intervals before an idle
# service is considered stale, while an in-progress sweep gets four whole intervals without one row of
# progress before it is considered wedged. A single fetch row has a bounded ~200s retry budget today; the
# 60-minute running window therefore avoids killing a legitimate long sweep while still recovering a hang.
connector_watchdog_reason() {
  local state="${1:-}" now_raw="${2:-}" progress_raw="${3:-}" completed_raw="${4:-}" interval_raw="${5:-}"
  local now progress completed interval age threshold
  case "$now_raw" in ''|*[!0-9]*) return 2;; esac
  case "$interval_raw" in ''|*[!0-9]*) return 2;; esac
  now=$((10#$now_raw)); interval=$((10#$interval_raw))
  [ "$interval" -ge 60 ] && [ "$interval" -le 86400 ] || return 2
  case "$state" in
    running)
      case "$progress_raw" in ''|*[!0-9]*) return 2;; esac
      progress=$((10#$progress_raw)); age=$((now - progress)); threshold=$((interval * 4))
      [ "$age" -ge "$threshold" ] || return 1
      printf 'running-stale\n'
      ;;
    completed|failed)
      case "$completed_raw" in ''|*[!0-9]*) return 2;; esac
      completed=$((10#$completed_raw)); age=$((now - completed)); threshold=$((interval * 3))
      [ "$age" -ge "$threshold" ] || return 1
      printf '%s-stale\n' "$state"
      ;;
    # A new install may not have a status yet because deploy still holds the shared repository lease when
    # RunAtLoad fires. A failed sweep is already scheduled to retry. Neither is evidence of a wedged timer.
    missing) return 1 ;;
    *) return 2 ;;
  esac
}

connector_host_is_doer() {
  local role_file="${1:-}" tunnel_plist="${2:-}" role_value=""
  [ -n "$role_file" ] && [ -n "$tunnel_plist" ] || return 2
  if [ -e "$role_file" ] || [ -L "$role_file" ]; then
    if [ ! -L "$role_file" ] && [ -f "$role_file" ] && [ -O "$role_file" ]; then
      role_value="$(cat "$role_file" 2>/dev/null || true)"
      case "$role_value" in doer) return 0 ;; admin) return 1 ;; esac
    fi
    return 1
  fi
  [ ! -L "$tunnel_plist" ] && [ -f "$tunnel_plist" ] && [ -O "$tunnel_plist" ]
}

if [[ "${BASH_SOURCE[0]}" != "$0" ]]; then
  return 0
fi

REPO="${ENGINE_REPO_ROOT:-$HOME/nostra-prod}"
PORT=8787
TUNNEL_HEAL_COOLDOWN_SECONDS="${WATCHDOG_TUNNEL_HEAL_COOLDOWN_SECONDS:-300}"
case "$TUNNEL_HEAL_COOLDOWN_SECONDS" in
  ''|*[!0-9]*) TUNNEL_HEAL_COOLDOWN_SECONDS=300;;
esac
CONNECTOR_HEAL_COOLDOWN_SECONDS="${WATCHDOG_CONNECTOR_HEAL_COOLDOWN_SECONDS:-3600}"
case "$CONNECTOR_HEAL_COOLDOWN_SECONDS" in
  ''|*[!0-9]*) CONNECTOR_HEAL_COOLDOWN_SECONDS=3600;;
esac
# resolve npm to an absolute path (launchd has a minimal PATH; brew is /opt/homebrew on Apple-Silicon, /usr/local on Intel)
NPM="$(command -v npm 2>/dev/null || true)"; [ -n "$NPM" ] || for c in /opt/homebrew/bin/npm /usr/local/bin/npm; do [ -x "$c" ] && NPM="$c" && break; done; NPM="${NPM:-/opt/homebrew/bin/npm}"
PYTHON="$(command -v python3 2>/dev/null || true)"; PYTHON="${PYTHON:-/usr/bin/python3}"
UID_NUM="$(id -u)"
AGENTS_DIR="$HOME/Library/LaunchAgents"
LOG="$HOME/Library/Logs/nostradamus-watchdog.log"
STATE_DIR="$HOME/Library/Application Support/nostradamus"
FAILS="$STATE_DIR/watchdog.fails"
TUNNEL_HEAL_AT="$STATE_DIR/tunnel-heal.at"
CONNECTOR_HEAL_AT="$STATE_DIR/connector-heal.at"
CONNECTOR_STATUS="$REPO/data/_connectors/runner_status.json"
ROLE_FILE="$HOME/.nostra-ops/role"
CONNECTOR_AUTONOMY_LOCK="$HOME/.nostra-ops/connector-autonomy.lock"
mkdir -p "$STATE_DIR" "$(dirname "$LOG")"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$LOG"; }
get_fails() { cat "$FAILS" 2>/dev/null || echo 0; }
set_fails() { echo "$1" > "$FAILS"; }
get_tunnel_heal_at() {
  local value
  value="$(cat "$TUNNEL_HEAL_AT" 2>/dev/null || true)"
  case "$value" in ''|*[!0-9]*) echo 0;; *) echo "$value";; esac
}
set_tunnel_heal_at() { echo "$1" > "$TUNNEL_HEAL_AT"; }
get_connector_heal_at() {
  local value
  value="$(cat "$CONNECTOR_HEAL_AT" 2>/dev/null || true)"
  case "$value" in ''|*[!0-9]*) echo 0;; *) echo "$value";; esac
}
set_connector_heal_at() {
  printf '%s\n' "$1" > "$CONNECTOR_HEAL_AT.tmp" 2>/dev/null \
    && mv "$CONNECTOR_HEAL_AT.tmp" "$CONNECTOR_HEAL_AT" 2>/dev/null
}
connector_autonomy_lock_acquire() {
  [ ! -L "$CONNECTOR_AUTONOMY_LOCK" ] || return 1
  umask 077
  exec 6>>"$CONNECTOR_AUTONOMY_LOCK" || return 1
  if ! "$PYTHON" -I - "$CONNECTOR_AUTONOMY_LOCK" 6<&6 <<'PYCONNECTORAUTONOMY'
import fcntl
import os
import stat
import sys

path = sys.argv[1]
try:
    opened = os.fstat(6)
    named = os.lstat(path)
    if (not stat.S_ISREG(opened.st_mode) or stat.S_ISLNK(named.st_mode)
            or opened.st_uid != os.getuid() or opened.st_nlink != 1
            or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
    os.fchmod(6, 0o600)
    fcntl.flock(6, fcntl.LOCK_EX | fcntl.LOCK_NB)
    locked = os.fstat(6)
    named = os.lstat(path)
    if (not stat.S_ISREG(locked.st_mode) or stat.S_ISLNK(named.st_mode)
            or locked.st_uid != os.getuid() or locked.st_nlink != 1
            or (locked.st_dev, locked.st_ino) != (named.st_dev, named.st_ino)):
        raise OSError
except OSError:
    raise SystemExit(3)
PYCONNECTORAUTONOMY
  then
    exec 6>&-
    return 1
  fi
}
connector_autonomy_lock_release() { exec 6>&-; }
# Recover an agent even if it was booted OUT (not just crashed): `kickstart` cannot start an
# unloaded agent, so bootstrap first when it is gone, THEN (re)start. This is exactly what was
# missing when a failed installer left the engine booted-out and the watchdog could not bring it back.
ensure_up() {
  if ! launchctl print "gui/$UID_NUM/$1" >/dev/null 2>&1; then
    launchctl bootstrap "gui/$UID_NUM" "$AGENTS_DIR/$1.plist" 2>/dev/null || return 1
  fi
  launchctl kickstart -k "gui/$UID_NUM/$1" 2>/dev/null
}

connector_service_running() {
  launchctl print "gui/$UID_NUM/com.nostradamus.connectors" 2>/dev/null \
    | grep -E 'state[[:space:]]*=[[:space:]]*running' >/dev/null
}

connector_service_pid() {
  launchctl print "gui/$UID_NUM/com.nostradamus.connectors" 2>/dev/null \
    | awk -F'= *' '/^[[:space:]]*pid[[:space:]]*=/{gsub(/[[:space:]]/, "", $2); if (!seen++) print $2}'
}

# Emit only validated scalars from the non-secret runner wire. Malformed/partial files are never a reason to
# kill a process: atomic publication should make them impossible, and conservative supervision fails closed.
read_connector_status() {
  "$PYTHON" -I - "$CONNECTOR_STATUS" <<'PYCONNECTORSTATUS' 2>/dev/null || printf 'invalid\t0\t0\t900\t0\tunknown\n'
import datetime
import json
import os
import re
import stat
import sys
import time

path = sys.argv[1]
required = {
    "schema_version", "service", "state", "interval_seconds", "host", "pid",
    "sweep_started_at", "last_progress_at", "sweep_completed_at", "processed_rows",
    "failed_rows", "skipped_manifests", "error_code",
}

def epoch(value):
    if (not isinstance(value, str)
            or not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z", value)):
        raise ValueError
    parsed = datetime.datetime.fromisoformat(value[:-1] + "+00:00")
    if parsed.tzinfo is None:
        raise ValueError
    return int(parsed.timestamp())

try:
    before = os.lstat(path)
except FileNotFoundError:
    print("missing\t0\t0\t900\t0\tunknown")
    raise SystemExit
except OSError:
    print("invalid\t0\t0\t900\t0\tunknown")
    raise SystemExit

descriptor = None
try:
    if (not stat.S_ISREG(before.st_mode)
            or before.st_uid != os.getuid() or before.st_nlink != 1
            or not 0 < before.st_size <= 16384):
        raise ValueError
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    opened = os.fstat(descriptor)
    if (not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.getuid() or opened.st_nlink != 1
            or opened.st_size != before.st_size
            or (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino)):
        raise ValueError
    chunks = []
    remaining = opened.st_size
    while remaining:
        chunk = os.read(descriptor, remaining)
        if not chunk:
            raise ValueError
        chunks.append(chunk)
        remaining -= len(chunk)
    if os.read(descriptor, 1):
        raise ValueError
    after = os.fstat(descriptor)
    after_path = os.lstat(path)
    identity = (opened.st_dev, opened.st_ino, opened.st_size, opened.st_mtime_ns,
                opened.st_ctime_ns, opened.st_uid, opened.st_nlink)
    if ((after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns,
         after.st_ctime_ns, after.st_uid, after.st_nlink) != identity
            or (after_path.st_dev, after_path.st_ino, after_path.st_size,
                after_path.st_mtime_ns, after_path.st_ctime_ns,
                after_path.st_uid, after_path.st_nlink) != identity):
        raise ValueError
    value = json.loads(b"".join(chunks).decode("utf-8"))
    if not isinstance(value, dict) or set(value) != required:
        raise ValueError
    state = value["state"]
    interval = value["interval_seconds"]
    pid = value["pid"]
    host = value["host"]
    if (value["schema_version"] != 1 or value["service"] != "connector-fetcher"
            or state not in {"running", "completed", "failed"} or interval != 900
            or not isinstance(pid, int) or isinstance(pid, bool) or pid <= 0
            or not isinstance(host, str) or not host or len(host) > 255
            or any(ord(char) < 32 or ord(char) == 127 for char in host)):
        raise ValueError
    for key in ("processed_rows", "failed_rows", "skipped_manifests"):
        count = value[key]
        if not isinstance(count, int) or isinstance(count, bool) or count < 0:
            raise ValueError
    if value["failed_rows"] > value["processed_rows"]:
        raise ValueError
    started = epoch(value["sweep_started_at"])
    progress = epoch(value["last_progress_at"])
    if progress < started or started > int(time.time()) + 300 or progress > int(time.time()) + 300:
        raise ValueError
    completed = 0
    if state == "running":
        if value["sweep_completed_at"] is not None or value["error_code"] is not None:
            raise ValueError
    else:
        completed = epoch(value["sweep_completed_at"])
        if completed < progress or completed > int(time.time()) + 300:
            raise ValueError
        if state == "completed" and value["error_code"] is not None:
            raise ValueError
        if state == "failed" and (not isinstance(value["error_code"], str)
                                  or not re.fullmatch(r"[a-z][a-z0-9_]{0,63}", value["error_code"])):
            raise ValueError
    print(f"{state}\t{progress}\t{completed}\t{interval}\t{pid}\t{host}")
except (OSError, UnicodeError, ValueError, TypeError, json.JSONDecodeError, OverflowError):
    print("invalid\t0\t0\t900\t0\tunknown")
finally:
    if descriptor is not None:
        os.close(descriptor)
PYCONNECTORSTATUS
}

connector_note_hourly() {
  local key="$1" message="$2" now last marker remaining
  marker="$STATE_DIR/connector-note-$key.at"
  now="$(date +%s)"
  last="$(cat "$marker" 2>/dev/null || true)"
  case "$last" in ''|*[!0-9]*) last=0;; esac
  remaining="$(tunnel_heal_cooldown_remaining "$now" "$last" 3600 2>/dev/null || echo 0)"
  [ "${remaining:-0}" -eq 0 ] || return 0
  log "$message"
  printf '%s\n' "$now" > "$marker.tmp" 2>/dev/null && mv "$marker.tmp" "$marker" 2>/dev/null || true
}

# keep the log bounded (~last 1000 lines once it passes 5000)
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG" 2>/dev/null || echo 0)" -gt 5000 ]; then
  tail -n 1000 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi

# Keep the timer-driven agents alive. They have no HTTP endpoint to probe, so the health checks below
# can't cover them — but if the auto-deploy watcher or the news archiver got booted OUT (a failed
# install, a stray bootout), nothing else would bring them back and deploys would silently stall.
# Bootstrap-if-gone every cycle is cheap (no kickstart, no restart when already loaded), so the
# pipeline that makes "merge to main -> live" work is itself self-healing.
for ag in com.nostradamus.deploy com.nostradamus.news-archive; do
  [ -f "$AGENTS_DIR/$ag.plist" ] || continue   # news-archive is doer-only; an admin-role host won't have it
  launchctl print "gui/$UID_NUM/$ag" >/dev/null 2>&1 \
    || { launchctl bootstrap "gui/$UID_NUM" "$AGENTS_DIR/$ag.plist" 2>/dev/null && log "RECOVERED $ag (was booted out)"; }
done

# Timer services normally sit loaded but idle between launches, so launchctl alone cannot tell whether the
# scheduler is making progress. The runner's exact, atomic status wire closes that gap. Supervision remains
# doer-only (the connector plist is absent on admin hosts) and pool-aware: a broken/unmounted Drive symlink is
# an availability incident, not permission to spin/restart a writer against an empty local directory.
CONNECTOR_PLIST="$AGENTS_DIR/com.nostradamus.connectors.plist"
if connector_host_is_doer "$ROLE_FILE" "$AGENTS_DIR/com.nostradamus.tunnel.plist" \
    && [ ! -L "$CONNECTOR_PLIST" ] && [ -f "$CONNECTOR_PLIST" ] && [ -O "$CONNECTOR_PLIST" ]; then
  # Production data/ is a symlink into the Drive pool. A Drive outage can coincide with deploy leaving an
  # empty real data/ directory in place; readability alone would mistake that clobber shape for a pool and
  # start a writer against local storage. Require both the symlink invariant and a resolving/readable target.
  if [ ! -L "$REPO/data" ] || [ ! -d "$REPO/data" ] || [ ! -r "$REPO/data" ]; then
    connector_note_hourly pool-unavailable "CONNECTORS SKIP data pool unavailable — no restart attempted"
  elif ! connector_autonomy_lock_acquire; then
    connector_note_hourly transition-busy \
      "CONNECTORS SKIP another connector role/service transition holds the autonomy lease"
  else
    # Failover/admin transition can win after the optimistic checks above but before this lease. Revalidate
    # all autonomy predicates while serialized; stale observations must never resurrect a stood-down host.
    if ! connector_host_is_doer "$ROLE_FILE" "$AGENTS_DIR/com.nostradamus.tunnel.plist" \
        || [ -L "$CONNECTOR_PLIST" ] || [ ! -f "$CONNECTOR_PLIST" ] || [ ! -O "$CONNECTOR_PLIST" ] \
        || [ ! -L "$REPO/data" ] || [ ! -d "$REPO/data" ] || [ ! -r "$REPO/data" ]; then
      connector_note_hourly transition-changed \
        "CONNECTORS SKIP role, service, or pool changed during watchdog arbitration"
    else
      connector_bootstrapped=0
      connector_loaded=1
      if ! launchctl print "gui/$UID_NUM/com.nostradamus.connectors" >/dev/null 2>&1; then
        if launchctl bootstrap "gui/$UID_NUM" "$CONNECTOR_PLIST" 2>/dev/null; then
          connector_bootstrapped=1
          log "RECOVERED com.nostradamus.connectors (was booted out)"
        else
          connector_loaded=0
          connector_note_hourly bootstrap-failed \
            "CONNECTORS RECOVERY-FAILED service was booted out — bootstrap remains armed"
        fi
      fi
      # RunAtLoad can legitimately exit without a heartbeat while deploy owns the shared repository lease.
      # Never interpret the old/missing status in the same cycle that this watchdog bootstrapped the service.
      if [ "$connector_loaded" = 1 ] && [ "$connector_bootstrapped" = 0 ]; then
        connector_status_line="$(read_connector_status)"
        IFS=$'\t' read -r connector_state connector_progress connector_completed connector_interval \
          connector_pid connector_host <<< "$connector_status_line"
        if [ "$connector_state" = invalid ]; then
          connector_note_hourly invalid-status "CONNECTORS SKIP runner status is invalid — conservative no-restart"
        else
          connector_now="$(date +%s)"
          connector_reason=""
          connector_reason="$(connector_watchdog_reason \
            "$connector_state" "$connector_now" "$connector_progress" \
            "$connector_completed" "$connector_interval")"
          connector_decision=$?
          if [ "$connector_decision" -eq 0 ]; then
            connector_heal_allowed=1
            connector_local_host="$(hostname 2>/dev/null || true)"
            if [ "$connector_reason" = running-stale ] && [ "$connector_host" != "$connector_local_host" ]; then
              connector_heal_allowed=0
              connector_note_hourly host-mismatch \
                "CONNECTORS SKIP running-stale belongs to a different heartbeat host"
            elif connector_service_running; then
              connector_heal_allowed=0
              if [ "$connector_reason" = running-stale ]; then
                connector_live_pid="$(connector_service_pid)"
                case "$connector_live_pid" in ''|*[!0-9]*) ;;
                  *) [ "$connector_live_pid" = "$connector_pid" ] && connector_heal_allowed=1 ;;
                esac
                [ "$connector_heal_allowed" = 1 ] || connector_note_hourly pid-mismatch \
                  "CONNECTORS SKIP running-stale belongs to a different or unproven live process"
              fi
            fi
            if [ "$connector_heal_allowed" = 1 ]; then
              connector_confirm_line="$(read_connector_status)"
              if [ "$connector_confirm_line" != "$connector_status_line" ]; then
                connector_heal_allowed=0
                connector_note_hourly status-advanced \
                  "CONNECTORS SKIP stale status advanced during watchdog decision"
              fi
            fi
            if [ "$connector_heal_allowed" = 1 ]; then
              connector_last_heal="$(get_connector_heal_at)"
              connector_cooldown_remaining="$(tunnel_heal_cooldown_remaining \
                "$connector_now" "$connector_last_heal" "$CONNECTOR_HEAL_COOLDOWN_SECONDS" 2>/dev/null || echo 0)"
              if [ "${connector_cooldown_remaining:-0}" -gt 0 ]; then
                connector_note_hourly cooldown \
                  "CONNECTORS SUPPRESS HEAL $connector_reason — cooldown active"
              else
                log "CONNECTORS HEAL $connector_reason"
                if ensure_up com.nostradamus.connectors; then
                  set_connector_heal_at "$connector_now" || true
                else
                  connector_note_hourly heal-failed \
                    "CONNECTORS HEAL-FAILED $connector_reason — restart remains armed"
                fi
              fi
            fi
          elif [ "$connector_decision" -eq 2 ]; then
            connector_note_hourly invalid-decision \
              "CONNECTORS SKIP runner status fields failed the watchdog contract"
          fi
        fi
      fi
    fi
    connector_autonomy_lock_release
  fi
fi

problem=""; detail=""; pub=""

# 1) engine process/health
if ! curl -fsS --max-time 5 "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then
  problem="engine-down"
else
  # 2) CONTENT health — the served bundle must come back as real JS. If it's HTML/404, the SPA is blank.
  ref="$(curl -fsS --max-time 5 "http://127.0.0.1:$PORT/" 2>/dev/null | grep -oE 'assets/index-[A-Za-z0-9_-]+\.js' | head -1)"
  if [ -z "$ref" ]; then
    problem="no-bundle-ref"
  else
    ct="$(curl -fsS -o /dev/null -w '%{http_code}:%{content_type}' --max-time 5 "http://127.0.0.1:$PORT/$ref" 2>/dev/null || echo '000:')"
    case "$ct" in
      200:*javascript*) detail="$ref ok" ;;
      *) problem="bundle-not-js"; detail="$ref -> $ct" ;;
    esac
  fi
fi

# Kill a STRAY second engine on a non-:8787 port (a duplicate node doubling filesystem/LLM load — the
# :8799 incident). Bounded to known stray ports, never :8787 (launchd owns that). Skipped only when the
# engine is locally DOWN this cycle, so we never fight a real engine-down repair.
if [ "$problem" != "engine-down" ]; then
  extra="$(lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | awk '/node/ && /:(8788|8789|879[0-9])/{print $2}' | sort -u)"
  if [ -n "$extra" ]; then
    log "DUP-ENGINE strays on non-8787 ports pids=$(echo "$extra" | tr '\n' ' ')— killing"
    echo "$extra" | xargs kill -9 2>/dev/null || true
  fi
fi

# 3) tunnel / public reachability (only checked when the engine is locally healthy). Capture the HTTP
#    code, total time, AND the x-engine-status header so we can tell apart three distinct states:
#      - dead tunnel       (code 000, or a Cloudflare 5xx >= 520)        -> re-kick the tunnel
#      - public-offline    (edge serving offline while local /api/health is fast: x-engine-status:offline
#                           or a 503) -> the tunnel dropped or the edge can't reach the origin; re-kick it.
#                           (The OLD check only caught code==000, so this whole class self-healed never.)
#      - slow-but-working  (200, just slow) -> LOG only, never heal (healing a working path = churn).
if [ -z "$problem" ] && [ -f "$AGENTS_DIR/com.nostradamus.tunnel.plist" ]; then
  # tunnel is DOER-ONLY: only supervise the public path on a machine that actually owns the tunnel, so an
  # admin-role host never tries to heal a URL it doesn't serve (which would fight the real doer's tunnel).
  hdr="$STATE_DIR/pub.hdr"
  pub_meta="$(curl -s -o /dev/null -D "$hdr" -w '%{http_code} %{time_total}' --max-time 12 "https://app.nostra-demus.com/api/health" 2>/dev/null || echo '000 0')"
  pub="${pub_meta%% *}"; pub_time="${pub_meta##* }"
  pub_engine="$(awk -F': *' 'tolower($1)=="x-engine-status"{gsub(/\r/,"",$2);print tolower($2)}' "$hdr" 2>/dev/null)"
  if [ "$pub" = "000" ] || { [ "$pub" -ge 520 ] 2>/dev/null; }; then
    problem="tunnel-down"; detail="pub=$pub"
  elif [ "$pub_engine" = "offline" ] || [ "$pub" = "503" ]; then
    problem="public-offline"; detail="pub=$pub engine=${pub_engine:-?}"
  else
    awk "BEGIN{exit !(${pub_time:-0} > 8.0)}" 2>/dev/null && log "SLOW pub=$pub ${pub_time}s"
  fi
fi

if [ -n "$problem" ]; then
  n=$(( $(get_fails) + 1 )); set_fails "$n"
  log "FAIL($n) $problem${detail:+ [$detail]}"
  # Tunnel/public failures get one immediate heal so the public URL recovers fast. Further tunnel heals
  # wait for the persistent cooldown; engine/bundle repairs still wait for 2 local failures.
  thresh=2; case "$problem" in tunnel-down|public-offline) thresh=1;; esac
  if [ "$n" -ge "$thresh" ]; then
    case "$problem" in
      bundle-not-js|no-bundle-ref)
        log "HEAL $problem"
        log "  rebuilding ui/web (dist looks corrupt/missing)"
        ( cd "$REPO" && "$NPM" --prefix ui/web run build ) >> "$LOG" 2>&1 || log "  WARN web build failed"
        lsof -ti:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
        ensure_up com.nostradamus.engine
        set_fails 0
        : > "$STATE_DIR/healing"
        ;;
      engine-down)
        log "HEAL $problem"
        # clear any non-launchd squatter holding the port, then ensure launchd owns it again —
        # bootstrap if the agent was booted OUT, not merely crashed (kickstart alone can't).
        lsof -ti:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
        ensure_up com.nostradamus.engine
        set_fails 0
        : > "$STATE_DIR/healing"
        ;;
      tunnel-down|public-offline)
        now="$(date +%s)"
        last_heal="$(get_tunnel_heal_at)"
        cooldown_remaining="$(tunnel_heal_cooldown_remaining "$now" "$last_heal" "$TUNNEL_HEAL_COOLDOWN_SECONDS")"
        if [ "${cooldown_remaining:-0}" -gt 0 ]; then
          log "SUPPRESS HEAL $problem — tunnel convergence cooldown ${cooldown_remaining}s remaining"
          # Tunnel state has its own timestamp. Do not let its persistent failure count make the next
          # one-off local engine/bundle failure skip the existing two-check threshold.
          set_fails 0
        else
          log "HEAL $problem"
          if ensure_up com.nostradamus.tunnel; then
            set_tunnel_heal_at "$now"
            : > "$STATE_DIR/healing"
          else
            # A failed launchctl command did not start convergence. Leave the timestamp untouched so the
            # next watchdog cycle retries instead of suppressing recovery for the whole cooldown.
            log "HEAL-FAILED $problem — tunnel restart command failed; retry remains armed"
          fi
          set_fails 0
        fi
        ;;
    esac
  fi
else
  if [ "$(get_fails)" != "0" ] || [ -f "$STATE_DIR/healing" ]; then
    log "RECOVERED${detail:+ [$detail]}"; rm -f "$STATE_DIR/healing"
  fi
  set_fails 0
  # healthy: heartbeat at most ~hourly (and always on first run / fresh log) so the track shows
  # proof-of-life — you can tell at a glance the watchdog is alive — without becoming noise.
  hb_age=999999
  [ -f "$LOG" ] && hb_age=$(( $(date +%s) - $(stat -f %m "$LOG" 2>/dev/null || echo 0) ))
  { [ ! -f "$LOG" ] || [ "$hb_age" -ge 3300 ]; } && log "OK${detail:+ [$detail]} pub=${pub:-?}"
fi

# 4) THE STORY (enrich) read health — defense-in-depth ON TOP OF the engine's own per-cycle heal pass.
# Low-frequency (~30 min) and only when the engine is locally healthy this cycle. A high ON-WIRE degraded
# rate means article reads are regressing in a way the in-engine heal can't fix on its own (LLM keys expired,
# provider chain broken, the heal pass silently not firing) — exactly the "frozen useless story" class of
# bug. Log the incident and attempt an INDEPENDENT heal via the engine API. Never fatal; bounded by the
# timestamp gate so it can't run every 60s.
if [ -z "$problem" ]; then
  eh_age=999999
  [ -f "$STATE_DIR/enrich-health.at" ] && eh_age=$(( $(date +%s) - $(stat -f %m "$STATE_DIR/enrich-health.at" 2>/dev/null || echo 0) ))
  if [ "$eh_age" -ge 1800 ]; then
    touch "$STATE_DIR/enrich-health.at"
    if ! ( cd "$REPO" && ENGINE_STATE_DIR="$REPO/ui/server/.state" "$NPM" --prefix ui/server run --silent enrich:health -- --strict ) >/dev/null 2>&1; then
      log "ENRICH-DEGRADED — article reads regressing; attempting independent heal"
      ( cd "$REPO" && ENGINE_STATE_DIR="$REPO/ui/server/.state" "$NPM" --prefix ui/server run --silent enrich:health -- --heal ) >> "$LOG" 2>&1 || log "  WARN enrich heal failed"
    fi
  fi
fi

# Always succeed once the checks ran: incidents live in the LOG, not the exit code. Without this a
# healthy run that writes no heartbeat would exit 1 (shell-false &&) and read as "failed" in
# `launchctl list` — misleading for the very command used to confirm the watchdog is alive.
exit 0
