export interface CallsAutomationPart {
  enabled: boolean
  state: 'watching' | 'checking' | 'needs_attention'
  message: string
  last_checked_at: string | null
  next_check_at: string | null
  queued: number
  running: number
}

export interface CallsNewsWatcherStatus {
  running: boolean
  sweeping: boolean
  lastSweepAt: string | null
  nextSweepAt: string | null
  manifestError: string | null
  cursorError: string | null
  retentionGaps: Array<{ subject: string; days: number; detectedAt: string }>
  retentionGapError: string | null
}

export interface CallsNewsSourceStatus {
  enabled: boolean
  running: boolean
  readOnly: boolean
  lastCycleAt: string | null
  schedulerActive: boolean
  schedulerStartedAt: string | null
  sourceLastCycleAt: string | null
  sourceLastError: string | null
  intervalMin: number
}

const time = (values: Array<string | null>, order: 'first' | 'last'): string | null => {
  const valid = values
    .filter((value): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value)))
    .sort((a, b) => Date.parse(a) - Date.parse(b))
  return valid.length ? (order === 'first' ? valid[0] : valid[valid.length - 1]) : null
}

/**
 * One plain status for the Calls screen. Green means every automatic path named by the UI is live:
 * new files, material-news routing, scoped call updates, and scheduled reviews.
 */
export function combineCallsAutomationStatus(input: {
  intake: CallsAutomationPart
  updates: CallsAutomationPart
  reviews: CallsAutomationPart
  news: CallsNewsWatcherStatus
  newsSource: CallsNewsSourceStatus
  now?: number
}): CallsAutomationPart {
  const { intake, updates, reviews, news, newsSource } = input
  const parts = [intake, updates, reviews]
  const base = {
    last_checked_at: time([intake.last_checked_at, updates.last_checked_at, reviews.last_checked_at, news.lastSweepAt], 'last'),
    next_check_at: time([intake.next_check_at, updates.next_check_at, reviews.next_check_at, news.nextSweepAt], 'first'),
    queued: parts.reduce((sum, part) => sum + part.queued, 0),
    running: parts.reduce((sum, part) => sum + part.running, 0) + (news.sweeping ? 1 : 0) + (newsSource.running ? 1 : 0),
  }

  if (parts.some((part) => !part.enabled) || !news.running || !newsSource.enabled) {
    return {
      ...base,
      enabled: false,
      state: 'needs_attention',
      next_check_at: null,
      message: !newsSource.enabled
        ? 'Automatic company news checks are turned off.'
        : !news.running
        ? 'Automatic news checks are not running on this machine.'
        : 'Automatic call updates are not running on this machine.',
    }
  }

  // `running` means an in-process fetch is active right now, not that the recurring source is alive. A
  // read-only cockpit can be supported by the standalone launchd ingester: its durable cycle is accepted
  // only while fresh enough for the configured cadence. This keeps both supported topologies honest.
  const intervalMs = Math.max(1, newsSource.intervalMin) * 60_000
  const sourceLastCycleMs = newsSource.sourceLastCycleAt ? Date.parse(newsSource.sourceLastCycleAt) : NaN
  const sourceFresh = Number.isFinite(sourceLastCycleMs)
    && (input.now ?? Date.now()) - sourceLastCycleMs <= Math.max(15 * 60_000, intervalMs * 3)
  const now = input.now ?? Date.now()
  const startedMs = newsSource.schedulerStartedAt ? Date.parse(newsSource.schedulerStartedAt) : NaN
  const startupGraceMs = Math.min(Math.max(2 * 60_000, intervalMs), 15 * 60_000)
  const starting = newsSource.schedulerActive && Number.isFinite(startedMs) && now - startedMs <= startupGraceMs
  if (newsSource.sourceLastError) {
    return {
      ...base,
      enabled: true,
      state: 'needs_attention',
      next_check_at: null,
      message: 'The company-news scanner could not complete its latest source check. It will retry automatically.',
    }
  }
  if (!sourceFresh && !starting && !newsSource.running) {
    return {
      ...base,
      enabled: true,
      state: 'needs_attention',
      next_check_at: null,
      message: newsSource.readOnly || newsSource.sourceLastCycleAt
        ? 'The separate company-news scanner has not checked in recently.'
        : newsSource.schedulerActive
          ? 'The company-news scanner has not completed a successful source check.'
          : 'The company-news scanner is not running.',
    }
  }

  if (news.manifestError || news.cursorError || news.retentionGapError || news.retentionGaps.length) {
    return {
      ...base,
      enabled: true,
      state: 'needs_attention',
      next_check_at: null,
      message: news.retentionGaps.length
        ? 'Some older company news could not be checked. New news will still be checked automatically.'
        : news.retentionGapError
          ? 'The saved older-news check needs attention.'
          : news.cursorError
            ? 'Automatic news checks are paused because their saved position needs attention. The system will keep trying.'
            : 'Automatic news checks need attention.',
    }
  }

  const needsAttention = parts.find((part) => part.state === 'needs_attention')
  if (needsAttention) return { ...base, enabled: true, state: 'needs_attention', message: needsAttention.message }

  if (news.sweeping || newsSource.running || starting || parts.some((part) => part.state === 'checking')) {
    return {
      ...base,
      enabled: true,
      state: 'checking',
      message: base.running > 0
        ? 'New information is being checked now.'
        : starting
          ? 'The company-news scanner is starting its first automatic check.'
          : 'New information is queued and will be checked automatically.',
    }
  }

  return {
    ...base,
    enabled: true,
    state: 'watching',
    message: 'Watching company folders, material news and scheduled reviews. You do not need to do anything.',
  }
}
