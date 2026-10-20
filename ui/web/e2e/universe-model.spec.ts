import { test, expect } from '@playwright/test'
import { MODEL_SCHEMA, UNIVERSE_URL, type ModelEventRead, type ModelRead, type ModelRow } from '../../shared/universe-model'
import { FINVIZ_VIEWS, type FinvizDataRead } from '../../shared/finviz-data'

test('Company Finviz data is compact, on demand, dated, unit-labelled and separate from signals', async ({ page, context }, testInfo) => {
  const now = new Date().toISOString()
  const row: ModelRow = { ticker: 'CO', company: 'Company Inc', price: 25, currency: 'USD', retrieved_at: now, signals: {} }
  const body: ModelRead = { schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows: [row], total: 1, complete: true, refreshing: false, fetched: 1,
    started_at: now, completed_at: now, next_refresh_at: now, stale: false, error: null, events: null,
    data: { captured: 2, expected: 8, refreshing: true, error: null } }
  let dataRequests = 0
  let wrongCompany = false
  let missingCompany = false
  let offline = false
  await context.route('**/api/screener/universe-model', (route) => route.fulfill({ json: body }))
  await context.route('**/api/screener/universe-model/data?*', (route) => {
    dataRequests++
    if (offline) return route.fulfill({ status: 404, json: { error: 'Endpoint unavailable during update' } })
    const views = Object.fromEntries(['overview', 'news'].map((id) => [id, {
      source_url: `https://finviz.com/screener/stocks?v=${FINVIZ_VIEWS.find((v) => v.id === id)!.code}&t=CO`, retrieved_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
      text: { ticker: 'CO', company: 'Company Inc', earningsDate: '2026-11-02T16:30:00' },
      numbers: { marketCap: 2500, debtEq: 0, forwardPE: null, roe: -5.5, futureMetric: 7 },
      ...(id === 'news' ? { news: [{ title: 'Reported merger', url: 'https://example.test/report', channel: 'Publisher', date: '2026-10-19T15:00:00' }] } : {}),
    }]))
    const result: FinvizDataRead = { source_url: UNIVERSE_URL, refreshing: true, error: null, rows: missingCompany ? [] : [{ ticker: 'CO', company: wrongCompany ? 'Other issuer' : 'Company Inc', views }] }
    return route.fulfill({ json: result })
  })
  await context.route('**/api/portfolio', (route) => route.fulfill({ json: { book: null } }))
  await context.route('**/api/watchlist', (route) => route.fulfill({ json: { rows: [], unreadable: [] } }))
  await page.goto('/e2e/ideas.html?surface=model')
  await page.getByRole('button', { name: 'Model', exact: true }).click()
  await page.getByRole('button', { name: 'Company Inc', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Total: 0 green ticks', { exact: true })).toBeVisible()
  expect(dataRequests).toBe(0)
  await dialog.getByText('Finviz data', { exact: true }).click()
  await expect(dialog.getByText('USD millions', { exact: true })).toBeVisible()
  await expect(dialog.getByText('refresh due', { exact: false })).toBeVisible()
  await expect(dialog.locator('dd').filter({ hasText: '2,500' })).toBeVisible()
  await expect(dialog.getByText('Raw · units unverified', { exact: true })).toBeVisible()
  await expect(dialog.getByText('Finviz local time · timezone unspecified', { exact: true })).toBeVisible()
  await expect(dialog.locator('dl')).toContainText('0×')
  await expect(dialog.locator('dl')).toContainText('—')
  await dialog.getByLabel('Finviz data view').selectOption('financial')
  await expect(dialog.getByText('Collection in progress…', { exact: true })).toBeVisible()
  offline = true
  await dialog.getByText('Finviz data', { exact: true }).click()
  await dialog.getByText('Finviz data', { exact: true }).click()
  await expect(dialog.getByText('Saved data unavailable.', { exact: true })).toBeVisible()
  await expect(dialog.getByText('Collection in progress…')).toHaveCount(0)
  offline = false
  await dialog.getByText('Finviz data', { exact: true }).click()
  await dialog.getByText('Finviz data', { exact: true }).click()
  await expect(dialog.getByText('Collection in progress…', { exact: true })).toBeVisible()
  await dialog.getByLabel('Finviz data view').selectOption('news')
  await expect(dialog.getByRole('link', { name: 'Reported merger' })).toHaveAttribute('href', 'https://example.test/report')
  await expect(dialog.getByText('Third-party data · unverified · quotes delayed', { exact: false })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('finviz-company-data-dark.png') })
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
  await page.screenshot({ path: testInfo.outputPath('finviz-company-data-light.png') })
  await page.setViewportSize({ width: 390, height: 844 })
  const box = (await dialog.boundingBox())!
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(390)
  await page.screenshot({ path: testInfo.outputPath('finviz-company-data-mobile.png') })
  await dialog.getByText('Finviz data', { exact: true }).click()
  wrongCompany = true
  await dialog.getByText('Finviz data', { exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('did not match this company')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  wrongCompany = false; offline = true
  await page.getByRole('button', { name: 'Company Inc', exact: true }).click()
  await page.getByRole('dialog').getByText('Finviz data', { exact: true }).click()
  await expect(page.getByRole('dialog').getByText('Saved data unavailable.', { exact: true })).toBeVisible()
  await expect(page.getByRole('dialog').getByText('This view has not been collected yet.')).toHaveCount(0)
  await page.keyboard.press('Escape')
  offline = false; missingCompany = true
  await page.getByRole('button', { name: 'Company Inc', exact: true }).click()
  await page.getByRole('dialog').getByText('Finviz data', { exact: true }).click()
  await expect(page.getByRole('dialog').getByText('Company absent from the current universe.', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('tbody tr').locator('td').last()).toHaveText('0Green ticks')
})

test('Universe Model green-count ranking, search, pagination, failure recovery and themes', async ({ page, context }, testInfo) => {
  await context.addInitScript(() => localStorage.setItem('nsw.universeEventModel.weights.v1', JSON.stringify({ contracts: 99, results: -5, guidance: -5 })))
  const now = new Date().toISOString()
  const event = { id: 'EVT-1', source_event_id: 'EVT-1', headline: 'Material contract announcement', url: 'https://example.test/filing', source: 'Issuer filing', reported_at: now, source_tier: 'primary_filing', direction: 'positive' as const,
    assessment: { read_at: now, story: ['The company won a material contract.'], company_role: 'subject' as const, effects: [{ side: 'beneficiary' as const, mechanism: 'The contract adds recurring revenue.', magnitude: null, horizon: 'Next two quarters' }], event_assessment: null, watch_item: null, provenance: { kind: 'original' as const, label: null, url: null } } }
  let evidenceRequests = 0
  await context.route('**/api/screener/universe-model/evidence*', (route) => {
    evidenceRequests++
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
  await expect(page.locator('tbody tr').first().locator('td').last()).toHaveText('2Green ticks')
  await expect(page.getByLabel('Legal / regulatory: No favorable signal').first()).toBeVisible()
  await page.getByLabel('Results: Favorable impact', { exact: true }).click()
  await expect(page.getByText('Material contract announcement').first()).toBeVisible()
  await expect(page.getByText('The contract adds recurring revenue.', { exact: true })).toBeVisible()
  expect(evidenceRequests).toBe(0) // The popup explains the exact assessment that supplied the tick.
  await page.getByRole('button', { name: 'Close signal details' }).click()
  await page.getByText('Signal rules', { exact: true }).click()
  await expect(page.getByLabel('Contracts / JVs weight', { exact: true })).toHaveCount(0)
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
  await page.getByText('Signal rules', { exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('model-dark.png'), fullPage: true })
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
  await page.screenshot({ path: testInfo.outputPath('model-light.png'), fullPage: true })
  await page.getByRole('button', { name: 'Events', exact: true }).click()
  await expect(page.getByText('Existing Events workspace')).toBeVisible()
  await expect(page.getByLabel('Event context', { exact: true })).toHaveValue('Saved event filter')
  await page.getByRole('button', { name: 'Model', exact: true }).click()
  await page.getByText('Signal rules', { exact: true }).click()
  await expect(page.locator('tbody tr').first()).toContainText('Company 104')
  partial = true
  await page.getByRole('button', { name: 'Check for updates' }).click()
  await expect(page.getByText('Partial coverage', { exact: true })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByText('Signal rules', { exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('model-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'Check an event', exact: true }).click()
  await expect(page.getByText('Existing Events workspace')).toBeVisible()
  await page.getByRole('button', { name: 'Model', exact: true }).click()
  await page.getByRole('button', { name: /^Portfolio\b/ }).click()
  await expect(page.getByRole('button', { name: 'Model', exact: true })).toHaveCount(0)
  await expect(page.getByText('Existing Events workspace')).toBeVisible()
  expect(requests).toBeGreaterThan(3)
})

test('Legacy snapshots keep impact unassessed while popup cache reads explain provenance and recover', async ({ page, context }, testInfo) => {
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
  await expect(dialog.getByRole('link', { name: 'Source actually read' })).toBeVisible()
  await dialog.getByText('Evidence & context', { exact: true }).click()
  await expect(dialog.getByRole('link', { name: 'Source actually read' })).toHaveAttribute('href', 'https://example.test/article-actually-read')
  await expect(dialog.getByText('Event context · inferred, not company-specific', { exact: true })).toBeVisible()
  const back = dialog.getByRole('button', { name: 'All company signals', exact: false })
  await back.focus(); await back.press('Enter')
  await expect(page.getByRole('heading', { name: 'Company signals', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(company).toBeFocused()

  const deal = page.locator('tbody tr').filter({ hasText: 'Orion Corp' }).getByRole('button', { name: 'Deals / restructuring: Unassessed', exact: true })
  await deal.click()
  dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Potential risk · inferred')).toBeVisible()
  await dialog.getByRole('button', { name: 'Close signal details' }).focus()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('link', { name: 'Company on Finviz' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: 'Close signal details' })).toBeFocused()
  await dialog.getByRole('combobox', { name: 'Recent signal report' }).selectOption('1')
  await expect(dialog.getByText('No completion date was disclosed.')).toBeHidden()
  await dialog.getByText('Evidence & context', { exact: true }).click()
  await expect(dialog.getByText('No completion date was disclosed.')).toBeVisible()
  await expect(dialog.getByText('Company impact not proven from saved analysis.')).toBeVisible()
  await expect(dialog.getByText('Potential benefit · inferred')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(deal).toBeFocused()

  const before = evidenceRequests
  await page.locator('tbody tr').filter({ hasText: 'Empty Corp' }).getByRole('button', { name: 'Deals / restructuring: No favorable signal', exact: true }).click()
  await expect(page.getByRole('dialog').getByText(/An event may still have occurred/)).toBeVisible()
  await page.keyboard.press('Escape')
  await page.locator('tbody tr').filter({ hasText: 'Uncertain Corp' }).getByRole('button', { name: 'Deals / restructuring: Unassessed', exact: true }).click()
  await expect(page.getByRole('dialog').getByText('Company impact or coverage unavailable. Unscored.')).toBeVisible()
  await page.keyboard.press('Escape')
  expect(evidenceRequests).toBe(before)

  offline = true
  await deal.click()
  dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('alert')).toContainText('Saved analysis unavailable')
  await expect(dialog.getByText(event.headline, { exact: true })).toBeVisible()
  offline = false
  await dialog.getByRole('button', { name: 'Retry saved analysis', exact: true }).click()
  await expect(dialog.getByText('Potential risk · inferred')).toBeVisible()
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

test('Embedded company assessments agree across green count, adverse/mixed crosses and unassessed popups', async ({ page, context }) => {
  const now = new Date().toISOString()
  const benefit = { side: 'beneficiary' as const, mechanism: 'The company could add recurring sales.', magnitude: null, horizon: 'Next two quarters' }
  const risk = { side: 'exposed' as const, mechanism: 'Financing could weaken the company’s balance sheet.', magnitude: null, horizon: null }
  const analysis = { read_at: now, story: ['A material agreement was announced.'], company_role: 'subject' as const, effects: [benefit], event_assessment: null, watch_item: null, provenance: { kind: 'original' as const, label: null, url: null } }
  const event = { id: 'STORY-1', source_event_id: 'ARTICLE-1', headline: 'Positive event headline', url: 'https://example.test/filing', source: 'Issuer filing', reported_at: now, source_tier: 'company', direction: 'positive' as const }
  const rows: ModelRow[] = [
    { ticker: 'GOOD', company: 'Favorable Corp', price: 10, currency: 'USD', retrieved_at: now, signals: { deals: [{ ...event, assessment: analysis }] } },
    { ticker: 'BAD', company: 'Adverse Corp', price: 10, currency: 'USD', retrieved_at: now, signals: { deals: [{ ...event, assessment: { ...analysis, effects: [risk] } }] } },
    { ticker: 'MIXED', company: 'Mixed Corp', price: 10, currency: 'USD', retrieved_at: now, signals: { deals: [{ ...event, assessment: { ...analysis, effects: [benefit, risk] } }] } },
    { ticker: 'PENDING', company: 'Unassessed Corp', price: 10, currency: 'USD', retrieved_at: now, signals: { deals: [{ ...event, assessment: null }] } },
  ]
  const body: ModelRead = { schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows, total: rows.length, complete: true, refreshing: false, fetched: rows.length,
    started_at: now, completed_at: now, next_refresh_at: now, stale: false, error: null, events: null }
  let evidenceRequests = 0
  await context.route('**/api/screener/universe-model', (route) => route.fulfill({ json: body }))
  await context.route('**/api/screener/universe-model/evidence*', (route) => { evidenceRequests++; return route.fulfill({ status: 500, json: { error: 'Must use the grid snapshot' } }) })
  await context.route('**/api/portfolio', (route) => route.fulfill({ json: { book: null } }))
  await context.route('**/api/watchlist', (route) => route.fulfill({ json: { rows: [], unreadable: [] } }))
  await page.goto('/e2e/ideas.html?surface=model')
  await page.getByRole('button', { name: 'Model', exact: true }).click()
  await expect(page.locator('tbody tr').first()).toContainText('Favorable Corp')
  await expect(page.locator('tbody tr').first().locator('td').last()).toHaveText('1Green ticks')
  for (const company of ['Adverse Corp', 'Mixed Corp']) {
    const row = page.locator('tbody tr').filter({ hasText: company })
    await expect(row.locator('td').last()).toHaveText('0Green ticks')
    await row.getByRole('button', { name: 'Deals / restructuring: No favorable signal', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('✕ No favorable signal', { exact: true })).toBeVisible()
    await expect(dialog.getByText(risk.mechanism, { exact: true })).toBeVisible()
    if (company === 'Mixed Corp') await expect(dialog.getByText(benefit.mechanism, { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
  }
  const pending = page.locator('tbody tr').filter({ hasText: 'Unassessed Corp' })
  await expect(pending.locator('td').last()).toHaveText('0Green ticks')
  await pending.getByRole('button', { name: 'Deals / restructuring: Unassessed', exact: true }).click()
  await expect(page.getByRole('dialog').getByText('— Impact unassessed', { exact: true })).toBeVisible()
  await expect(page.getByText('Company impact not proven from saved analysis.', { exact: true })).toBeVisible()
  expect(evidenceRequests).toBe(0)
})
