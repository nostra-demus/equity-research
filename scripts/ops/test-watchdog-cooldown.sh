#!/usr/bin/env bash
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
# Sourcing exposes only the pure cooldown helper; the watchdog's source guard prevents all I/O.
# shellcheck source=watchdog.sh
source "$HERE/watchdog.sh"

failures=0

expect_decision() {
  local description="$1" expected="$2" expected_remaining="$3" now="$4" last="$5" cooldown="$6"
  local remaining decision
  if ! remaining="$(tunnel_heal_cooldown_remaining "$now" "$last" "$cooldown")"; then
    echo "  FAIL $description rejected valid inputs"
    failures=$((failures + 1))
    return
  fi
  decision=heal
  [ "$remaining" -gt 0 ] && decision=suppress
  if [ "$decision" != "$expected" ] || [ "$remaining" != "$expected_remaining" ]; then
    echo "  FAIL $description: got $decision/$remaining, want $expected/$expected_remaining"
    failures=$((failures + 1))
  else
    echo "  ok  $description"
  fi
}

expect_decision "first tunnel failure heals immediately" heal 0 1000 0 300
expect_decision "repeat failure inside cooldown is suppressed" suppress 240 1060 1000 300
expect_decision "last second remains suppressed" suppress 1 1299 1000 300
expect_decision "cooldown boundary permits another heal" heal 0 1300 1000 300
expect_decision "zero-second override disables suppression" heal 0 1001 1000 0
expect_decision "backwards clock step cannot suppress forever" heal 0 900 1000 300
if tunnel_heal_cooldown_remaining bad 1000 300 >/dev/null 2>&1; then
  echo "  FAIL invalid decision input was accepted"
  failures=$((failures + 1))
else
  echo "  ok  invalid decision input is rejected"
fi

expect_connector_decision() {
  local description="$1" expected="$2" state="$3" now="$4" progress="$5" completed="$6" interval="$7"
  local reason rc
  reason="$(connector_watchdog_reason "$state" "$now" "$progress" "$completed" "$interval" 2>/dev/null)"; rc=$?
  if [ "$expected" = none ]; then
    if [ "$rc" -ne 1 ]; then
      echo "  FAIL $description: got rc=$rc reason=${reason:-?}, want no heal"
      failures=$((failures + 1))
    else
      echo "  ok  $description"
    fi
  elif [ "$rc" -ne 0 ] || [ "$reason" != "$expected" ]; then
    echo "  FAIL $description: got rc=$rc reason=${reason:-?}, want $expected"
    failures=$((failures + 1))
  else
    echo "  ok  $description"
  fi
}

expect_connector_decision "fresh completed sweep is not restarted" none completed 10000 9000 9000 900
expect_connector_decision "three missed completed intervals is stale" completed-stale completed 11700 9000 9000 900
expect_connector_decision "legitimate long sweep remains alive before four intervals" none running 12599 9000 0 900
expect_connector_decision "four intervals without row progress is wedged" running-stale running 12600 9000 0 900
expect_connector_decision "missing first heartbeat waits for the scheduled RunAtLoad retry" none missing 10000 0 0 900
expect_connector_decision "fresh failed sweep waits for its scheduled retry" none failed 10000 9000 9000 900
expect_connector_decision "three missed retries after failure is stale" failed-stale failed 11700 9000 9000 900

# Exercise the real watchdog with PATH-isolated command doubles. Any unexpected curl target fails;
# launchctl only records arguments. No real service or network endpoint can be touched by this test.
TEST_TMP="$(mktemp -d)" || exit 1
trap 'rm -rf "$TEST_TMP"' EXIT
MOCK_BIN="$TEST_TMP/bin"
TEST_HOME="$TEST_TMP/home"
LAUNCHCTL_LOG="$TEST_TMP/launchctl.calls"
mkdir -p "$MOCK_BIN" "$TEST_HOME/Library/LaunchAgents" "$TEST_HOME/Library/Application Support/nostradamus"
: > "$TEST_HOME/Library/LaunchAgents/com.nostradamus.tunnel.plist"
: > "$TEST_HOME/Library/LaunchAgents/com.nostradamus.connectors.plist"
: > "$TEST_HOME/Library/Application Support/nostradamus/enrich-health.at"
: > "$LAUNCHCTL_LOG"

