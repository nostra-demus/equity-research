#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
TSX="$REPO_ROOT/ui/server/node_modules/.bin/tsx"

if [[ ! -x "$TSX" ]]; then
  echo "PULSE-REFRESH-FAIL: pinned ui/server tsx is unavailable; install the checked-in ui/server dependencies before running research" >&2
  exit 1
fi

exec "$TSX" "$REPO_ROOT/scripts/refresh-swarm-pulse.ts" "$@"
