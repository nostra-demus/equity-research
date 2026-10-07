import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildDiscoveryEvents, discoveryIdea, discoveryPage, fileDiscoveryCard, projectDiscovery, readFilingActions } from '../../server/src/news/ideas/ideas-workspace'
import type { IdeaLane } from '../../shared/ideas-workspace'
import type { FeedItem } from '../../server/src/news/types'

test('Ideas → Events default, filters, filing, reload and keyboard navigation', async ({ page, context }, testInfo) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-browser-'))
  const now = new Date().toISOString()
  const idea = (ticker: string, exchange: string) => discoveryIdea({ idea_id: `IDEA-${ticker}`, idea_version: ticker, idea_version_started_at: now,
    ticker, exchange, company: `${ticker} Company`, direction: 'long', pair_with: null, reason: `${ticker} contract announcement`, why_now: 'A new disclosure is available.',
    source_event_ids: [`EVT-${ticker}`], source_headlines: ['New contract'], source_name: 'Example filing', source_url: 'https://example.test/filing',
    updated_at: now, newest_source_at: now, surfaced_at: now, decay_at: new Date(Date.now() + 86_400_000).toISOString(), status: 'live',
    trade_score: 50, conviction: 50, trade_score_basis: 'evidence_gate_v2', missing_checks: [], prior_coverage: null, thesis_type: 'company_specific',
  })
  const events = buildDiscoveryEvents([], [{ kind: 'item', event_id: 'EVT-pipeline', dedup_group: 'EVT-pipeline',
    headline: 'Pipeline closes after damage', source_name: 'Example wire', url: 'https://example.test/pipeline', found_at: now, ts: now,
    band: 'pick', triage_score: 95, scope: 'geopolitical', country: 'SA', companies: [], commodities: ['CRUDE-OIL'] } as FeedItem])
  const cards = [...events, idea('USCO', 'NYSE'), idea('HKCO', 'HKEX'), idea('INCO', 'NSE')]
  let failRead = false
  let failWrite = false
  let malformed = false
  let stalledPages = false
  await context.route('**/api/screener/board', (route) => route.fulfill({ json: { signals: [], live: [], ideas: [], resumable: [], counts: {} } }))
  await context.route('**/api/screener/idea-workspace?*', async (route) => {
    if (failRead) return route.fulfill({ status: 503, json: { error: 'Fixture temporarily unavailable' } })
    if (malformed) return route.fulfill({ json: { schema_version: 'ideas-workspace/v1', rows: [{ payload: { reason: {} } }] } })
    const q = new URL(route.request().url()).searchParams
    const result = discoveryPage(projectDiscovery(cards, await readFilingActions(root)), q.get('lane') as IdeaLane,
      (q.get('hide') || '').split(','), q.get('kind') || 'all', Number(q.get('cursor') || 0))
    if (stalledPages) result.next_cursor = '30'
    return route.fulfill({ json: result })
  })
  await context.route('**/api/screener/idea-workspace/actions', async (route) => {
    if (failWrite) return route.fulfill({ status: 503, json: { error: 'Fixture cannot save archive' } })
    return route.fulfill({ json: { card: await fileDiscoveryCard(root, cards, route.request().postDataJSON()) } })
  })
  await context.route('**/api/screener/ideas/IDEA-USCO/feedback', async (route) => {
    cards.find((c) => c.payload.ticker === 'USCO')!.payload.feedback = route.request().postDataJSON().polarity === 'up' ? 'up' : null
    return route.fulfill({ json: { ok: true } })
  })
  await context.route('**/api/e2e/promote-idea', async (route) => {
    cards.find((c) => c.payload.ticker === 'USCO')!.payload.status = 'promoted'
    return route.fulfill({ json: { ok: true } })
  })
  try {
    await page.goto('/e2e/ideas.html')
    await expect(page.getByRole('radio', { name: 'Ideas', exact: true })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('tab', { name: 'Events', exact: true })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByText('Pipeline closes after damage').first()).toBeVisible()
    await expect(page.getByText('Qualified 3–6 month ideas')).toHaveCount(0)
    await expect(page.getByLabel('Hide Hong Kong listings')).toBeChecked()
    await expect(page.getByLabel('Hide India listings')).toBeChecked()
    await page.screenshot({ path: testInfo.outputPath('events-dark.png'), fullPage: true })

    await page.evaluate(async () => {
      const { usePersonalScopeStore } = await import('/src/lib/personalScope.ts')
      usePersonalScopeStore.getState().setScope('universe')
    })
    await page.getByRole('tab', { name: 'Long', exact: true }).click()
    await expect(page.getByText('USCO contract announcement')).toBeVisible()
    await expect(page.getByText('HKCO contract announcement')).toHaveCount(0)
    const good = page.getByRole('button', { name: 'Good idea', exact: true })
    await good.click()
    await expect(good).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('tab', { name: 'Events', exact: true }).click()
    await page.getByRole('tab', { name: 'Long', exact: true }).click()
    await expect(good).toHaveAttribute('aria-pressed', 'true')
    await good.click()
    await expect(good).toHaveAttribute('aria-pressed', 'false')
    // The launch itself is covered by the provider fixture; verify this card refreshes after acceptance.
    await page.evaluate(async () => {
      const { useStore } = await import('/src/lib/store.ts')
      const profile = { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' }
      useStore.setState({ runProvider: 'claude', providers: { ...useStore.getState().providers, catalogState: 'valid',
        claude: { provider: 'claude', enabled: true, available: true, checked: true, status: 'available', profile } },
        scPromoteIdea: async () => { await fetch('/api/e2e/promote-idea', { method: 'POST' }) } })
    })
    await page.getByRole('button', { name: 'Run the full machine →', exact: true }).click()
    await page.getByRole('button', { name: 'Confirm · run the machine', exact: true }).click()
    await expect(page.getByText('Sent to full research', { exact: true })).toBeVisible()
    await expect(good).toHaveCount(0)
    await page.getByLabel('Hide Hong Kong listings').uncheck()
    await expect(page.getByText('HKCO contract announcement')).toBeVisible()
    await page.evaluate(async () => {
      const { usePersonalScopeStore } = await import('/src/lib/personalScope.ts')
      usePersonalScopeStore.setState({ portfolio: { members: [{ ticker: 'USCO', name: 'USCO Company', listingCountry: 'US' }], status: 'ready', error: null, asOf: null, unresolved: 0 } })
      usePersonalScopeStore.getState().setScope('portfolio')
    })
    await expect(page.getByText('USCO contract announcement')).toBeVisible()
    await expect(page.getByText('HKCO contract announcement')).toHaveCount(0)
    await page.getByRole('tab', { name: 'Events', exact: true }).click()
    await expect(page.getByText('Pipeline closes after damage').first()).toBeVisible()
    await page.evaluate(async () => {
      const { usePersonalScopeStore } = await import('/src/lib/personalScope.ts')
      usePersonalScopeStore.getState().setScope('universe')
    })
    await page.reload()
    await expect(page.getByRole('tab', { name: 'Events', exact: true })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByLabel('Hide Hong Kong listings')).not.toBeChecked()

    failWrite = true
    await page.getByRole('button', { name: 'Archive', exact: true }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByText('Pipeline closes after damage').first()).toBeVisible()
    failWrite = false
    await page.getByRole('button', { name: 'Archive', exact: true }).click()
    await expect(page.getByText('No developing events are available yet.')).toBeVisible()
    await page.reload()
    await expect(page.getByText('No developing events are available yet.')).toBeVisible()
    await page.getByRole('tab', { name: 'Idea archives', exact: true }).click()
    await expect(page.getByText('Pipeline closes after damage').first()).toBeVisible()
    await page.getByRole('button', { name: 'Restore', exact: true }).click()
    await page.getByRole('tab', { name: 'Events', exact: true }).click()
    await expect(page.getByText('Pipeline closes after damage').first()).toBeVisible()
    await page.getByRole('button', { name: 'Archive', exact: true }).click()
    await page.getByRole('button', { name: 'Undo', exact: true }).click()
    await expect(page.getByText('Pipeline closes after damage').first()).toBeVisible()

    // Timer refresh keeps the selection; a failed refresh retains the last good cards.
    await page.clock.install()
    await page.getByRole('tab', { name: 'Long', exact: true }).click()
    await expect(page.getByText('USCO contract announcement')).toBeVisible()
    failRead = true
    await page.clock.fastForward(30_100)
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('alert')).toContainText('Fixture temporarily unavailable')
    await expect(page.getByRole('alert')).not.toContainText('/api/')
    await expect(page.getByRole('tab', { name: 'Long', exact: true })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByText('USCO contract announcement')).toBeVisible()
    failRead = false
    await page.getByRole('button', { name: 'Retry', exact: true }).click()
    await expect(page.getByRole('alert')).toHaveCount(0)
    malformed = true
    await page.clock.fastForward(30_100)
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByText('USCO contract announcement')).toBeVisible()
    malformed = false
    await page.getByRole('button', { name: 'Retry', exact: true }).click()
    await expect(page.getByRole('alert')).toHaveCount(0)
    stalledPages = true
    await page.clock.fastForward(30_100)
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByText('USCO contract announcement')).toBeVisible()
    stalledPages = false
    await page.getByRole('button', { name: 'Retry', exact: true }).click()
    await expect(page.getByRole('alert')).toHaveCount(0)
    await page.getByRole('tab', { name: 'Long', exact: true }).focus()
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByRole('tab', { name: 'Events', exact: true })).toBeFocused()
    await expect(page.getByText('Pipeline closes after damage').first()).toBeVisible()

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
    await page.screenshot({ path: testInfo.outputPath('events-light.png'), fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('tab', { name: 'Events', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath('events-mobile.png'), fullPage: true })
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
})