cat > "$MOCK_BIN/mock-command" <<'MOCK'
#!/usr/bin/env bash
case "${0##*/}" in
  curl)
    url=""; header=""
    while [ "$#" -gt 0 ]; do
      case "$1" in
        -D) shift; header="${1:-}" ;;
        http://*|https://*) url="$1" ;;
      esac
      shift
    done
    case "$url" in
      http://127.0.0.1:8787/api/health)
        [ "${WATCHDOG_TEST_LOCAL_HEALTH:-up}" = up ]
        ;;
      http://127.0.0.1:8787/)
        printf '<script src="/assets/index-test.js"></script>\n'
        ;;
      http://127.0.0.1:8787/assets/index-test.js)
        printf '200:application/javascript'
        ;;
      https://app.nostra-demus.com/api/health)
        status="${WATCHDOG_TEST_PUBLIC_STATUS:-503}"
        engine=offline; [ "$status" = 200 ] && engine=online
        printf 'HTTP/1.1 %s Test\r\nx-engine-status: %s\r\n\r\n' "$status" "$engine" > "$header"
        printf '%s 0.100' "$status"
        ;;
      *) exit 98 ;;
    esac
    ;;
  launchctl)
    printf '%s\n' "$*" >> "$WATCHDOG_TEST_LAUNCHCTL_LOG"
    case "$*" in
      print*com.nostradamus.connectors*)
        [ "${WATCHDOG_TEST_CONNECTOR_LOADED:-1}" = 1 ] || exit 1
        if [ "${WATCHDOG_TEST_CONNECTOR_RUNNING:-0}" = 1 ]; then
          printf 'state = running\n'
          # Keep writing after the match so `grep -q` readers deterministically close early/SIGPIPE under
          # pipefail. The production helper must drain the complete launchctl snapshot before deciding.
          for _line in $(seq 1 2000); do printf 'noise = %s\n' "$_line"; done
          printf '  pid = %s\n' "${WATCHDOG_TEST_CONNECTOR_PID:-4242}"
        fi
        exit 0
        ;;
    esac
    case "$*" in
      *"kickstart -k"*com.nostradamus.tunnel*|*"kickstart -k"*com.nostradamus.connectors*)
        [ "${WATCHDOG_TEST_LAUNCHCTL_FAIL:-0}" = 1 ] && exit 1
        ;;
    esac
    exit 0
    ;;
  lsof)
    exit 0
    ;;
  stat)
    date +%s
    ;;
  npm)
    exit 97
    ;;
  *) exit 99 ;;
esac
MOCK
chmod +x "$MOCK_BIN/mock-command"
for command_name in curl launchctl lsof stat npm; do
  ln -s mock-command "$MOCK_BIN/$command_name"
done

run_watchdog() {
  WATCHDOG_TEST_PUBLIC_STATUS="$1" \
  WATCHDOG_TEST_LOCAL_HEALTH="$2" \
  WATCHDOG_TEST_LAUNCHCTL_FAIL="${3:-0}" \
  WATCHDOG_TEST_LAUNCHCTL_LOG="$LAUNCHCTL_LOG" \
  WATCHDOG_TEST_CONNECTOR_LOADED="${4:-1}" \
  WATCHDOG_TEST_CONNECTOR_RUNNING="${5:-0}" \
  WATCHDOG_TEST_CONNECTOR_PID="${6:-4242}" \
  WATCHDOG_TUNNEL_HEAL_COOLDOWN_SECONDS=300 \
  ENGINE_REPO_ROOT="$TEST_TMP/repo" \
  HOME="$TEST_HOME" \
  PATH="$MOCK_BIN:/usr/bin:/bin" \
    /bin/bash "$HERE/watchdog.sh"
}

write_connector_status() {
  local state="$1" progress_age="$2" complete_age="$3" pid="${4:-4242}" host="${5:-$(hostname)}"
  local status_dir="$TEST_TMP/repo/data/_connectors" now started progress completed error
  now="$(date +%s)"; progress=$((now - progress_age)); started=$((progress - 60))
  completed=null; error=null
  if [ "$state" != running ]; then
    completed_epoch=$((now - complete_age))
    completed="\"$(epoch_iso "$completed_epoch")\""
  fi
  [ "$state" != failed ] || error='"runner_exception"'
  mkdir -p "$status_dir"
  cat > "$status_dir/runner_status.json" <<JSON
{"schema_version":1,"service":"connector-fetcher","state":"$state","interval_seconds":900,"host":"$host","pid":$pid,"sweep_started_at":"$(epoch_iso "$started")","last_progress_at":"$(epoch_iso "$progress")","sweep_completed_at":$completed,"processed_rows":2,"failed_rows":0,"skipped_manifests":0,"error_code":$error}
JSON
}

