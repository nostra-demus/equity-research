process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildSupplyChainBoard, type SupplyChainLead } from '../src/supply-chain'

// A throwaway repo tree per case. The lane reads only the filesystem, so a temp repo exercises the real
// discovery, standing-run, and cross-anchor logic without any fixture indirection.
function repo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'supply-chain-'))
  fs.mkdirSync(path.join(dir, 'analyses'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'data'), { recursive: true })
  return dir
}

interface CpInit {
  node_id?: string
  name: string
  affiliation?: 'third_party' | 'likely_group'
  listing?: string | null
  role?: string
  role_kind?: 'operating' | 'financing' | 'other'
  anchor_side_entity?: string
  link_strength?: number
  link_strength_cap?: number | null
  disclosed_by?: 'counterparty' | 'anchor_group' | null
}

function counterparty(init: CpInit) {
  const listing = init.listing === undefined ? 'NASDAQ:WMI' : init.listing
  return {
    node_id: init.node_id || init.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: init.name,
    affiliation: init.affiliation || 'third_party',
    listing,
    exchange: listing ? listing.split(':')[0] : null,
    symbol: listing ? listing.split(':')[1] : null,
    country: listing ? 'United States' : null,
    industry: 'Electrical Components and Equipment',
    description: 'Makes things.',
    order: 2,
    role: init.role || 'supplier',
    role_kind: init.role_kind || 'operating',
    anchor_side_entity: init.anchor_side_entity || 'Anchor Corp',
    disclosed_by: init.disclosed_by === undefined ? 'counterparty' : init.disclosed_by,
    source_ref: `${init.name} 2025 Form Doc`,
    source_file: 'Anchor Suppliers.xls',
    mechanism: `${init.name} is disclosed as selling into Anchor Corp. If those sales are a meaningful share of its revenue…`,
    link_strength: init.link_strength ?? 90,
    link_strength_components: { disclosure_side: 30, directness: 24, anchor_side: 14, role_kind: 14, investability: 14, corroboration: 0 },
    link_strength_cap: init.link_strength_cap ?? null,
    link_strength_cap_reason: init.link_strength_cap == null ? null : 'capped',
    evidence_gaps: ['how much of its revenue the anchor accounts for is not disclosed here'],
  }
}

function writeRun(
  dir: string,
  runName: string,
  opts: { anchorName: string; anchorListing?: string | null; counterparties?: ReturnType<typeof counterparty>[]; decision?: string | null; sheets?: number; graph?: unknown },
): void {
  const runAbs = path.join(dir, 'analyses', runName)
  fs.mkdirSync(path.join(runAbs, '_pool_extracts'), { recursive: true })
  if (opts.decision !== null && opts.decision !== undefined) {
    fs.writeFileSync(path.join(runAbs, 'decision_record.json'), JSON.stringify({ decision: opts.decision, decision_date: runName.slice(-10) }))
  }
  const graph = opts.graph !== undefined ? opts.graph : {
    schema_version: 'relationship-graph/v1',
    generated_by: 'relationship_graph.py',
    ticker: runName.slice(0, -11),
    anchor: { name: opts.anchorName, listing: opts.anchorListing === undefined ? 'NYSE:ANC' : opts.anchorListing, node_id: 'anchor' },
    sources: Array.from({ length: opts.sheets ?? 1 }, (_, i) => ({
      file: 'Anchor Suppliers.xls', path: 'Anchor Suppliers.xls', sheet: i ? 'Customers' : 'Suppliers',
      orientation: i ? 'customers' : 'suppliers', rows: 3, anchor_named: opts.anchorName, anchor_listing: 'NYSE:ANC',
      scope_notes: ['Recently disclosed suppliers only (within the last two years)'],
    })),
    scope_notes: ['Recently disclosed suppliers only (within the last two years)'],
    nodes: [],
    edges: [],
    counterparties: opts.counterparties ?? [],
    industry_clusters: [],
    concentration: {
      relationship_rows: 6, intragroup_rows: 3, intragroup_row_share_pct: 50, named_entities: 8,
      group_entities: 2, likely_group_entities: 1, third_party_entities: (opts.counterparties ?? []).length,
      listed_third_parties: (opts.counterparties ?? []).filter((c) => c.listing).length,
      listed_suppliers: 1, listed_customers: 0, exchanges: ['NASDAQ'],
    },
    warnings: [],
  }
  fs.writeFileSync(path.join(runAbs, '_pool_extracts', 'relationships.json'), JSON.stringify(graph))
}

