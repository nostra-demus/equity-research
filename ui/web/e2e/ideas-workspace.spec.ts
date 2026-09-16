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
  await context.route('**/api/screener/board', (route) => route.fulfill({ json: { signals: [], live: [], ideas: [], resumable: [], counts: {} } }))
  await context.route('**/api/screener/idea-workspace?*', (route) => {
    if (failRead) return route.fulfill({ status: 503, json: { error: 'Fixture temporarily unavailable' } })
    if (malformed) return route.fulfill({ json: { schema_version: 'ideas-workspace/v1', rows: [{ payload: { reason: {} } }] } })
    const q = new URL(route.request().url()).searchParams
    return route.fulfill({ json: discoveryPage(projectDiscovery(cards, readFilingActions(root)), q.get('lane') as IdeaLane,
      (q.get('hide') || '').split(','), q.get('kind') || 'all', Number(q.get('cursor') || 0)) })
  })
  await context.route('**/api/screener/idea-workspace/actions', (route) => {
    if (failWrite) return route.fulfill({ status: 503, json: { error: 'Fixture cannot save archive' } })
    return route.fulfill({ json: { card: fileDiscoveryCard(root, cards, route.request().postDataJSON()) } })
  })
  await context.route('**/api/screener/ideas/IDEA-USCO/feedback', (route) => {
    cards.find((c) => c.payload.ticker === 'USCO')!.payload.feedback = route.request().postDataJSON().polarity === 'up' ? 'up' : null
    return route.fulfill({ json: { ok: true } })
  })
  await context.route('**/api/e2e/promote-idea', (route) => {
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
    await page.getByRole('tab', { name: 'Long', exact: true }).focus()
    await page.keyboard.press('ArrowRight')
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
