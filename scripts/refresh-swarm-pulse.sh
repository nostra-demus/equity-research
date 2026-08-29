#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
TSX_PACKAGE="$REPO_ROOT/ui/server/node_modules/tsx/package.json"

if ! command -v node >/dev/null 2>&1 || [[ ! -f "$TSX_PACKAGE" ]]; then
  echo "PULSE-REFRESH-FAIL: pinned ui/server tsx is unavailable; install the checked-in ui/server dependencies before running research" >&2
  exit 1
fi

# The tsx CLI starts an IPC supervisor even for a one-shot script. Some research
# sandboxes forbid that local socket. Node's pinned tsx import hook runs the same
# TypeScript in one process and needs no IPC endpoint.
cd "$REPO_ROOT/ui/server"
exec node --import tsx "$REPO_ROOT/scripts/refresh-swarm-pulse.ts" "$@"
