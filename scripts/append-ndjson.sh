#!/usr/bin/env bash
# Append ONE JSON line to an append-only .ndjson ledger file, safely under concurrency.
#
# The screener swarm appends to shared ledgers (screener/ledger/events.ndjson,
# handoffs.ndjson) from runs that may overlap. Two unsynchronized appends can interleave
# bytes and corrupt a line, so every ledger append routes through this helper. It uses the
# same atomic-mkdir lock pattern as scripts/commit-run.sh (macOS has no flock), refuses to
# write if the lock cannot be acquired, and validates the payload is a single JSON object
# on one line before touching the file.
#
# Optional idempotency: pass a key field+value; if any existing line already contains that
# exact key-value pair, the append is skipped (exit 0, DUPLICATE=1) — so re-runs never
# double-log the same signal/handoff.
#
# Usage:  append-ndjson.sh <file.ndjson> '<json-object-one-line>' [<idempotency_jq_like_key> <value>]
# Prints: APPENDED=1 | DUPLICATE=1
# Exit:   0 ok; 2 usage/invalid json; 3 lock timeout; 4 append failed
set -u

FILE="${1:-}"
JSON="${2:-}"
IDKEY="${3:-}"
IDVAL="${4:-}"

if [ -z "$FILE" ] || [ -z "$JSON" ]; then
  echo "usage: append-ndjson.sh <file.ndjson> '<json-object-one-line>' [<id_key> <id_value>]" >&2
  exit 2
fi
if { [ -n "$IDKEY" ] && [ -z "$IDVAL" ]; } || { [ -z "$IDKEY" ] && [ -n "$IDVAL" ]; }; then
  echo "append-ndjson: idempotency key and value must be supplied together and non-empty" >&2
  exit 2
fi

# validate: single-line, parses as a JSON object
case "$JSON" in
  *$'\n'*) echo "append-ndjson: payload must be a single line" >&2; exit 2 ;;
esac
mkdir -p "$(dirname "$FILE")"

# Canonicalize the parent so equivalent spellings of one ledger (relative, absolute, or with `..`)
# hash to the same lock. The directory exists now, so pwd -P is available on stock macOS shells.
FILE_DIR="$(cd "$(dirname "$FILE")" 2>/dev/null && pwd -P)" || {
  echo "append-ndjson: cannot resolve ledger directory" >&2
  exit 2
}
FILE="$FILE_DIR/$(basename "$FILE")"

# The lock must live beside the canonical ledger. TMPDIR is process-local configuration: two engine
# processes can legitimately have different TMPDIR values, and putting the lock there gave each writer
# a different mutex for the same ledger. A sibling lock path is filesystem/repository scoped, so every
# spelling and every process that reaches this file contends on exactly one lock.
LOCK="${FILE}.lock"
HELD=0
OWNER_TOKEN="$$-$(date +%s)-${RANDOM:-0}"
release() {
  if [ "$HELD" = "1" ]; then
    current_token="$(awk -F= '$1 == "token" { print $2; exit }' "$LOCK/owner" 2>/dev/null || true)"
    # Never tear down a lock that was reclaimed and re-created by another writer while this process was
    # being killed. An ownerless directory can only be ours in the mkdir→owner-file creation window.
    if [ "$current_token" = "$OWNER_TOKEN" ] || { [ -z "$current_token" ] && [ ! -f "$LOCK/owner" ]; }; then
      rm -f "$LOCK/owner" 2>/dev/null || true
      rmdir "$LOCK" 2>/dev/null || true
    fi
    HELD=0
  fi
}
on_signal() {
  code="$1"
  release
  trap - EXIT INT TERM HUP
  exit "$code"
}
trap release EXIT
trap 'on_signal 130' INT
trap 'on_signal 143' TERM
trap 'on_signal 129' HUP

lock_mtime() {
  stat -f '%m' "$LOCK" 2>/dev/null || stat -c '%Y' "$LOCK" 2>/dev/null || true
}

# A killed writer must not strand this append-only ledger forever. Reclaim only a lock that positively
# belongs to a dead PID on this host. A malformed lock is reclaimed only after a grace period. An
# ownerless lock is never reclaimed unless an operator explicitly supplies a grace, avoiding the tiny
# race between another process's mkdir and owner-file write. Unknown remote owners fail closed.
reclaim_stale_lock() {
  [ -d "$LOCK" ] || return 0
  now="$(date +%s)"
  mtime="$(lock_mtime)"
  age=0
  case "$mtime" in ''|*[!0-9]*) age=0 ;; *) age=$((now - mtime)) ;; esac
  if [ -f "$LOCK/owner" ]; then
    owner_pid="$(awk -F= '$1 == "pid" { print $2; exit }' "$LOCK/owner" 2>/dev/null || true)"
    owner_host="$(awk -F= '$1 == "host" { print $2; exit }' "$LOCK/owner" 2>/dev/null || true)"
    owner_valid=1
    case "$owner_pid" in ''|*[!0-9]*) owner_valid=0 ;; esac
    [ -n "$owner_host" ] || owner_valid=0
    stale_owner_grace="${NDJSON_STALE_OWNER_GRACE_SECS:-30}"
    case "$stale_owner_grace" in ''|*[!0-9]*) stale_owner_grace=30 ;; esac
    if [ "$owner_valid" = "1" ] && [ "$owner_host" = "$(hostname)" ] && ! kill -0 "$owner_pid" 2>/dev/null; then
      rm -f "$LOCK/owner" 2>/dev/null || true
      rmdir "$LOCK" 2>/dev/null || true
    elif [ "$owner_valid" = "0" ] && [ "$age" -ge "$stale_owner_grace" ]; then
      rm -f "$LOCK/owner" 2>/dev/null || true
      rmdir "$LOCK" 2>/dev/null || true
    fi
  else
    # There is no identity proof on an ownerless lock. Never reclaim it by default: doing so can delete
    # a live writer's directory in the unavoidable mkdir→owner-rename interval. Operators/tests may set
    # an explicit grace when recovering a positively abandoned ownerless directory.
    ownerless_grace="${NDJSON_OWNERLESS_GRACE_SECS:-}"
    case "$ownerless_grace" in ''|*[!0-9]*) ;; *)
      if [ "$age" -ge "$ownerless_grace" ]; then rmdir "$LOCK" 2>/dev/null || true; fi
      ;;
    esac
  fi
}

