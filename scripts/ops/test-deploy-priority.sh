#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
DEPLOY="$HERE/deploy.sh"
BARRIER="$ROOT/ui/server/src/deploy-barrier.ts"

bash -n "$DEPLOY"

python3 -I - "$DEPLOY" "$BARRIER" <<'PY'
from pathlib import Path
import re
import sys

deploy = Path(sys.argv[1]).read_text(encoding="utf-8")
barrier = Path(sys.argv[2]).read_text(encoding="utf-8")

assert 'DEPLOY_INTENT="$RUN_BARRIER_DIR/provider-deploy-pending"' in deploy
assert "PROVIDER_DEPLOY_INTENT_FILE = 'provider-deploy-pending'" in barrier
assert 'DEBOUNCE_SECS="${DEPLOY_DEBOUNCE_SECS:-0}"' in deploy

publish = deploy.index('set_deploy_intent "$REMOTE_HINT"')
exclusive = deploy.index('exec 10>>"$RUN_BARRIER_LOCK"')
busy = deploy.index('if [ "$barrier_rc" -ne 0 ]')
admitted = deploy.index('CLEAR_DEPLOY_INTENT_ON_EXIT=1', busy)
assert publish < exclusive < busy < admitted

busy_block = deploy[busy:admitted]
assert 'new provider admissions remain paused' in busy_block
assert 'clear_deploy_intent' not in busy_block
assert re.search(r'trap deploy_cleanup EXIT', deploy)
assert '[ "$CLEAR_DEPLOY_INTENT_ON_EXIT" = 1 ] && clear_deploy_intent' in deploy

precheck = barrier.index('if (intentPending()) throw deploymentInProgressError()')
shared = barrier.index('mode: \'shared\'')
postcheck = barrier.index('if (intentPending()) {', shared)
release = barrier.index('releaseRetainedFlock(descriptor)', postcheck)
assert precheck < shared < postcheck < release

print('test-deploy-priority.sh: pending main drains readers and receives writer priority')
PY
