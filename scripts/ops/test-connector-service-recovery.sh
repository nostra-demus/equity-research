#!/usr/bin/env bash
# Focused static/portable release contract for connector-only recovery. The macOS service-load transaction
# itself is exercised by test-service-load-contract.sh; this test guards the role and non-truncation wiring
# on Linux CI as well as macOS.
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
INSTALL="$HERE/install-services.sh"
DEPLOY="$HERE/deploy.sh"
WATCHDOG="$HERE/watchdog.sh"
FAILOVER="$HERE/nostra-failover.sh"
SUPERVISOR="$HERE/connector-supervisor.py"
failures=0

check() {
  local description="$1" command="$2"
  if bash -c "$command"; then
    echo "  ok  $description"
  else
    echo "  FAIL $description"
    failures=$((failures + 1))
  fi
}

check "ops scripts remain valid shell" \
  "bash -n \"$INSTALL\" && bash -n \"$DEPLOY\" && bash -n \"$WATCHDOG\" && bash -n \"$FAILOVER\" && python3 -m py_compile \"$SUPERVISOR\""
check "installer accepts only the connector and OmniRoute narrow repair targets" \
  "grep -Fq 'case \"\$ONLY\" in connectors|omniroute)' \"$INSTALL\" && grep -Fq 'ONLY_SET=1' \"$INSTALL\""
check "unknown or misspelled installer arguments fail closed" \
  "grep -Fq 'ERROR: unknown argument:' \"$INSTALL\" && ! grep -Fq 'WARN ignoring unknown arg:' \"$INSTALL\""
check "connector-only install skips every runtime ops-script replacement" \
  "grep -Fq 'if [ -z \"\$ONLY\" ]; then' \"$INSTALL\" && grep -Fq 'install_runtime_script \"\$s\"' \"$INSTALL\""
check "full installs replace runtime scripts atomically instead of truncating live inodes" \
  "grep -Fq 'mktemp \"\$OPS/.\${script}.staged.XXXXXX\"' \"$INSTALL\" && grep -Fq 'mv \"\$staged\" \"\$OPS/\$script\"' \"$INSTALL\" && ! grep -Eq '^for s in .*; do cp ' \"$INSTALL\""
check "admin demotion becomes durable before doer-only removal can fail" \
  "awk '/persist_role admin/{seen=NR} /for label in .*DOER_ONLY/{remove=NR} END{exit !(seen && remove && seen < remove)}' \"$INSTALL\""
check "doer role is persisted only after successful install work" \
  "awk 'index(\$0, \"[ \\\"\\\$install_failed\\\" = 0 ] || exit 1\"){success=NR} /persist_role doer/{role=NR} END{exit !(success && role && role > success)}' \"$INSTALL\""
check "deploy gates the whole connector transaction on conservative doer truth" \
  "grep -Fq 'is_doer_host || return 0' \"$DEPLOY\" && grep -Fq 'return 1                                                # unsafe/unknown durable truth fails closed as admin' \"$DEPLOY\""
check "legacy doer absence invokes only the reviewed connector installer" \
  "grep -Fq 'install-services.sh\" --role doer --only connectors' \"$DEPLOY\""
check "deploy defers connector activation until the canonical Drive symlink resolves" \
  "awk 'index(\$0, \"if [ ! -L \\\"\\\$PROD/data\\\"\"){pool=NR} index(\$0, \"install-services.sh\\\" --role doer --only connectors\"){install=NR} END{exit !(pool && install && pool < install)}' \"$DEPLOY\""
check "watchdog delegates connector convergence to its reviewed installed supervisor" \
  "grep -Fq 'CONNECTOR_SUPERVISOR=\"\$HOME/.nostra-ops/connector-supervisor.py\"' \"$WATCHDOG\" && ! grep -Fq 'launchctl bootstrap \"gui/\$UID_NUM\" \"\$CONNECTOR_PLIST\"' \"$WATCHDOG\""
