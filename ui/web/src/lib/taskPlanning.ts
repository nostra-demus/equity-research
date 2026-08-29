const RETRY_DELAYS_MS = [200, 400, 800, 1_600, 3_000, 5_000, 5_000] as const

export function taskPlanningBusy(error: unknown): boolean {
  const cause = error as { status?: unknown; message?: unknown; error?: unknown; body?: { error?: unknown } }
  return Number(cause?.status) === 409
    && String(cause?.message ?? cause?.error ?? cause?.body?.error ?? '').includes('Tasks and Watchlist are being updated')
}

/** A planning lock is transient and is raised before a mutation starts, so retrying it is idempotent. */
export async function retryTaskPlanning<T>(
  operation: () => Promise<T>,
  wait: (milliseconds: number) => Promise<void> = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  delays: readonly number[] = RETRY_DELAYS_MS,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (!taskPlanningBusy(error) || attempt >= delays.length) throw error
      await wait(delays[attempt])
    }
  }
}
