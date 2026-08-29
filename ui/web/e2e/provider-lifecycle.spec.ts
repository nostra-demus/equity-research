import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { REQUIRED_FILES } from './fixtures/fixture-contract.mjs'

type Provider = 'claude' | 'codex'

interface FixtureState {
  provider: Provider
  updating: boolean
  pending: unknown[]
  resumable: { runRoot: string }[]
  spawnCount: number
  launchPosts: number
  continuationPosts: number
  normalizedEventTypes: string[]
  sourceRunRoot: string
  targetRunRoot: string
  partialHashBefore: string | null
  partialHashAfter: string | null
  artifacts: Record<string, boolean>
  provenance: { provider?: string; profileKey?: string } | null
}

async function reset(request: APIRequestContext, provider: Provider): Promise<void> {
  const response = await request.post('http://127.0.0.1:8899/api/e2e/reset', { data: { provider } })
  expect(response.ok()).toBeTruthy()
}

async function state(request: APIRequestContext): Promise<FixtureState> {
  return request.get('http://127.0.0.1:8899/api/e2e/state').then((response) => response.json())
}

async function waitForState(
  request: APIRequestContext,
  predicate: (value: FixtureState) => boolean,
): Promise<FixtureState> {
  let last = await state(request)
  await expect.poll(async () => {
    last = await state(request)
    return predicate(last)
  }).toBe(true)
  return last
}

async function reloadReady(page: Page): Promise<void> {
  await page.reload()
  await expect(page.getByTestId('lifecycle-harness')).toHaveAttribute('data-ready', 'yes')
}

test.describe.configure({ mode: 'serial' })

for (const provider of ['claude', 'codex'] as const) {
  test(`${provider} has the same exact-root queued interruption and continuation lifecycle`, async ({ page, request }) => {
    await reset(request, provider)
    await page.goto(`/e2e/lifecycle.html?provider=${provider}`)
    await expect(page.getByTestId('lifecycle-harness')).toHaveAttribute('data-ready', 'yes')

    await page.getByTestId('run-full').click()
    const launchDialog = page.locator('.modal').filter({ hasText: 'Run the full pipeline on KAR' })
    await expect(launchDialog).toBeVisible()
    await expect(page.getByRole('radio', { name: provider === 'claude' ? 'Claude' : 'Codex' })).toHaveAttribute('aria-checked', 'true')
    if (provider === 'codex') {
      await expect(launchDialog).toContainText('Allowance impact')
      await expect(launchDialog).not.toContainText('$')
    }
    await page.getByPlaceholder('KAR').fill('KAR')
    await page.getByRole('button', { name: 'Queue full run' }).click()

    await expect(page.getByText('Waiting for update').first()).toBeVisible()
    let fixture = await waitForState(request, (value) => value.pending.length === 1)
    expect(fixture.spawnCount).toBe(0)
    expect(fixture.launchPosts).toBe(1)
    expect(fixture.continuationPosts).toBe(0)

    // The durable request is server truth: a browser refresh cannot lose it or invent an active run.
    await reloadReady(page)
    await expect(page.getByText('Waiting for update').first()).toBeVisible()
    fixture = await state(request)
    expect(fixture.spawnCount).toBe(0)
    expect(fixture.pending).toHaveLength(1)

    const deployed = await request.post('http://127.0.0.1:8899/api/e2e/deploy')
    expect(deployed.ok()).toBeTruthy()
    fixture = await waitForState(request, (value) => value.spawnCount === 1 && value.resumable.length === 1)
    expect(fixture.sourceRunRoot).toBe('analyses/KAR_2026-08-28')
    expect(fixture.targetRunRoot).toBe(fixture.sourceRunRoot)
    expect(fixture.partialHashBefore).toMatch(/^sha256:[a-f0-9]{64}$/)
    expect(fixture.normalizedEventTypes).toEqual(expect.arrayContaining(['session', 'tool-use', 'result']))

    // Activity and Continue survive reconnect and target yesterday's exact saved root.
    await reloadReady(page)
    const completeRun = page.getByRole('button').filter({ hasText: 'Complete run' })
    await expect(completeRun).toBeVisible()
    await completeRun.click()
    await expect(page.getByRole('dialog')).toContainText('Continue saved work')
    await expect(page.getByRole('dialog')).toContainText('Completed work stays intact; only the unfinished work runs.')
    await expect(page.getByRole('dialog')).toContainText(provider === 'claude' ? 'Opus' : 'Sol + Terra')
    await page.getByRole('button', { name: 'Complete remaining work' }).click()

    fixture = await waitForState(request, (value) => value.spawnCount === 2 && value.continuationPosts === 1)
    expect(fixture.launchPosts).toBe(1) // Continue never fell back to generic /api/launch.
    expect(fixture.pending).toHaveLength(0)
    expect(fixture.resumable).toHaveLength(0)
    expect(fixture.partialHashAfter).toBe(fixture.partialHashBefore)
    for (const required of REQUIRED_FILES) expect(fixture.artifacts[required], required).toBe(true)
    expect(fixture.provenance).toMatchObject({ provider })
    expect(fixture.provenance?.profileKey).toContain(provider === 'claude' ? 'claude:opus' : 'codex|gpt-5.6-sol')
    expect(fixture.normalizedEventTypes.filter((type) => type === 'session')).toHaveLength(2)
    expect(fixture.normalizedEventTypes.filter((type) => type === 'result')).toHaveLength(2)

    await reloadReady(page)
    await expect(page.locator('.apill').filter({ hasText: 'done' }).first()).toBeVisible()
  })
}
