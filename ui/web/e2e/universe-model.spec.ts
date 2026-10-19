import { test, expect } from '@playwright/test'
import { MODEL_SCHEMA, UNIVERSE_URL, type ModelEventRead, type ModelRead, type ModelRow } from '../../shared/universe-model'

test('Universe Model ranking, weights, search, pagination, failure recovery and themes', async ({ page, context }, testInfo) => {
  const now = new Date().toISOString()
  const event = { id: 'EVT-1', source_event_id: 'EVT-1', headline: 'Material contract announcement', url: 'https://example.test/filing', source: 'Issuer filing', reported_at: now, source_tier: 'primary_filing', direction: 'positive' as const }
  await context.route('**/api/screener/universe-model/evidence*', (route) => {
    const q = new URL(route.request().url()).searchParams
    return route.fulfill({ json: { event_id: q.get('eventId'), ticker: q.get('ticker'), company: q.get('company'), analysis: null } })
  })
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
  await page.getByRole('button', { name: 'Close signal details' }).click()
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

test('Company and signal popups explain exact events, company impact, missingness and provenance', async ({ page, context }, testInfo) => {
  const now = new Date().toISOString()
  const event = { id: 'STORY-DEAL', source_event_id: 'ARTICLE-DEAL', headline: 'Orion agrees to acquire its supplier for $200m', excerpt: 'The purchase is subject to regulatory approval.',
    classification_reason: 'A material acquisition changes the company’s supplier ownership.', url: 'https://example.test/announcement', source: 'Issuer announcement', reported_at: now, source_tier: 'company', direction: 'mixed' as const }
  const second = { ...event, id: 'STORY-SECOND', source_event_id: 'ARTICLE-SECOND', headline: 'Orion confirms the approval process remains open', excerpt: 'No completion date was disclosed.' }
  const rows: ModelRow[] = [{ ticker: 'ORN', company: 'Orion Corp', price: 100, currency: 'USD', retrieved_at: now, signals: { deals: [event, second] } },
    { ticker: 'EMPTY', company: 'Empty Corp', price: 50, currency: 'USD', retrieved_at: now, signals: {} },
    { ticker: 'UNCERTAIN', company: 'Uncertain Corp', price: null, currency: 'USD', retrieved_at: now, signals: null }]
  const body: ModelRead = { schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows, total: 3, complete: true, refreshing: false, fetched: 3,
    started_at: now, completed_at: now, next_refresh_at: now, stale: false, error: null, events: null }
  let offline = false
  let evidenceRequests = 0
  await context.route('**/api/screener/universe-model', (route) => route.fulfill({ json: body }))
  await context.route('**/api/screener/universe-model/evidence*', (route) => {
    evidenceRequests++
    if (offline) return route.fulfill({ status: 503, json: { error: 'Saved analysis temporarily unavailable' } })
    const q = new URL(route.request().url()).searchParams
    const read: ModelEventRead = { event_id: q.get('eventId')!, ticker: q.get('ticker')!, company: q.get('company')!, analysis: q.get('eventId') === 'ARTICLE-SECOND' ? null : {
      read_at: now, story: ['The proposed purchase is financed with debt.'], company_role: 'acquirer',
      effects: [{ side: 'beneficiary', mechanism: 'The company could reduce input costs after integrating the supplier.', magnitude: null, horizon: 'After closing' },
        { side: 'exposed', mechanism: 'Debt financing could increase leverage.', magnitude: '$200m consideration', horizon: null }],
      event_assessment: 'The acquisition has operating benefits and financing risks.', watch_item: 'Regulatory approval and financing terms.',
      provenance: { kind: 'alternate', label: 'Other approved outlet', url: 'https://example.test/article-actually-read' },
    } }
    return route.fulfill({ json: read })
  })
  await context.route('**/api/portfolio', (route) => route.fulfill({ json: { book: null } }))
  await context.route('**/api/watchlist', (route) => route.fulfill({ json: { rows: [], unreadable: [] } }))
  await page.goto('/e2e/ideas.html?surface=model')
  await page.getByRole('button', { name: 'Model', exact: true }).click()
  const company = page.getByRole('button', { name: 'Orion Corp', exact: true })
  await company.focus(); await company.press('Enter')
  let dialog = page.getByRole('dialog', { name: 'Company signals', exact: true })
  await expect(dialog).toBeVisible() // The fixture uses the desktop app's StrictMode lifecycle.
  const overviewDeal = dialog.getByRole('button', { name: /Deals \/ restructuring/ })
  await overviewDeal.focus(); await overviewDeal.press('Enter')
  dialog = page.getByRole('dialog', { name: 'Deals / restructuring', exact: true })
  await expect(dialog.getByRole('heading', { name: 'Deals / restructuring', exact: true })).toBeFocused()
  await expect(dialog.getByText('The company could reduce input costs after integrating the supplier.')).toBeVisible()
  await expect(dialog.getByText('Debt financing could increase leverage.')).toBeVisible()
  await expect(dialog.getByText('Company role: acquirer', { exact: true })).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Source actually read' })).toHaveAttribute('href', 'https://example.test/article-actually-read')
  await expect(dialog.getByText(/This describes the event overall/)).toBeVisible()
  const back = dialog.getByRole('button', { name: 'All company signals', exact: false })
  await back.focus(); await back.press('Enter')
  await expect(page.getByRole('heading', { name: 'Company signals', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(company).toBeFocused()

  const deal = page.locator('tbody tr').filter({ hasText: 'Orion Corp' }).getByRole('button', { name: 'Deals / restructuring: Present', exact: true })
  await deal.click()
  dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Potential risk · saved inference')).toBeVisible()
  await dialog.getByRole('button', { name: 'Close signal details' }).focus()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('link', { name: 'Company on Finviz' })).toBeFocused()
  await dialog.getByRole('combobox', { name: 'Recent signal report' }).selectOption('1')
  await expect(dialog.getByText('No completion date was disclosed.')).toBeVisible()
  await expect(dialog.getByText(/Company-specific financial impact is not proven/)).toBeVisible()
  await expect(dialog.getByText('Potential benefit · saved inference')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(deal).toBeFocused()

  const before = evidenceRequests
  await page.locator('tbody tr').filter({ hasText: 'Empty Corp' }).getByRole('button', { name: 'Deals / restructuring: No matching report', exact: true }).click()
  await expect(page.getByRole('dialog').getByText(/This does not prove that no event occurred/)).toBeVisible()
  await page.keyboard.press('Escape')
  await page.locator('tbody tr').filter({ hasText: 'Uncertain Corp' }).getByRole('button', { name: 'Deals / restructuring: Unavailable', exact: true }).click()
  await expect(page.getByRole('dialog').getByText(/No conclusion about this signal can be drawn/)).toBeVisible()
  await page.keyboard.press('Escape')
  expect(evidenceRequests).toBe(before)

  offline = true
  await deal.click()
  dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('alert')).toContainText('The saved analysis could not be loaded')
  await expect(dialog.getByText(event.headline, { exact: true })).toBeVisible()
  offline = false
  await dialog.getByRole('button', { name: 'Retry saved analysis', exact: true }).click()
  await expect(dialog.getByText('Potential risk · saved inference')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('model-popup-dark.png') })
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
  await page.screenshot({ path: testInfo.outputPath('model-popup-light.png') })
  await page.setViewportSize({ width: 390, height: 844 })
  const box = (await dialog.boundingBox())!
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(390)
  expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(844)
  await page.screenshot({ path: testInfo.outputPath('model-popup-mobile.png') })
  await page.mouse.click(2, 2)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