check "supervisor orders deploy lease before the exact installer autonomy transaction" \
  "grep -Fq 'ordered_locks_acquire(repo, ops, autonomy=False)' \"$SUPERVISOR\" && grep -Fq '[\"/bin/bash\", str(installer), \"--role\", \"doer\", \"--only\", \"connectors\"]' \"$SUPERVISOR\" && grep -Fq 'connector-autonomy.lock' \"$INSTALL\""
check "failover locks are bounded and ordered deploy then repository then connector autonomy" \
  "grep -Fq 'deadline = time.monotonic() + int(sys.argv[2])' \"$FAILOVER\" && awk 'index(\$0, \"acquire_standdown_locks\"){fn=NR} fn && index(\$0, \"exec 8>>\"){deploy=NR} fn && index(\$0, \"exec 9>>\"){repo=NR} fn && index(\$0, \"exec 7>>\"){autonomy=NR} END{exit !(fn && deploy && repo && autonomy && deploy < repo && repo < autonomy)}' \"$FAILOVER\""
check "UI/tunnel failover explicitly excludes the dedicated connector writer" \
  "grep -Fq 'NOSTRA_INSTALL_CONNECTORS=0 bash' \"$FAILOVER\" && grep -Fq 'remove_connector_writer' \"$FAILOVER\" && grep -Fq 'reviewed_prod_source' \"$FAILOVER\""
check "role readers require exact private stable bytes in every activation path" \
  "for f in \"$INSTALL\" \"$DEPLOY\" \"$FAILOVER\"; do grep -Fq 'before.st_nlink != 1 or before.st_mode & 0o077' \"\$f\" && grep -Fq 'if raw == b\"doer\\n\"' \"\$f\" || exit 1; done"
check "deploy creates and validates both global locks as private stable inodes" \
  "grep -Fq '[ ! -L \"\$DEPLOY_LOCK\" ]' \"$DEPLOY\" && grep -Fq 'os.fchmod(8, 0o600)' \"$DEPLOY\" && grep -Fq '[ ! -L \"\$GITLOCK\" ]' \"$DEPLOY\" && grep -Fq 'os.fchmod(9, 0o600)' \"$DEPLOY\" && grep -Fq 'opened.st_nlink != 1' \"$DEPLOY\""
check "failover stamps admin before cleanup and never skips dangling plists" \
  "grep -Fq 'if ! persist_admin_role; then' \"$FAILOVER\" && grep -Fq '[ -e \"\$f\" ] || [ -L \"\$f\" ] || continue' \"$FAILOVER\" && grep -Fq 'STANDDOWN INCOMPLETE' \"$FAILOVER\""

TEST_TMP="$(mktemp -d)" || exit 1
trap 'rm -rf "$TEST_TMP"' EXIT
FAILOVER_TEST_PROD="$TEST_TMP/failover-test-prod"
mkdir -p "$FAILOVER_TEST_PROD"
git -C "$FAILOVER_TEST_PROD" init -q
TEST_HOME="$TEST_TMP/home"
TEST_PROD="$TEST_TMP/prod"
TEST_OPS="$TEST_HOME/.nostra-ops"
mkdir -p "$TEST_OPS" "$TEST_PROD/.git"
for script in deploy.sh watchdog.sh housekeeping.sh; do
  printf 'live sentinel for %s\n' "$script" > "$TEST_OPS/$script"
done
runtime_identity() {
  for script in deploy.sh watchdog.sh housekeeping.sh; do
    cksum "$TEST_OPS/$script"
    ls -di "$TEST_OPS/$script"
  done
}

# Execute the real narrow path with nounset enabled and no OmniRoute on PATH. Production macOS ships Bash
# 3.2, whose empty-array expansion is the regression this covers; newer CI Bash still verifies the same
# command exits cleanly, removes no unrelated service, and never widens into the ordinary LABELS loop.
OMNI_MOCK_BIN="$TEST_TMP/omniroute-mock-bin"
mkdir -p "$OMNI_MOCK_BIN"
ln -s "$(command -v python3)" "$OMNI_MOCK_BIN/python3"
printf '%s\n' '#!/usr/bin/env bash' \
  'case "${1:-}" in print) exit 1 ;; list) exit 0 ;; bootout) exit 0 ;; esac' \
  'exit 1' > "$OMNI_MOCK_BIN/launchctl"
