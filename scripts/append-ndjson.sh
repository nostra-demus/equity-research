#!/usr/bin/env bash
# Append ONE JSON line to an append-only .ndjson ledger file, safely under concurrency.
#
# The screener swarm appends to shared ledgers (screener/ledger/events.ndjson,
# handoffs.ndjson) from runs that may overlap. Two unsynchronized appends can interleave
# bytes and corrupt a line, so every ledger append routes through this helper. It uses the
# same atomic-mkdir lock pattern as scripts/commit-run.sh (macOS has no flock), falls back
# to a plain O_APPEND write if the lock stays stuck, and validates the payload is a single
# JSON object on one line before touching the file.
#
# Optional idempotency: pass a key field+value; if any existing line already contains that
# exact key-value pair, the append is skipped (exit 0, DUPLICATE=1) — so re-runs never
# double-log the same signal/handoff.
#
# Usage:  append-ndjson.sh <file.ndjson> '<json-object-one-line>' [<idempotency_jq_like_key> <value>]
# Prints: APPENDED=1 | DUPLICATE=1
# Exit:   0 ok; 2 usage/invalid json
set -u

FILE="${1:-}"
JSON="${2:-}"
IDKEY="${3:-}"
IDVAL="${4:-}"

if [ -z "$FILE" ] || [ -z "$JSON" ]; then
  echo "usage: append-ndjson.sh <file.ndjson> '<json-object-one-line>' [<id_key> <id_value>]" >&2
  exit 2
fi

# validate: single-line, parses as a JSON object
case "$JSON" in
  *$'\n'*) echo "append-ndjson: payload must be a single line" >&2; exit 2 ;;
esac
printf '%s' "$JSON" | python3 -c 'import json,sys; o=json.load(sys.stdin); assert isinstance(o,dict)' 2>/dev/null || {
  echo "append-ndjson: payload is not a JSON object" >&2; exit 2; }

mkdir -p "$(dirname "$FILE")"

# idempotency check (cheap grep first, then exact JSON check to dodge substring hits)
if [ -n "$IDKEY" ] && [ -n "$IDVAL" ] && [ -s "$FILE" ]; then
  if grep -F -- "\"$IDVAL\"" "$FILE" >/dev/null 2>&1; then
    if FILE="$FILE" IDKEY="$IDKEY" IDVAL="$IDVAL" python3 - <<'PY'
import json, os, sys
fp, k, v = os.environ["FILE"], os.environ["IDKEY"], os.environ["IDVAL"]
for ln in open(fp, encoding="utf-8", errors="replace"):
    ln = ln.strip()
    if not ln:
        continue
    try:
        if str(json.loads(ln).get(k)) == v:
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
fi

LOCKBASE="$(printf '%s' "$FILE" | shasum 2>/dev/null | awk '{print $1}')"
[ -n "$LOCKBASE" ] || LOCKBASE="$(printf '%s' "$FILE" | cksum | awk '{print $1}')"
LOCK="${TMPDIR:-/tmp}/ndjson-${LOCKBASE}.lock"
HELD=0
for _ in $(seq 1 100); do # up to ~10s
  if mkdir "$LOCK" 2>/dev/null; then HELD=1; break; fi
  sleep 0.1
done

printf '%s\n' "$JSON" >> "$FILE"

[ "$HELD" = "1" ] && rmdir "$LOCK" 2>/dev/null
echo "APPENDED=1"
exit 0