const byName = (leads: SupplyChainLead[]) => new Map(leads.map((l) => [l.name, l]))

// ---- 1. an empty engine says so, and never pretends -------------------------------------------------
{
  const dir = repo()
  const board = buildSupplyChainBoard(dir)
  assert.equal(board.schema_version, 'supply-chain-board/v1')
  assert.equal(board.health.outcome, 'no_exports')
  assert.equal(board.health.status, 'pre_data')
  assert.equal(board.leads.length, 0)
  assert.match(board.health.reason, /No Capital IQ supplier or customer export/)
}

// ---- 2. a real chain becomes leads, with the evidence attached ---------------------------------------
{
  const dir = repo()
  writeRun(dir, 'ANC_2026-08-01', {
    anchorName: 'Anchor Corp', decision: 'Buy',
    counterparties: [
      counterparty({ name: 'Widget Motors', listing: 'NASDAQ:WMI' }),
      counterparty({ name: 'Packrite Holdings', listing: 'SEHK:9001', anchor_side_entity: 'Anchor Procurement Co., Ltd.', disclosed_by: 'anchor_group', link_strength: 80 }),
      counterparty({ name: 'Regional Bank', listing: 'SEHK:3866', role: 'creditor', role_kind: 'financing', link_strength: 45, link_strength_cap: 45 }),
      counterparty({ name: 'Quiet Plastics', listing: null, link_strength: 25, link_strength_cap: 25 }),
      counterparty({ name: 'Anchor Widgets Trading', listing: null, affiliation: 'likely_group', link_strength: 20, link_strength_cap: 20 }),
    ],
  })
  const board = buildSupplyChainBoard(dir)
  const leads = byName(board.leads)
  assert.equal(board.leads.length, 5, 'every disclosed counterparty should be mapped, including the ones that cannot be traded')
  assert.equal(board.health.outcome, 'leads')
  assert.equal(board.health.status, 'healthy')

  // readiness is the honest gate, not a filter that hides evidence
  assert.equal(leads.get('Widget Motors')!.readiness, 'research_now')
  assert.equal(leads.get('Regional Bank')!.readiness, 'not_directional')
  assert.equal(leads.get('Quiet Plastics')!.readiness, 'not_investable')
  assert.equal(leads.get('Anchor Widgets Trading')!.readiness, 'related_party')

  // the anchor's own verdict travels with the lead; the counterparty gets no direction of its own
  const wm = leads.get('Widget Motors')!
  assert.equal(wm.anchor_decision, 'Buy')
  assert.equal(wm.anchor_ticker, 'ANC')
  assert.equal(wm.transmission, 'same_direction')
  assert.equal(leads.get('Regional Bank')!.transmission, 'none', 'a lending relationship must not read as moving with the anchor')
  assert.ok(!('direction' in wm), 'the chain lane must never assert a long or short on a counterparty')
  assert.equal(wm.source_ref, 'Widget Motors 2025 Form Doc')
  assert.ok(wm.evidence_gaps.length > 0, 'a lead must always carry what is still missing')

  // ranking: the strongest evidence first, and a bank can never outrank a real operating supplier
  assert.equal(board.leads[0].name, 'Widget Motors')
  assert.ok(leads.get('Widget Motors')!.lead_score > leads.get('Regional Bank')!.lead_score)
  assert.ok(leads.get('Regional Bank')!.lead_score > leads.get('Quiet Plastics')!.lead_score)
  assert.ok(leads.get('Quiet Plastics')!.lead_score > leads.get('Anchor Widgets Trading')!.lead_score)

  // the path reads outward from the anchor and names the group entity only when it is not the parent
  assert.deepEqual(wm.path.map((s) => s.name), ['Anchor Corp', 'Widget Motors'])
  assert.deepEqual(
    leads.get('Packrite Holdings')!.path.map((s) => s.name),
    ['Anchor Corp', 'Anchor Procurement Co., Ltd.', 'Packrite Holdings'],
  )
}

