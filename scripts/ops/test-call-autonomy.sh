#!/usr/bin/env bash
# Portable contract test for the single automatic calls/review owner and legacy timer retirement.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
INSTALL="$ROOT/scripts/ops/install-services.sh"
DEPLOY="$ROOT/scripts/ops/deploy.sh"
HOUSEKEEPING="$ROOT/scripts/ops/housekeeping.sh"
TEMPLATE="$ROOT/scripts/ops/com.nostradamus.engine.plist"
TMP_ROOT="$(mktemp -d)"
trap 'rm -rf "$TMP_ROOT"' EXIT
fail=0

check() {
  local name="$1"; shift
  if "$@"; then echo "  ok  $name"; else echo "  FAIL $name"; fail=1; fi
}

owner_probe() {
  local role="$1" connectors="$2" expected="$3" home
  home="$TMP_ROOT/owner-$role-$connectors"
  mkdir -p "$home"
  [ "$(HOME="$home" NOSTRA_INSTALL_CONNECTORS="$connectors" \
      NOSTRA_TEST_PRINT_AUTOMATION_OWNER=1 bash "$INSTALL" --role "$role")" = "$expected" ]
}

echo "== automatic-owner truth table =="
check "permanent doer + connector writer owns automation" owner_probe doer 1 "1 batch"
check "serving-only failover owns no automation" owner_probe doer 0 "0 off"
check "admin owns no automation" owner_probe admin 1 "0 off"
check "installer renders the shared owner token" grep -Fq \
  's#{{AUTOMATION_OWNER}}#$e_auto#g' "$INSTALL"
check "installer retires old review owner before engine install" awk '
  /retire_legacy_review_agent \|\| exit 1/{retire=NR}
  /for label in "\$\{LABELS\[@\]\}"/{install=NR}
  END{exit !(retire && install && retire < install)}' "$INSTALL"

echo "== engine plist contract =="
if python3 - "$TEMPLATE" <<'PYTEMPLATE'
import plistlib, re, sys
raw = open(sys.argv[1], encoding="utf-8").read()
for token in ("INTAKE_AUTO_ANALYZE", "CALL_UPDATE_AUTO_ENABLED",
              "REVIEW_DISPATCH_ENABLED", "CONVICTION_LOOP_ENABLED"):
    assert f"<key>{token}</key><string>{{{{AUTOMATION_OWNER}}}}</string>" in raw
assert "<key>BRIDGE_MODE</key><string>{{BRIDGE_MODE}}</string>" in raw
# Substitute every template field only so plistlib also proves the tracked template remains valid XML.
for token in ("HOME", "ENGINE_REPO_ROOT", "STATE_DIR", "PLIST_PATH", "NODE_BIN"):
    raw = raw.replace("{{" + token + "}}", "/tmp/nostra")
raw = raw.replace("{{AUTOMATION_OWNER}}", "0").replace("{{BRIDGE_MODE}}", "off")
plistlib.loads(re.sub(br"<!--.*?-->", b"", raw.encode(), flags=re.S))
PYTEMPLATE
then echo "  ok  template renders every automatic loop from one owner value"
else echo "  FAIL template automatic-owner contract"; fail=1
fi
check "tracked hk-review plist is retired" test ! -e "$ROOT/scripts/ops/com.nostradamus.hk-review.plist"

echo "== deploy-time engine transform =="
INPUT="$TMP_ROOT/engine.plist"
STAGED_ONE="$TMP_ROOT/engine-owner.plist"
BACKUP_ONE="$TMP_ROOT/engine-owner.backup"
STAGED_ZERO="$TMP_ROOT/engine-nonowner.plist"
BACKUP_ZERO="$TMP_ROOT/engine-nonowner.backup"
if ! python3 - "$TEMPLATE" "$INPUT" <<'PYINPUT'
import sys
raw = open(sys.argv[1], encoding="utf-8").read()
values = {
    "HOME": "/tmp/nostra-home", "ENGINE_REPO_ROOT": "/tmp/nostra-prod",
    "STATE_DIR": "/tmp/nostra-state", "PLIST_PATH": "/usr/bin:/bin",
    "NODE_BIN": "/usr/bin/node", "AUTOMATION_OWNER": "1", "BRIDGE_MODE": "batch",
}
for key, value in values.items(): raw = raw.replace("{{" + key + "}}", value)
open(sys.argv[2], "w", encoding="utf-8").write(raw)
PYINPUT
then echo "  FAIL could not prepare engine fixture"; fail=1
fi
chmod 600 "$INPUT"
touch "$STAGED_ONE" "$BACKUP_ONE" "$STAGED_ZERO" "$BACKUP_ZERO"
chmod 600 "$STAGED_ONE" "$BACKUP_ONE" "$STAGED_ZERO" "$BACKUP_ZERO"
TEST_HOME="$TMP_ROOT/deploy-render-home"; mkdir -p "$TEST_HOME"
HOME="$TEST_HOME" bash "$DEPLOY" --test-render-engine-autonomy \
  "$INPUT" "$STAGED_ONE" "$BACKUP_ONE" 1 || fail=1
HOME="$TEST_HOME" bash "$DEPLOY" --test-render-engine-autonomy \
  "$INPUT" "$STAGED_ZERO" "$BACKUP_ZERO" 0 || fail=1
