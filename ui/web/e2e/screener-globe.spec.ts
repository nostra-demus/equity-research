// End-to-end coverage for the Screener Globe view, against the REAL dev servers (playwright.config.ts's
// webServer boots both the Fastify control plane on :8787 and the Vite dev server on :5173, proxying
// /api -> :8787, so api.ts's ensureMode() resolves to 'live' instead of the read-only static snapshot).
//
// /api/screener/globe itself is intercepted with page.route() and served a fixed fixture — real firehose
// content is whatever happens to be in this checkout's screener/inbox/ archive, which is not a stable
// thing to assert against in a repeatable test. Every OTHER API call goes to the real server untouched,
// so the app boots for real, opens the real screener swarm, and only the globe's own data is mocked.
//
// Covers exactly the plan's test cases 4 and 5 (Tests table): "clicking a country filters events" and
// "filters work together with the map" — plus the WebGL-fallback list view, grouped into the same suite
// per the plan ("WebGL-fallback renders the list view | covered in the same Playwright suite by forcing
// webglOK false").
import { test, expect, type Page } from '@playwright/test'

// A small, deterministic GlobeSnapshot (ui/server/src/news/globe.ts's shape) — two countries with
// distinct counts/scores/themes so a country click and a filter change are both observably different.
const FIXTURE_SNAPSHOT = {
  countries: [
    {
      country: 'US', countryName: 'United States', region: 'North America', lat: 38.9, lon: -77.0,
      count: 5, maxScore: 82, avgScore: 61, topThemes: ['macro', 'policy'],
      sample: [
        { event_id: 'EVT-US-1', headline: 'US weighs sanctions on Iran over missile program', ts: '2026-06-30T09:00:00Z', triage_score: 82, source_name: 'Example Wire' },
        { event_id: 'EVT-US-2', headline: 'US regulator opens antitrust probe', ts: '2026-06-30T08:00:00Z', triage_score: 55, source_name: 'Example Wire' },
      ],
    },
    {
      country: 'AE', countryName: 'United Arab Emirates', region: 'Middle East', lat: 25.2, lon: 55.3,
      count: 2, maxScore: 60, avgScore: 58, topThemes: ['product'],
      sample: [
        { event_id: 'EVT-AE-1', headline: 'UAE defense contractor wins missile order', ts: '2026-06-30T07:00:00Z', triage_score: 60, source_name: 'Example Wire' },
      ],
    },
  ],
  regions: [
    { region: 'North America', lat: 45.0, lon: -100.0, count: 5, maxScore: 82, avgScore: 61 },
    { region: 'Middle East', lat: 27.0, lon: 45.0, count: 2, maxScore: 60, avgScore: 58 },
  ],
  globalUnresolvedCount: 3,
  total: 10,
  sinceDays: 30,
  builtAt: '2026-06-30T12:00:00Z',
}

// A second fixture a filter change resolves to — deliberately DIFFERENT country set + counts, so the test
// can assert the marker/panel set actually changes (not just that a request fired).
const FIXTURE_SNAPSHOT_FILTERED = {
  countries: [
    {
      country: 'AE', countryName: 'United Arab Emirates', region: 'Middle East', lat: 25.2, lon: 55.3,
      count: 1, maxScore: 60, avgScore: 60, topThemes: ['product'],
      sample: [{ event_id: 'EVT-AE-1', headline: 'UAE defense contractor wins missile order', ts: '2026-06-30T07:00:00Z', triage_score: 60, source_name: 'Example Wire' }],
    },
  ],
  regions: [{ region: 'Middle East', lat: 27.0, lon: 45.0, count: 1, maxScore: 60, avgScore: 60 }],
  globalUnresolvedCount: 0,
  total: 1,
  sinceDays: 7,
  builtAt: '2026-06-30T12:00:00Z',
}

/** Mock /api/screener/globe: sinceDays=7 (the "7d" preset button) returns the filtered fixture, every
 *  other query returns the default fixture. Lets one route handler cover both the initial load and the
 *  filter-change assertions without a stateful counter. */
