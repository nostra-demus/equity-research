#!/usr/bin/env bash
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=service-load-contract.sh
source "$HERE/service-load-contract.sh"

failures=0
TEST_TMP="$(mktemp -d)" || exit 1
trap 'rm -rf "$TEST_TMP"' EXIT
PYTHON_BIN="$(command -v python3)"

portable_file_size() {
  "$PYTHON_BIN" -I - "$1" <<'PY'
import os
import sys

print(os.lstat(sys.argv[1]).st_size)
PY
}

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
chmod 700 "$TEST_CONFIG"
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

credential_plist() {
  local source="$1" destination="$2" value="$3"
  "$PYTHON_BIN" -I - "$source" "$destination" "$value" <<'PY'
import os
import plistlib
import sys

source, destination, value = sys.argv[1:]
with open(source, "rb") as handle:
    contract = plistlib.load(handle)
contract["EnvironmentVariables"]["CONNECTOR_TEST_TOKEN"] = value
with open(destination, "wb") as handle:
    plistlib.dump(contract, handle)
os.chmod(destination, 0o600)
PY
}

credential_value() {
  "$PYTHON_BIN" -I - "$1" <<'PY'
import plistlib
import sys

with open(sys.argv[1], "rb") as handle:
    contract = plistlib.load(handle)
print(contract.get("EnvironmentVariables", {}).get("CONNECTOR_TEST_TOKEN", ""))
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
RACE_SIZE="$(portable_file_size "$RACE_PLIST")"
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
  elif [ "$(portable_file_size "$RACE_PLIST")" != "$RACE_SIZE" ]; then
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

# A credential-aware activation owns the exact pre-install inode through a private claim. If another plist
# appears at the public pathname after the claim, activation must not overwrite either credential generation.
CLAIM_COLLISION_AGENTS="$TEST_TMP/LaunchAgents-claim-collision"
mkdir -p "$CLAIM_COLLISION_AGENTS"
CLAIM_COLLISION_DST="$CLAIM_COLLISION_AGENTS/com.nostradamus.connectors.plist"
CLAIM_COLLISION_PROVIDERS="$TEST_CONFIG/claim-collision-providers.env"
credential_plist "$VALID_PLIST" "$CLAIM_COLLISION_DST" old-secret
CLAIM_COLLISION_PATH="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
  "$CLAIM_COLLISION_DST" "$CLAIM_COLLISION_PROVIDERS")"
credential_plist "$VALID_PLIST" "$CLAIM_COLLISION_DST" new-secret
CLAIM_COLLISION_STAGED="$(mktemp "$CLAIM_COLLISION_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$CLAIM_COLLISION_STAGED"
chmod 600 "$CLAIM_COLLISION_STAGED"
mock_loaded=1
mock_launchctl_calls=0
launchctl() { mock_launchctl_calls=$((mock_launchctl_calls + 1)); return 1; }
if nostra_activate_connector_plist com.nostradamus.connectors "$CLAIM_COLLISION_STAGED" \
    "$CLAIM_COLLISION_DST" "$TEST_REPO" "$TEST_CONFIG" "$CLAIM_COLLISION_AGENTS" gui/test \
    "$CLAIM_COLLISION_PATH" "$HERE/migrate-connector-secrets.py" "$CLAIM_COLLISION_PROVIDERS" \
    >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  CLAIM_COLLISION_RESULT=0
else
  CLAIM_COLLISION_RESULT=$?
fi
if [ "$CLAIM_COLLISION_RESULT" = 0 ] \
  || [ "$mock_launchctl_calls" != 0 ] \
  || [ ! -f "$CLAIM_COLLISION_PATH" ] \
  || [ "$(credential_value "$CLAIM_COLLISION_PATH")" != old-secret ] \
  || [ "$(credential_value "$CLAIM_COLLISION_DST")" != new-secret ] \
  || ! grep -q '^CONNECTOR_TEST_TOKEN=old-secret$' "$CLAIM_COLLISION_PROVIDERS"; then
  echo "  FAIL concurrent connector pathname replacement was clobbered or lost its private claim"
  failures=$((failures + 1))
else
  echo "  ok  claimed activation refuses a concurrent pathname without losing either credential generation"
fi

# A fresh install claims absence with an owned guard. Replacing that guard before publication must retain the
# unexpected file in the private transaction, never overwrite or remove it as though it were ours.
ABSENT_COLLISION_AGENTS="$TEST_TMP/LaunchAgents-absence-collision"
mkdir -p "$ABSENT_COLLISION_AGENTS"
ABSENT_COLLISION_DST="$ABSENT_COLLISION_AGENTS/com.nostradamus.connectors.plist"
ABSENT_COLLISION_PROVIDERS="$TEST_CONFIG/absence-collision-providers.env"
ABSENT_COLLISION_CLAIM="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
  "$ABSENT_COLLISION_DST" "$ABSENT_COLLISION_PROVIDERS")"