chmod +x "$OMNI_MOCK_BIN/launchctl"
mkdir -p "$TEST_HOME/Library/LaunchAgents"
printf 'stale crash-loop fixture\n' \
  > "$TEST_HOME/Library/LaunchAgents/com.nostradamus.omniroute.plist"
if HOME="$TEST_HOME" ENGINE_REPO_ROOT="$TEST_PROD" \
    PATH="$OMNI_MOCK_BIN:/usr/bin:/bin:/usr/sbin:/sbin" \
    /bin/bash -u "$INSTALL" --role admin --only omniroute \
      >"$TEST_TMP/omniroute-only.out" 2>&1; then
  omniroute_only_rc=0
else
  omniroute_only_rc=$?
fi
if [ "$omniroute_only_rc" -eq 0 ] \
    && ! grep -qi 'unbound variable' "$TEST_TMP/omniroute-only.out" \
    && grep -q 'skipping com.nostradamus.omniroute' "$TEST_TMP/omniroute-only.out" \
    && [ ! -e "$TEST_HOME/Library/LaunchAgents/com.nostradamus.omniroute.plist" ] \
    && [ ! -e "$TEST_OPS/role" ]; then
  echo "  ok  system Bash $('/bin/bash' -c 'printf %s "$BASH_VERSION"') executes --only omniroute under set -u"
else
  echo "  FAIL --only omniroute hit nounset/empty-array regression or widened its scope"
  sed 's/^/    /' "$TEST_TMP/omniroute-only.out" 2>/dev/null || true
  failures=$((failures + 1))
fi

before_runtime="$(runtime_identity)"
HOME="$TEST_HOME" ENGINE_REPO_ROOT="$TEST_PROD" NOSTRA_ENGINE_CONFIG_DIR=relative \
  bash "$INSTALL" --role doer --only connectors >"$TEST_TMP/only.out" 2>&1
only_rc=$?
after_runtime="$(runtime_identity)"
if [ "$only_rc" -eq 1 ] && [ "$before_runtime" = "$after_runtime" ] && [ ! -e "$TEST_OPS/role" ]; then
  echo "  ok  connector-only execution leaves live runtime script inodes/bytes and role truth untouched"
else
  echo "  FAIL connector-only execution touched runtime scripts/role or missed its safe preflight stop"
  failures=$((failures + 1))
fi

printf 'admin\n' > "$TEST_OPS/role"
before_admin_repair="$(runtime_identity)"
HOME="$TEST_HOME" ENGINE_REPO_ROOT="$TEST_PROD" \
  bash "$INSTALL" --role doer --only connectors >"$TEST_TMP/admin-only.out" 2>&1
admin_only_rc=$?
after_admin_repair="$(runtime_identity)"
if [ "$admin_only_rc" -eq 1 ] && [ "$before_admin_repair" = "$after_admin_repair" ] \
    && [ "$(cat "$TEST_OPS/role")" = admin ] \
    && grep -q 'requires this installed host to already be the doer' "$TEST_TMP/admin-only.out"; then
  echo "  ok  stale connector-only repair cannot undo an admin/failover stand-down"
else
  echo "  FAIL connector-only repair promoted or touched an explicitly stood-down admin"
  failures=$((failures + 1))
fi
rm -f "$TEST_OPS/role"

HOME="$TEST_HOME" bash "$INSTALL" --onyl connectors >"$TEST_TMP/typo.out" 2>&1
typo_rc=$?
if [ "$typo_rc" -eq 2 ] && grep -q 'ERROR: unknown argument: --onyl' "$TEST_TMP/typo.out"; then
  echo "  ok  misspelled connector-only option cannot broaden into a full install"