// ---- 3. no verdict on the anchor caps the chain behind it ---------------------------------------------
{
  const dir = repo()
  writeRun(dir, 'ANC_2026-08-01', { anchorName: 'Anchor Corp', decision: null, counterparties: [counterparty({ name: 'Widget Motors' })] })
  const board = buildSupplyChainBoard(dir)
  const lead = board.leads[0]
  assert.equal(lead.readiness, 'needs_anchor')
  assert.equal(lead.lead_score_cap, 60)
  assert.ok(lead.lead_score <= 60, 'an undecided anchor must cap every lead behind it')
  assert.ok(lead.evidence_gaps.some((g) => /no standing research verdict/.test(g)))
  assert.equal(board.health.outcome, 'none_investable')
  assert.equal(board.health.research_now_count, 0)
}

// ---- 4. the standing run wins: a newer decision-less re-run must not shadow the dossier -----------------
{
  const dir = repo()
  writeRun(dir, 'ANC_2026-07-01', { anchorName: 'Anchor Corp', decision: 'Buy', counterparties: [counterparty({ name: 'Widget Motors' })] })
  writeRun(dir, 'ANC_2026-08-01', { anchorName: 'Anchor Corp', decision: null, counterparties: [counterparty({ name: 'Ghost Supplier' })] })
  const board = buildSupplyChainBoard(dir)
  assert.equal(board.leads.length, 1)
  assert.equal(board.leads[0].name, 'Widget Motors')
  assert.equal(board.leads[0].anchor_run_root, 'analyses/ANC_2026-07-01')
  assert.equal(board.leads[0].anchor_decision, 'Buy')
}

// ---- 5. among decided runs, the newest wins -------------------------------------------------------------
{
  const dir = repo()
  writeRun(dir, 'ANC_2026-07-01', { anchorName: 'Anchor Corp', decision: 'Avoid', counterparties: [counterparty({ name: 'Old Supplier' })] })
  writeRun(dir, 'ANC_2026-08-01', { anchorName: 'Anchor Corp', decision: 'Buy', counterparties: [counterparty({ name: 'New Supplier' })] })
  const board = buildSupplyChainBoard(dir)
  assert.deepEqual(board.leads.map((l) => l.name), ['New Supplier'])
  assert.equal(board.leads[0].anchor_decision, 'Buy')
}