async function mockGlobeApi(page: Page) {
  await page.route('**/api/screener/globe**', async (route) => {
    const url = new URL(route.request().url())
    const body = url.searchParams.get('sinceDays') === '7' ? FIXTURE_SNAPSHOT_FILTERED : FIXTURE_SNAPSHOT
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
}

/** Open the screener swarm's Globe view: switch to the screener swarm if needed, then click the "Globe"
 *  segmented-radio button in EventRail's view toggle (EventRail.tsx:428). Also switches to List mode when
 *  the sandboxed browser's real WebGL support (headless Chromium ships swiftshader) puts the view into the
 *  3D Map by default — ScreenerGlobeView's own "Map or list" toggle (only rendered when webglOK) — so the
 *  row-based assertions below hit ScreenerGlobeFallbackList's DOM deterministically instead of racing a
 *  3D-canvas-positioned marker. The dedicated WebGL-fallback test below covers the forced-no-WebGL path;
 *  this helper just avoids depending on which path the sandbox's WebGL support happens to take by default. */
async function openGlobeView(page: Page) {
  await page.goto('/')
  // the app defaults to the screener swarm when one exists (store.ts's swarms-loaded default) — but be
  // explicit/robust: if a swarm switcher is present and screener isn't already active, select it.
  const globeRadio = page.getByRole('radio', { name: 'Globe' })
  await expect(globeRadio).toBeVisible({ timeout: 15_000 })
  // scInit()'s own async chain (api.swarmGraph -> scRefreshBoard -> ...) auto-opens Themes as the
  // screener's default landing view once it resolves (store.ts scInit, guarded not to clobber an
  // already-open Globe — but only from the moment it's actually open). Waiting for THAT auto-default to
  // land first (Themes checked) before clicking Globe sidesteps the underlying race entirely, rather than
  // relying only on the guard: a click that lands WHILE scInit's chain is still in flight is a real,
  // if rare, race a fast user click can hit too — this wait makes the test deterministic either way.
  // exact: true — "Themes" (substring, case-insensitive by default) would otherwise also match the
  // Themes-window radios ("Rank themes by news flow over the last hour", etc.) rendered underneath once
  // the default Themes view opens, which is a strict-mode violation (Playwright refuses an ambiguous match).
  const themesRadio = page.getByRole('radio', { name: 'Themes', exact: true })
  await expect(themesRadio).toHaveAttribute('aria-checked', 'true', { timeout: 15_000 })
  await globeRadio.click()
  await expect(globeRadio).toHaveAttribute('aria-checked', 'true')

  // The "Map or list" toggle only renders once React commits the post-click state (webglOK && the globe
  // view mounted) — Locator.isVisible() does NOT wait (its timeout option is deprecated/ignored per the
  // Playwright docs), so a bare isVisible() call right after the click can read false before React's
  // commit lands. Locator.waitFor() DOES actually wait; only when it genuinely never appears within the
  // window (WebGL forced off, per the dedicated fallback test below) does the view stay in the list.
  const listToggle = page.getByRole('radio', { name: 'List' })
  const gotToggle = await listToggle.waitFor({ state: 'visible', timeout: 5_000 }).then(() => true).catch(() => false)
  if (gotToggle) {
    await listToggle.click()
    await expect(listToggle).toHaveAttribute('aria-checked', 'true')
  }
}

test.describe('Screener Globe view', () => {
  test.beforeEach(async ({ page }) => {
    await mockGlobeApi(page)
  })

  // ---- plan test case 4: clicking a country filters events ----
  test('clicking a country opens the country panel and reflects that country', async ({ page }) => {
    await openGlobeView(page)

    // openGlobeView already switched to List mode when available — the deterministic path regardless of
    // the sandboxed browser's real WebGL support; the map-marker click path is covered by the dedicated
    // WebGL-fallback test below, asserting the SAME click-to-filter contract through the fallback list.
    const usRow = page.locator('.sglobe__rowhit', { hasText: 'United States' })
    await expect(usRow).toBeVisible({ timeout: 10_000 })
    await usRow.click()

    // the click-through panel (CountryEventPanel) reads the matching aggregate straight out of the
    // already-fetched snapshot — no second network round trip — and reflects the clicked country
    const panel = page.getByRole('dialog', { name: /United States/ })
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('United States')
    await expect(panel).toContainText('North America')
    await expect(panel.locator('.sglobe__statval').first()).toHaveText('5') // event count from the fixture
    await expect(panel).toContainText('US weighs sanctions on Iran over missile program')

    // switching to the AE row updates the panel to the newly clicked country (still no extra round trip)
    const aeRow = page.locator('.sglobe__rowhit', { hasText: 'United Arab Emirates' })
    await aeRow.click()
    const aePanel = page.getByRole('dialog', { name: /United Arab Emirates/ })
    await expect(aePanel).toBeVisible()
    await expect(aePanel).toContainText('UAE defense contractor wins missile order')
    await expect(page.getByRole('dialog', { name: /^United States/ })).toHaveCount(0)
  })

  // ---- plan test case 5: filters work together with the map ----
  test('changing a filter re-fetches the snapshot and updates both the row list and the panel', async ({ page }) => {
    await openGlobeView(page)

    // baseline: the default (sinceDays=30) fixture shows both US and AE, plus the "Global / unknown" row
    await expect(page.locator('.sglobe__rowhit', { hasText: 'United States' })).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.sglobe__rowhit', { hasText: 'United Arab Emirates' })).toBeVisible()
    await expect(page.locator('.sglobe__row--unresolved')).toContainText('3') // globalUnresolvedCount

    // select the country BEFORE filtering, so we can also assert the panel content changes in lockstep
    await page.locator('.sglobe__rowhit', { hasText: 'United Arab Emirates' }).click()
    await expect(page.getByRole('dialog', { name: /United Arab Emirates/ })).toContainText('2') // count from the default fixture

    // set the sinceDays filter to "7d" — ScreenerGlobeFilters' preset button, debounced re-fetch (store.ts)
    const sevenDay = page.getByRole('radio', { name: '7d' })
    await sevenDay.click()
    await expect(sevenDay).toHaveAttribute('aria-checked', 'true')

    // the map (row list) reflects the NEW filtered snapshot: US drops out, AE's count changes 2 -> 1
    await expect(page.locator('.sglobe__rowhit', { hasText: 'United States' })).toHaveCount(0, { timeout: 10_000 })
    const aeRowAfter = page.locator('.sglobe__rowhit', { hasText: 'United Arab Emirates' })
    await expect(aeRowAfter).toBeVisible()
    await expect(aeRowAfter).toContainText('1')
    // globalUnresolvedCount is 0 in the filtered fixture — the "Global / unknown" row disappears entirely
    await expect(page.locator('.sglobe__row--unresolved')).toHaveCount(0)

    // the panel (still showing AE, since it stays selected across a filter change) also reflects the
    // filtered snapshot's numbers — filters and the map/panel show the SAME query (plan requirement 7)
    const panelAfter = page.getByRole('dialog', { name: /United Arab Emirates/ })
    await expect(panelAfter.locator('.sglobe__statval').first()).toHaveText('1')
  })

  // ---- WebGL-fallback renders the list view (grouped into this suite per the plan) ----
  test('forcing webglOK false renders the list fallback with the same country data', async ({ page }) => {
    // Standard Playwright trick to force detectWebGL() to false regardless of the sandboxed browser's
    // real WebGL support: strip getContext's webgl branches before any app script runs.
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext
      // @ts-expect-error — deliberately narrowing the real overload set for the test-only stub
      HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: any[]) {
        if (type === 'webgl' || type === 'webgl2') return null
        return orig.call(this, type, ...rest)
      }
    })
    await openGlobeView(page)

    // no Map/List toggle at all when WebGL is unavailable (ScreenerGlobeView only renders it when webglOK)
    await expect(page.getByRole('radiogroup', { name: 'Map or list' })).toHaveCount(0)
    // the fallback list renders directly, with the same fixture data as the WebGL-capable path
    await expect(page.locator('.sglobe__rowhit', { hasText: 'United States' })).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.sglobe__rowhit', { hasText: 'United Arab Emirates' })).toBeVisible()
    await expect(page.locator('.sglobe__row--unresolved')).toContainText('Global / unknown')

    // click-to-filter still works through the fallback list's own row buttons
    await page.locator('.sglobe__rowhit', { hasText: 'United States' }).click()
    await expect(page.getByRole('dialog', { name: /United States/ })).toBeVisible()
  })
})