if python3 - "$STAGED_ONE" "$STAGED_ZERO" <<'PYRESULT'
import plistlib, sys
keys = ("INTAKE_AUTO_ANALYZE", "CALL_UPDATE_AUTO_ENABLED",
        "REVIEW_DISPATCH_ENABLED", "CONVICTION_LOOP_ENABLED")
owner = plistlib.load(open(sys.argv[1], "rb"))["EnvironmentVariables"]
other = plistlib.load(open(sys.argv[2], "rb"))["EnvironmentVariables"]
assert all(owner[key] == "1" for key in keys) and owner["BRIDGE_MODE"] == "batch"
assert all(other[key] == "0" for key in keys) and other["BRIDGE_MODE"] == "off"
PYRESULT
then echo "  ok  deploy renders paid loops on only for the permanent owner"
else echo "  FAIL deploy automatic-owner values"; fail=1
fi
check "deploy transform preserves the exact prior bytes" cmp -s "$INPUT" "$BACKUP_ONE"
check "non-owner transform preserves the exact prior bytes" cmp -s "$INPUT" "$BACKUP_ZERO"

echo "== legacy review retirement =="
RETIRE_HOME="$TMP_ROOT/retire-home"
RETIRE_AGENTS="$RETIRE_HOME/Library/LaunchAgents"
RETIRE_BIN="$TMP_ROOT/retire-bin"
mkdir -p "$RETIRE_AGENTS" "$RETIRE_BIN"
cp "$INPUT" "$RETIRE_AGENTS/com.nostradamus.hk-review.plist"
printf '%s\n' loaded > "$TMP_ROOT/launch-state"
cat > "$RETIRE_BIN/launchctl" <<'SHLAUNCH'
#!/usr/bin/env bash
case "${1:-}" in
  print) [ "$(cat "$MOCK_LAUNCH_STATE" 2>/dev/null)" = loaded ] ;;
  bootout) printf '%s\n' "$*" >> "$MOCK_LAUNCH_LOG"; printf '%s\n' unloaded > "$MOCK_LAUNCH_STATE" ;;
  *) exit 0 ;;
esac
SHLAUNCH
chmod +x "$RETIRE_BIN/launchctl"
MOCK_LAUNCH_STATE="$TMP_ROOT/launch-state" MOCK_LAUNCH_LOG="$TMP_ROOT/launch.log" \
  PATH="$RETIRE_BIN:$PATH" HOME="$RETIRE_HOME" REVIEW_RETIRE_WAIT_SECONDS=0 \
  bash "$DEPLOY" --test-retire-review-agent || fail=1
check "retirement booted the legacy label out" grep -Fq "bootout gui/" "$TMP_ROOT/launch.log"
check "retirement removes the plist only after unload" test ! -e "$RETIRE_AGENTS/com.nostradamus.hk-review.plist"

# A launchd job that ignores bootout must remain visible on disk and make reconciliation fail.
cp "$INPUT" "$RETIRE_AGENTS/com.nostradamus.hk-review.plist"
printf '%s\n' loaded > "$TMP_ROOT/launch-state"
cat > "$RETIRE_BIN/launchctl" <<'SHSTUBBORN'
#!/usr/bin/env bash
[ "${1:-}" = print ] && exit 0
exit 0
SHSTUBBORN
chmod +x "$RETIRE_BIN/launchctl"
if PATH="$RETIRE_BIN:$PATH" HOME="$RETIRE_HOME" REVIEW_RETIRE_WAIT_ATTEMPTS=1 \
    REVIEW_RETIRE_WAIT_SECONDS=0 bash "$DEPLOY" --test-retire-review-agent; then
  echo "  FAIL stubborn legacy review job reported retired"; fail=1
else
  echo "  ok  stubborn legacy review job fails closed"
fi
check "stubborn job keeps its visible plist" test -f "$RETIRE_AGENTS/com.nostradamus.hk-review.plist"

echo "== rolling housekeeping guard =="
FAKE_CLAUDE="$TMP_ROOT/fake-claude"
cat > "$FAKE_CLAUDE" <<'SHCLAUDE'
#!/usr/bin/env bash
touch "$CLAUDE_WAS_RUN"
SHCLAUDE
chmod +x "$FAKE_CLAUDE"
GUARD_HOME="$TMP_ROOT/guard-home"; mkdir -p "$GUARD_HOME"
CLAUDE_WAS_RUN="$TMP_ROOT/claude-ran" CLAUDE_BIN="$FAKE_CLAUDE" HOME="$GUARD_HOME" \
  HOUSEKEEPING_LOG="$TMP_ROOT/housekeeping.log" bash "$HOUSEKEEPING" /research:review-decisions due
check "legacy wrapper cannot start a paid review" test ! -e "$TMP_ROOT/claude-ran"
check "legacy wrapper records a clear skip" grep -Fq "retired timer" "$TMP_ROOT/housekeeping.log"

echo "== shell syntax =="
check "install-services.sh parses" bash -n "$INSTALL"
check "deploy.sh parses" bash -n "$DEPLOY"
check "housekeeping.sh parses" bash -n "$HOUSEKEEPING"

exit "$fail"