else
  echo "  FAIL misspelled connector-only option did not fail closed with rc=2"
  failures=$((failures + 1))
fi

empty_selector_ok=1
for empty_case in equals separate; do
  before_empty="$(runtime_identity)"
  if [ "$empty_case" = equals ]; then
    HOME="$TEST_HOME" bash "$INSTALL" --only= >"$TEST_TMP/empty-$empty_case.out" 2>&1
  else
    HOME="$TEST_HOME" bash "$INSTALL" --only '' >"$TEST_TMP/empty-$empty_case.out" 2>&1
  fi
  empty_rc=$?
  after_empty="$(runtime_identity)"
  if [ "$empty_rc" -ne 2 ] || [ "$before_empty" != "$after_empty" ] \
      || ! grep -q 'ERROR: --only needs a non-empty value' "$TEST_TMP/empty-$empty_case.out"; then
    empty_selector_ok=0
  fi
done
if [ "$empty_selector_ok" = 1 ]; then
  echo "  ok  empty --only forms fail closed without touching runtime scripts"
else
  echo "  FAIL empty --only form broadened scope or returned the wrong contract"
  failures=$((failures + 1))
fi

# Exercise the real stand-down function with launchctl stubbed. Every bootout must observe durable admin
# truth, and all doer plists must be gone when it returns while the failover monitor remains installed.
FAILOVER_HOME="$TEST_TMP/failover-home"
mkdir -p "$FAILOVER_HOME/.nostra-ops" "$FAILOVER_HOME/Library/LaunchAgents" "$FAILOVER_HOME/Library/Logs"
printf 'doer\n' > "$FAILOVER_HOME/.nostra-ops/role"
for label in failover watchdog deploy connectors tunnel; do
  printf '<plist/>\n' > "$FAILOVER_HOME/Library/LaunchAgents/com.nostradamus.$label.plist"
done
ln -s "$FAILOVER_HOME/missing-target" \
  "$FAILOVER_HOME/Library/LaunchAgents/com.nostradamus.dangling.plist"
FAILOVER_VIOLATION="$TEST_TMP/failover-violation"
if HOME="$FAILOVER_HOME" ENGINE_REPO_ROOT="$FAILOVER_TEST_PROD" NOSTRA_FAILOVER_LOG="$TEST_TMP/failover.log" \
    FAILOVER_SCRIPT="$FAILOVER" FAILOVER_VIOLATION="$FAILOVER_VIOLATION" bash <<'FAILOVER_TEST'
set -uo pipefail
source "$FAILOVER_SCRIPT"
launchctl() {
  if [ "${1:-}" = bootout ]; then
    [ "$(cat "$HOME/.nostra-ops/role" 2>/dev/null || true)" = admin ] \
      || printf 'bootout-before-admin\n' > "$FAILOVER_VIOLATION"
    return 0
  fi
  [ "${1:-}" = print ] && return 1
  return 0
}
stand_down
FAILOVER_TEST
then
  failover_rc=0
else
  failover_rc=$?
fi
if [ "$failover_rc" -eq 0 ] && [ "$(cat "$FAILOVER_HOME/.nostra-ops/role")" = admin ] \
    && [ ! -e "$FAILOVER_VIOLATION" ] \
    && [ -f "$FAILOVER_HOME/Library/LaunchAgents/com.nostradamus.failover.plist" ] \
    && [ ! -e "$FAILOVER_HOME/Library/LaunchAgents/com.nostradamus.connectors.plist" ] \
    && [ ! -L "$FAILOVER_HOME/Library/LaunchAgents/com.nostradamus.dangling.plist" ] \
    && [ ! -e "$FAILOVER_HOME/Library/LaunchAgents/com.nostradamus.deploy.plist" ]; then
  echo "  ok  failover stand-down verifies removal, including dangling service links"
else
  echo "  FAIL failover stand-down did not verify and remove autonomous services"
  failures=$((failures + 1))
