// Strict build-time boundary for the static screener archive.  A malformed committed payload never
// becomes a plausible audit inventory: replace it with an explicit unavailable wrapper instead.
const ID = /^IDEA-[a-f0-9]{12}$/
const VERSION = /^IDEAV-[a-f0-9]{16}$/
const HEALTH = new Set(['missing', 'ok', 'degraded', 'unreadable'])
const REASONS = new Set(['expired', 'expired_pruned', 'historical_board_expired', 'latest_board_current'])
const DIRECTIONS = new Set(['long', 'short', 'pair'])
const count = (v) => Number.isSafeInteger(v) && v >= 0
const clock = (v) => typeof v === 'string' && v.trim() === v && Number.isFinite(Date.parse(v))
const object = (v) => !!v && typeof v === 'object' && !Array.isArray(v)

const emptySideCount = () => ({ total_count: 0, shown_count: 0, hidden_count: 0 })
const emptyRetentionSide = () => ({ evicted_count: 0, oldest_retained_at: null })

export function emptyIdeasArchive(status = 'missing', error = null) {
  return {
    schema_version: 'ideas-archive/v1',
    health: { status, file_count: 0, suppression_count: 0, corrupt_count: 0, invalid_count: 0, error },
    total_count: 0, shown_count: 0, hidden_count: 0,
    side_counts: { long: emptySideCount(), short: emptySideCount() },
    retention: {
      truncated: false, evicted_count: 0, oldest_retained_at: null,
      side_counts: { long: emptyRetentionSide(), short: emptyRetentionSide() },
    },
    rows: [],
  }
}

function validCount(value) {
  return object(value) && count(value.total_count) && count(value.shown_count) && count(value.hidden_count)
    && value.total_count === value.shown_count + value.hidden_count
}

function sides(row) {
  if (row.direction === 'long') return ['long']
  if (row.direction === 'short') return ['short']
  return row.direction === 'pair' && typeof row.pair_with === 'string' && row.pair_with ? ['long', 'short'] : []
}

function validRow(row) {
  return object(row) && ID.test(row.idea_id) && VERSION.test(row.idea_version)
    && clock(row.idea_version_started_at) && typeof row.ticker === 'string'
    && DIRECTIONS.has(row.direction) && sides(row).length > 0 && clock(row.decay_at)
    && row.status === 'expired' && row.promoted_signal_id === null && row.stale === true
    && clock(row.archived_at) && REASONS.has(row.archive_reason) && row.audit_only === true
    && (row.promotion_available === undefined || row.promotion_available === false)
}

function validRetentionSide(value) {
  return object(value) && count(value.evicted_count)
    && (value.oldest_retained_at === null || clock(value.oldest_retained_at))
}

export function validIdeasArchive(value) {
  if (!object(value) || value.schema_version !== 'ideas-archive/v1' || !Array.isArray(value.rows)
    || !validCount(value) || value.shown_count !== value.rows.length || !object(value.health)
    || !HEALTH.has(value.health.status) || !count(value.health.file_count)
    || !count(value.health.suppression_count) || !count(value.health.corrupt_count)
    || !count(value.health.invalid_count) || !(value.health.error === null || typeof value.health.error === 'string')
    || !object(value.side_counts) || !validCount(value.side_counts.long) || !validCount(value.side_counts.short)
    || !object(value.retention) || typeof value.retention.truncated !== 'boolean'
    || !count(value.retention.evicted_count)
    || !(value.retention.oldest_retained_at === null || clock(value.retention.oldest_retained_at))
    || !object(value.retention.side_counts)
    || !validRetentionSide(value.retention.side_counts.long)
    || !validRetentionSide(value.retention.side_counts.short)) return false

  const keys = new Set()
  const shown = { long: 0, short: 0 }
  for (const row of value.rows) {
    if (!validRow(row)) return false
    const key = `${row.idea_id}|${row.idea_version}|${row.idea_version_started_at}`
    if (keys.has(key)) return false
    keys.add(key)
    for (const side of sides(row)) shown[side]++
  }
  return value.side_counts.long.shown_count === shown.long
    && value.side_counts.short.shown_count === shown.short
    && value.side_counts.long.shown_count <= value.side_counts.long.total_count
    && value.side_counts.short.shown_count <= value.side_counts.short.total_count
}

export function normalizeStaticBoardArchive(board) {
  if (!object(board)) return board
  if (board.ideas_archive === undefined) {
    return { ...board, ideas_archive: emptyIdeasArchive('missing') }
  }
  if (validIdeasArchive(board.ideas_archive)) return board
  return { ...board, ideas_archive: emptyIdeasArchive('unreadable', 'static_archive_payload_invalid') }
}
