#!/usr/bin/env bash
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=service-load-contract.sh
source "$HERE/service-load-contract.sh"

failures=0
TEST_TMP="$(mktemp -d)" || exit 1
trap 'rm -rf "$TEST_TMP"' EXIT
PYTHON_BIN="$(command -v python3)"

expect_connector_rejection() {
  local description="$1" plist_path="$2" repo_root="$3" config_dir="$4"
  if nostra_validate_connector_plist "$plist_path" "$repo_root" "$config_dir" \
      >"$TEST_TMP/validation.out" 2>"$TEST_TMP/validation.err"; then
    echo "  FAIL $description was accepted"
    failures=$((failures + 1))
  else
    echo "  ok  $description is rejected"
  fi
}

TEST_REPO="$TEST_TMP/nostra-prod"
TEST_CONFIG="$TEST_TMP/config"
TEST_HOME="$TEST_TMP/home"
mkdir -p "$TEST_REPO" "$TEST_CONFIG" "$TEST_HOME"
VALID_PLIST="$TEST_TMP/connectors-valid.plist"
"$PYTHON_BIN" -I - "$VALID_PLIST" "$TEST_REPO" "$TEST_CONFIG" "$TEST_HOME" <<'PY'
import os
import plistlib
import sys

destination, repo_root, config_dir, home = sys.argv[1:]
contract = {
    "Label": "com.nostradamus.connectors",
    "EnvironmentVariables": {
        "HOME": home,
        "PATH": "/usr/bin:/bin",
        "NOSTRA_CONNECTOR_CREDENTIAL_SOURCE": "providers_env",
        "NOSTRA_ENGINE_CONFIG_DIR": config_dir,
    },
    "WorkingDirectory": repo_root,
    "ProgramArguments": [
        "/usr/bin/env",
        "python3",
        "-I",
        os.path.join(repo_root, ".claude", "tools", "run_connectors.py"),
        "--data-root",
        os.path.join(repo_root, "data"),
    ],
    "MaterializeDatalessFiles": True,
    "RunAtLoad": True,
    "StartInterval": 900,
    "ThrottleInterval": 60,
    "StandardOutPath": os.path.join(home, "Library", "Logs", "nostradamus-connectors.log"),
    "StandardErrorPath": os.path.join(home, "Library", "Logs", "nostradamus-connectors.log"),
}
with open(destination, "wb") as handle:
    plistlib.dump(contract, handle)
os.chmod(destination, 0o600)
PY

if nostra_validate_connector_plist "$VALID_PLIST" "$TEST_REPO" "$TEST_CONFIG" >/dev/null 2>&1; then
  echo "  ok  valid connector production contract is accepted"
else
  echo "  FAIL valid connector production contract was rejected"
  failures=$((failures + 1))
fi

mutate_plist() {
  local source="$1" destination="$2" mutation="$3"
  "$PYTHON_BIN" -I - "$source" "$destination" "$mutation" <<'PY'
import os
import plistlib
import sys

source, destination, mutation = sys.argv[1:]
with open(source, "rb") as handle:
    contract = plistlib.load(handle)
if mutation == "credential":
    contract["EnvironmentVariables"]["CONNECTOR_TEST_TOKEN"] = "must-not-appear-in-errors"
elif mutation == "no-isolation":
    contract["ProgramArguments"].remove("-I")
elif mutation == "cadence":
    contract["StartInterval"] = 901
elif mutation == "config":
    contract["EnvironmentVariables"]["NOSTRA_ENGINE_CONFIG_DIR"] = "/unexpected/config"
else:
    raise SystemExit(f"unknown mutation: {mutation}")
with open(destination, "wb") as handle:
    plistlib.dump(contract, handle)
os.chmod(destination, 0o600)
PY
}

for mutation in credential no-isolation cadence config; do
  MUTATED_PLIST="$TEST_TMP/connectors-$mutation.plist"
  mutate_plist "$VALID_PLIST" "$MUTATED_PLIST" "$mutation"
  expect_connector_rejection "connector $mutation contract defect" "$MUTATED_PLIST" "$TEST_REPO" "$TEST_CONFIG"
  if grep -q 'must-not-appear-in-errors' "$TEST_TMP/validation.err"; then
    echo "  FAIL connector validator leaked a credential value"
    failures=$((failures + 1))
  fi
done

chmod 640 "$VALID_PLIST"
expect_connector_rejection "group-readable connector plist" "$VALID_PLIST" "$TEST_REPO" "$TEST_CONFIG"
chmod 600 "$VALID_PLIST"
ln -s "$VALID_PLIST" "$TEST_TMP/connectors-link.plist"
expect_connector_rejection "symlink connector plist" "$TEST_TMP/connectors-link.plist" "$TEST_REPO" "$TEST_CONFIG"

RACE_PLIST="$TEST_TMP/connectors-same-size-race.plist"
cp "$VALID_PLIST" "$RACE_PLIST"
chmod 600 "$RACE_PLIST"
RACE_SIZE="$(stat -f '%z' "$RACE_PLIST")"
RACE_SYNC="$TEST_TMP/validator-sync"
mkdir -p "$RACE_SYNC"
nostra_validate_connector_plist "$RACE_PLIST" "$TEST_REPO" "$TEST_CONFIG" "$RACE_SYNC" \
  >"$TEST_TMP/race.out" 2>"$TEST_TMP/race.err" &