fi

# A failed bootout is an incomplete transition, never a false dormant success. Its plist remains as a retry
# witness and durable admin truth prevents the watchdog/deploy from reviving more autonomy.
FAIL_BOOT_HOME="$TEST_TMP/fail-boot-home"
mkdir -p "$FAIL_BOOT_HOME/.nostra-ops" "$FAIL_BOOT_HOME/Library/LaunchAgents" "$FAIL_BOOT_HOME/Library/Logs"
printf 'doer\n' > "$FAIL_BOOT_HOME/.nostra-ops/role"
printf '<plist/>\n' > "$FAIL_BOOT_HOME/Library/LaunchAgents/com.nostradamus.failover.plist"
printf '<plist/>\n' > "$FAIL_BOOT_HOME/Library/LaunchAgents/com.nostradamus.connectors.plist"
if HOME="$FAIL_BOOT_HOME" ENGINE_REPO_ROOT="$FAILOVER_TEST_PROD" NOSTRA_FAILOVER_LOG="$TEST_TMP/fail-boot.log" \
    NOSTRA_FAILOVER_STOP_TRIES=1 FAILOVER_SCRIPT="$FAILOVER" bash <<'FAIL_BOOT_TEST'
set -uo pipefail
source "$FAILOVER_SCRIPT"
launchctl() {
  [ "${1:-}" = print ] && return 0
  return 1
}
stand_down
FAIL_BOOT_TEST
then
  fail_boot_rc=0
else
  fail_boot_rc=$?
fi
if [ "$fail_boot_rc" -ne 0 ] && [ "$(cat "$FAIL_BOOT_HOME/.nostra-ops/role")" = admin ] \
    && [ -f "$FAIL_BOOT_HOME/Library/LaunchAgents/com.nostradamus.connectors.plist" ] \
    && grep -q 'STANDDOWN INCOMPLETE' "$TEST_TMP/fail-boot.log" \
    && ! grep -q 'verified dormant' "$TEST_TMP/fail-boot.log"; then
  echo "  ok  failed service shutdown remains visible and retryable"
else
  echo "  FAIL failed service shutdown was reported as dormant or lost its retry witness"
  failures=$((failures + 1))
fi

# A held deploy lease is bounded. Stand-down records admin immediately, stops recovery agents, makes a
# best-effort tunnel/connector stop, and returns for the next monitor tick instead of hanging forever.
LOCK_HOME="$TEST_TMP/lock-home"
mkdir -p "$LOCK_HOME/.nostra-ops" "$LOCK_HOME/Library/LaunchAgents" "$LOCK_HOME/Library/Logs"
printf 'doer\n' > "$LOCK_HOME/.nostra-ops/role"
printf '<plist/>\n' > "$LOCK_HOME/Library/LaunchAgents/com.nostradamus.failover.plist"
for label in tunnel connectors external-ingest news-archive hk-track; do
  printf '<plist/>\n' > "$LOCK_HOME/Library/LaunchAgents/com.nostradamus.$label.plist"
done
LOCK_READY="$TEST_TMP/failover-lock-ready"
LOCK_RELEASE="$TEST_TMP/failover-lock-release"
LOCK_LAUNCH_LOG="$TEST_TMP/failover-lock-launchctl.log"
python3 -I - "$LOCK_HOME/.nostra-ops/.deploy.flock" "$LOCK_READY" "$LOCK_RELEASE" <<'PY' &
import fcntl
import os
import sys
import time

descriptor = os.open(sys.argv[1], os.O_WRONLY | os.O_CREAT, 0o600)
fcntl.flock(descriptor, fcntl.LOCK_EX)
open(sys.argv[2], "w").close()
deadline = time.monotonic() + 10
while not os.path.exists(sys.argv[3]) and time.monotonic() < deadline:
    time.sleep(0.01)
