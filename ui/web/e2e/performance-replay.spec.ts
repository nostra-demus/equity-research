import { expect, test } from '@playwright/test'

test('synthetic live-run replay stays within the cockpit paint budget without launching work', async ({ page }) => {
  const launchRequests: string[] = []
  page.on('request', (request) => {
    if (/\/api\/(?:launch|resume|readiness\/decision)/.test(request.url())) launchRequests.push(request.url())
  })
  await page.goto('/e2e/performance.html')
  await expect(page.getByTestId('performance-replay')).toHaveAttribute('data-ready', 'yes')
  const result = await page.evaluate(() => window.runSyntheticPerformanceReplay())
  console.log(`synthetic replay: ${result.events} events · p95 paint ${result.p95EventToPaintMs.toFixed(1)}ms · max ${result.maxEventToPaintMs.toFixed(1)}ms · total ${result.totalMs.toFixed(1)}ms`)

  expect(result.events).toBe(360)
  expect(result.activityRows).toBe(80)
  expect(result.p95EventToPaintMs).toBeLessThanOrEqual(250)
  expect(result.maxEventToPaintMs).toBeLessThanOrEqual(500)
  expect(result.totalMs).toBeLessThanOrEqual(3_000)
  expect(launchRequests, 'the performance benchmark must never invoke a run launcher').toEqual([])
})
