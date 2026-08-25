#!/usr/bin/env bash
# ---------------------------------------------------------------------------------------------------
# Cloud archive of the RAW NEWS store to Google Drive — via the Google Drive for Desktop mount.
#
# Drive for Desktop presents the user's Drive as a normal local folder; anything copied into it is
# uploaded to the cloud automatically (no rclone, no API key, no OAuth — it uses the already-signed-in
# desktop app). So this just COPIES the firehose files into the Drive folder, then PRUNES the local
# copies older than the retention window — the laptop disk stays bounded while the full history lives
# permanently in the cloud. readFeed (the engine) falls back to the same Drive folder for pruned days,
# so the time-travel filter still spans the entire archive.
#
#   - COPY (never move) into Drive, re-copying only when the local file is newer → cloud is append-only.
#   - SNAPSHOT the live SQLite queue through SQLite's online backup API; never copy the open WAL database.
#   - PRUNE local firehose and pipeline-audit files older than RETENTION_DAYS, but ONLY when every byte matches
#     the Drive copy (never delete data that isn't safely mirrored).
#   - If a canonical queue exists, an unreachable Drive or incomplete snapshot pair exits non-zero and leaves
#     a watchdog-visible failure marker. Without a queue yet, an unreachable archive remains a clean no-op.
# ---------------------------------------------------------------------------------------------------

REPO="${REPO:-$HOME/nostra-prod}"
ARCH="${NEWS_ARCHIVE_DIR:-}"
RETENTION_DAYS="${NEWS_LOCAL_RETENTION_DAYS:-30}"
LOG="${ARCHIVE_LOG:-$HOME/Library/Logs/nostradamus-news-archive.log}"
SRC="$REPO/screener/inbox"
STATE_DIR="${ENGINE_STATE_DIR:-$REPO/ui/server/.state}"
NODE_BIN="${NODE_BIN:-$(command -v node 2>/dev/null)}"
QUEUE_DB="$STATE_DIR/news-queue.sqlite"
QUEUE_FAILURE_MARKER="$STATE_DIR/news-archive.failed"
ts() { date "+%Y-%m-%dT%H:%M:%S"; }
mkdir -p "$(dirname "$LOG")" 2>/dev/null

mark_queue_failure() {
  mkdir -p "$STATE_DIR" 2>/dev/null || true
  marker_tmp="$QUEUE_FAILURE_MARKER.$$.tmp"
  printf '%s queue-snapshot-failed\n' "$(ts)" > "$marker_tmp" 2>/dev/null \
    && mv -f "$marker_tmp" "$QUEUE_FAILURE_MARKER" 2>/dev/null || true
}

if [ -z "$ARCH" ]; then
  if [ -f "$QUEUE_DB" ]; then
    mark_queue_failure
    echo "$(ts) [error] NEWS_ARCHIVE_DIR not set — canonical SQLite queue has no cloud restore point" >> "$LOG"
    exit 1
  fi
  echo "$(ts) [skip] NEWS_ARCHIVE_DIR not set — no cloud archive configured" >> "$LOG"; exit 0
fi
# the Drive folder must exist + be writable (Drive app running + mounted), else don't prune anything
if ! mkdir -p "$ARCH" 2>/dev/null || [ ! -w "$ARCH" ]; then
  [ ! -f "$QUEUE_DB" ] || mark_queue_failure
  echo "$(ts) [waiting] Drive folder not reachable ($ARCH) — is Google Drive running? (no prune this run)" >> "$LOG"
  [ ! -f "$QUEUE_DB" ] || exit 1
  exit 0
fi