RACE_PID=$!
for _wait in $(seq 1 200); do [ -f "$RACE_SYNC/validator-opened" ] && break; sleep 0.01; done
if [ ! -f "$RACE_SYNC/validator-opened" ]; then
  echo "  FAIL same-size mutation test could not synchronize with secure open"
  failures=$((failures + 1))
  kill "$RACE_PID" 2>/dev/null || true
  wait "$RACE_PID" 2>/dev/null || true
else
  "$PYTHON_BIN" -I - "$RACE_PLIST" "$RACE_SYNC/mutation-complete" <<'PY'
import os
import sys

path, completion = sys.argv[1:]
before = os.stat(path)
with open(path, "r+b", buffering=0) as handle:
    payload = handle.read()
    mutated = payload.replace(b"<integer>900</integer>", b"<integer>901</integer>", 1)
    if mutated == payload or len(mutated) != len(payload):
        raise SystemExit("same-size fixture mutation was not possible")
    handle.seek(0)
    handle.write(mutated)
    os.fsync(handle.fileno())
# Force a distinct mtime even on a coarse timestamp filesystem; ctime changes independently as well.
os.utime(path, ns=(before.st_atime_ns, before.st_mtime_ns + 1_000_000_000))
descriptor = os.open(completion, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
os.close(descriptor)
PY
  if wait "$RACE_PID"; then RACE_RESULT=0; else RACE_RESULT=$?; fi
  if [ "$RACE_RESULT" = 0 ]; then
    echo "  FAIL same-size in-place mutation escaped connector validation"
    failures=$((failures + 1))
  elif [ "$(stat -f '%z' "$RACE_PLIST")" != "$RACE_SIZE" ]; then
    echo "  FAIL timestamp regression did not preserve file size"
    failures=$((failures + 1))
  elif ! grep -Eq 'changed during secure read|changed during validation' "$TEST_TMP/race.err"; then
    echo "  FAIL same-size mutation was rejected for an unexpected reason"
    failures=$((failures + 1))
  else
    echo "  ok  mtime/ctime checks reject a deterministic same-size in-place mutation"
  fi
fi

# The activation helper must restore the old on-disk contract before touching launchd when the atomic
# replacement cannot be verified, and restore both file + loaded state when a valid replacement will not load.
ROLLBACK_AGENTS="$TEST_TMP/LaunchAgents"
mkdir -p "$ROLLBACK_AGENTS"
ROLLBACK_DST="$ROLLBACK_AGENTS/com.nostradamus.connectors.plist"
mutate_plist "$VALID_PLIST" "$ROLLBACK_DST" cadence
ROLLBACK_HASH="$(shasum -a 256 "$ROLLBACK_DST" | awk '{print $1}')"

mock_loaded=1
mock_launchctl_calls=0
mock_bootstrap_attempts=0
loaded() { [ "$mock_loaded" = 1 ]; }
launchctl() {
  mock_launchctl_calls=$((mock_launchctl_calls + 1))
  case "$1" in
    bootout) mock_loaded=0; return 0 ;;
    bootstrap) mock_loaded=1; return 0 ;;
    kickstart) return 0 ;;
    *) return 1 ;;
  esac
}

INVALID_STAGED="$(mktemp "$ROLLBACK_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
mutate_plist "$VALID_PLIST" "$INVALID_STAGED" no-isolation
if nostra_activate_connector_plist com.nostradamus.connectors "$INVALID_STAGED" "$ROLLBACK_DST" \
    "$TEST_REPO" "$TEST_CONFIG" "$ROLLBACK_AGENTS" gui/test >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  echo "  FAIL invalid installed connector contract activated"
  failures=$((failures + 1))
elif [ "$mock_launchctl_calls" != 0 ] \
  || [ "$(shasum -a 256 "$ROLLBACK_DST" | awk '{print $1}')" != "$ROLLBACK_HASH" ] \
  || ! loaded com.nostradamus.connectors; then
  echo "  FAIL pre-bootout connector verification did not preserve prior file/service"
  failures=$((failures + 1))
else
  echo "  ok  failed installed verification rolls back before bootout"
fi

mock_loaded=1
mock_launchctl_calls=0
mock_bootstrap_attempts=0
launchctl() {
  mock_launchctl_calls=$((mock_launchctl_calls + 1))
  case "$1" in
    bootout) return 0 ;; # Simulate launchd accepting bootout while the prior job remains registered.
    bootstrap) mock_bootstrap_attempts=$((mock_bootstrap_attempts + 1)); return 1 ;;
    kickstart) return 0 ;;
    *) return 1 ;;
  esac
}
sleep() { :; }
STICKY_STAGED="$(mktemp "$ROLLBACK_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$STICKY_STAGED"
chmod 600 "$STICKY_STAGED"
if nostra_activate_connector_plist com.nostradamus.connectors "$STICKY_STAGED" "$ROLLBACK_DST" \
    "$TEST_REPO" "$TEST_CONFIG" "$ROLLBACK_AGENTS" gui/test >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  STICKY_RESULT=0
