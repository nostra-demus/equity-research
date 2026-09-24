import { expect, test, type Locator, type Page } from '@playwright/test'

async function openPanels(page: Page) {
  await page.evaluate(async () => {
    const { useStore } = await import('/src/lib/store.ts')
    useStore.setState({
      openOutput: { title: 'Investment Thesis — Demonstration Company', nodeKey: 'master/synthesizer', verdict: 'Watchlist',
        body: '# Investment thesis\n\n' + Array.from({ length: 24 }, (_, i) => `## Evidence ${i + 1}\n\nA long report remains readable while discussing its assumptions.\n\n`).join('')
          + '| Scenario | Source | Comparable | Assumption | Outcome |\n|---|---|---|---|---|\n| Base | ' + 'long_source_reference_'.repeat(30) + ' | Prior period | Documented | Watch |\n\nEnd of report.' },
      chatOpen: true, chatTitle: 'Demonstration Company — Investment thesis', chatScope: 'run',
      chatMessages: [{ role: 'user', content: 'Why does this scenario show a negative return?' },
        { role: 'assistant', content: 'The assumptions imply a lower valuation. Review the base and bear scenarios alongside the report.' }],
      activityOpen: true,
    })
  })
}

async function within(page: Page, locator: Locator) {
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.y).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1)
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1)
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) => {
    const url = route.request().url()
    if (url.includes('/chat/models')) return route.fulfill({ json: { models: ['sonnet'] } })
    if (url.includes('/activity')) return route.fulfill({ json: { rows: [], users: [], tickers: [], total: 0, allTime: 0 } })
    return route.fulfill({ status: 503, json: { error: 'Fixture: service unavailable' } })
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/e2e/workspace.html')
  await expect(page.locator('.topbar')).toBeVisible()
})