credential_plist "$VALID_PLIST" "$ABSENT_COLLISION_DST.new" must-survive
mv -f "$ABSENT_COLLISION_DST.new" "$ABSENT_COLLISION_DST"
ABSENT_COLLISION_STAGED="$(mktemp "$ABSENT_COLLISION_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$ABSENT_COLLISION_STAGED"
chmod 600 "$ABSENT_COLLISION_STAGED"
mock_loaded=0
mock_launchctl_calls=0
launchctl() { mock_launchctl_calls=$((mock_launchctl_calls + 1)); return 1; }
if nostra_activate_connector_plist com.nostradamus.connectors "$ABSENT_COLLISION_STAGED" \
    "$ABSENT_COLLISION_DST" "$TEST_REPO" "$TEST_CONFIG" "$ABSENT_COLLISION_AGENTS" gui/test \
    "$ABSENT_COLLISION_CLAIM" "$HERE/migrate-connector-secrets.py" "$ABSENT_COLLISION_PROVIDERS" \
    >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  ABSENT_COLLISION_RESULT=0
else
  ABSENT_COLLISION_RESULT=$?
fi
ABSENT_RETAINED="$(find "$ABSENT_COLLISION_AGENTS" -type f -name public-entry -print -quit 2>/dev/null)"
if [ "$ABSENT_COLLISION_RESULT" = 0 ] || [ "$mock_launchctl_calls" != 0 ] \
  || [ -z "$ABSENT_RETAINED" ] || [ "$(credential_value "$ABSENT_RETAINED")" != must-survive ]; then
  echo "  FAIL initially-absent activation deleted or overwrote an unowned concurrent pathname"
  failures=$((failures + 1))
else
  echo "  ok  initially-absent activation retains an unowned concurrent pathname without launchd changes"
fi

# Ordinary bootstrap failure still restores and reloads the exact claimed prior plist, then removes the
# private claim/anchor transaction artifacts.
CLAIM_ROLLBACK_AGENTS="$TEST_TMP/LaunchAgents-claim-rollback"
mkdir -p "$CLAIM_ROLLBACK_AGENTS"
CLAIM_ROLLBACK_DST="$CLAIM_ROLLBACK_AGENTS/com.nostradamus.connectors.plist"
CLAIM_ROLLBACK_PROVIDERS="$TEST_CONFIG/claim-rollback-providers.env"
credential_plist "$VALID_PLIST" "$CLAIM_ROLLBACK_DST" rollback-secret
CLAIM_ROLLBACK_HASH="$(shasum -a 256 "$CLAIM_ROLLBACK_DST" | awk '{print $1}')"
CLAIM_ROLLBACK_PATH="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
  "$CLAIM_ROLLBACK_DST" "$CLAIM_ROLLBACK_PROVIDERS")"
CLAIM_ROLLBACK_STAGED="$(mktemp "$CLAIM_ROLLBACK_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$CLAIM_ROLLBACK_STAGED"
chmod 600 "$CLAIM_ROLLBACK_STAGED"
mock_loaded=1
mock_bootstrap_attempts=0
launchctl() {
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
if nostra_activate_connector_plist com.nostradamus.connectors "$CLAIM_ROLLBACK_STAGED" \
    "$CLAIM_ROLLBACK_DST" "$TEST_REPO" "$TEST_CONFIG" "$CLAIM_ROLLBACK_AGENTS" gui/test \
    "$CLAIM_ROLLBACK_PATH" "$HERE/migrate-connector-secrets.py" "$CLAIM_ROLLBACK_PROVIDERS" \
    >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  CLAIM_ROLLBACK_RESULT=0
else
  CLAIM_ROLLBACK_RESULT=$?
fi
if [ "$CLAIM_ROLLBACK_RESULT" = 0 ] \
  || [ "$(shasum -a 256 "$CLAIM_ROLLBACK_DST" | awk '{print $1}')" != "$CLAIM_ROLLBACK_HASH" ] \
  || [ -e "$CLAIM_ROLLBACK_PATH" ] \
  || ! loaded com.nostradamus.connectors \
  || [ "$mock_bootstrap_attempts" != 7 ]; then
  echo "  FAIL claimed connector activation failure did not restore exact prior file/load state"
  failures=$((failures + 1))
else
  echo "  ok  failed claimed activation restores and reloads the exact prior plist"
fi

# A failure at the irreversible boundary is still an activation failure: unload the replacement, restore
# the exact claim without consulting providers.env, and reload the previously-running service.
COMMIT_FAIL_AGENTS="$TEST_TMP/LaunchAgents-commit-fail"
mkdir -p "$COMMIT_FAIL_AGENTS"
COMMIT_FAIL_DST="$COMMIT_FAIL_AGENTS/com.nostradamus.connectors.plist"
COMMIT_FAIL_PROVIDERS="$TEST_CONFIG/commit-fail-providers.env"
credential_plist "$VALID_PLIST" "$COMMIT_FAIL_DST" commit-rollback-secret
COMMIT_FAIL_HASH="$(shasum -a 256 "$COMMIT_FAIL_DST" | awk '{print $1}')"
COMMIT_FAIL_CLAIM="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
  "$COMMIT_FAIL_DST" "$COMMIT_FAIL_PROVIDERS")"