os.close(descriptor)
PY
lock_holder=$!
for _wait in $(seq 1 100); do [ -e "$LOCK_READY" ] && break; sleep 0.01; done
lock_started="$(date +%s)"
if HOME="$LOCK_HOME" ENGINE_REPO_ROOT="$FAILOVER_TEST_PROD" NOSTRA_FAILOVER_LOG="$TEST_TMP/lock.log" \
    NOSTRA_FAILOVER_LOCK_WAIT_SECONDS=1 NOSTRA_FAILOVER_STOP_TRIES=1 \
    FAILOVER_SCRIPT="$FAILOVER" LOCK_LAUNCH_LOG="$LOCK_LAUNCH_LOG" bash <<'LOCK_TEST'
set -uo pipefail
source "$FAILOVER_SCRIPT"
launchctl() {
  [ "${1:-}" = bootout ] && printf '%s\n' "$*" >> "$LOCK_LAUNCH_LOG"
  [ "${1:-}" = print ] && return 1
  return 0
}
stand_down
LOCK_TEST
then
  lock_rc=0
else
  lock_rc=$?
fi
lock_elapsed=$(( $(date +%s) - lock_started ))
: > "$LOCK_RELEASE"
wait "$lock_holder"
if [ "$lock_rc" -ne 0 ] && [ "$lock_elapsed" -lt 5 ] \
    && [ "$(cat "$LOCK_HOME/.nostra-ops/role")" = admin ] \
    && grep -q 'transition lease stayed unavailable' "$TEST_TMP/lock.log" \
    && grep -q 'com.nostradamus.external-ingest' "$LOCK_LAUNCH_LOG" \
    && grep -q 'com.nostradamus.news-archive' "$LOCK_LAUNCH_LOG" \
    && grep -q 'com.nostradamus.hk-track' "$LOCK_LAUNCH_LOG"; then
  echo "  ok  held deploy lease cannot hang stand-down and emergency-stops every autonomous job"
else
  echo "  FAIL held deploy lease hung stand-down or left a commit-capable job running"
  failures=$((failures + 1))
fi

# A failed takeover may create some services but must be rolled back immediately and stay admin so the next
# zero-connector tick can retry a clean activation.
ACTIVATE_HOME="$TEST_TMP/activate-home"
ACTIVATE_PROD="$TEST_TMP/activate-prod"
mkdir -p "$ACTIVATE_HOME/.nostra-ops" "$ACTIVATE_HOME/Library/LaunchAgents" \
  "$ACTIVATE_HOME/Library/Logs" "$ACTIVATE_PROD/scripts/ops"
git -C "$ACTIVATE_PROD" init -q
printf '%s\n' '#!/usr/bin/env bash' \
  'touch "$HOME/installer-ran"' \
  'mkdir -p "$HOME/Library/LaunchAgents"' \
  'printf "<plist/>\\n" > "$HOME/Library/LaunchAgents/com.nostradamus.tunnel.plist"' \
  'printf "<plist/>\\n" > "$HOME/Library/LaunchAgents/com.nostradamus.connectors.plist"' \
  'exit 9' > "$ACTIVATE_PROD/scripts/ops/install-services.sh"
chmod +x "$ACTIVATE_PROD/scripts/ops/install-services.sh"
git -C "$ACTIVATE_PROD" add scripts/ops/install-services.sh
git -C "$ACTIVATE_PROD" -c user.name=test -c user.email=test@example.com commit -qm fixture
git -C "$ACTIVATE_PROD" branch -M main
git -C "$ACTIVATE_PROD" remote add origin "$ACTIVATE_PROD"
git -C "$ACTIVATE_PROD" update-ref refs/remotes/origin/main HEAD
if HOME="$ACTIVATE_HOME" ENGINE_REPO_ROOT="$ACTIVATE_PROD" \
    NOSTRA_FAILOVER_LOG="$TEST_TMP/activate.log" NOSTRA_FAILOVER_STOP_TRIES=1 \
    FAILOVER_SCRIPT="$FAILOVER" bash <<'ACTIVATE_TEST'
