#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
DEPLOY="$HERE/deploy.sh"
BARRIER="$ROOT/ui/server/src/deploy-barrier.ts"
INSTALLER="$HERE/install-services.sh"

bash -n "$DEPLOY"

python3 -I - "$DEPLOY" "$BARRIER" "$INSTALLER" <<'PY'
from pathlib import Path
import re
import sys

deploy = Path(sys.argv[1]).read_text(encoding="utf-8")
barrier = Path(sys.argv[2]).read_text(encoding="utf-8")
installer = Path(sys.argv[3]).read_text(encoding="utf-8")

assert 'DEPLOY_INTENT="$RUN_BARRIER_DIR/provider-deploy-pending"' in deploy
assert 'DEPLOY_AUTHORIZATION_DIR="${NOSTRA_DEPLOY_AUTHORIZATION_DIR:-$OPS/deploy-authorizations}"' in deploy
assert 'DEPLOY_AUTHORIZATION_HELPER="${NOSTRA_DEPLOY_AUTHORIZATION_HELPER:-$OPS/deploy-authorization.py}"' in deploy
assert 'DEPLOY_TOKEN_COMMAND="${NOSTRA_DEPLOY_TOKEN_COMMAND:-$OPS/gh-app-token.sh}"' in deploy
assert 'DEPLOY_AUDIT_LEDGER="${NOSTRA_DEPLOY_AUDIT_LEDGER:-$OPS/deploy-audit/events.jsonl}"' in deploy
assert 'DEPLOY_AUDIT_PENDING="$OPS/.deploy.audit-pending"' in deploy
assert 'deploy-authorization.py gh-app-token.sh housekeeping.sh' in installer
assert 'deploy-authorization.py gh-app-token.sh housekeeping.sh' in deploy

# install-services.sh stages EVERY ops wrapper script it installs (its `for s in ...` list); deploy.sh's
# automatic self-update loop (its `for opsscript in ...` list) must carry the SAME set, or a wrapper
# edited on main keeps running its stale installed copy under launchd until an operator reruns
# install-services.sh by hand — exactly the market-feed-local.sh gap PR #706's review caught. The two
# loops are allowed to differ in order but never in membership.
installer_scripts = set(re.search(r'for s in ([^;]+); do', installer).group(1).split())
deploy_scripts = set(re.search(r'for opsscript in ([^;]+); do', deploy).group(1).split())
missing_from_deploy = installer_scripts - deploy_scripts
assert not missing_from_deploy, f"deploy.sh self-update never picks up: {sorted(missing_from_deploy)}"
assert 'market-feed-local.sh' in deploy_scripts
assert 'calibrate-local.sh' in deploy_scripts

assert "PROVIDER_DEPLOY_INTENT_FILE = 'provider-deploy-pending'" in barrier
assert 'DEBOUNCE_SECS="${DEPLOY_DEBOUNCE_SECS:-0}"' in deploy

dirty_before_token = deploy.index('BLOCKED reviewed deployment ${REMOTE_HINT:0:9} before authorization')
authorization = deploy.index('HINT_AUTHORIZED_COMMIT="$(ensure_deploy_authorization "$REMOTE_HINT")"')
dirty_preflight = deploy.index('BLOCKED reviewed deployment ${REMOTE_HINT:0:9} before admission pause')
publish = deploy.index('set_deploy_intent "$REMOTE_HINT"')
exclusive = deploy.index('exec 10>>"$RUN_BARRIER_LOCK"')
busy = deploy.index('if [ "$barrier_rc" -ne 0 ]')
admitted = deploy.index('CLEAR_DEPLOY_INTENT_ON_EXIT=1', busy)
locked_authorization = deploy.index('AUTHORIZED_CODE_COMMIT="$(ensure_deploy_authorization "$REMOTE")"', admitted)
fast_forward = deploy.index('"$GIT" merge --ff-only origin/main', locked_authorization)
assert dirty_before_token < authorization < dirty_preflight < publish < exclusive < busy < admitted < locked_authorization < fast_forward

reconcile = deploy.index('reconcile_build() {')
audit = deploy.index('record_deploy_audit "$target" "$AUTHORIZED_CODE_COMMIT" "$DEPLOY_STARTED_AT"', reconcile)
marker = deploy.index('printf \'%s\\n\' "$target" > "$MARK.tmp"', audit)
consume = deploy.index('consume_deploy_authorization "$REMOTE" "$AUTHORIZED_CODE_COMMIT"', marker)
assert audit < marker < consume
assert 'only the audit append will retry (no rebuild/restart)' in deploy
assert 'retry_pending_deploy_audit' in deploy

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

print('test-deploy-priority.sh: only an exact green push drains readers and receives writer priority')
PY

# The self-update loop's actual behaviour, not just its membership list: extract it verbatim (so this
# tracks the shipped code) and run it against a bootstrap scenario where $changed is EMPTY — exactly what
# the CURRENTLY RUNNING (old-inode) deploy.sh process sees on the very first deploy of a commit that adds
# a name to this list, since that process's own git-diff-derived $changed was computed before this loop
# ever iterated the new name (PR #706 review, "Bootstrap newly enrolled ops wrappers during this
# deployment"). Before the fix (gated on `case "$changed" in *scripts/ops/$opsscript*)`), an empty
# $changed matches nothing and the installed copy is never touched. After the fix (gated on `cmp -s`
# against the checked-out source), a differing installed copy is refreshed regardless of $changed.
python3 -I - "$DEPLOY" <<'PY2'
from pathlib import Path
import subprocess
import sys
import tempfile

deploy = Path(sys.argv[1]).read_text(encoding="utf-8")
# "for opsscript in" alone also matches this PR's own prose comment describing the loop — anchor on the
# actual code line (the literal script-name list) so this extracts the real loop, not a sentence about it.
start = deploy.index("for opsscript in watchdog.sh")
end = deploy.index("\n  done", start) + len("\n  done")
loop = deploy[start:end]
assert "market-feed-local.sh" in loop

with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    prod, ops = root / "prod" / "scripts" / "ops", root / "ops"
    prod.mkdir(parents=True)
    ops.mkdir(parents=True)
    (prod / "market-feed-local.sh").write_text("#!/usr/bin/env bash\necho NEW\n")
    (ops / "market-feed-local.sh").write_text("#!/usr/bin/env bash\necho OLD\n")  # the stale installed copy
    driver = f"""#!/usr/bin/env bash
set -uo pipefail
PROD="{root / 'prod'}"
OPS="{ops}"
changed=""
failed=0
log() {{ :; }}
{loop}
printf '%s' "$failed"
"""
    result = subprocess.run(["/bin/bash", "-c", driver], capture_output=True, text=True, timeout=15)
    assert result.returncode == 0, result.stderr
    installed = (ops / "market-feed-local.sh").read_text(encoding="utf-8")
    assert "NEW" in installed, (
        "the newly-enrolled wrapper's stale installed copy was never refreshed with an empty $changed "
        f"(the exact bootstrap gap): {installed!r}"
    )
    assert result.stdout.strip() == "0", f"self-update must not report failed for a normal content sync: {result.stdout!r}"

print('test-deploy-priority.sh: a wrapper newly enrolled in the self-update list heals on an empty $changed')
PY2