COMMIT_FAIL_UNKNOWN="$(dirname "$COMMIT_FAIL_CLAIM")/interrupted-replacement.plist"
credential_plist "$VALID_PLIST" "$COMMIT_FAIL_UNKNOWN" retained-after-commit-failure
COMMIT_FAIL_STAGED="$(mktemp "$COMMIT_FAIL_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$COMMIT_FAIL_STAGED"
chmod 600 "$COMMIT_FAIL_STAGED"
mock_loaded=1
mock_bootstrap_attempts=0
launchctl() {
  case "$1" in
    bootout) mock_loaded=0; return 0 ;;
    bootstrap)
      mock_bootstrap_attempts=$((mock_bootstrap_attempts + 1))
      mock_loaded=1
      [ "$mock_bootstrap_attempts" = 1 ] && rm -f "$COMMIT_FAIL_PROVIDERS"
      return 0
      ;;
    kickstart) return 0 ;;
    *) return 1 ;;
  esac
}
if nostra_activate_connector_plist com.nostradamus.connectors "$COMMIT_FAIL_STAGED" \
    "$COMMIT_FAIL_DST" "$TEST_REPO" "$TEST_CONFIG" "$COMMIT_FAIL_AGENTS" gui/test \
    "$COMMIT_FAIL_CLAIM" "$HERE/migrate-connector-secrets.py" "$COMMIT_FAIL_PROVIDERS" \
    >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  COMMIT_FAIL_RESULT=0
else
  COMMIT_FAIL_RESULT=$?
fi
COMMIT_FAIL_RETAINED="$(find "$COMMIT_FAIL_AGENTS" -type f \
  -name interrupted-replacement.plist -print -quit 2>/dev/null)"
if [ "$COMMIT_FAIL_RESULT" = 0 ] \
  || [ "$(shasum -a 256 "$COMMIT_FAIL_DST" | awk '{print $1}')" != "$COMMIT_FAIL_HASH" ] \
  || [ -e "$COMMIT_FAIL_CLAIM" ] || [ -e "$COMMIT_FAIL_PROVIDERS" ] \
  || [ -z "$COMMIT_FAIL_RETAINED" ] \
  || [ "$(credential_value "$COMMIT_FAIL_RETAINED")" != retained-after-commit-failure ] \
  || ! loaded com.nostradamus.connectors || [ "$mock_bootstrap_attempts" != 2 ]; then
  echo "  FAIL post-bootstrap commit failure left the replacement active or lost the prior claim"
  sed 's/^/    /' "$TEST_TMP/activate.err" 2>/dev/null || true
  failures=$((failures + 1))
else
  echo "  ok  post-bootstrap commit failure unloads replacement and restores/reloads exact prior claim"
fi

SUCCESS_AGENTS="$TEST_TMP/LaunchAgents-success"
mkdir -p "$SUCCESS_AGENTS"
SUCCESS_DST="$SUCCESS_AGENTS/com.nostradamus.connectors.plist"
SUCCESS_PROVIDERS="$TEST_CONFIG/success-providers.env"
SUCCESS_CLAIM="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
  "$SUCCESS_DST" "$SUCCESS_PROVIDERS")"
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
    "$TEST_REPO" "$TEST_CONFIG" "$SUCCESS_AGENTS" gui/test \
    "$SUCCESS_CLAIM" "$HERE/migrate-connector-secrets.py" "$SUCCESS_PROVIDERS" \
    >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  echo "  FAIL valid connector contract did not activate"
  failures=$((failures + 1))
elif [ "$(shasum -a 256 "$SUCCESS_DST" | awk '{print $1}')" != "$(shasum -a 256 "$VALID_PLIST" | awk '{print $1}')" ] \
  || [ -e "$SUCCESS_CLAIM" ] || ! loaded com.nostradamus.connectors; then
  echo "  FAIL valid connector activation did not publish/load exact staged bytes"
  failures=$((failures + 1))
elif find "$SUCCESS_AGENTS" -maxdepth 1 \( -name '.com.nostradamus.connectors.backup.*' \
    -o -name '.com.nostradamus.connectors.staged.*' \
    -o -name '.com.nostradamus.connectors.plist.credential-claim-*' \
    -o -name '.com.nostradamus.connectors.plist.credential-committed-*' \) \
    -print -quit | grep -q .; then
  echo "  FAIL valid connector activation left a staging/transaction artifact"
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
