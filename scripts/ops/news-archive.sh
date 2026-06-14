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
#   - PRUNE local firehose files older than RETENTION_DAYS, but ONLY when a same-size copy is confirmed
#     in the Drive folder (never delete data that isn't safely in the cloud).
#   - No-ops cleanly if the Drive folder isn't reachable (Drive app off) — logs and exits 0, prunes nothing.
# ---------------------------------------------------------------------------------------------------

REPO="${REPO:-/Users/chiraagkapil/equity-research}"
ARCH="${NEWS_ARCHIVE_DIR:-}"
RETENTION_DAYS="${NEWS_LOCAL_RETENTION_DAYS:-30}"
LOG="${ARCHIVE_LOG:-$HOME/Library/Logs/nostradamus-news-archive.log}"
SRC="$REPO/screener/inbox"
ts() { date "+%Y-%m-%dT%H:%M:%S"; }
mkdir -p "$(dirname "$LOG")" 2>/dev/null

if [ -z "$ARCH" ]; then
  echo "$(ts) [skip] NEWS_ARCHIVE_DIR not set — no cloud archive configured" >> "$LOG"; exit 0
fi
# the Drive folder must exist + be writable (Drive app running + mounted), else don't prune anything
if ! mkdir -p "$ARCH" 2>/dev/null || [ ! -w "$ARCH" ]; then
  echo "$(ts) [waiting] Drive folder not reachable ($ARCH) — is Google Drive running? (no prune this run)" >> "$LOG"; exit 0
fi

echo "$(ts) [start] mirror raw news → $ARCH" >> "$LOG"
up=0
for f in "$SRC"/*_firehose.ndjson "$SRC"/*_sweep.json; do
  [ -e "$f" ] || continue
  dest="$ARCH/$(basename "$f")"
  if [ ! -e "$dest" ] || [ "$f" -nt "$dest" ]; then
    # write CONTENTS (not cp -p): Google Drive's file-provider rejects attribute-preservation on
    # overwrite ("Operation not permitted"), so copy the bytes only — Drive then uploads them.
    if cat "$f" > "$dest" 2>>"$LOG"; then up=$((up+1)); else echo "$(ts) [warn] copy failed: $(basename "$f")" >> "$LOG"; fi
  fi
done
echo "$(ts) [up] $up file(s) copied/updated to Drive" >> "$LOG"

# prune local firehose older than retention, only if a same-size cloud copy exists
pruned=0
while IFS= read -r f; do
  [ -e "$f" ] || continue
  dest="$ARCH/$(basename "$f")"
  if [ -e "$dest" ] && [ "$(stat -f%z "$f" 2>/dev/null)" = "$(stat -f%z "$dest" 2>/dev/null)" ]; then
    rm -f "$f" && pruned=$((pruned+1)) && echo "$(ts) [prune] $(basename "$f") (safe in Drive)" >> "$LOG"
  fi
done < <(find "$SRC" -name '*_firehose.ndjson' -type f -mtime +"$RETENTION_DAYS" 2>/dev/null)

echo "$(ts) [ok] archive complete · uploaded $up · pruned $pruned (local retention ${RETENTION_DAYS}d)" >> "$LOG"
exit 0