epoch_iso() {
  python3 -I - "$1" <<'PY'
from datetime import datetime, timezone
import sys
print(datetime.fromtimestamp(int(sys.argv[1]), timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z"))
PY
}

count_kickstarts() {
  grep -c "kickstart -k .*com.nostradamus.$1" "$LAUNCHCTL_LOG" 2>/dev/null || true
}

ROLE_FILE="$TEST_HOME/.nostra-ops/role"
TUNNEL_PLIST="$TEST_HOME/Library/LaunchAgents/com.nostradamus.tunnel.plist"
mkdir -p "$(dirname "$ROLE_FILE")"
printf 'admin\n' > "$ROLE_FILE"
if connector_host_is_doer "$ROLE_FILE" "$TUNNEL_PLIST"; then
  echo "  FAIL explicit admin role did not override a stale tunnel plist"
  failures=$((failures + 1))
else
  echo "  ok  explicit admin role overrides legacy tunnel inference"
fi
printf 'doer\n' > "$ROLE_FILE"
if connector_host_is_doer "$ROLE_FILE" "$TUNNEL_PLIST"; then
  echo "  ok  durable doer role enables connector supervision"
else
  echo "  FAIL durable doer role was not recognized"
  failures=$((failures + 1))
fi
printf 'corrupt\n' > "$ROLE_FILE"
if connector_host_is_doer "$ROLE_FILE" "$TUNNEL_PLIST"; then
  echo "  FAIL corrupt durable role fell back to the tunnel and enabled autonomy"
  failures=$((failures + 1))
else
  echo "  ok  corrupt durable role fails closed as admin"
fi
rm -f "$ROLE_FILE"
if connector_host_is_doer "$ROLE_FILE" "$TUNNEL_PLIST"; then
  echo "  ok  pre-marker legacy doer is inferred from its safe tunnel plist"
else
  echo "  FAIL legacy tunnel doer was not recognized"
  failures=$((failures + 1))
fi

# Connector service integration: pool-aware bootstrap, conservative stale handling, process identity, and
# independent restart cooldown. Keep the public/engine side healthy so only connector calls are counted.
printf 'doer\n' > "$ROLE_FILE"
mkdir -p "$TEST_TMP/repo" "$TEST_TMP/pool"
ln -s "$TEST_TMP/pool" "$TEST_TMP/repo/data"
: > "$LAUNCHCTL_LOG"
rm -f "$TEST_HOME/Library/Application Support/nostradamus/connector-heal.at"
write_connector_status completed 60 60
run_watchdog 200 up 0 0 0
if [ "$(grep -c 'bootstrap .*com.nostradamus.connectors.plist' "$LAUNCHCTL_LOG" 2>/dev/null || true)" != 1 ] \
    || [ "$(count_kickstarts connectors)" != 0 ]; then
  echo "  FAIL an unloaded connector was not bootstrap-only recovered"
  failures=$((failures + 1))
else
  echo "  ok  unloaded connector bootstraps without a same-cycle stale restart"
fi

: > "$LAUNCHCTL_LOG"
write_connector_status completed 4000 4000
run_watchdog 200 up
run_watchdog 200 up
if [ "$(count_kickstarts connectors)" != 1 ]; then
  echo "  FAIL stale completed status did not restart once with cooldown"
  failures=$((failures + 1))
else
  echo "  ok  stale completed service restarts once and cooldown suppresses storms"
fi

: > "$LAUNCHCTL_LOG"
rm -f "$TEST_HOME/Library/Application Support/nostradamus/connector-heal.at"
write_connector_status failed 4000 4000
run_watchdog 200 up
if [ "$(count_kickstarts connectors)" != 1 ]; then
  echo "  FAIL stale failed status did not restart the scheduler"
  failures=$((failures + 1))
else
  echo "  ok  stale failed status restarts after three missed retries"
fi

: > "$LAUNCHCTL_LOG"
rm -f "$TEST_HOME/Library/Application Support/nostradamus/connector-heal.at"
write_connector_status completed 4000 4000
run_watchdog 200 up 1
run_watchdog 200 up 1
if [ -f "$TEST_HOME/Library/Application Support/nostradamus/connector-heal.at" ]; then
  echo "  FAIL a failed connector restart recorded a cooldown"
  failures=$((failures + 1))
elif [ "$(count_kickstarts connectors)" != 2 ]; then
  echo "  FAIL connector restart failure suppressed the next retry"
  failures=$((failures + 1))
else
  echo "  ok  failed connector restarts remain armed and earn no cooldown"
fi

: > "$LAUNCHCTL_LOG"
rm -f "$TEST_HOME/Library/Application Support/nostradamus/connector-heal.at"
write_connector_status running -600 0
run_watchdog 200 up
if [ "$(count_kickstarts connectors)" != 0 ] \
    || ! grep -q 'runner status is invalid' "$TEST_HOME/Library/Logs/nostradamus-watchdog.log"; then
  echo "  FAIL future runner timestamps were accepted as restart evidence"
  failures=$((failures + 1))
else
  echo "  ok  future runner timestamps are rejected and cannot trigger a restart"
fi

: > "$LAUNCHCTL_LOG"
write_connector_status completed 4000 4000
python3 -I - "$TEST_TMP/repo/data/_connectors/runner_status.json" <<'PY'
import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as source:
    value = json.load(source)
value["last_progress_at"] = value["last_progress_at"].replace("T", " ").replace(".000000Z", "Z")
with open(path, "w", encoding="utf-8") as destination:
    json.dump(value, destination, separators=(",", ":"))
PY
run_watchdog 200 up
if [ "$(count_kickstarts connectors)" != 0 ] \
    || ! grep -q 'runner status is invalid' "$TEST_HOME/Library/Logs/nostradamus-watchdog.log"; then
  echo "  FAIL non-canonical runner timestamp was accepted as restart evidence"
  failures=$((failures + 1))
else
  echo "  ok  non-canonical runner timestamps fail closed"
fi

: > "$LAUNCHCTL_LOG"
write_connector_status completed 60 60
STATUS_PATH="$TEST_TMP/repo/data/_connectors/runner_status.json"
mv "$STATUS_PATH" "$TEST_TMP/status-outside.json"
ln -s "$TEST_TMP/status-outside.json" "$STATUS_PATH"
run_watchdog 200 up
if [ "$(count_kickstarts connectors)" != 0 ]; then
  echo "  FAIL symlinked runner status triggered connector recovery"
  failures=$((failures + 1))
else
  echo "  ok  no-follow runner-status read rejects symlinks without recovery"
fi
rm -f "$STATUS_PATH" "$TEST_TMP/status-outside.json"

: > "$LAUNCHCTL_LOG"
rm -f "$TEST_HOME/Library/Application Support/nostradamus/connector-heal.at"
write_connector_status running 4000 0 4242 "$(hostname)"
run_watchdog 200 up 0 1 1 9999
if [ "$(count_kickstarts connectors)" != 0 ]; then
  echo "  FAIL stale status from an old pid killed a different live process"
  failures=$((failures + 1))
else
  echo "  ok  running-stale status cannot kill a different live process"
fi
run_watchdog 200 up 0 1 1 4242
if [ "$(count_kickstarts connectors)" != 1 ]; then
  echo "  FAIL same-host same-pid wedged connector was not restarted"
  failures=$((failures + 1))
else
  echo "  ok  same-host same-pid connector with four stale intervals is restarted"
fi

: > "$LAUNCHCTL_LOG"
AUTONOMY_LOCK="$TEST_HOME/.nostra-ops/connector-autonomy.lock"
LOCK_READY="$TEST_TMP/autonomy-lock.ready"
LOCK_RELEASE="$TEST_TMP/autonomy-lock.release"
python3 -I - "$AUTONOMY_LOCK" "$LOCK_READY" "$LOCK_RELEASE" <<'PY' &
import fcntl
import os
import sys
import time

lock_path, ready_path, release_path = sys.argv[1:]
descriptor = os.open(lock_path, os.O_RDWR | os.O_CREAT | os.O_APPEND, 0o600)
fcntl.flock(descriptor, fcntl.LOCK_EX)
with open(ready_path, "w", encoding="utf-8") as handle:
    handle.write("ready\n")
deadline = time.monotonic() + 10
while not os.path.exists(release_path) and time.monotonic() < deadline:
    time.sleep(0.01)
os.close(descriptor)
PY
lock_holder=$!
for _wait in $(seq 1 100); do
  [ -f "$LOCK_READY" ] && break
  sleep 0.01
done
run_watchdog 200 up 0 0 0
: > "$LOCK_RELEASE"
wait "$lock_holder"
if grep -q 'com.nostradamus.connectors' "$LAUNCHCTL_LOG"; then
  echo "  FAIL watchdog touched the connector while a role/service transition held its lease"
  failures=$((failures + 1))
else
  echo "  ok  connector transition lease suppresses watchdog bootstrap and restart"
fi

: > "$LAUNCHCTL_LOG"
rm -f "$TEST_HOME/Library/Application Support/nostradamus/connector-heal.at"
# Reproduce the documented Drive-absent clobber shape: deploy can conservatively leave an empty real data/
# directory in place. It is readable, but it is not the production pool symlink and must never start a writer.
rm "$TEST_TMP/repo/data"
mkdir "$TEST_TMP/repo/data"
run_watchdog 200 up 0 0 0
if grep -q 'com.nostradamus.connectors' "$LAUNCHCTL_LOG"; then
  echo "  FAIL real local data directory was mistaken for the unavailable Drive pool"
  failures=$((failures + 1))
else
  echo "  ok  Drive-absent real data directory neither bootstraps nor restarts connectors"
fi
rm -r "$TEST_TMP/repo/data"
ln -s "$TEST_TMP/pool" "$TEST_TMP/repo/data"

run_watchdog 503 up
first_heal_at="$(cat "$TEST_HOME/Library/Application Support/nostradamus/tunnel-heal.at")"
run_watchdog 200 up
run_watchdog 503 up
if [ "$(count_kickstarts tunnel)" != 1 ]; then
  echo "  FAIL a healthy check cleared the cooldown or a repeat failure re-kicked the tunnel"
  failures=$((failures + 1))
elif ! grep -q "SUPPRESS HEAL public-offline" "$TEST_HOME/Library/Logs/nostradamus-watchdog.log"; then
  echo "  FAIL repeat tunnel heal was suppressed without an incident log"
  failures=$((failures + 1))
elif [ "$(cat "$TEST_HOME/Library/Application Support/nostradamus/tunnel-heal.at")" != "$first_heal_at" ]; then
  echo "  FAIL healthy check did not preserve the tunnel cooldown timestamp"
  failures=$((failures + 1))
else
  echo "  ok  cooldown persists across recovery and logs repeat suppression"
fi

printf '%s\n' "$(( $(date +%s) - 300 ))" > "$TEST_HOME/Library/Application Support/nostradamus/tunnel-heal.at"
run_watchdog 503 up
if [ "$(count_kickstarts tunnel)" != 2 ]; then
  echo "  FAIL expired cooldown did not permit another tunnel heal"
  failures=$((failures + 1))
else
  echo "  ok  expired cooldown permits another tunnel heal"
fi

# A tunnel timestamp must not disable the independent two-check local-engine repair path.
run_watchdog 503 down
run_watchdog 503 down
if [ "$(count_kickstarts engine)" != 1 ]; then
  echo "  FAIL local engine supervision changed while tunnel cooldown state existed"
  failures=$((failures + 1))
else
  echo "  ok  local engine supervision remains independent"
fi

# A failed restart command must not earn a cooldown: the next cycle needs to retry immediately.
rm -f "$TEST_HOME/Library/Application Support/nostradamus/tunnel-heal.at"
: > "$LAUNCHCTL_LOG"
run_watchdog 503 up 1
run_watchdog 503 up 1
if [ -f "$TEST_HOME/Library/Application Support/nostradamus/tunnel-heal.at" ]; then
  echo "  FAIL a failed tunnel restart recorded a cooldown timestamp"
  failures=$((failures + 1))
elif [ "$(count_kickstarts tunnel)" != 2 ]; then
  echo "  FAIL a failed tunnel restart suppressed the next cycle's retry"
  failures=$((failures + 1))
elif ! grep -q "HEAL-FAILED public-offline" "$TEST_HOME/Library/Logs/nostradamus-watchdog.log"; then
  echo "  FAIL a failed tunnel restart was not recorded in the incident log"
  failures=$((failures + 1))
else
  echo "  ok  failed tunnel restarts remain retryable and do not start the cooldown"
fi

if [ "$failures" -ne 0 ]; then
  echo "$failures watchdog cooldown test(s) failed"
  exit 1
fi
echo "watchdog cooldown tests passed"
