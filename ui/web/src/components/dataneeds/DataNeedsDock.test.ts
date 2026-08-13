import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { DataNeed } from '../../lib/types'

const { DataNeedsPanel, NeedCard } = await import('./DataNeedsDockView')

const v2Need: DataNeed = {
  need_id: 'unit-growth',
  series: 'Monthly unit growth by segment',
  why_it_caps: 'The blended total cannot show which segment is changing the call.',
  cap_lifted: 'High conviction', // legacy promise: deliberately never rendered
  priority: 1,
  expected_impact: {
    if_supportive: 'Raises the base-case volume path.',
    if_adverse: 'Cuts the base-case volume path.',
  },
  entry_orbs: [{ module: 'demand', agent: 'segment-reader', why: 'Owns the unit bridge', confidence: 0.8 }],
  filing_required: false,
  entry_modules: ['demand'],
  suggested_source: { name: 'Example authority', acquisition: 'official_api', access: 'public', licensing_basis: 'Open endpoint' },
  tier: 5,
  cadence: 'monthly',
  source_lookup: {
    lookup_status: 'public_link_found',
    public_url: 'https://data.example.test/series',
    checked_at: '2026-08-13T10:00:00.000Z',
    lookup_note: 'Exact public series.',
    stale: false,
    access_basis: 'https_url_public_dns',
  },
}

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

const renderNeed = (need: DataNeed, search?: { status: 'searching' } | { status: 'error'; message: string }) =>
  renderToStaticMarkup(createElement(NeedCard, { need, index: 0, search, onSearch: () => {} }))

check('v2 card leads with priority, exact orb, two-sided impact, and a public-link result', () => {
  const html = renderNeed(v2Need)
  assert.match(html, /Priority 1/)
  assert.match(html, /demand · segment-reader/)
  assert.match(html, /routing confidence/)
  assert.match(html, /If supportive/)
  assert.match(html, /If adverse/)
  assert.match(html, /Candidate public link/)
  assert.match(html, /Access and reuse rights not verified/)
  assert.match(html, /Checked 13 Aug 2026/)
  assert.match(html, /href="https:\/\/data\.example\.test\/series"/)
  assert.doesNotMatch(html, /High conviction/)
})

check('a clean no-result is the only state labelled Could not find', () => {
  const html = renderNeed({ ...v2Need, source_lookup: { ...v2Need.source_lookup!, lookup_status: 'could_not_find', public_url: null } })
  assert.match(html, />Could not find</)
  assert.match(html, />Search again</)
})

check('an unsearched need offers a direct public-source lookup', () => {
  const html = renderNeed({ ...v2Need, source_lookup: undefined })
  assert.match(html, />Find public source</)
  assert.doesNotMatch(html, /Could not find/)
})

check('a lookup failure stays an error even when an older no-result exists', () => {
  const need = { ...v2Need, source_lookup: { ...v2Need.source_lookup!, lookup_status: 'could_not_find' as const, public_url: null } }
  const html = renderNeed(need, { status: 'error', message: 'Search failed: network error' })
  assert.match(html, /Search failed: network error/)
  assert.match(html, />Try again</)
  assert.match(html, /role="alert"/)
  assert.doesNotMatch(html, /Could not find/)
})

