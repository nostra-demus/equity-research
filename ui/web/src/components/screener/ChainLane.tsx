// The CHAIN lane of Ideas — the companies a researched company actually trades with.
//
// A Capital IQ Suppliers / Customers export names, with a source filing per row, exactly who sells into a
// company and who buys from it. The server turns that into a graph and projects the outside parties here,
// grouped by how far out they sit: direct counterparties first, then the ones reached one step further.
//
// Deliberate honesty, per the doctrine. This lane has its own tab rather than living under LONG/SHORT
// because it does NOT produce a direction: the export proves a relationship exists and says nothing about
// how big it is, so "long the supplier because we like the customer" is a claim the evidence cannot carry
// (§3, §7). Each card therefore carries the ANCHOR's own standing verdict, which way the link transmits,
// and what is still missing — never a buy or a sell on the counterparty. Rows that cannot be traded
// (unlisted, a lending relationship, a possibly-related entity) are kept and shown behind a toggle rather
// than deleted, because a hidden row reads as "there was nothing there".
//
// It fails closed on a missing/foreign payload (deploy skew, DESIGN.md §5): the tab only exists when the
// server positively sends a board of the schema this file understands.

import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import type { SupplyChainBoard, SupplyChainLead, SupplyChainReadiness } from '../../lib/types'

const BOARD_SCHEMA = 'supply-chain-board/v1'
const SCORE_BASIS = 'chain_evidence_v1'
const HEALTH_STATUSES = new Set(['healthy', 'pre_data', 'degraded'])
const HEALTH_OUTCOMES = new Set(['no_exports', 'leads', 'none_investable', 'storage_error', 'invalid_artifacts'])
const READINESS = new Set<SupplyChainReadiness>(['research_now', 'needs_anchor', 'not_directional', 'not_investable', 'related_party'])
const ROLE_KINDS = new Set(['operating', 'financing', 'other'])

/** Rows a reader can act on today sit in the open list; everything else waits behind the toggle. */
const ACTIONABLE = new Set<SupplyChainReadiness>(['research_now', 'needs_anchor'])

const ORDER_LABEL: Record<number, { title: string; note: string }> = {
  2: {
    title: 'Direct counterparties',
    note: 'Companies that trade with the anchor itself, or with a business it owns.',
  },
  3: {
    title: 'One step further out',
    note: 'Reached through another company we hold a supplier list for — a longer chain, so a weaker read.',
  },
}