# Acquire BEFORE the duplicate read. Checking first created a classic TOCTOU race: two writers both
# observed "missing", then serialized two identical appends. Never fall back to an unlocked append.
MAX_ATTEMPTS="${NDJSON_LOCK_MAX_ATTEMPTS:-100}"
SLEEP_SECS="${NDJSON_LOCK_SLEEP_SECS:-0.1}"
attempt=0
while [ "$attempt" -lt "$MAX_ATTEMPTS" ]; do
  if mkdir "$LOCK" 2>/dev/null; then
    # Mark ownership immediately after mkdir so an arriving signal cannot strand the directory in the
    # tiny interval before the owner file is written.
    HELD=1
    if [ "${NDJSON_TEST_FAIL_OWNER_WRITE:-0}" = "1" ]; then
      # Exercise the real partial-write cleanup branch without relying on a filesystem-specific fault.
      printf 'pid=%s\n' "$$" > "$LOCK/owner"
      owner_written=0
    elif printf 'pid=%s\nhost=%s\ncreated=%s\ntoken=%s\n' "$$" "$(hostname)" "$(date +%s)" "$OWNER_TOKEN" > "$LOCK/owner"; then
      owner_written=1
    else
      owner_written=0
    fi
    if [ "$owner_written" != "1" ]; then
      # A stale-owner reclaimer from an older helper may have removed the tiny ownerless window. Do not
      # fail the append or proceed unlocked. Remove a partial owner file and the directory we just made
      # before clearing local ownership; otherwise HELD=0 prevents the exit trap from cleaning the lock.
      rm -f "$LOCK/owner" 2>/dev/null || true
      rmdir "$LOCK" 2>/dev/null || true
      HELD=0
      attempt=$((attempt + 1))
      continue
    fi
    break
  fi
  reclaim_stale_lock
  sleep "$SLEEP_SECS"
  attempt=$((attempt + 1))
done
if [ "$HELD" != "1" ]; then
  echo "append-ndjson: timed out waiting for ledger lock: $FILE" >&2
  exit 3
fi

# Parse while holding the same lock as duplicate-read+append. Besides keeping the evidence boundary
# strict (Python's default parser accepts NaN), this prevents a burst of racing writers from spawning a
# burst of validators before they serialize on the ledger anyway.
printf '%s' "$JSON" | python3 -c 'import json,sys; bad=lambda x: (_ for _ in ()).throw(ValueError(x)); o=json.load(sys.stdin,parse_constant=bad); assert isinstance(o,dict)' 2>/dev/null || {
  echo "append-ndjson: payload is not a JSON object" >&2; exit 2; }

# Test-only fault-injection point used by the real signal-race regression. It lives after durable
# ownership and before duplicate-read/append, the exact critical section a termination must release.
if [ -n "${NDJSON_TEST_HOLD_AFTER_LOCK_SECS:-}" ]; then
  sleep "$NDJSON_TEST_HOLD_AFTER_LOCK_SECS"
fi

# Exact idempotency check while holding the same lock as the append. A substring hit never counts;
# only a parsed top-level field whose string value exactly equals IDVAL suppresses the write.
if [ -n "$IDKEY" ] && [ -n "$IDVAL" ] && [ -s "$FILE" ]; then
  if NDJSON_FILE="$FILE" NDJSON_IDKEY="$IDKEY" NDJSON_IDVAL="$IDVAL" python3 - <<'PY'
import json, os, sys
fp, k, v = os.environ["NDJSON_FILE"], os.environ["NDJSON_IDKEY"], os.environ["NDJSON_IDVAL"]
for ln in open(fp, encoding="utf-8", errors="replace"):
    ln = ln.strip()
    if not ln:
        continue
    try:
        obj = json.loads(ln)
        if k in obj and isinstance(obj[k], str) and obj[k] == v:
            sys.exit(0)  # duplicate found
    except Exception:
        continue
sys.exit(1)
PY
  then
    echo "DUPLICATE=1"
    exit 0
  fi
fi

if ! printf '%s\n' "$JSON" >> "$FILE"; then
  echo "append-ndjson: failed to append ledger: $FILE" >&2
  exit 4
fi

echo "APPENDED=1"
exit 0