check('lookup keeps the same find button busy while searching, preserving keyboard focus', () => {
  const idle = renderNeed({ ...v2Need, source_lookup: undefined })
  const searching = renderNeed({ ...v2Need, source_lookup: undefined }, { status: 'searching' })
  assert.match(idle, /dneed__actions"><button class="dneed__find"[^>]*>Find public source<\/button>/)
  assert.match(searching, /dneed__actions"><button class="dneed__find"[^>]*disabled=""[^>]*aria-busy="true"[^>]*>/)
  assert.match(searching, /Searching…/)
})

check('a no-result retry keeps that same footer button mounted while searching', () => {
  const need = { ...v2Need, source_lookup: { ...v2Need.source_lookup!, lookup_status: 'could_not_find' as const, public_url: null } }
  const retry = renderNeed(need)
  const searching = renderNeed(need, { status: 'searching' })
  assert.match(retry, /dneed__actions"><button class="dneed__find"[^>]*>Search again<\/button>/)
  assert.match(searching, /dneed__actions"><button class="dneed__find"[^>]*disabled=""[^>]*aria-busy="true"[^>]*>/)
  assert.doesNotMatch(searching, /Could not find/)
})

check('terminal lookup results are politely announced', () => {
  const found = renderNeed(v2Need)
  const absent = renderNeed({ ...v2Need, source_lookup: { ...v2Need.source_lookup!, lookup_status: 'could_not_find', public_url: null } })
  assert.match(found, /dneed__source-found[^>]*role="status"[^>]*aria-live="polite"/)
  assert.match(absent, /dneed__not-found[^>]*role="status"[^>]*aria-live="polite"/)
})

check('legacy v1 needs remain useful without a promised cap-lift', () => {
  const legacy: DataNeed = {
    ...v2Need,
    priority: undefined,
    expected_impact: undefined,
    entry_orbs: undefined,
    source_lookup: undefined,
  }
  const html = renderNeed(legacy)
  assert.match(html, />demand</)
  assert.match(html, />Find public source</)
  assert.doesNotMatch(html, /Priority|High conviction|If supportive|If adverse/)
})

check('filing-only needs do not offer connector discovery', () => {
  const html = renderNeed({ ...v2Need, filing_required: true, source_lookup: undefined })
  assert.match(html, /Statutory filing required/)
  assert.doesNotMatch(html, /Add the filing as a source|Find public source|Search again|Try again/)
})

check('a built need does not search for a duplicate source or claim its connector is a public page', () => {
  const html = renderNeed({ ...v2Need, built_by: 'existing-feed', source_lookup: undefined })
  assert.match(html, /Feed already available/)
  assert.doesNotMatch(html, /View feed|Find public source|Candidate public link|Search again|Try again/)
})

check('dock copy says evidence can move the selected call in either direction', () => {
  const html = renderToStaticMarkup(createElement(DataNeedsPanel, {
    needs: [v2Need], integrityWarnings: [], open: true, searchByNeed: {},
    onToggle: () => {}, onSearch: () => {},
  }))
  assert.match(html, /What would improve this call/)
  assert.match(html, /evidence can strengthen, weaken, or leave the call unchanged/)
  assert.match(html, /never guarantees conviction/)
  assert.doesNotMatch(html, />Add a source</)
})

check('a fully rejected guidance set stays visible as a clear recovery state', () => {
  const html = renderToStaticMarkup(createElement(DataNeedsPanel, {
    needs: [], integrityWarnings: ['v2 contract failed'], open: true, searchByNeed: {},
    onToggle: () => {}, onSearch: () => {},
  }))
  assert.match(html, /Data guidance unavailable/)
  assert.match(html, /Refresh or rerun this call/)
})

check('surviving needs show a quiet integrity warning when other entries were dropped', () => {
  const html = renderToStaticMarkup(createElement(DataNeedsPanel, {
    needs: [v2Need], integrityWarnings: ['one entry hidden'], open: true, searchByNeed: {},
    onToggle: () => {}, onSearch: () => {},
  }))
  assert.match(html, /Some guidance could not be verified and is hidden/)
  assert.match(html, /Monthly unit growth by segment/)
})

check('only a v2 empty set claims there is no active data gap', () => {
  const common = {
    needs: [], integrityWarnings: [], open: true, searchByNeed: {},
    onToggle: () => {}, onSearch: () => {},
  }
  const v2 = renderToStaticMarkup(createElement(DataNeedsPanel, { ...common, schemaVersion: '2.0' }))
  const legacy = renderToStaticMarkup(createElement(DataNeedsPanel, common))
  assert.match(v2, /did not identify an active data gap/)
  assert.match(legacy, /older call did not produce structured data guidance/)
  assert.match(legacy, /Rerun to generate it/)
  assert.doesNotMatch(legacy, /did not identify an active data gap/)
})

check('historical orb routes remain visible but are clearly not rerunnable', () => {
  const html = renderNeed({
    ...v2Need,
    entry_orbs: [{ ...v2Need.entry_orbs![0], route_status: 'historical' }],
  })
  assert.match(html, /segment-reader · historical/)
  assert.match(html, /no longer rerunnable/)
})

check('old lookup truth is visibly dated and stale rather than timeless', () => {
  const html = renderNeed({
    ...v2Need,
    source_lookup: { ...v2Need.source_lookup!, stale: true },
  })
  assert.match(html, /Previously found — recheck/)
  assert.doesNotMatch(html, />Candidate public link</)
  assert.match(html, /Checked 13 Aug 2026 · recheck due/)
  assert.match(html, />Recheck link</)

  const rechecking = renderNeed({
    ...v2Need,
    source_lookup: { ...v2Need.source_lookup!, stale: true },
  }, { status: 'searching' })
  assert.match(rechecking, /disabled=""[^>]*aria-busy="true"/)
  assert.match(rechecking, /Searching…/)

  const failedRecheck = renderNeed({
    ...v2Need,
    source_lookup: { ...v2Need.source_lookup!, stale: true },
  }, { status: 'error', message: 'Search failed: DNS unavailable' })
  assert.match(failedRecheck, /Previously found — recheck/)
  assert.match(failedRecheck, /role="alert">Search failed: DNS unavailable/)
  assert.match(failedRecheck, />Try again</)

  const absent = renderNeed({
    ...v2Need,
    source_lookup: { ...v2Need.source_lookup!, lookup_status: 'could_not_find', public_url: null, stale: true },
  })
  assert.match(absent, /Previously: Could not find — recheck/)
  assert.match(absent, /Checked 13 Aug 2026 · recheck due/)
  assert.match(absent, />Search again</)
})

check('dock layout reserves the measured decision strip and scrolls its own body', () => {
  const css = readFileSync(new URL('./DataNeedsDock.css', import.meta.url), 'utf8')
  assert.match(css, /z-index:\s*19/)
  assert.match(css, /max-height:\s*calc\(100% - 56px - var\(--dneeds-bottom-reserve, 18px\)\)/)
  assert.match(css, /\.dneeds__body\s*\{[^}]*min-height:\s*0[^}]*flex:\s*1 1 auto[^}]*overflow-y:\s*auto/s)
  assert.match(css, /max-height:\s*calc\(100dvh - 52px - var\(--dneeds-bottom-reserve, 18px\)\)/)
})

console.log(`DataNeedsDock: ${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