echo "$(ts) [start] mirror raw news → $ARCH" >> "$LOG"
up=0
for f in "$SRC"/*_firehose.ndjson "$SRC"/*_pipeline.ndjson "$SRC"/*_sweep.json; do
  [ -e "$f" ] || continue
  dest="$ARCH/$(basename "$f")"
  if [ ! -e "$dest" ] || [ "$f" -nt "$dest" ]; then
    # Write to a sibling temporary file and rename only after byte verification. A stopped Drive process or
    # interrupted copy therefore leaves the prior cloud object intact instead of a convincing partial file.
    dest_tmp="$dest.upload-$$.tmp"
    if dd if="$f" of="$dest_tmp" bs=1048576 2>>"$LOG" && cmp -s "$f" "$dest_tmp" && mv -f "$dest_tmp" "$dest" 2>>"$LOG"; then
      up=$((up+1))
    else
      rm -f "$dest_tmp"
      echo "$(ts) [warn] verified copy failed: $(basename "$f")" >> "$LOG"
    fi
  fi
done
echo "$(ts) [up] $up file(s) copied/updated to Drive" >> "$LOG"

# A SQLite database in WAL mode is a set of live files, so copying only `news-queue.sqlite` can produce a
# corrupt or stale backup. SQLite's online backup API takes one transactionally consistent snapshot while
# ingestion continues. Keep one dated restore point per UTC day and a stable latest name; neither limits the
# raw Drive archive or removes the live local queue.
queue_snapshots=0
if [ -f "$QUEUE_DB" ]; then
  if [ -z "$NODE_BIN" ] || [ ! -x "$NODE_BIN" ]; then
    echo "$(ts) [warn] node is unavailable — SQLite queue snapshot skipped (raw archive still copied)" >> "$LOG"
  else
    QUEUE_TMP="$(mktemp "${TMPDIR:-/tmp}/news-queue-snapshot.XXXXXX")"
    QUEUE_GZ="${QUEUE_TMP}.gz"
    QUEUE_SHA="${QUEUE_GZ}.sha256"
    if "$NODE_BIN" "$REPO/scripts/ops/news-queue-snapshot.mjs" "$QUEUE_DB" "$QUEUE_TMP" >>"$LOG" 2>&1 \
      && gzip -c "$QUEUE_TMP" > "$QUEUE_GZ" \
      && gzip -t "$QUEUE_GZ"; then
      queue_hash="$(shasum -a 256 "$QUEUE_GZ" 2>>"$LOG" | awk '{print $1}')"
      if [ -n "$queue_hash" ]; then
        for queue_name in "$(date -u +%F)_news-queue.sqlite.gz" "news-queue-latest.sqlite.gz"; do
          queue_dest="$ARCH/$queue_name"
          queue_dest_tmp="$queue_dest.upload-$$.tmp"
          printf '%s  %s\n' "$queue_hash" "$queue_name" > "$QUEUE_SHA"
          sha_dest="$queue_dest.sha256"
          sha_tmp="$sha_dest.upload-$$.tmp"
          if dd if="$QUEUE_GZ" of="$queue_dest_tmp" bs=1048576 2>>"$LOG" \
            && cmp -s "$QUEUE_GZ" "$queue_dest_tmp" \
            && dd if="$QUEUE_SHA" of="$sha_tmp" bs=4096 2>>"$LOG" \
            && cmp -s "$QUEUE_SHA" "$sha_tmp" \
            && mv -f "$queue_dest_tmp" "$queue_dest" 2>>"$LOG" \
            && mv -f "$sha_tmp" "$sha_dest" 2>>"$LOG"; then
            queue_snapshots=$((queue_snapshots+1))
          else
            rm -f "$queue_dest_tmp" "$sha_tmp"
            echo "$(ts) [warn] verified queue snapshot/checksum upload failed: $queue_name" >> "$LOG"
          fi
        done
      else
        echo "$(ts) [warn] queue snapshot checksum failed — no restore point was replaced" >> "$LOG"
      fi
    else
      echo "$(ts) [warn] SQLite queue snapshot failed — live database was not changed" >> "$LOG"
    fi
    rm -f "$QUEUE_TMP" "$QUEUE_GZ" "$QUEUE_SHA"
  fi
fi

# Prune local firehose and pipeline audit telemetry older than retention only after a full byte comparison.
pruned=0
while IFS= read -r f; do
  [ -e "$f" ] || continue
  dest="$ARCH/$(basename "$f")"
  if [ -e "$dest" ] && cmp -s "$f" "$dest"; then
    rm -f "$f" && pruned=$((pruned+1)) && echo "$(ts) [prune] $(basename "$f") (safe in Drive)" >> "$LOG"
  fi
done < <(find "$SRC" \( -name '*_firehose.ndjson' -o -name '*_pipeline.ndjson' \) -type f -mtime +"$RETENTION_DAYS" 2>/dev/null)

if [ -f "$QUEUE_DB" ] && [ "$queue_snapshots" -ne 2 ]; then
  mark_queue_failure
  echo "$(ts) [error] archive incomplete · uploaded $up · queue snapshots $queue_snapshots/2 · pruned $pruned" >> "$LOG"
  exit 1
fi
rm -f "$QUEUE_FAILURE_MARKER" 2>/dev/null || true
echo "$(ts) [ok] archive complete · uploaded $up · queue snapshots $queue_snapshots · pruned $pruned (local retention ${RETENTION_DAYS}d)" >> "$LOG"
exit 0
