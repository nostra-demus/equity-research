// Archive facets are preloaded from the server's off-thread warm index so native geography selects have
// their options before the first click. Intent handlers remain as retries, while an empty archive search
// itself stays cheap. Run: npx tsx src/lib/archiveFacetsLazy.test.ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const previousWindow = (globalThis as any).window
const previousDocument = (globalThis as any).document
;(globalThis as any).window = {
  __ENGINE_LIVE__: true,
  WebGLRenderingContext: undefined,
  addEventListener: () => {},
  matchMedia: () => ({ matches: true }),
}
;(globalThis as any).document = {
  hidden: false,
  addEventListener: () => {},
  createElement: () => ({ getContext: () => null }),
}

const { api } = await import('./api')
const { useStore } = await import('./store')
const originalNewsFacets = api.newsFacets
const originalNewsSearch = api.newsSearch
let facetCalls = 0
api.newsFacets = async () => {
  facetCalls++
  return {
    themes: [], countries: [], regions: [], sectors: [], subSectors: [], sources: [], companies: [],
    total: 0, builtThroughDate: null, builtAt: '2099-01-01T00:00:00.000Z',
  }
}

try {
  const railSource = readFileSync(fileURLToPath(new URL('../components/screener/EventRail.tsx', import.meta.url)), 'utf8')
  assert.match(railSource, /useEffect\(\(\) => \{ void loadFacets\(\{\}\) \}, \[loadFacets\]\)/, 'the rail preloads the warm facet snapshot once before a native select opens')
  assert.equal((railSource.match(/onFocusCapture=\{ensureFacets\}/g) || []).length, 2, 'keyboard focus must demand-load both primary facet controls')
  assert.equal((railSource.match(/onPointerDown=\{ensureFacets\}/g) || []).length, 2, 'pointer use must demand-load both primary facet controls')
  assert.equal((railSource.match(/onClick=\{ensureFacets\}/g) || []).length, 2, 'keyboard activation must retry both primary facet controls')
  assert.doesNotMatch(railSource, /if \(n\) ensureFacets\(\)/, 'opening static secondary Filters must not start a redundant facet scan')
  assert.match(railSource, /onTextIntent=\{ensureFacets\}/, 'using the keyword input must demand-load ticker-to-company facets')
  assert.match(railSource, /facetsLoading && !facets \? 'loading countries…'/, 'a background recount must keep the existing country selection visible')

  const filterSource = readFileSync(fileURLToPath(new URL('../components/screener/FeedFilters.tsx', import.meta.url)), 'utf8')
  assert.match(filterSource, /onFocus=\{onTextIntent\}/, 'keyboard entry into the keyword input must signal filter intent')
  assert.match(filterSource, /onChange=\{\(e\) => \{ onTextIntent\?\.\(\); set\(\{ text: e\.target\.value \}\) \}\}/, 'typing must signal intent even when focus was set programmatically')

  useStore.setState({ scArchiveQuery: {}, scFacets: null, scFacetsLoading: false })
  await useStore.getState().scRunArchiveSearch({})
  await Promise.resolve()
  assert.equal(facetCalls, 0, 'the mount-time empty search must not scan facets')

  useStore.setState({ scArchiveQuery: { text: 'amazon' } })
  await useStore.getState().scRunArchiveSearch({})
  await Promise.resolve()
  assert.equal(facetCalls, 1, 'clearing a used filter must restore full-archive facets')

  let finishSearch: ((value: Awaited<ReturnType<typeof api.newsSearch>>) => void) | undefined
  api.newsSearch = async () => new Promise((resolve) => { finishSearch = resolve })
  facetCalls = 0
  const activeSearch = useStore.getState().scRunArchiveSearch({ geoRegion: 'Asia' })
  await Promise.resolve()
  assert.equal(facetCalls, 0, 'a full-archive recount must not compete with the first history result page')
  assert.ok(finishSearch, 'the history search must start immediately')
  finishSearch({ items: [], nextCursor: null, scannedThroughDate: '2099-01-01', exhausted: true })
  await activeSearch
  assert.equal(facetCalls, 1, 'context counts refresh after the first history result page settles')
  console.log('\narchiveFacetsLazy.test.ts: 14 passed')
} finally {
  api.newsFacets = originalNewsFacets
  api.newsSearch = originalNewsSearch
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
}
