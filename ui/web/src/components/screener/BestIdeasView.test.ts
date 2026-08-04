import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { BoardIdea } from '../../lib/types'
import { CompactIdea, ideaThemeAttribution, leadEmptyMessage } from './BestIdeasView'

const honest = leadEmptyMessage({ status: 'healthy', outcome: 'success_empty', reason: 'No leads passed.' })
assert.equal(honest, 'The provider pass completed successfully and returned no leads.')

const degraded = leadEmptyMessage({ status: 'degraded', outcome: 'success_empty', reason: 'The snapshot store is invalid.' })
assert.equal(degraded, 'The snapshot store is invalid.', 'a degraded pass cannot use honest-empty copy')

const failed = leadEmptyMessage({ status: 'error', outcome: 'failed', reason: 'The provider output was malformed.' })
assert.equal(failed, 'The provider output was malformed.')

const sourceThemes = [{ theme_id: 'THM-1', theme_rev: 3 }]
assert.deepEqual(
  ideaThemeAttribution({ origin_type: 'theme', source_themes: sourceThemes }),
  {
    label: 'found through Themes',
    title: 'This lead entered the skim through a theme that cleared the evidence gate',
  },
)
assert.deepEqual(
  ideaThemeAttribution({ origin_type: 'mixed', source_themes: sourceThemes }),
  {
    label: 'theme corroborated',
    title: 'This lead appeared on the wire and was corroborated by a theme that cleared the evidence gate',
  },
)
assert.equal(ideaThemeAttribution({ origin_type: 'wire', source_themes: sourceThemes }), null)
assert.equal(ideaThemeAttribution({ origin_type: 'theme', source_themes: [] }), null)

const compactThemeLead = {
  idea_id: 'IDEA-THEME-COMPACT',
  ticker: 'GAIN',
  direction: 'long',
  reason: 'A scoped theme supplied the current reason.',
  conviction: 62,
  trade_score: 58,
  status: 'surfaced',
  origin_type: 'theme',
  source_themes: sourceThemes,
} as unknown as BoardIdea
const compactHtml = renderToStaticMarkup(createElement(CompactIdea, { idea: compactThemeLead }))
assert.match(compactHtml, /found through Themes/, 'rank 3+ and cooling compact rows retain theme provenance')
assert.match(compactHtml, /bidea-c__theme/)

console.log('BestIdeasView empty-state and theme-attribution truth tests passed')
