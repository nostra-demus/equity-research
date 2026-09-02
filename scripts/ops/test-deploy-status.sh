#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEPLOY="$ROOT/scripts/ops/deploy.sh"
TEST_TMP="$(mktemp -d)"
TEST_HOME="$TEST_TMP/home"
TEST_REPO="$TEST_TMP/repo"
TEST_STATE="$TEST_TMP/state"
trap 'rm -rf "$TEST_TMP"' EXIT

mkdir -p "$TEST_HOME" "$TEST_STATE"
chmod 700 "$TEST_STATE"
git -C "$TEST_TMP" init -q "$TEST_REPO"

TARGET="$(printf 'a%.0s' {1..40})"
DATA_TIP="$(printf 'c%.0s' {1..40})"
DEPLOYED="$(printf 'b%.0s' {1..40})"
STATUS="$TEST_STATE/deployment-status.json"

write_status() {
  HOME="$TEST_HOME" ENGINE_REPO_ROOT="$TEST_REPO" ENGINE_STATE_DIR="$TEST_STATE" \
    bash "$DEPLOY" --write-deployment-status "$1" "$2" "$3"
}

write_status "$TARGET" "$DEPLOYED" observed
first_since="$(python3 -I - "$STATUS" "$TARGET" "$DEPLOYED" <<'PY'
import json, os, stat, sys
path, target, deployed = sys.argv[1:]
info = os.lstat(path)
assert stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o600
value = json.load(open(path, encoding="utf-8"))
assert value["schemaVersion"] == 1
assert value["status"] == "pending"
assert value["targetSha"] == target and value["deployedSha"] == deployed
assert value["reason"] == "observed"
assert isinstance(value["pendingSince"], int) and isinstance(value["checkedAt"], int)
print(value["pendingSince"])
PY
)"

write_status "$TARGET" "$DEPLOYED" ci_not_green
python3 -I - "$STATUS" "$first_since" <<'PY'
import json, sys
value = json.load(open(sys.argv[1], encoding="utf-8"))
assert value["status"] == "pending"
assert value["pendingSince"] == int(sys.argv[2])
assert value["reason"] == "ci_not_green"
PY

# Autonomous data may advance main while the deployed program is unchanged. The visible lag age must not
# reset on every such tip; it resets only after production itself advances.
write_status "$DATA_TIP" "$DEPLOYED" observed
python3 -I - "$STATUS" "$first_since" "$DATA_TIP" <<'PY'
import json, sys
value = json.load(open(sys.argv[1], encoding="utf-8"))
assert value["targetSha"] == sys.argv[3]
assert value["pendingSince"] == int(sys.argv[2])
PY

write_status "$DATA_TIP" "$DATA_TIP" deployed
python3 -I - "$STATUS" "$DATA_TIP" <<'PY'
import json, sys
value = json.load(open(sys.argv[1], encoding="utf-8"))
assert value["status"] == "current"
assert value["targetSha"] == sys.argv[2] and value["deployedSha"] == sys.argv[2]
assert value["pendingSince"] is None and value["reason"] == "deployed"
PY

rm -f "$STATUS"
printf 'do not replace\n' > "$TEST_TMP/outside"
ln -s "$TEST_TMP/outside" "$STATUS"
if write_status "$TARGET" "$DEPLOYED" observed; then
  echo "FAIL unsafe deployment-status symlink was replaced" >&2
  exit 1
fi
grep -qx 'do not replace' "$TEST_TMP/outside"

echo "test-deploy-status.sh: lag age persists, recovery clears it, and unsafe paths fail closed"
