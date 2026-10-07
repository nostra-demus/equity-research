import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildDiscoveryEvents, discoveryIdea, discoveryPage, fileDiscoveryCard, projectDiscovery, readFilingActions } from '../../server/src/news/ideas/ideas-workspace'
import type { IdeaLane } from '../../shared/ideas-workspace'
import type { FeedItem } from '../../server/src/news/types'
import { createTheme } from '../../server/src/news/themes/discover'
import { buildThemesIndex } from '../../server/src/news/themes/store'
import { attachValidNarrative } from '../../server/test/themes-fixtures'

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

test('Themes precedes Events: read source-backed explanations, filter sectors, refresh and recover', async ({ page, context }, testInfo) => {
  const now = new Date()
  const makeTheme = (id: string, name: string, subject: string, headline: string) => {
    const rows = [1, 2, 3].map((n) => ({ event_id: `${id}-${n}`, dedup_group: `${id}-${n}`, headline: `${headline} ${n}`,
      found_at: now.toISOString(), companies: [], event_types: ['capex'], issuer_linkage: 'sector' as const,
      triage_score: 85, source_tier: 'company', source_name: 'Fixture source', url: `https://example.test/${id}/${n}` }))
    const theme = createTheme(rows, now, 'claude')
    theme.name = name
    theme.description = `${name} connects new demand with capacity spending.`
    theme.needs_rename = false
    attachValidNarrative(theme, { anchor_terms: [subject, 'demand'],
      thesis: `${name} is changing how businesses invest in capacity.`, why_now: `${name} has new reported demand this week.`,
      mechanism_steps: ['Demand changes the capacity businesses need.', 'Capacity spending changes suppliers’ revenue and costs.'],
      falsifier: 'Reported demand falls for two consecutive quarters.', validated_at: now.toISOString(), expressions: [] })
    return theme
  }
  const technology = makeTheme('tech', 'AI software security', 'software', 'Software security demand expands')
  const bank = makeTheme('bank', 'Bank lending demand', 'bank', 'Bank lending demand expands')
  const unknown = makeTheme('unknown', 'New research capacity', 'research', 'Research capacity demand expands')
  let response = buildThemesIndex([technology, bank, unknown], () => now)
  let fail = false
  let delay = false
  let release: (() => void) | undefined
  let ideaReads = 0
  await context.route('**/api/screener/board', (route) => route.fulfill({ json: { signals: [], live: [], ideas: [], resumable: [], counts: {} } }))
  await context.route('**/api/screener/idea-workspace?*', (route) => { ideaReads++; return route.fulfill({ json: discoveryPage([], 'events', [], 'all', 0) }) })
  await context.route('**/api/news/themes', async (route) => {
    const snapshot = structuredClone(response)
    if (delay) await new Promise<void>((resolve) => { release = resolve })
    return fail ? route.fulfill({ status: 503, json: { error: 'Theme source unavailable' } }) : route.fulfill({ json: snapshot })
  })
  await page.goto('/e2e/ideas.html')
  await expect(page.getByRole('tab', { name: 'Events', exact: true })).toHaveAttribute('aria-selected', 'true')
  // Portfolio and listing filters must not erase themes before companies have been discovered.
  await page.evaluate(async () => { const { usePersonalScopeStore } = await import('/src/lib/personalScope.ts'); usePersonalScopeStore.getState().setScope('portfolio') })
  delay = true
  await page.getByRole('tab', { name: 'Themes', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Loading themes' })).toBeVisible()
  await expect.poll(() => !!release).toBe(true)
  release!(); delay = false
  await expect(page.getByRole('heading', { name: 'AI software security', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Bank lending demand', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What is happening and why now' })).toHaveCount(3)
  await expect(page.getByRole('heading', { name: 'Why it matters · Inference, not from filings' })).toHaveCount(3)
  await expect(page.getByText('Theme interpretation · Inference, not from filings', { exact: true })).toHaveCount(3)
  await expect(page.getByRole('link', { name: 'Software security demand expands 1' })).toHaveAttribute('href', 'https://example.test/tech/1')
  await expect(page.getByLabel('Hide Hong Kong listings')).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('themes-dark.png'), fullPage: true })
  const readsBeforeFilter = ideaReads
  await page.getByLabel('Theme sector').selectOption('Information Technology')
  await expect(page.getByRole('heading', { name: 'AI software security', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Bank lending demand', exact: true })).toHaveCount(0)
  await page.getByLabel('Theme sector').selectOption('Financials')
  await expect(page.getByRole('heading', { name: 'Bank lending demand', exact: true })).toBeVisible()
  await page.getByLabel('Theme sector').selectOption('Energy')
  await expect(page.getByText('No validated themes match Energy.', { exact: false })).toBeVisible()
  await page.getByLabel('Theme sector').selectOption('unclassified')
  await expect(page.getByRole('heading', { name: 'New research capacity', exact: true })).toBeVisible()
  expect(ideaReads).toBe(readsBeforeFilter)
  await page.getByLabel('Theme sector').selectOption('all')
  // Preserve the reader's card, focus and source disclosure when an earlier theme grows live.
  const bankReading = page.getByRole('article', { name: 'Bank lending demand', exact: true })
  const bankSources = bankReading.locator('summary')
  await bankSources.click()
  await expect(bankReading.locator('details')).not.toHaveAttribute('open', '')
  await bankSources.focus()
  const readingTop = (await bankReading.boundingBox())!.y
  const longerTechnology = response.themes.find((t) => t.theme_id === technology.theme_id)!
  longerTechnology.narrative!.why_now = 'Software security demand expands as businesses add automated systems and assess the controls those systems need. '.repeat(20)
  await page.evaluate(async (theme) => { const { useStore } = await import('/src/lib/store.ts'); useStore.getState()._handleNewsEvent({ type: 'theme-update', theme }) }, longerTechnology)
  await expect(page.getByText(longerTechnology.narrative!.why_now, { exact: true })).toBeVisible()
  expect(Math.abs((await bankReading.boundingBox())!.y - readingTop)).toBeLessThan(2)
  await expect(bankSources).toBeFocused()
  await expect(bankReading.locator('details')).not.toHaveAttribute('open', '')
  // Retire a theme during an older HTTP read. SSE must remove it immediately, and that response
  // or a buffered equal-revision update must never resurrect it, even when later polling fails.
  delay = true; release = undefined
  await page.getByRole('button', { name: 'Refresh themes', exact: true }).click()
  await expect.poll(() => !!release).toBe(true)
  const unknownSummary = response.themes.find((t) => t.theme_id === unknown.theme_id)!
  await page.evaluate(async (id) => { const { useStore } = await import('/src/lib/store.ts'); useStore.getState()._handleNewsEvent({ type: 'theme-remove', removal: { theme_id: id, reason: 'retired', merged_into: null, rev: 10 } }) }, unknown.theme_id)
  await expect(page.getByRole('heading', { name: 'New research capacity', exact: true })).toHaveCount(0)
  delay = false; release!()
  await expect(page.getByRole('button', { name: 'Refresh themes', exact: true })).toBeEnabled()
  await expect(page.getByRole('heading', { name: 'New research capacity', exact: true })).toHaveCount(0)
  await page.evaluate(async (theme) => { const { useStore } = await import('/src/lib/store.ts'); useStore.getState()._handleNewsEvent({ type: 'theme-update', theme }) }, unknownSummary)
  await expect(page.getByRole('heading', { name: 'New research capacity', exact: true })).toHaveCount(0)
  // Qualification can change at the same revision. An older response cannot erase that live truth.
  delay = true; release = undefined
  await page.getByRole('button', { name: 'Refresh themes', exact: true }).click()
  await expect.poll(() => !!release).toBe(true)
  const updatedBank = response.themes.find((t) => t.theme_id === bank.theme_id)!
  updatedBank.narrative!.thesis = 'Bank lending demand is changing the capacity banks need for new lending.'
  updatedBank.assessment.metrics.narrative_support_count = 8
  updatedBank.assessment.metrics.high_quality_evidence_count = 8
  updatedBank.assessment.metrics.unique_evidence_count = 8
  await page.evaluate(async (theme) => { const { useStore } = await import('/src/lib/store.ts'); useStore.getState()._handleNewsEvent({ type: 'theme-update', theme }) }, updatedBank)
  await expect(page.getByText(updatedBank.narrative!.thesis, { exact: true })).toBeVisible()
  await expect(page.getByText('Supporting source excerpt · 3 shown of 8 supporting reports', { exact: true })).toBeVisible()
  delay = false; release!()
  await expect(page.getByRole('button', { name: 'Refresh themes', exact: true })).toBeEnabled()
  await expect(page.getByText(updatedBank.narrative!.thesis, { exact: true })).toBeVisible()
  fail = true
  await page.getByRole('button', { name: 'Refresh themes', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Showing the last loaded themes.')
  await expect(page.getByRole('heading', { name: 'AI software security', exact: true })).toBeVisible()
  fail = false
  // Old/malformed narratives fail closed; explicit challenge sources stay visible.
  response.themes.find((t) => t.theme_id === technology.theme_id)!.narrative = null
  const bankSummary = response.themes.find((t) => t.theme_id === bank.theme_id)!
  bankSummary.evidence.push({ ...bankSummary.evidence[0], event_id: 'bank-challenge', headline: 'Bank credit losses challenge demand', stance: 'challenges', url: 'https://example.test/challenge' })
  bankSummary.activity = bankSummary.assessment.activity = 'challenged'
  bankSummary.assessment.metrics.recent_24h_challenge_count = 1
  bankSummary.assessment.metrics.unique_evidence_count = 9
  bankSummary.assessment.metrics.pending_revalidation = true
  bankSummary.conviction = bankSummary.assessment.conviction = 'watch'
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'AI software security', exact: true })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Bank credit losses challenge demand' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Evidence that challenges the theme' })).toBeVisible()
  await expect(page.getByText('New evidence awaiting revalidation', { exact: true })).toBeVisible()
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
  await page.screenshot({ path: testInfo.outputPath('themes-light.png'), fullPage: true })
  await page.evaluate(() => { const app = document.querySelector('.app') as HTMLElement; app.dataset.swarm = 'future'; app.style.setProperty('--swarm-color', '#8b5cf6') })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('themes-mobile-derived.png'), fullPage: true })
  await page.getByRole('tab', { name: 'Themes', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Events', exact: true })).toBeFocused()
  await expect(page.getByLabel('Hide Hong Kong listings')).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('tab', { name: 'Themes', exact: true })).toBeFocused()
  await expect(page.getByRole('heading', { name: 'Bank lending demand', exact: true })).toBeVisible()
  response = { ...response, themes: [], generated_at: now.toISOString() }
  await page.getByRole('button', { name: 'Refresh themes', exact: true }).click()
  await expect(page.getByText('No validated themes are available yet.', { exact: false })).toBeVisible()
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
  await expect(page.locator('.discovery-card')).toHaveCount(61)
  expect(Math.abs((await reading.boundingBox())!.y - before)).toBeLessThan(2)
  expect(await reading.evaluate((el) => el === (window as any).readingNode)).toBe(true)
  await expect(reading.locator('details')).toHaveAttribute('open', '')
  await expect(summary).toBeFocused()
  const boundary = await page.locator('.discovery-card').last().getAttribute('data-reading-key')
  cards.unshift(...Array.from({ length: 45 }, (_, index) => ({ ...liveCard(1000 + index), updated_at: new Date(Date.now() + 60_000 + index).toISOString() })))
  await page.clock.fastForward(30_100)
  // Only real arrivals extend the mounted window; API page padding must not ratchet it upward.
  await expect(page.locator('.discovery-card')).toHaveCount(106)
  await page.clock.fastForward(30_100)
  await expect(page.locator('.discovery-card')).toHaveCount(106)
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

test('automatic reconciliation is bounded when a loaded card disappears', async ({ page, context }) => {
  const cards = Array.from({ length: 500 }, (_, i) => liveCard(i + 1))
  let reads = 0
  await context.route('**/api/screener/board', (route) => route.fulfill({ json: { signals: [], live: [], ideas: [], resumable: [], counts: {} } }))
  await context.route('**/api/screener/idea-workspace?*', (route) => {
    reads++
    const q = new URL(route.request().url()).searchParams
    return route.fulfill({ json: discoveryPage(cards, q.get('lane') as IdeaLane, [], 'all', Number(q.get('cursor'))) })
  })
  await page.clock.install()
  await page.goto('/e2e/ideas.html')
  await expect(page.locator('.discovery-card')).toHaveCount(30)
  const reading = page.locator('.discovery-card').filter({ has: page.getByText('Developing event 20', { exact: true }) })
  await reading.scrollIntoViewIfNeeded()
  const before = (await reading.boundingBox())!.y
  const beforeReads = reads
  cards.splice(2, 1)
  await page.clock.fastForward(30_100)
  await expect(page.getByRole('alert')).toContainText('Showing the last loaded cards.')
  expect(reads - beforeReads).toBe(5)
  await expect(page.locator('.discovery-card')).toHaveCount(30)
  expect(Math.abs((await reading.boundingBox())!.y - before)).toBeLessThan(2)
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByText('Developing event 3', { exact: true })).toHaveCount(0)
  await expect(page.locator('.discovery-card')).toHaveCount(30)
  // The last fetched page may contain unread padding; it must remain available to Show more.
  await page.getByRole('button', { name: 'Show more', exact: true }).click()
  await expect(page.locator('.discovery-card')).toHaveCount(60)
})