const liveCard = (index: number): import('../../shared/ideas-workspace').DiscoveryCard => ({
  key: `event-${index.toString(16).padStart(24, '0')}`, kind: 'event', aliases: [`family:fixture-${index}`],
  sides: [], listings: { long: null, short: null }, updated_at: new Date(Date.now() - index * 1000).toISOString(),
  priority: 100, payload: {}, expired: false, archived_at: null, archive_reason: null, action_revision: null,
  event: { title: `Developing event ${index}`, latest_change: `Reported development ${index}`, implications: [],
    regions: ['US'], topics: ['policy'], summary_status: 'reports_only', independent_stories: 1,
    reports: [1, 2].map((report) => ({ event_id: `fixture-${index}-${report}`, family: `fixture-${index}`,
      headline: `Source ${report} for event ${index}`, at: new Date().toISOString(), time_basis: 'source',
      publisher: 'Fixture wire', url: `https://example.test/${index}/${report}`, stance: 'reported' })),
  },
})

test('background refresh preserves reading, loaded depth, source disclosure and focus', async ({ page, context }) => {
  const cards = Array.from({ length: 150 }, (_, i) => liveCard(i + 1))
  cards[40].event!.reports = cards[40].event!.reports.slice(0, 1)
  let failed = false, hold = false, reads = 0
  let release: (() => void) | null = null
  await context.route('**/api/screener/board', (route) => route.fulfill({ json: { signals: [], live: [], ideas: [], resumable: [], counts: {} } }))
  await context.route('**/api/screener/idea-workspace?*', async (route) => {
    reads++
    if (hold) await new Promise<void>((resolve) => { release = resolve })
    if (failed) return route.fulfill({ status: 503, json: { error: 'Fixture refresh unavailable' } })
    const q = new URL(route.request().url()).searchParams
    return route.fulfill({ json: discoveryPage(cards, q.get('lane') as IdeaLane, [], 'all', Number(q.get('cursor'))) })
  })
  await page.clock.install()
  await page.goto('/e2e/ideas.html')
  await expect(page.locator('.discovery-card')).toHaveCount(30)
  await page.getByRole('button', { name: 'Show more', exact: true }).click()
  await expect(page.locator('.discovery-card')).toHaveCount(60)
  const reading = page.locator('.discovery-card').filter({ has: page.getByText('Developing event 41', { exact: true }) })
  await reading.scrollIntoViewIfNeeded()
  const summary = reading.locator('summary')
  await summary.focus()
  const before = await reading.evaluate((el) => { (window as any).readingNode = el; return el.getBoundingClientRect().top })
  const beforeMembership = reads
  await page.evaluate(async () => {
    const { usePersonalScopeStore } = await import('/src/lib/personalScope.ts')
    const { useStore } = await import('/src/lib/store.ts')
    usePersonalScopeStore.setState({ portfolio: { members: [], status: 'loading', error: null, asOf: null, unresolved: 0 } })
    useStore.setState({ scFacets: { companies: [], countries: [], regions: [], total: 0 } as any })
  })
  await expect(summary).toBeFocused()
  expect(reads).toBe(beforeMembership)
  expect(await reading.evaluate((el) => el === (window as any).readingNode)).toBe(true)
  hold = true
  await page.clock.fastForward(30_100)
  await expect.poll(() => release !== null).toBe(true)
  await expect(page.locator('.bidea--skeleton')).toHaveCount(0)
  await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-busy', 'false')
  await expect(page.getByRole('button', { name: 'Show more', exact: true })).toBeEnabled()
  cards.unshift(liveCard(0))
  cards[2].event!.latest_change = 'A substantially longer update. '.repeat(30)
  cards[41].event!.reports.push({ ...cards[41].event!.reports[0], event_id: 'added-source' })
  hold = false
  release!()
  await expect(page.locator('.discovery-card')).toHaveCount(90)
  expect(Math.abs((await reading.boundingBox())!.y - before)).toBeLessThan(2)
  expect(await reading.evaluate((el) => el === (window as any).readingNode)).toBe(true)
  await expect(reading.locator('details')).toHaveAttribute('open', '')
  await expect(summary).toBeFocused()
  const boundary = await page.locator('.discovery-card').last().getAttribute('data-reading-key')
  cards.unshift(...Array.from({ length: 45 }, (_, index) => ({ ...liveCard(1000 + index), updated_at: new Date(Date.now() + 60_000 + index).toISOString() })))
  await page.clock.fastForward(30_100)
  await expect(page.locator('.discovery-card')).toHaveCount(150)
  await expect(page.locator(`[data-reading-key="${boundary}"]`)).toHaveCount(1)
  expect(Math.abs((await reading.boundingBox())!.y - before)).toBeLessThan(2)
  failed = true
  await page.clock.fastForward(30_100)
  await expect(page.getByRole('alert')).toContainText('Showing the last loaded cards.')
  expect(Math.abs((await reading.boundingBox())!.y - before)).toBeLessThan(2)
  failed = false
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(reading.locator('details')).toHaveAttribute('open', '')
  // A score change can move the reading card below the old loaded boundary.
  cards.find((card) => card.key === liveCard(41).key)!.priority = 50
  await summary.focus()
  await page.clock.fastForward(30_100)
  await expect(reading).toBeVisible()
  await expect(summary).toBeFocused()
  expect(await reading.evaluate((el) => el === (window as any).readingNode)).toBe(true)
  await page.locator('.discovery').evaluate((el) => { el.scrollTop = 0 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  cards.unshift({ ...liveCard(100), updated_at: new Date(Date.now() + 120_000).toISOString() })
  await page.clock.fastForward(30_100)
  await expect(page.locator('.discovery-card').first()).toContainText('Developing event 100')
  expect(await page.locator('.discovery').evaluate((el) => el.scrollTop)).toBe(0)
  expect(await page.locator('.discovery-card').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
})

test('live news rail preserves the visible story during prepends and updates', async ({ page }) => {
  await page.goto('/e2e/ideas.html?surface=wire')
  await page.evaluate(async () => {
    const { usePersonalScopeStore } = await import('/src/lib/personalScope.ts')
    const { useStore } = await import('/src/lib/store.ts')
    usePersonalScopeStore.getState().setScope('universe')
    useStore.setState({ newsItems: Array.from({ length: 45 }, (_, index) => ({ kind: 'item', event_id: `EVT-${index}`, dedup_group: `EVT-${index}`,
      headline: `Wire development ${index}`, source_name: 'Fixture wire', url: `https://example.test/wire/${index}`,
      ts: new Date(Date.now() - index * 1000).toISOString(), band: 'pick', triage_score: 95, scope: 'policy', country: 'US', companies: [], event_types: [] })) as any })
  })
  await expect(page.locator('.evrow')).toHaveCount(45)
  await page.evaluate(async () => {
    const { useStore } = await import('/src/lib/store.ts')
    useStore.setState({ readEvents: new Set(useStore.getState().newsItems.map((item) => item.event_id)) })
  })
  await expect(page.locator('.evrail__unreadbar')).toHaveCount(0)
  const key = await page.locator('.evrow').nth(20).getAttribute('data-reading-key')
  const row = page.locator(`.evrow[data-reading-key="${key}"]`)
  await row.scrollIntoViewIfNeeded()
  const before = await row.evaluate((el) => { (window as any).wireNode = el; return el.getBoundingClientRect().top })
  await page.evaluate(async () => {
    const { useStore } = await import('/src/lib/store.ts')
    const items = useStore.getState().newsItems
    useStore.setState({ newsItems: [{ ...items[0], event_id: 'EVT-new', dedup_group: 'EVT-new', headline: 'Newest wire development', ts: new Date(Date.now() + 60_000).toISOString() },
      ...items.map((item, index) => index === 1 ? { ...item, headline: 'Longer wire update. '.repeat(30) } : item)] })
  })
  await expect(page.locator('.evrow')).toHaveCount(46)
  await expect(page.locator('.evrail__unreadbar')).toHaveCount(1)
  expect(Math.abs((await row.boundingBox())!.y - before)).toBeLessThan(2)
  expect(await row.evaluate((el) => el === (window as any).wireNode)).toBe(true)
  // Native anchoring remains available for font/width changes outside React commits.
  await page.locator('.evrail').evaluate((el) => { el.style.width = '310px' })
  expect(Math.abs((await row.boundingBox())!.y - before)).toBeLessThan(2)
})

for (const surface of ['activity', 'speed']) {
  test(`${surface} keeps last successful content after a failed background check`, async ({ page, context }) => {
    let failed = false
    const activity = { rows: [{ runId: 'fixture-reading', user: 'fixture@local', userVia: 'local', kind: 'full', ticker: 'READING',
      swarm: 'research', provider: 'codex', launchedAt: Date.now(), status: 'done', durationMs: 1000 }],
      total: 1, allTime: 1, users: ['fixture@local'], tickers: ['READING'], earliest: Date.now() }
    const speed = { version: 1, release: 'fixture', generatedAt: new Date().toISOString(), windowHours: 24,
      retentionDays: 7, sampleCount: 123, droppedSamples: 0, status: 'good', metrics: [] }
    await context.route(surface === 'activity' ? '**/api/activity?*' : '**/api/performance/summary?*', (route) => failed
      ? route.fulfill({ status: 503, json: { error: 'Fixture unavailable' } }) : route.fulfill({ json: surface === 'activity' ? activity : speed }))
    await page.clock.install()
    await page.goto(`/e2e/ideas.html?surface=${surface}`)
    const content = surface === 'activity' ? page.locator('td').getByText('READING', { exact: true }) : page.getByText('123 timing samples in the last 24 hours')
    await expect(content).toBeVisible()
    failed = true
    await page.clock.fastForward(30_100)
    await expect(page.getByRole('status')).toContainText('Showing the last loaded')
    await expect(content).toBeVisible()
    failed = false
    await page.getByRole('button', { name: 'Retry', exact: true }).click()
    await expect(page.getByRole('status')).toHaveCount(0)
    await expect(content).toBeVisible()
    if (surface === 'activity') {
      failed = true
      await page.getByLabel('Status', { exact: true }).selectOption('error')
      await expect(page.getByRole('status')).toContainText('Run history is unavailable.')
      await expect(content).toHaveCount(0)
    }
  })
}