set -uo pipefail
source "$FAILOVER_SCRIPT"
launchctl() { [ "${1:-}" = print ] && return 1; return 0; }
activate
ACTIVATE_TEST
then
  activate_rc=0
else
  activate_rc=$?
fi
if [ "$activate_rc" -ne 0 ] && [ -e "$ACTIVATE_HOME/installer-ran" ] \
    && [ "$(cat "$ACTIVATE_HOME/.nostra-ops/role")" = admin ] \
    && [ ! -e "$ACTIVATE_HOME/Library/LaunchAgents/com.nostradamus.tunnel.plist" ] \
    && [ ! -e "$ACTIVATE_HOME/Library/LaunchAgents/com.nostradamus.connectors.plist" ] \
    && grep -q 'ACTIVATE FAILED' "$TEST_TMP/activate.log"; then
  echo "  ok  failed activation rolls back partial autonomous services and stays retryable"
else
  echo "  FAIL failed activation left a partial doer or suppressed its retry"
  failures=$((failures + 1))
fi

# A reviewed successful serving takeover must fence a stale connector and must
# not reinstall it while publishing the UI/tunnel doer role.
TAKEOVER_HOME="$TEST_TMP/takeover-home"
TAKEOVER_PROD="$TEST_TMP/takeover-prod"
mkdir -p "$TAKEOVER_HOME/.nostra-ops" "$TAKEOVER_HOME/Library/LaunchAgents" \
  "$TAKEOVER_HOME/Library/Logs" "$TAKEOVER_PROD/scripts/ops"
printf '<plist/>\n' > "$TAKEOVER_HOME/Library/LaunchAgents/com.nostradamus.connectors.plist"
git -C "$TAKEOVER_PROD" init -q
printf '%s\n' '#!/usr/bin/env bash' \
  '[ "${NOSTRA_INSTALL_CONNECTORS:-}" = 0 ] || exit 7' \
  '[ ! -e "$HOME/Library/LaunchAgents/com.nostradamus.connectors.plist" ] || exit 8' \
  'printf "doer\\n" > "$HOME/.nostra-ops/role"' \
  'chmod 600 "$HOME/.nostra-ops/role"' \
  'touch "$HOME/takeover-installer-ran"' \
  'exit 0' > "$TAKEOVER_PROD/scripts/ops/install-services.sh"
chmod +x "$TAKEOVER_PROD/scripts/ops/install-services.sh"
git -C "$TAKEOVER_PROD" add scripts/ops/install-services.sh
git -C "$TAKEOVER_PROD" -c user.name=test -c user.email=test@example.com commit -qm fixture
git -C "$TAKEOVER_PROD" branch -M main
git -C "$TAKEOVER_PROD" remote add origin "$TAKEOVER_PROD"
git -C "$TAKEOVER_PROD" update-ref refs/remotes/origin/main HEAD
if HOME="$TAKEOVER_HOME" ENGINE_REPO_ROOT="$TAKEOVER_PROD" \
    NOSTRA_FAILOVER_LOG="$TEST_TMP/takeover.log" NOSTRA_FAILOVER_STOP_TRIES=1 \
    FAILOVER_SCRIPT="$FAILOVER" bash <<'TAKEOVER_TEST'
set -uo pipefail
source "$FAILOVER_SCRIPT"
launchctl() { [ "${1:-}" = print ] && return 1; return 0; }
activate
TAKEOVER_TEST
then
  takeover_rc=0
else
  takeover_rc=$?
fi
if [ "$takeover_rc" -eq 0 ] && [ -e "$TAKEOVER_HOME/takeover-installer-ran" ] \
    && [ "$(cat "$TAKEOVER_HOME/.nostra-ops/role")" = doer ] \
    && [ ! -e "$TAKEOVER_HOME/Library/LaunchAgents/com.nostradamus.connectors.plist" ]; then
  echo "  ok  reviewed serving takeover fences and never promotes the connector writer"
