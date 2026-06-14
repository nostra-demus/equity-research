#!/usr/bin/env bash
# ---------------------------------------------------------------------------------------------------
# Daily cloud archive of the RAW NEWS store to Google Drive via rclone.
#
# The screener writes every day's news to screener/inbox/<date>_firehose.ndjson (append-only, never
# pruned). This pushes those files to Drive for durability ("infinite memory" + survive a laptop loss),
# so the local disk is a working cache and Drive is the permanent archive.
#
# Design:
#   - rclone COPY, never SYNC: it only uploads new/changed files and NEVER deletes on the remote, so if
#     we later prune old local files the cloud copy is untouched. Append-only by construction.
#   - Idempotent + safe on a schedule (launchd runs it every few hours; re-running is a cheap no-op).
#   - No-ops CLEANLY until setup is done: if rclone isn't installed or the remote isn't configured yet,
#     it logs a one-line hint and exits 0 (so launchd never thrashes). Once you run the two setup
#     commands, the next tick starts archiving automatically — no further action needed.
#
# One-time setup (you):   brew install rclone   &&   rclone config   (create a Google Drive remote
# named exactly "gdrive").  That's it.
# ---------------------------------------------------------------------------------------------------

REPO="${REPO:-/Users/chiraagkapil/equity-research}"
REMOTE="${RCLONE_REMOTE:-gdrive}"
DEST="${DRIVE_FOLDER:-equity-research-data/news-archive}"
LOG="${ARCHIVE_LOG:-$HOME/Library/Logs/nostradamus-news-archive.log}"
ts() { date "+%Y-%m-%dT%H:%M:%S"; }

mkdir -p "$(dirname "$LOG")" 2>/dev/null

RCLONE="$(command -v rclone || true)"
if [ -z "$RCLONE" ]; then
  echo "$(ts) [waiting] rclone not installed — run:  brew install rclone" >> "$LOG"
  exit 0
fi

if ! "$RCLONE" listremotes 2>/dev/null | grep -q "^${REMOTE}:"; then
  echo "$(ts) [waiting] rclone remote '${REMOTE}:' not configured — run:  rclone config  (make a Google Drive remote named ${REMOTE})" >> "$LOG"
  exit 0
fi

echo "$(ts) [start] archiving raw news → ${REMOTE}:${DEST}" >> "$LOG"
if "$RCLONE" copy "$REPO/screener/inbox" "${REMOTE}:${DEST}" \
    --include "*_firehose.ndjson" --include "*_sweep.json" \
    --transfers 4 --checkers 8 --stats-one-line --log-file "$LOG" --log-level INFO 2>>"$LOG"; then
  echo "$(ts) [ok] archive complete → ${REMOTE}:${DEST}" >> "$LOG"
else
  echo "$(ts) [error] rclone copy failed (see lines above)" >> "$LOG"
fi
exit 0
