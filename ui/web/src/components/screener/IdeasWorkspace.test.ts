import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { IdeasWorkspace, readListingExclusions } from './IdeasWorkspace'
import { useStore } from '../../lib/store'

assert.deepEqual(readListingExclusions(), ['HK', 'IN'])
assert.deepEqual(readListingExclusions({ getItem: () => '[]' }), [])
assert.deepEqual(readListingExclusions({ getItem: () => '["HK"]' }), ['HK'])
assert.deepEqual(readListingExclusions({ getItem: () => '{bad}' }), ['HK', 'IN'])
assert.deepEqual(readListingExclusions({ getItem: () => { throw new Error('blocked storage') } }), ['HK', 'IN'])
useStore.setState({ ideasLane: 'events' })
const html = renderToStaticMarkup(createElement(IdeasWorkspace))
assert.equal(html.match(/role="tab"/g)?.length, 5)
assert.match(html, /id="ideas-events-tab"[^>]*aria-selected="true"/)
assert.ok(html.indexOf('>Long</button>') < html.indexOf('>Events</button>'))
assert.ok(html.indexOf('>Events</button>') < html.indexOf('>Short</button>'))
assert.match(html, /Hide Hong Kong listings/)
assert.match(html, /Hide India listings/)
assert.doesNotMatch(html, /Qualified 3|No verified qualified|default to no position|Board health/)
useStore.getState().setIdeasLane('short')
assert.equal(useStore.getState().ideasLane, 'short')
console.log('Ideas workspace defaults, navigation and filter persistence tests passed')
