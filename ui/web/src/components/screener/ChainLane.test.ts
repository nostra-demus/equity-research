import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { SupplyChainBoard, SupplyChainLead } from '../../lib/types'
import { ChainLane, normalizeSupplyChainBoard } from './ChainLane'
import { IdeasTabs } from './BestIdeasView'

// ---- the tab strip stays two tabs until the server actually sends a chain board ----------------------
{
  const two = renderToStaticMarkup(createElement(IdeasTabs, { active: 'long', onSelect: () => {} }))
  assert.equal(two.match(/role="tab"/g)?.length, 2, 'an engine without the chain lane must show exactly the two directional tabs')
  assert.doesNotMatch(two, />CHAIN</)

  const three = renderToStaticMarkup(createElement(IdeasTabs, { active: 'chain', onSelect: () => {}, chain: true }))
  assert.equal(three.match(/role="tab"/g)?.length, 3)
  assert.match(three, />CHAIN<\/button>/)
  assert.match(three, /id="ideas-chain-tab"[^>]*aria-selected="true"/)
  assert.match(three, /id="ideas-chain-tab"[^>]*tabindex="0"/)
  assert.match(three, /id="ideas-long-tab"[^>]*tabindex="-1"/)
  assert.match(three, /aria-controls="ideas-chain-panel"/)
}

// ---- fixtures ----------------------------------------------------------------------------------------
const lead = (patch: Partial<SupplyChainLead> = {}): SupplyChainLead => ({
  lead_id: 'SCL-abc123abc123',
  anchor_ticker: 'HAIER',
  anchor_name: 'Haier Smart Home Co., Ltd.',
  anchor_listing: 'SHSE:600690',
  anchor_run_root: 'analyses/HAIER_2026-08-13',
  anchor_decision: 'Buy',
  anchor_decision_date: '2026-08-13',
  name: 'Shaily Engineering Plastics Limited',
  listing: 'BSE:501423',
  exchange: 'BSE',
  symbol: '501423',
  country: 'India',
  industry: 'Industrial Machinery and Supplies and Components',
  description: 'Makes engineering plastics.',
  order: 2,
  path: [
    { name: 'Haier Smart Home Co., Ltd.', listing: 'SHSE:600690', role: null },
    { name: 'Haier US Appliance Solutions, Inc.', listing: null, role: 'group entity' },
    { name: 'Shaily Engineering Plastics Limited', listing: 'BSE:501423', role: 'supplier' },
  ],
  role: 'supplier',
  role_kind: 'operating',
  transmission: 'same_direction',
  mechanism: 'Shaily Engineering Plastics is disclosed as selling into Haier US Appliance Solutions.',
  disclosed_by: 'counterparty',
  source_ref: 'Shaily Engineering Plastics Limited (BSE:501423) - Form Doc',
  source_file: 'Haier Suppliers.xls',
  link_strength: 91,
  link_strength_components: { disclosure_side: 30, directness: 24, anchor_side: 9, role_kind: 14, investability: 14, corroboration: 0 },
  lead_score: 91,
  lead_score_basis: 'chain_evidence_v1',
  lead_score_cap: null,
  lead_score_cap_reason: null,
  readiness: 'research_now',
  evidence_gaps: ['how much of its revenue Haier accounts for is not disclosed here'],
  prior_coverage: null,
  ...patch,
})

const board = (patch: Partial<SupplyChainBoard> = {}): SupplyChainBoard => ({
  schema_version: 'supply-chain-board/v1',
  generated_at: '2026-08-13T09:00:00Z',
  score_basis: 'chain_evidence_v1',
  health: {
    status: 'healthy', outcome: 'leads', reason: '1 outside counterparty is listed and operating.',
    run_count: 1, graph_count: 1, invalid_count: 0, input_warning_count: 0, pool_export_count: 2, sheet_count: 2,
    anchors_without_export: [], lead_count: 1, research_now_count: 1, third_order_count: 0,
  },
  anchors: [{
    ticker: 'HAIER', name: 'Haier Smart Home Co., Ltd.', listing: 'SHSE:600690',
    run_root: 'analyses/HAIER_2026-08-13', decision: 'Buy', decision_date: '2026-08-13',
    sheets: 2, scope_notes: ['Recently disclosed suppliers only (within the last two years)'],
    relationship_rows: 42, intragroup_rows: 21, intragroup_row_share_pct: 50,
    third_party_entities: 18, listed_third_parties: 11, listed_suppliers: 10, listed_customers: 1,
    exchanges: ['BSE', 'SEHK', 'SHSE'], industry_clusters: [], warnings: [],
  }],
  leads: [lead()],
  ...patch,
})

// ---- the payload gate fails closed --------------------------------------------------------------------
assert.equal(normalizeSupplyChainBoard(undefined), null, 'an engine that sends nothing must not render the lane')
assert.equal(normalizeSupplyChainBoard(null), null)
assert.equal(normalizeSupplyChainBoard({}), null)
assert.equal(normalizeSupplyChainBoard({ ...board(), schema_version: 'supply-chain-board/v2' }), null, 'a schema this build does not understand must be refused, not half-rendered')
assert.equal(normalizeSupplyChainBoard({ ...board(), score_basis: 'vibes' }), null, 'a different score basis is a different contract')
assert.equal(normalizeSupplyChainBoard({ ...board(), health: { ...board().health, outcome: 'invented' } }), null)
assert.equal(normalizeSupplyChainBoard({ ...board(), leads: 'nope' }), null)
assert.ok(normalizeSupplyChainBoard(board()), 'a well-formed board is accepted')