test('report and chat tile beneath navigation; toolbars, menus and scrolling stay inside their panes', async ({ page }, info) => {
  for (const width of [1440, 1920, 2560, 1040]) {
    await page.setViewportSize({ width, height: 900 })
    await openPanels(page)
    const reader = page.getByRole('region', { name: 'Report', exact: true })
    const chat = page.getByRole('complementary', { name: 'Chat with your data' })
    await expect(reader).toBeVisible()
    await expect(chat).toBeVisible()
    // Wait for the real entrance animation before measuring the settled pane boundaries.
    await reader.getByRole('button', { name: 'Close report', exact: true }).click({ trial: true })
    await chat.getByRole('button', { name: 'Close chat', exact: true }).click({ trial: true })
    await within(page, reader)
    await within(page, chat)
    const top = (await page.locator('.topbar').boundingBox())!
    const rb = (await reader.boundingBox())!
    const cb = (await chat.boundingBox())!
    expect(rb.y).toBeGreaterThanOrEqual(top.y + top.height)
    expect(rb.x + rb.width).toBeLessThanOrEqual(cb.x + 1)
    for (const button of await page.locator('.reader__head button, .chatpanel__head button').all()) await within(page, button)
    for (const label of ['Auto sources', 'Scope', 'Sonnet', 'Simple']) {
      await chat.getByRole('button', { name: new RegExp(label) }).click()
      await within(page, chat.locator('.dlmenu'))
      await page.keyboard.press('Escape')
      await expect(chat).toBeVisible()
      await expect(reader).toBeVisible()
    }
    await chat.locator('textarea').fill('Keep this draft while I read')
    await reader.locator('.reader__body').evaluate((el) => { el.scrollTop = el.scrollHeight })
    await expect(reader.getByText('End of report.')).toBeInViewport()
    expect(await reader.locator('.reader__body').evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
    await within(page, chat.locator('.chatpanel__input'))
    await reader.locator('.reader__body').evaluate((el) => { el.scrollTop = 0 })
    await page.screenshot({ path: info.outputPath(`panels-${width}.png`) })
  }
})

test('compact panes preserve drafts and scroll, reopening Ask reveals chat, Escape closes only the visible pane', async ({ page }, info) => {
  await page.setViewportSize({ width: 820, height: 740 })
  await openPanels(page)
  const nav = page.getByRole('navigation', { name: 'Workspace panels' })
  const chat = page.getByRole('complementary', { name: 'Chat with your data' })
  const reader = page.getByRole('region', { name: 'Report', exact: true })
  await expect(chat).toBeVisible()
  await expect(nav.getByRole('button', { name: 'Chat', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(reader).toBeHidden()
  await chat.locator('textarea').fill('Saved draft')
  await nav.getByRole('button', { name: 'Report', exact: true }).click()
  await expect(chat).toBeHidden()
  await reader.locator('.reader__body').evaluate((el) => { el.scrollTop = 500 })
  await nav.getByRole('button', { name: 'Workspace', exact: true }).click()
  await expect(page.locator('#workspace-workspace')).toBeVisible()
  await nav.getByRole('button', { name: 'Activity', exact: true }).click()
  await within(page, page.locator('.adock'))
  await nav.getByRole('button', { name: 'Report', exact: true }).click()
  expect(await reader.locator('.reader__body').evaluate((el) => el.scrollTop)).toBe(500)
  await page.evaluate(async () => { const { useStore } = await import('/src/lib/store.ts'); useStore.getState().openChat('run') })
  await expect(chat).toBeVisible()
  await expect(chat.locator('textarea')).toHaveValue('Saved draft')
  await expect(nav.getByRole('button', { name: 'Chat', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.screenshot({ path: info.outputPath('compact-chat.png') })
  await page.keyboard.press('Escape')
  await expect(chat).toHaveCount(0)
  await expect(reader).toBeVisible()
  await expect(nav.getByRole('button', { name: 'Activity' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(reader).toHaveCount(0)
})

test('navigation can open another tool then bring its document forward without covering either header', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openPanels(page)
  await page.evaluate(async () => { const { useStore } = await import('/src/lib/store.ts'); useStore.getState().openDataLibrary() })
  await expect(page.locator('.datalib')).toBeVisible()
  const close = page.locator('.datalib').getByTitle('Close', { exact: true })
  await expect(close).toBeInViewport()
  await close.click({ trial: true })
  await page.evaluate(async () => { const { useStore } = await import('/src/lib/store.ts'); useStore.getState().openInlineDoc('Document from a tool', 'The document opens in the shared reader.') })
  await expect(page.getByRole('region', { name: 'Report', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Close report', exact: true }).click({ trial: true })
  await page.evaluate(async () => { const { useStore } = await import('/src/lib/store.ts'); useStore.getState().openMemory() })
  const memory = (await page.locator('.pipeline.memory').boundingBox())!
  const top = (await page.locator('.topbar').boundingBox())!
  expect(memory.y).toBeGreaterThanOrEqual(top.y + top.height)
})

test('shared shell uses the same bounded panels in light and derived swarm themes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  for (const swarm of ['research', 'commodity', 'screener']) {
    await page.evaluate(async (activeSwarm) => {
      const { useStore } = await import('/src/lib/store.ts')
      useStore.setState({ activeSwarm, scInit: async () => {}, scEnsureNewsStream: async () => {} })
      document.documentElement.dataset.theme = 'light'
    }, swarm)
    await openPanels(page)
    await within(page, page.locator('.reader'))
    await within(page, page.locator('.chatpanel'))
  }
})

test('a reply completed in a hidden chat remains at the newest answer when returning', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 740 })
  await openPanels(page)
  const nav = page.getByRole('navigation', { name: 'Workspace panels' })
  await nav.getByRole('button', { name: 'Workspace', exact: true }).click()
  await page.evaluate(async () => {
    const { useStore } = await import('/src/lib/store.ts')
    useStore.setState({ chatMessages: [...useStore.getState().chatMessages,
      { role: 'assistant', content: 'A detailed explanation.\n\n'.repeat(80) + 'Newest answer ends here.' }] })
  })
  await nav.getByRole('button', { name: 'Chat', exact: true }).click()
  await expect(page.getByText('Newest answer ends here.', { exact: true })).toBeInViewport()
})

test('new admission attention reveals Activity once, while subsequent polling preserves the selected view', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 740 })
  await openPanels(page)
  await page.route('**/api/pending-admissions', (route) => route.fulfill({ json: { requests: [{
    requestId: 'layout-admission', user: 'fixture', userVia: 'local', ticker: 'DEMO', action: 'full',
    provider: 'claude', status: 'needs_attention', attention: 'Review the refreshed plan.',
    createdAt: '2026-09-24T10:00:00Z', updatedAt: '2026-09-24T10:00:00Z',
  }] } }))
  await page.evaluate(async () => { const { useStore } = await import('/src/lib/store.ts'); await useStore.getState().refreshPendingAdmissions() })
  await expect(page.locator('.adock')).toBeVisible()
  await within(page, page.locator('.adock'))
  await page.getByRole('navigation', { name: 'Workspace panels' }).getByRole('button', { name: 'Report', exact: true }).click()
  await page.evaluate(async () => { const { useStore } = await import('/src/lib/store.ts'); await useStore.getState().refreshPendingAdmissions() })
  await expect(page.getByRole('region', { name: 'Report', exact: true })).toBeVisible()
  await expect(page.locator('.adock')).toBeHidden()
})