test('sparse portfolio views retain their raw pagination depth for quiet background checks', async ({ page, context }) => {
  const now = new Date().toISOString()
  const cards = Array.from({ length: 300 }, (_, i) => discoveryIdea({ idea_id: `IDEA-CO${i}`, idea_version: String(i), idea_version_started_at: now,
    ticker: `CO${i}`, exchange: 'NYSE', company: `Company ${i}`, direction: 'long', pair_with: null, reason: `Company ${i} development`, why_now: 'A new disclosure is available.',
    source_event_ids: [`EVT-${i}`], source_headlines: ['New disclosure'], source_name: 'Fixture filing', source_url: 'https://example.test/filing',
    updated_at: now, newest_source_at: now, surfaced_at: now, decay_at: new Date(Date.now() + 86_400_000).toISOString(), status: 'live',
    trade_score: 50, conviction: 50, trade_score_basis: 'evidence_gate_v2', missing_checks: [], prior_coverage: null, thesis_type: 'company_specific',
  }))
  await context.route('**/api/screener/board', (route) => route.fulfill({ json: { signals: [], live: [], ideas: [], resumable: [], counts: {} } }))
  await context.route('**/api/screener/idea-workspace?*', (route) => {
    const q = new URL(route.request().url()).searchParams
    return route.fulfill({ json: discoveryPage(cards, q.get('lane') as IdeaLane, [], 'all', Number(q.get('cursor'))) })
  })
  await page.clock.install()
  await page.goto('/e2e/ideas.html')
  await page.evaluate(async () => {
    const { usePersonalScopeStore } = await import('/src/lib/personalScope.ts')
    usePersonalScopeStore.setState({ portfolio: { members: [{ ticker: 'CO299', name: 'Company 299', listingCountry: 'US' }], status: 'ready', error: null, asOf: null, unresolved: 0 } })
    usePersonalScopeStore.getState().setScope('portfolio')
  })
  await page.getByRole('tab', { name: 'Long', exact: true }).click()
  await expect(page.locator('.discovery-card')).toHaveCount(1)
  await expect(page.getByText('Company 299 development', { exact: true })).toBeVisible()
  await page.clock.fastForward(30_100)
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.locator('.discovery-card')).toHaveCount(1)
  // Membership publication is also an automatic refresh of this same view.
  await page.evaluate(async () => {
    const { usePersonalScopeStore } = await import('/src/lib/personalScope.ts')
    const prior = usePersonalScopeStore.getState().portfolio
    usePersonalScopeStore.setState({ portfolio: { ...prior, members: [...prior.members] } })
  })
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.locator('.discovery-card')).toHaveCount(1)
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