else
  echo "  FAIL serving takeover retained or reinstalled a connector writer"
  failures=$((failures + 1))
fi

# Local inconsistency is cleaned before the certificate/network guards. Cover both an interrupted admin
# transition with a still-live tunnel and a doer marker whose actual tunnel contract disappeared.
MAIN_MOCK_BIN="$TEST_TMP/main-mock-bin"
MAIN_LAUNCH_LOG="$TEST_TMP/main-launchctl.log"
mkdir -p "$MAIN_MOCK_BIN"
printf '%s\n' '#!/usr/bin/env bash' \
  'case "${1:-}" in' \
  '  bootout) printf "%s\\n" "$*" >> "$MOCK_LAUNCH_LOG"; exit 0;;' \
  '  print) exit 1;;' \
  '  list) exit 0;;' \
  'esac' \
  'exit 1' > "$MAIN_MOCK_BIN/launchctl"
chmod +x "$MAIN_MOCK_BIN/launchctl"
main_cleanup_ok=1
for cleanup_case in admin-leftover doer-no-tunnel doer-unloaded-tunnel; do
  CASE_HOME="$TEST_TMP/main-$cleanup_case"
  CASE_LOG="$TEST_TMP/main-$cleanup_case.log"
  mkdir -p "$CASE_HOME/.nostra-ops" "$CASE_HOME/Library/LaunchAgents" "$CASE_HOME/Library/Logs"
  printf '<plist/>\n' > "$CASE_HOME/Library/LaunchAgents/com.nostradamus.failover.plist"
  if [ "$cleanup_case" = admin-leftover ]; then
    printf 'admin\n' > "$CASE_HOME/.nostra-ops/role"
    printf '<plist/>\n' > "$CASE_HOME/Library/LaunchAgents/com.nostradamus.tunnel.plist"
    stale_plist="$CASE_HOME/Library/LaunchAgents/com.nostradamus.tunnel.plist"
  elif [ "$cleanup_case" = doer-no-tunnel ]; then
    printf 'doer\n' > "$CASE_HOME/.nostra-ops/role"
    printf '<plist/>\n' > "$CASE_HOME/Library/LaunchAgents/com.nostradamus.external-ingest.plist"
    stale_plist="$CASE_HOME/Library/LaunchAgents/com.nostradamus.external-ingest.plist"
  else
    printf 'doer\n' > "$CASE_HOME/.nostra-ops/role"
    printf '<plist/>\n' > "$CASE_HOME/Library/LaunchAgents/com.nostradamus.tunnel.plist"
    stale_plist="$CASE_HOME/Library/LaunchAgents/com.nostradamus.tunnel.plist"
  fi
  : > "$MAIN_LAUNCH_LOG"
  HOME="$CASE_HOME" ENGINE_REPO_ROOT="$FAILOVER_TEST_PROD" PATH="$MAIN_MOCK_BIN:/usr/bin:/bin" MOCK_LAUNCH_LOG="$MAIN_LAUNCH_LOG" \
    NOSTRA_FAILOVER_LOG="$CASE_LOG" NOSTRA_FAILOVER_STOP_TRIES=1 \
    bash "$FAILOVER" >/dev/null 2>&1
  if [ -e "$stale_plist" ] || [ "$(cat "$CASE_HOME/.nostra-ops/role")" != admin ] \
      || ! grep -q 'LOCAL CLEANUP' "$CASE_LOG" || [ ! -s "$MAIN_LAUNCH_LOG" ]; then
    main_cleanup_ok=0
  fi
done
if [ "$main_cleanup_ok" -eq 1 ]; then
  echo "  ok  local partial state cleans up before missing-certificate/network exits"
else
  echo "  FAIL blind monitor skipped local cleanup or trusted doer intent without a tunnel"
  failures=$((failures + 1))
fi

if [ "$failures" -ne 0 ]; then
  echo "$failures connector service recovery contract test(s) failed"
  exit 1
fi
echo "connector service recovery contract tests passed"
