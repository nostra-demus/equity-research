#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEPLOY="$ROOT/scripts/ops/deploy.sh"
TEST_TMP="$(mktemp -d)"
TEST_HOME="$TEST_TMP/home"
TEST_REPO="$TEST_TMP/repo"
trap 'rm -rf "$TEST_TMP"' EXIT

mkdir -p "$TEST_HOME" "$TEST_REPO/.codex/agents"
git -C "$TEST_REPO" init -q

guard_rc() {
  HOME="$TEST_HOME" ENGINE_REPO_ROOT="$TEST_REPO" \
    bash "$DEPLOY" --check-codex-import-contamination
}

check_rc() {
  local label="$1" expected="$2" actual
  shift 2
  "$@"
  actual=$?
  if [ "$actual" -ne "$expected" ]; then
    echo "FAIL $label (expected rc=$expected, got rc=$actual)" >&2
    exit 1
  fi
  echo "  ok  $label"
}

check_rc "clean checkout has no Codex-import contamination" 1 guard_rc

printf '%s\n' 'not an imported agent' > "$TEST_REPO/.codex/agents/memo-writer.toml.example"
check_rc "lookalike path is ignored" 1 guard_rc

printf '%s\n' 'generated helper' > "$TEST_REPO/.codex/agents/memo-writer.toml"
check_rc "untracked imported-agent path is detected" 0 guard_rc
check_rc "the existing §28 dirty gate still blocks that file" 0 \
  env HOME="$TEST_HOME" ENGINE_REPO_ROOT="$TEST_REPO" bash "$DEPLOY" --check-dirty

git -C "$TEST_REPO" add .codex/agents/memo-writer.toml
check_rc "a reviewed/tracked path is not classified as import contamination" 1 guard_rc

rm -f "$TEST_REPO/.codex/agents/module-memo-writer.toml"
ln -s memo-writer.toml "$TEST_REPO/.codex/agents/module-memo-writer.toml"
check_rc "an untracked symlink at an imported-agent path is detected" 0 guard_rc

echo "test-deploy-codex-import-guard.sh: exact imported-agent paths are diagnosed without weakening the dirty gate"
