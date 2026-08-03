#!/usr/bin/env bash
# Append ONE JSON line to an append-only .ndjson ledger file, safely under concurrency.
#
# The screener swarm appends to shared ledgers (screener/ledger/events.ndjson,
# handoffs.ndjson) from runs that may overlap. Two unsynchronized appends can interleave
# bytes and corrupt a line, so every ledger append routes through this helper. Python takes
# a kernel advisory lock on the ledger inode itself, refuses to write if ownership cannot be
# proven, and validates the payload is a single JSON object on one line before touching it.
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

# The kernel, not PID metadata, owns the mutex. Lock the ledger inode itself so real paths, symlinks, and
# hard-link aliases all converge on one lease. Advisory flock is released automatically on process death;
# there is no stale pathname to reclaim and no ABA window in which a delayed reclaimer can delete a live
# successor lock.
exec python3 - "$FILE" "$JSON" "$IDKEY" "$IDVAL" <<'PY'
import fcntl
import json
import os
import sys
import time

file_path, payload, id_key, id_value = sys.argv[1:5]

def reject_constant(value):
    raise ValueError(value)

try:
    obj = json.loads(payload, parse_constant=reject_constant)
    if not isinstance(obj, dict):
        raise ValueError("top level is not an object")
except (AssertionError, TypeError, ValueError, json.JSONDecodeError):
    print("append-ndjson: payload is not a JSON object", file=sys.stderr)
    raise SystemExit(2)

def env_int(name, default):
    try:
        value = int(os.environ.get(name, str(default)))
        return value if value >= 0 else default
    except ValueError:
        return default

def env_float(name, default):
    try:
        value = float(os.environ.get(name, str(default)))
        return value if value >= 0 and value < float("inf") else default
    except ValueError:
        return default

max_attempts = env_int("NDJSON_LOCK_MAX_ATTEMPTS", 100)
sleep_seconds = env_float("NDJSON_LOCK_SLEEP_SECS", 0.1)

try:
    ledger = open(file_path, "a+b", buffering=0)
except OSError as exc:
    print(f"append-ndjson: cannot open ledger: {exc}", file=sys.stderr)
    raise SystemExit(4)

acquired = False
with ledger:
    for attempt in range(max_attempts):
        try:
            fcntl.flock(ledger.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            acquired = True
            break
        except BlockingIOError:
            if attempt + 1 < max_attempts:
                time.sleep(sleep_seconds)
        except OSError as exc:
            print(f"append-ndjson: cannot acquire ledger lock: {exc}", file=sys.stderr)
            raise SystemExit(3)

    if not acquired:
        print(f"append-ndjson: timed out waiting for ledger lock: {file_path}", file=sys.stderr)
        raise SystemExit(3)

    hold_seconds = env_float("NDJSON_TEST_HOLD_AFTER_LOCK_SECS", 0)
    if hold_seconds > 0:
        print("LOCKED=1", flush=True)
        time.sleep(hold_seconds)

    # A SIGKILL or I/O failure can stop a regular-file append after a partial write. The next lease
    # holder trims only an unterminated final fragment; every committed NDJSON record ends in `\n`.
    size = os.fstat(ledger.fileno()).st_size
    if size > 0:
        os.lseek(ledger.fileno(), size - 1, os.SEEK_SET)
        if os.read(ledger.fileno(), 1) != b"\n":
            cursor = size
            last_newline = -1
            while cursor > 0:
                width = min(65_536, cursor)
                cursor -= width
                os.lseek(ledger.fileno(), cursor, os.SEEK_SET)
                chunk = os.read(ledger.fileno(), width)
                found = chunk.rfind(b"\n")
                if found >= 0:
                    last_newline = cursor + found
                    break
            os.ftruncate(ledger.fileno(), last_newline + 1 if last_newline >= 0 else 0)
            os.fsync(ledger.fileno())

    if id_key and id_value and os.fstat(ledger.fileno()).st_size > 0:
        try:
            with os.fdopen(os.dup(ledger.fileno()), "rb") as existing:
                os.lseek(existing.fileno(), 0, os.SEEK_SET)
                for raw_line in existing:
                    line = raw_line.decode("utf-8", errors="replace").strip()
                    if not line:
                        continue
                    try:
                        row = json.loads(line, parse_constant=reject_constant)
                    except (TypeError, ValueError, json.JSONDecodeError):
                        continue
                    if isinstance(row, dict) and isinstance(row.get(id_key), str) and row[id_key] == id_value:
                        print("DUPLICATE=1")
                        raise SystemExit(0)
        except OSError as exc:
            print(f"append-ndjson: cannot read ledger: {exc}", file=sys.stderr)
            raise SystemExit(4)

    record = (payload + "\n").encode("utf-8")
    start_size = os.fstat(ledger.fileno()).st_size
    written = 0
    try:
        while written < len(record):
            count = os.write(ledger.fileno(), record[written:])
            if count <= 0:
                raise OSError("zero-byte append")
            written += count
        os.fsync(ledger.fileno())
    except OSError as exc:
        try:
            os.ftruncate(ledger.fileno(), start_size)
            os.fsync(ledger.fileno())
        except OSError:
            pass
        print(f"append-ndjson: failed to append ledger: {exc}", file=sys.stderr)
        raise SystemExit(4)

    print("APPENDED=1")
PY
