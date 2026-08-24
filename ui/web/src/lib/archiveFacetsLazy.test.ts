// Archive facets are intentionally demand-loaded: the rail's mount-time empty search must stay cheap,
// while clearing a filter must restore the full facet universe. Run: npx tsx src/lib/archiveFacetsLazy.test.ts
import assert from 'node:assert/strict'

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
let facetCalls = 0
api.newsFacets = async () => {
  facetCalls++
  return {
    themes: [], countries: [], regions: [], sectors: [], subSectors: [], sources: [], companies: [],
    total: 0, builtThroughDate: null, builtAt: '2099-01-01T00:00:00.000Z',
  }
}

try {
  useStore.setState({ scArchiveQuery: {}, scFacets: null, scFacetsLoading: false })
  await useStore.getState().scRunArchiveSearch({})
  await Promise.resolve()
  assert.equal(facetCalls, 0, 'the mount-time empty search must not scan facets')

  useStore.setState({ scArchiveQuery: { text: 'amazon' } })
  await useStore.getState().scRunArchiveSearch({})
  await Promise.resolve()
  assert.equal(facetCalls, 1, 'clearing a used filter must restore full-archive facets')
  console.log('\narchiveFacetsLazy.test.ts: 2 passed')
} finally {
  api.newsFacets = originalNewsFacets
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
}