// one malformed row is dropped without taking the lane down with it
{
  const mixed = normalizeSupplyChainBoard({
    ...board(),
    leads: [lead(), { ...lead({ lead_id: 'SCL-bad' }), readiness: 'sideways' }, { ...lead({ lead_id: 'SCL-bad2' }), lead_score_basis: 'other' }],
  })
  assert.equal(mixed?.leads.length, 1)
  assert.equal(mixed?.leads[0].lead_id, 'SCL-abc123abc123')
}

// ---- the lane renders the evidence chain, not a direction ----------------------------------------------
{
  const html = renderToStaticMarkup(createElement(ChainLane, { board: board() }))
  assert.match(html, /Direct counterparties/, 'leads are grouped by how far out they sit')
  assert.match(html, /BSE:501423/)
  assert.match(html, /Shaily Engineering Plastics Limited/)
  // the full hop path is shown, including the group entity the relationship is actually with
  assert.match(html, /Haier US Appliance Solutions, Inc\./)
  assert.match(html, /group entity/)
  // the anchor's verdict travels with the lead; the counterparty gets no side of its own
  assert.match(html, /behind <strong>HAIER<\/strong>/)
  assert.match(html, /Buy/)
  assert.doesNotMatch(html, /\bLONG\b|\bSHORT\b/, 'a chain lead must never be presented as a directional call')
  // the discloser is surfaced — it is the one materiality signal the export gives for free
  assert.match(html, /named the anchor in its own filing/)
  // gaps are always visible, never suppressed
  assert.match(html, /what is still missing \(1\)/)
  assert.match(html, /how much of its revenue Haier accounts for/)
  // the score is labelled evidence, never conviction or a target
  assert.match(html, /evidence/)
  assert.match(html, /91<span class="bidea__readden">\/100/)
  // the related-party read reaches the strip
  assert.match(html, /50%<\/strong> of its disclosed chain is in-house/)
  assert.match(html, /11<\/strong> listed outside part/)
  assert.match(html, /within the last two years/, 'the export scope caveat must be visible, not buried')
}

// ---- rows that cannot be traded are held back, counted, and reachable ------------------------------------
{
  const held = board({
    leads: [
      lead(),
      lead({ lead_id: 'SCL-bank', name: 'Bank of Qingdao Co., Ltd.', listing: 'SEHK:3866', symbol: '3866', role: 'creditor', role_kind: 'financing', transmission: 'none', readiness: 'not_directional', lead_score: 45, lead_score_cap: 45, lead_score_cap_reason: 'the disclosed link is financing, not operating' }),
      lead({ lead_id: 'SCL-unlisted', name: 'CPMC Holdings Limited', listing: null, exchange: null, symbol: null, country: null, readiness: 'not_investable', lead_score: 25 }),
    ],
    health: { ...board().health, lead_count: 3 },
  })
  const html = renderToStaticMarkup(createElement(ChainLane, { board: held }))
  assert.match(html, /Show 2 more the engine is holding back/, 'held-back rows are counted in the open, never silently dropped')
  assert.match(html, /unlisted, lending-only, or possibly inside/)
  assert.doesNotMatch(html, /Bank of Qingdao/, 'a lending-only row stays behind the toggle by default')
  assert.doesNotMatch(html, /CPMC Holdings/)
}

// ---- an empty lane says why, and still shows what was read -----------------------------------------------
{
  const empty = board({
    leads: [],
    health: {
      ...board().health, outcome: 'no_exports', status: 'pre_data', lead_count: 0, research_now_count: 0,
      reason: 'No Capital IQ supplier or customer export has been read into a research run yet.',
    },
  })
  const html = renderToStaticMarkup(createElement(ChainLane, { board: empty }))
  assert.match(html, /No Capital IQ supplier or customer export/)
  assert.doesNotMatch(html, /Direct counterparties/)
  assert.match(html, /HAIER/, 'even with no leads, what WAS read stays visible')
}

// ---- a degraded read is surfaced, not hidden behind a healthy-looking list ---------------------------------
{
  const degraded = board({ health: { ...board().health, status: 'degraded', reason: '1 relationship graph could not be read.' } })
  const html = renderToStaticMarkup(createElement(ChainLane, { board: degraded }))
  assert.match(html, /bideas__truthwarn/)
  assert.match(html, /could not be read/)
}

// ---- a third-order lead is labelled as the longer chain it is ------------------------------------------------
{
  const third = board({
    leads: [lead({
      lead_id: 'SCL-third', order: 3, name: 'Copper Mill Co.', listing: 'SHSE:601609', symbol: '601609',
      path: [
        { name: 'Haier Smart Home Co., Ltd.', listing: 'SHSE:600690', role: null },
        { name: 'Widget Motors', listing: 'NASDAQ:WMI', role: 'supplier' },
        { name: 'Copper Mill Co.', listing: 'SHSE:601609', role: 'supplier' },
      ],
      evidence_gaps: ['this is two steps out — it reaches Haier Smart Home only through Widget Motors'],
    })],
  })
  const html = renderToStaticMarkup(createElement(ChainLane, { board: third }))
  assert.match(html, /One step further out/)
  assert.match(html, /a longer chain, so a weaker read/)
  assert.match(html, /two steps out/)
}

console.log('ChainLane: PASS (conditional tab, fail-closed payload gate, evidence chain rendered, no direction asserted, held-back rows counted, empty + degraded states, third-order labelling)')
