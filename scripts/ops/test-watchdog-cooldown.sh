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

# Exercise the real watchdog with PATH-isolated command doubles. Any unexpected curl target fails;
# launchctl only records arguments. No real service or network endpoint can be touched by this test.
TEST_TMP="$(mktemp -d)" || exit 1
trap 'rm -rf "$TEST_TMP"' EXIT
MOCK_BIN="$TEST_TMP/bin"
TEST_HOME="$TEST_TMP/home"
LAUNCHCTL_LOG="$TEST_TMP/launchctl.calls"
mkdir -p "$MOCK_BIN" "$TEST_HOME/Library/LaunchAgents" "$TEST_HOME/Library/Application Support/nostradamus"
: > "$TEST_HOME/Library/LaunchAgents/com.nostradamus.tunnel.plist"
: > "$TEST_HOME/Library/Application Support/nostradamus/enrich-health.at"
: > "$LAUNCHCTL_LOG"
mkdir -p "$TEST_HOME/.nostra-ops"
cat > "$TEST_HOME/.nostra-ops/connector-supervisor.py" <<'PY'
import os
from pathlib import Path

marker = Path(os.environ["HOME"]) / ".nostra-ops" / "supervisor-test.calls"
count = int(marker.read_text() if marker.exists() else "0")
marker.write_text(str(count + 1))
PY
chmod 700 "$TEST_HOME/.nostra-ops/connector-supervisor.py"
mkdir -p "$TEST_TMP/repo/scripts/ops"
cp "$TEST_HOME/.nostra-ops/connector-supervisor.py" "$TEST_TMP/repo/scripts/ops/connector-supervisor.py"
git -C "$TEST_TMP/repo" init -q -b main
git -C "$TEST_TMP/repo" config user.email test@example.invalid
git -C "$TEST_TMP/repo" config user.name Test
git -C "$TEST_TMP/repo" add scripts/ops/connector-supervisor.py
git -C "$TEST_TMP/repo" commit -qm supervisor-fixture
git -C "$TEST_TMP/repo" update-ref refs/remotes/origin/main HEAD

# First-rollout migration: the prior deploy process can copy the new watchdog before it knows the helper
# filename. The watchdog may bootstrap that installed helper only from clean current main == origin/main.
BOOTSTRAP_REPO="$TEST_TMP/bootstrap-repo"
BOOTSTRAP_HOME="$TEST_TMP/bootstrap-home"
mkdir -p "$BOOTSTRAP_REPO/scripts/ops" "$BOOTSTRAP_HOME/.nostra-ops"
cp "$HERE/connector-supervisor.py" "$BOOTSTRAP_REPO/scripts/ops/connector-supervisor.py"
git -C "$BOOTSTRAP_REPO" init -q -b main
git -C "$BOOTSTRAP_REPO" config user.email test@example.invalid
git -C "$BOOTSTRAP_REPO" config user.name Test
git -C "$BOOTSTRAP_REPO" add scripts/ops/connector-supervisor.py
git -C "$BOOTSTRAP_REPO" commit -qm bootstrap
git -C "$BOOTSTRAP_REPO" update-ref refs/remotes/origin/main HEAD
if HOME="$BOOTSTRAP_HOME" ENGINE_REPO_ROOT="$BOOTSTRAP_REPO" WATCHDOG_SCRIPT="$HERE/watchdog.sh" \
    bash <<'BOOTSTRAP_TEST'
set -uo pipefail
source "$WATCHDOG_SCRIPT"
REPO="$ENGINE_REPO_ROOT"
PYTHON="$(command -v python3)"
CONNECTOR_SUPERVISOR="$HOME/.nostra-ops/connector-supervisor.py"
bootstrap_connector_supervisor
BOOTSTRAP_TEST
then bootstrap_rc=0; else bootstrap_rc=$?; fi
if [ "$bootstrap_rc" -eq 0 ] && [ -f "$BOOTSTRAP_HOME/.nostra-ops/connector-supervisor.py" ] \
    && [ ! -L "$BOOTSTRAP_HOME/.nostra-ops/connector-supervisor.py" ]; then
  echo "  ok  clean first-rollout watchdog atomically installs the reviewed supervisor"
else
  echo "  FAIL first-rollout watchdog could not bootstrap the reviewed supervisor"
  failures=$((failures + 1))
fi
rm -f "$BOOTSTRAP_HOME/.nostra-ops/connector-supervisor.py"
printf '# dirty\n' >> "$BOOTSTRAP_REPO/scripts/ops/connector-supervisor.py"
if HOME="$BOOTSTRAP_HOME" ENGINE_REPO_ROOT="$BOOTSTRAP_REPO" WATCHDOG_SCRIPT="$HERE/watchdog.sh" \
    bash <<'DIRTY_BOOTSTRAP_TEST'
set -uo pipefail
source "$WATCHDOG_SCRIPT"
REPO="$ENGINE_REPO_ROOT"
PYTHON="$(command -v python3)"
CONNECTOR_SUPERVISOR="$HOME/.nostra-ops/connector-supervisor.py"
bootstrap_connector_supervisor
DIRTY_BOOTSTRAP_TEST
then dirty_bootstrap_rc=0; else dirty_bootstrap_rc=$?; fi
if [ "$dirty_bootstrap_rc" -eq 0 ] \
    && ! grep -q '# dirty' "$BOOTSTRAP_HOME/.nostra-ops/connector-supervisor.py" \
    && cmp -s "$BOOTSTRAP_HOME/.nostra-ops/connector-supervisor.py" \
      <(git -C "$BOOTSTRAP_REPO" show HEAD:scripts/ops/connector-supervisor.py); then
  echo "  ok  dirty working-tree helper is ignored in favor of the reviewed Git object"
else
  echo "  FAIL dirty helper bytes crossed the first-rollout trust gate"
  failures=$((failures + 1))
fi

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

count_kickstarts() {
  grep -c "kickstart -k .*com.nostradamus.$1" "$LAUNCHCTL_LOG" 2>/dev/null || true
}

mkdir -p "$TEST_TMP/repo"
run_watchdog 200 up
if [ "$(cat "$TEST_HOME/.nostra-ops/supervisor-test.calls" 2>/dev/null || echo 0)" != 1 ]; then
  echo "  FAIL watchdog did not invoke the installed connector supervisor exactly once"
  failures=$((failures + 1))
elif grep -q 'com.nostradamus.connectors' "$LAUNCHCTL_LOG"; then
  echo "  FAIL watchdog bypassed the supervisor and mutated connector launchd state directly"
  failures=$((failures + 1))
else
  echo "  ok  watchdog delegates connector convergence to the installed reviewed supervisor"
fi

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
