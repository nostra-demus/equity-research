import { test, expect } from '@playwright/test'
import { MODEL_SCHEMA, UNIVERSE_URL, type ModelRead, type ModelRow } from '../../shared/universe-model'

test('Universe Model ranking, weights, search, pagination, failure recovery and themes', async ({ page, context }, testInfo) => {
  const now = new Date().toISOString()
  const event = { id: 'EVT-1', headline: 'Material contract announcement', url: 'https://example.test/filing', source: 'Issuer filing', reported_at: now, source_tier: 'primary_filing', direction: 'positive' as const }
  const rows: ModelRow[] = Array.from({ length: 105 }, (_, i) => ({ ticker: `CO${i}`, company: `Company ${String(i).padStart(3, '0')}`,
    price: 100 + i, currency: 'USD', retrieved_at: now, signals: i === 104 ? { results: [event], guidance: [event] } : i === 0 ? { contracts: [event] } : {} }))
  let fail = false
  let partial = false
  let requests = 0
  await context.route('**/api/screener/universe-model', (route) => {
    requests++
    if (fail) return route.fulfill({ status: 503, json: { error: 'Fixture offline' } })
    const body: ModelRead = { schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows: partial ? rows.slice(0, 20) : rows, total: 105,
      complete: !partial, refreshing: partial, fetched: partial ? 20 : 105, started_at: now, completed_at: partial ? null : now,
      next_refresh_at: new Date(Date.now() + 1800000).toISOString(), stale: partial, error: null,
      events: { checked_at: now, from: new Date(Date.now() - 90 * 86400000).toISOString(), to: now, archive_days: 90, reports_scanned: 1000, latest_report_at: now, refreshing: false, error: null } }
    return route.fulfill({ json: body })
  })
  await context.route('**/api/portfolio', (route) => route.fulfill({ json: { book: null } }))
  await context.route('**/api/watchlist', (route) => route.fulfill({ json: { rows: [], unreadable: [] } }))
  await page.goto('/e2e/ideas.html?surface=model')
  await expect(page.getByRole('button', { name: 'Universe', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('Existing Events workspace')).toBeVisible()
  await page.getByLabel('Event context', { exact: true }).fill('Saved event filter')
  await page.getByRole('button', { name: 'Model', exact: true }).click()
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Total ↓', exact: true })).toBeVisible()
  await expect(page.locator('tbody tr').first()).toContainText('Company 104')
  await expect(page.getByLabel('Legal / regulatory: No matching report').first()).toBeVisible()
  await page.getByLabel('Results: Present', { exact: true }).click()
  await expect(page.getByText('Material contract announcement').first()).toBeVisible()
  await page.getByLabel('Results: Present', { exact: true }).click()
  await page.getByText('Signal rules and weights', { exact: true }).click()
  await page.getByLabel('Contracts / JVs weight', { exact: true }).fill('5')
  await expect(page.locator('tbody tr').first()).toContainText('Company 000')
  const riskWeight = page.getByLabel('Debt / distress weight', { exact: true })
  await riskWeight.fill('')
  await riskWeight.pressSequentially('-5')
  await riskWeight.press('Tab')
  await expect(riskWeight).toHaveValue('-5')
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page.getByText('101–105 of 105')).toBeVisible()
  await page.getByRole('searchbox').fill('CO104')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.locator('tbody tr')).toContainText('Company 104')
  await page.getByRole('searchbox').fill('nothing-matches')
  await expect(page.getByText('No companies match', { exact: false })).toBeVisible()
  await page.getByRole('searchbox').fill('')
  fail = true
  await page.getByRole('button', { name: 'Check for updates' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
  fail = false
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByText('Signal rules and weights', { exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('model-dark.png'), fullPage: true })
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
  await page.screenshot({ path: testInfo.outputPath('model-light.png'), fullPage: true })
  await page.getByRole('button', { name: 'Events', exact: true }).click()
  await expect(page.getByText('Existing Events workspace')).toBeVisible()
  await expect(page.getByLabel('Event context', { exact: true })).toHaveValue('Saved event filter')
  await page.getByRole('button', { name: 'Model', exact: true }).click()
  await page.getByText('Signal rules and weights', { exact: true }).click()
  await expect(page.getByLabel('Contracts / JVs weight', { exact: true })).toHaveValue('5')
  await page.getByRole('button', { name: 'Reset to equal weights' }).click()
  await expect(page.getByLabel('Contracts / JVs weight', { exact: true })).toHaveValue('1')
  partial = true
  await page.getByRole('button', { name: 'Check for updates' }).click()
  await expect(page.getByText('Partial coverage', { exact: false })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByText('Signal rules and weights', { exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('model-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'Check an event', exact: true }).click()
  await expect(page.getByText('Existing Events workspace')).toBeVisible()
  await page.getByRole('button', { name: 'Model', exact: true }).click()
  await page.getByRole('button', { name: /^Portfolio\b/ }).click()
  await expect(page.getByRole('button', { name: 'Model', exact: true })).toHaveCount(0)
  await expect(page.getByText('Existing Events workspace')).toBeVisible()
  expect(requests).toBeGreaterThan(3)
})