// ---- 6. third order exists only when the middle company's OWN export is in the pool ----------------------
{
  const dir = repo()
  writeRun(dir, 'ANC_2026-08-01', {
    anchorName: 'Anchor Corp', decision: 'Buy',
    counterparties: [counterparty({ node_id: 'widget-motors', name: 'Widget Motors', listing: 'NASDAQ:WMI' })],
  })
  // no graph for Widget Motors yet -> nothing beyond order 2
  assert.equal(buildSupplyChainBoard(dir).health.third_order_count, 0)

  writeRun(dir, 'WMI_2026-08-02', {
    anchorName: 'Widget Motors', anchorListing: 'NASDAQ:WMI', decision: 'Watchlist',
    counterparties: [
      counterparty({ node_id: 'copper-mill', name: 'Copper Mill', listing: 'SHSE:601609', anchor_side_entity: 'Widget Motors' }),
      counterparty({ node_id: 'side-bank', name: 'Side Bank', listing: 'SEHK:1', role: 'creditor', role_kind: 'financing', link_strength: 45, link_strength_cap: 45 }),
    ],
  })
  const board = buildSupplyChainBoard(dir)
  const third = board.leads.filter((l) => l.anchor_ticker === 'ANC' && l.order === 3)
  assert.equal(third.length, 1, 'exactly the one operating link two hops out becomes a third-order lead')
  assert.equal(third[0].name, 'Copper Mill')
  assert.deepEqual(third[0].path.map((s) => s.name), ['Anchor Corp', 'Widget Motors', 'Copper Mill'])
  assert.ok(third[0].evidence_gaps.some((g) => /two steps out/.test(g)), 'a third-order lead must say the chain is longer')
  assert.ok(
    !board.leads.some((l) => l.anchor_ticker === 'ANC' && l.name === 'Side Bank'),
    'a financing link must not be walked through or reached as a third-order lead',
  )
  // and the same company still appears as WMI's own direct counterparty
  assert.ok(board.leads.some((l) => l.anchor_ticker === 'WMI' && l.name === 'Copper Mill' && l.order === 2))
}

// ---- 7. a shorter chain always wins over a longer one to the same company ---------------------------------
{
  const dir = repo()
  writeRun(dir, 'ANC_2026-08-01', {
    anchorName: 'Anchor Corp', decision: 'Buy',
    counterparties: [
      counterparty({ node_id: 'widget-motors', name: 'Widget Motors', listing: 'NASDAQ:WMI' }),
      counterparty({ node_id: 'copper-mill', name: 'Copper Mill', listing: 'SHSE:601609' }),
    ],
  })
  writeRun(dir, 'WMI_2026-08-02', {
    anchorName: 'Widget Motors', anchorListing: 'NASDAQ:WMI', decision: 'Watchlist',
    counterparties: [counterparty({ node_id: 'copper-mill', name: 'Copper Mill', listing: 'SHSE:601609', anchor_side_entity: 'Widget Motors' })],
  })
  const ancCopper = buildSupplyChainBoard(dir).leads.filter((l) => l.anchor_ticker === 'ANC' && l.name === 'Copper Mill')
  assert.equal(ancCopper.length, 1, 'a company reachable both directly and through a middle must appear once')
  assert.equal(ancCopper[0].order, 2, 'the direct, better-evidenced link must be the one kept')
}

// ---- 8. prior coverage is recognised, and only on a real match ---------------------------------------------
{
  const dir = repo()
  fs.mkdirSync(path.join(dir, 'data', 'WMI'), { recursive: true })
  writeRun(dir, 'ANC_2026-08-01', {
    anchorName: 'Anchor Corp', decision: 'Buy',
    counterparties: [
      counterparty({ name: 'Widget Motors', listing: 'NASDAQ:WMI' }),
      counterparty({ name: 'Unknown Supplier', listing: 'NASDAQ:UNK' }),
    ],
  })
  const leads = byName(buildSupplyChainBoard(dir).leads)
  assert.equal(leads.get('Widget Motors')!.prior_coverage?.data_pool_present, true)
  assert.equal(leads.get('Unknown Supplier')!.prior_coverage, null, 'coverage must never be claimed for a company we have not gathered')
  assert.ok(
    leads.get('Widget Motors')!.lead_score > leads.get('Unknown Supplier')!.lead_score,
    'an already-gathered counterparty should rank ahead of an identical one we have nothing on',
  )
}