else
  STICKY_RESULT=$?
fi
unset -f sleep
if [ "$STICKY_RESULT" = 0 ]; then
  echo "  FAIL connector reported success while prior job ignored bootout"
  failures=$((failures + 1))
elif [ "$(shasum -a 256 "$ROLLBACK_DST" | awk '{print $1}')" != "$ROLLBACK_HASH" ] \
  || ! loaded com.nostradamus.connectors \
  || [ "$mock_bootstrap_attempts" != 0 ]; then
  echo "  FAIL sticky prior connector state was confused with replacement activation"
  failures=$((failures + 1))
else
  echo "  ok  prior job surviving bootout cannot masquerade as replacement success"
fi

mock_loaded=1
mock_launchctl_calls=0
mock_bootstrap_attempts=0
launchctl() {
  mock_launchctl_calls=$((mock_launchctl_calls + 1))
  case "$1" in
    bootout) mock_loaded=0; return 0 ;;
    bootstrap)
      mock_bootstrap_attempts=$((mock_bootstrap_attempts + 1))
      if [ "$mock_bootstrap_attempts" -le 6 ]; then return 1; fi
      mock_loaded=1
      return 0
      ;;
    kickstart) return 0 ;;
    *) return 1 ;;
  esac
}
VALID_STAGED="$(mktemp "$ROLLBACK_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$VALID_STAGED"
chmod 600 "$VALID_STAGED"
if nostra_activate_connector_plist com.nostradamus.connectors "$VALID_STAGED" "$ROLLBACK_DST" \
    "$TEST_REPO" "$TEST_CONFIG" "$ROLLBACK_AGENTS" gui/test >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  echo "  FAIL connector activation failure returned success"
  failures=$((failures + 1))
elif [ "$(shasum -a 256 "$ROLLBACK_DST" | awk '{print $1}')" != "$ROLLBACK_HASH" ] \
  || ! loaded com.nostradamus.connectors \
  || [ "$mock_bootstrap_attempts" != 7 ]; then
  echo "  FAIL connector activation failure did not restore prior file/load state"
  failures=$((failures + 1))
elif find "$ROLLBACK_AGENTS" -maxdepth 1 -name '.com.nostradamus.connectors.backup.*' -print -quit | grep -q .; then
  echo "  FAIL successful connector rollback left a backup artifact"
  failures=$((failures + 1))
else
  echo "  ok  failed connector activation restores prior file and loaded state"
fi

SUCCESS_AGENTS="$TEST_TMP/LaunchAgents-success"
mkdir -p "$SUCCESS_AGENTS"
SUCCESS_DST="$SUCCESS_AGENTS/com.nostradamus.connectors.plist"
SUCCESS_STAGED="$(mktemp "$SUCCESS_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$SUCCESS_STAGED"
chmod 600 "$SUCCESS_STAGED"
mock_loaded=0
mock_launchctl_calls=0
launchctl() {
  mock_launchctl_calls=$((mock_launchctl_calls + 1))
  case "$1" in
    bootout) mock_loaded=0; return 0 ;;
    bootstrap) mock_loaded=1; return 0 ;;
    kickstart) return 0 ;;
    *) return 1 ;;
  esac
}
if ! nostra_activate_connector_plist com.nostradamus.connectors "$SUCCESS_STAGED" "$SUCCESS_DST" \
    "$TEST_REPO" "$TEST_CONFIG" "$SUCCESS_AGENTS" gui/test >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  echo "  FAIL valid connector contract did not activate"
  failures=$((failures + 1))
elif [ "$(shasum -a 256 "$SUCCESS_DST" | awk '{print $1}')" != "$(shasum -a 256 "$VALID_PLIST" | awk '{print $1}')" ] \
  || ! loaded com.nostradamus.connectors; then
  echo "  FAIL valid connector activation did not publish/load exact staged bytes"
  failures=$((failures + 1))
elif find "$SUCCESS_AGENTS" -maxdepth 1 \( -name '.com.nostradamus.connectors.backup.*' \
    -o -name '.com.nostradamus.connectors.staged.*' \) -print -quit | grep -q .; then
  echo "  FAIL valid connector activation left a staging/backup artifact"
  failures=$((failures + 1))
else
  echo "  ok  valid connector activation atomically publishes and loads"
fi

unset -f launchctl loaded
loaded() { return 1; }
if nostra_report_loaded com.nostradamus.connectors >/dev/null 2>&1; then
  echo "  FAIL failed bootstrap returned success"
  failures=$((failures + 1))
else
  echo "  ok  failed bootstrap returns nonzero"
fi

loaded() { return 0; }
if nostra_report_loaded com.nostradamus.connectors >/dev/null 2>&1; then
  echo "  ok  loaded service returns success"
else
  echo "  FAIL loaded service returned nonzero"
  failures=$((failures + 1))
fi

if [ "$failures" = 0 ]; then
  echo "PASS: service load result contract"
  exit 0
fi
echo "FAIL: service load result contract — $failures failure(s)"
exit 1