const READINESS_NOTE: Record<SupplyChainReadiness, string> = {
  research_now: 'listed, trades with the anchor, and the anchor has a verdict',
  needs_anchor: 'the anchor has no verdict yet, so the chain has no direction',
  not_directional: 'a lending or ownership link — it does not move with the anchor',
  not_investable: 'the export names no listing for it',
  related_party: 'may be part of the anchor’s own group',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function nonBlank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isLead(value: unknown): value is SupplyChainLead {
  if (!isRecord(value)) return false
  return nonBlank(value.lead_id) && nonBlank(value.anchor_ticker) && nonBlank(value.name)
    && nonBlank(value.role) && nonBlank(value.mechanism)
    && ROLE_KINDS.has(value.role_kind as string)
    && READINESS.has(value.readiness as SupplyChainReadiness)
    && value.lead_score_basis === SCORE_BASIS
    && finite(value.lead_score) && finite(value.order)
    && Array.isArray(value.path) && value.path.every((step) => isRecord(step) && nonBlank(step.name))
    && Array.isArray(value.evidence_gaps) && value.evidence_gaps.every(nonBlank)
}

/**
 * A positive shape check before anything renders. An older engine sends no `supply_chain` at all and a
 * newer one could send a schema this build does not understand; either way the tab must not appear rather
 * than render an empty lane that reads as "the chain is empty".
 */
export function normalizeSupplyChainBoard(value: unknown): SupplyChainBoard | null {
  if (!isRecord(value)) return null
  if (value.schema_version !== BOARD_SCHEMA || value.score_basis !== SCORE_BASIS) return null
  const health = value.health
  if (!isRecord(health) || !HEALTH_STATUSES.has(health.status as string) || !HEALTH_OUTCOMES.has(health.outcome as string) || !nonBlank(health.reason)) return null
  if (!Array.isArray(value.leads) || !Array.isArray(value.anchors)) return null
  return {
    ...(value as unknown as SupplyChainBoard),
    leads: value.leads.filter(isLead),
    anchors: value.anchors.filter((a) => isRecord(a) && nonBlank(a.ticker)) as SupplyChainBoard['anchors'],
  }
}

function orderTitle(order: number): { title: string; note: string } {
  return ORDER_LABEL[order] || {
    title: `${order} steps out`,
    note: 'Reached only through other companies we hold supplier lists for.',
  }
}

/** "supplier · named in its own filing" — the two facts that decide how much the link is worth. */
function disclosureLabel(lead: SupplyChainLead): { text: string; title: string } | null {
  if (lead.disclosed_by === 'counterparty') {
    return {
      text: 'named the anchor in its own filing',
      title: `${lead.name} disclosed this relationship itself — it considered the connection material enough to name in its own accounts. Source: ${lead.source_ref || 'the relationship export'}`,
    }
  }
  if (lead.disclosed_by === 'anchor_group') {
    return {
      text: 'disclosed by the anchor',
      title: `The relationship comes from ${lead.anchor_name || lead.anchor_ticker}'s own filing, not from ${lead.name}'s. Source: ${lead.source_ref || 'the relationship export'}`,
    }
  }
  return null
}

function coverageLabel(lead: SupplyChainLead): { text: string; rated: boolean } {
  const pc = lead.prior_coverage
  if (pc?.has_run) return { text: `already researched${pc.latest_decision ? ` · ${pc.latest_decision}` : ''}`, rated: true }
  if (pc?.data_pool_present) return { text: 'data on file — never rated', rated: false }
  return { text: 'nothing gathered yet', rated: false }
}

function ChainPath({ lead }: { lead: SupplyChainLead }) {
  return (
    <p className="chain__path" title={lead.path.map((s) => s.name).join(' → ')}>
      {lead.path.map((step, i) => (
        <span key={`${step.name}-${i}`} className="chain__step">
          {i > 0 && <span className="chain__arrow" aria-hidden>→</span>}
          <span className={i === 0 ? 'chain__stepname chain__stepname--anchor' : 'chain__stepname'}>{step.name}</span>
          {step.role && <span className="chain__steprole">{step.role}</span>}
        </span>
      ))}
    </p>
  )
}

function ChainCard({ lead }: { lead: SupplyChainLead }) {
  const addCompany = useStore((s) => s.addCompany)
  const driveEnabled = useStore((s) => s.driveEnabled)
  const [busy, setBusy] = useState(false)
  const disclosure = disclosureLabel(lead)
  const coverage = coverageLabel(lead)
  const canStartPool = Boolean(lead.symbol) && !lead.prior_coverage?.data_pool_present && !lead.prior_coverage?.has_run && driveEnabled

  return (
    <article className={`bidea chain__card${lead.readiness === 'research_now' ? ' chain__card--live' : ''}`}>
      <div className="bidea__head">
        <span className="bidea__ticker">{lead.listing || lead.name}</span>
        {lead.listing && <span className="bidea__co">{lead.name}</span>}
        {lead.country && <span className="chain__country">{lead.country}</span>}
      </div>

      <ChainPath lead={lead} />

      <p className="bidea__reason">{lead.mechanism}</p>

      <div className="bidea__tags">
        <span className="bidea__tag">{lead.role}{lead.industry ? ` · ${lead.industry}` : ''}</span>
        {disclosure && (
          <span className={`bidea__tag${lead.disclosed_by === 'counterparty' ? ' bidea__tag--rated' : ''}`} title={disclosure.title}>
            {disclosure.text}
          </span>
        )}
        {lead.transmission === 'same_direction'
          ? <span className="bidea__tag" title="More units built and sold by the anchor is more business for this company — how much more is not disclosed.">moves with the anchor</span>
          : <span className="bidea__tag bidea__tag--warn" title={READINESS_NOTE[lead.readiness]}>{READINESS_NOTE[lead.readiness]}</span>}
        <span className={`bidea__tag bidea__tag--cov${coverage.rated ? ' bidea__tag--rated' : ''}`}>{coverage.text}</span>
      </div>

      <details className="bidea__disclosure">
        <summary>what is still missing ({lead.evidence_gaps.length})</summary>
        <ul>
          {lead.evidence_gaps.map((gap, i) => <li key={i}>{gap}</li>)}
        </ul>
      </details>

      <div className="bidea__foot">
        <div className="bidea__read" title={`How well evidenced and how direct the connection is — ${lead.link_strength}/100 before caps${lead.lead_score_cap_reason ? `, held at ${lead.lead_score_cap} because ${lead.lead_score_cap_reason}` : ''}. This is not a view on the company, and not a price target.`}>
          <span className="bidea__readlabel">evidence</span>
          <span className="bidea__readnum">{lead.lead_score}<span className="bidea__readden">/100</span></span>
          <span className="bidea__bar" aria-hidden><span className="bidea__barfill" style={{ width: `${Math.max(0, Math.min(100, lead.lead_score))}%` }} /></span>
        </div>
        <div className="bidea__actions">
          <span className="chain__anchor" title={`This lead sits behind ${lead.anchor_name || lead.anchor_ticker}${lead.anchor_decision_date ? `, decided ${lead.anchor_decision_date}` : ''}.`}>
            behind <strong>{lead.anchor_ticker}</strong>
            {lead.anchor_decision ? <em> · {lead.anchor_decision}</em> : <em className="chain__anchor--none"> · not decided</em>}
          </span>
          {canStartPool && (
            <button
              type="button"
              className="bidea__cta"
              disabled={busy}
              title={`Create a data pool for ${lead.symbol} so its filings can be gathered and it can be researched properly.`}
              onClick={async () => { setBusy(true); try { await addCompany(lead.symbol!) } finally { setBusy(false) } }}
            >
              {busy ? 'Creating…' : 'Start a pool'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function AnchorStrip({ board }: { board: SupplyChainBoard }) {
  if (!board.anchors.length) return null
  return (
    <ul className="chain__maps">
      {board.anchors.map((anchor) => {
        const scope = anchor.scope_notes.join(' · ')
        return (
          <li key={anchor.ticker} className="chain__map">
            <span className="chain__mapticker">{anchor.ticker}</span>
            <span className="chain__mapfact">
              <strong>{anchor.listed_third_parties}</strong> listed outside part{anchor.listed_third_parties === 1 ? 'y' : 'ies'}
              {anchor.exchanges.length > 1 ? ` across ${anchor.exchanges.length} markets` : ''}
            </span>
            {anchor.intragroup_row_share_pct !== null && (
              <span
                className={`chain__mapfact${anchor.intragroup_row_share_pct >= 50 ? ' chain__mapfact--warn' : ''}`}
                title={`${anchor.intragroup_rows} of ${anchor.relationship_rows} disclosed relationships are with companies inside ${anchor.name || anchor.ticker}'s own group. A high share means most of the chain is not arm's-length — a related-party read, not an idea.`}
              >
                <strong>{Math.round(anchor.intragroup_row_share_pct)}%</strong> of its disclosed chain is in-house
              </span>
            )}
            {scope && <span className="chain__mapscope" title={scope}>{scope}</span>}
          </li>
        )
      })}
    </ul>
  )
}

export function ChainLane({ board }: { board: SupplyChainBoard }) {
  const [showAll, setShowAll] = useState(false)

  const { open, held, groups } = useMemo(() => {
    const openRows = board.leads.filter((l) => ACTIONABLE.has(l.readiness))
    const heldRows = board.leads.filter((l) => !ACTIONABLE.has(l.readiness))
    const shown = showAll ? [...openRows, ...heldRows] : openRows
    const byOrder = new Map<number, SupplyChainLead[]>()
    for (const lead of shown) {
      const bucket = byOrder.get(lead.order)
      if (bucket) bucket.push(lead)
      else byOrder.set(lead.order, [lead])
    }
    return {
      open: openRows,
      held: heldRows,
      groups: [...byOrder.entries()].sort((a, b) => a[0] - b[0]),
    }
  }, [board.leads, showAll])

  if (!board.leads.length) {
    return (
      <>
        <AnchorStrip board={board} />
        <p className="bideas__empty">{board.health.reason}</p>
      </>
    )
  }

  return (
    <>
      {board.health.status === 'degraded' && (
        <div className="bideas__truthwarn" role="status" title={board.health.reason}>
          <span aria-hidden>!</span> {board.health.reason}
        </div>
      )}
      <AnchorStrip board={board} />
      {!open.length && (
        <p className="chain__note">
          {board.health.reason}
        </p>
      )}
      {groups.map(([order, leads]) => {
        const label = orderTitle(order)
        return (
          <section key={order} className="chain__group">
            <h3 className="chain__grouphead">
              {label.title}
              <span className="chain__groupcount">{leads.length}</span>
            </h3>
            <p className="chain__groupnote">{label.note}</p>
            <div className="bideas__list">
              {leads.map((lead) => <ChainCard key={lead.lead_id} lead={lead} />)}
            </div>
          </section>
        )
      })}
      {held.length > 0 && (
        <button type="button" className="chain__more" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
          {showAll
            ? `Hide the ${held.length} that cannot be traded`
            : `Show ${held.length} more the engine is holding back`}
          <span className="chain__morewhy">
            {showAll ? '' : 'unlisted, lending-only, or possibly inside the anchor’s own group'}
          </span>
        </button>
      )}
    </>
  )
}