// ---- 9. a malformed or foreign artifact is counted, never half-believed --------------------------------------
{
  const dir = repo()
  writeRun(dir, 'ANC_2026-08-01', { anchorName: 'Anchor Corp', decision: 'Buy', graph: { schema_version: 'relationship-graph/v9', anchor: {}, counterparties: [], sources: [] } })
  const wrongSchema = buildSupplyChainBoard(dir)
  assert.equal(wrongSchema.health.invalid_count, 1)
  assert.equal(wrongSchema.leads.length, 0)
  assert.equal(wrongSchema.health.outcome, 'invalid_artifacts')
  assert.equal(wrongSchema.health.status, 'degraded')

  const dir2 = repo()
  fs.mkdirSync(path.join(dir2, 'analyses', 'ANC_2026-08-01', '_pool_extracts'), { recursive: true })
  fs.writeFileSync(path.join(dir2, 'analyses', 'ANC_2026-08-01', '_pool_extracts', 'relationships.json'), '{ not json')
  assert.equal(buildSupplyChainBoard(dir2).health.invalid_count, 1)
}

// ---- 10. a counterparty row missing its contract is dropped, not partially trusted -----------------------------
{
  const dir = repo()
  const good = counterparty({ name: 'Widget Motors' })
  const bad: any = { ...counterparty({ name: 'Broken Row' }), role_kind: 'sideways' }
  const noMechanism: any = { ...counterparty({ name: 'No Mechanism' }), mechanism: '' }
  writeRun(dir, 'ANC_2026-08-01', { anchorName: 'Anchor Corp', decision: 'Buy', counterparties: [good, bad, noMechanism] })
  const board = buildSupplyChainBoard(dir)
  assert.deepEqual(board.leads.map((l) => l.name), ['Widget Motors'])
}

// ---- 11. an empty graph does not take the standing slot from an older one that has one ---------------------------
{
  const dir = repo()
  writeRun(dir, 'ANC_2026-07-01', { anchorName: 'Anchor Corp', decision: 'Buy', counterparties: [counterparty({ name: 'Widget Motors' })] })
  writeRun(dir, 'ANC_2026-08-01', { anchorName: 'Anchor Corp', decision: 'Buy', sheets: 0, counterparties: [] })
  const board = buildSupplyChainBoard(dir)
  assert.deepEqual(board.leads.map((l) => l.name), ['Widget Motors'])
  assert.equal(board.health.anchors_without_export.length, 0)
}

// ---- 12. the anchor map carries the related-party read ------------------------------------------------------------
{
  const dir = repo()
  writeRun(dir, 'ANC_2026-08-01', { anchorName: 'Anchor Corp', decision: 'Buy', sheets: 2, counterparties: [counterparty({ name: 'Widget Motors' })] })
  const board = buildSupplyChainBoard(dir)
  assert.equal(board.anchors.length, 1)
  const map = board.anchors[0]
  assert.equal(map.ticker, 'ANC')
  assert.equal(map.sheets, 2)
  assert.equal(map.intragroup_row_share_pct, 50)
  assert.equal(map.relationship_rows, 6)
  assert.ok(map.scope_notes.some((s) => /within the last two years/.test(s)), 'the export scope must reach the board')
  assert.equal(board.health.sheet_count, 2)
}

// ---- 13. a run with no export at all is reported, not silently ignored ----------------------------------------------
{
  const dir = repo()
  fs.mkdirSync(path.join(dir, 'analyses', 'NOEXP_2026-08-01'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'analyses', 'NOEXP_2026-08-01', 'decision_record.json'), JSON.stringify({ decision: 'Buy' }))
  writeRun(dir, 'ANC_2026-08-01', { anchorName: 'Anchor Corp', decision: 'Buy', counterparties: [counterparty({ name: 'Widget Motors' })] })
  const board = buildSupplyChainBoard(dir)
  assert.deepEqual(board.health.anchors_without_export, ['NOEXP'])
  assert.equal(board.health.run_count, 2)
  assert.equal(board.health.graph_count, 1)
}

console.log('supply-chain: PASS (empty honesty, readiness gates, anchor verdict caps, standing run, third order only when evidenced, shortest chain wins, coverage match, invalid artifacts, related-party map)')
