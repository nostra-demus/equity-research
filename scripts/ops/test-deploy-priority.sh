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
assert 'DEPLOY_AUTHORIZATION_DIR="${NOSTRA_DEPLOY_AUTHORIZATION_DIR:-$OPS/deploy-authorizations}"' in deploy
assert 'DEPLOY_AUTHORIZATION_HELPER="${NOSTRA_DEPLOY_AUTHORIZATION_HELPER:-$OPS/deploy-authorization.py}"' in deploy
assert "PROVIDER_DEPLOY_INTENT_FILE = 'provider-deploy-pending'" in barrier
assert 'DEBOUNCE_SECS="${DEPLOY_DEBOUNCE_SECS:-0}"' in deploy

authorization = deploy.index('HINT_AUTHORIZED_COMMIT="$(deploy_authorization_allows "$REMOTE_HINT")"')
dirty_preflight = deploy.index('BLOCKED reviewed deployment ${REMOTE_HINT:0:9} before admission pause')
publish = deploy.index('set_deploy_intent "$REMOTE_HINT"')
exclusive = deploy.index('exec 10>>"$RUN_BARRIER_LOCK"')
busy = deploy.index('if [ "$barrier_rc" -ne 0 ]')
admitted = deploy.index('CLEAR_DEPLOY_INTENT_ON_EXIT=1', busy)
locked_authorization = deploy.index('AUTHORIZED_CODE_COMMIT="$(deploy_authorization_allows "$REMOTE")"', admitted)
fast_forward = deploy.index('"$GIT" merge --ff-only origin/main', locked_authorization)
assert authorization < dirty_preflight < publish < exclusive < busy < admitted < locked_authorization < fast_forward

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

print('test-deploy-priority.sh: only an authorized program drains readers and receives writer priority')
PY
