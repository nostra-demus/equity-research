import type { CSSProperties } from 'react'
import type { DataNeed } from '../../lib/types'

export type NeedSearchState = { status: 'searching' } | { status: 'error'; message: string }

function shortHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'Open HTTPS address' }
}

function checkedLabel(iso: string | undefined, stale: boolean | undefined): string {
  if (!iso || !Number.isFinite(Date.parse(iso))) return stale ? 'Check is stale' : 'Check date unavailable'
  const date = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(iso))
  return `Checked ${date}${stale ? ' · recheck due' : ''}`
}

export function DataNeedsPanel({ needs, integrityWarnings, schemaVersion, open, style, searchByNeed, onToggle, onSearch }: {
  needs: DataNeed[]
  integrityWarnings: string[]
  schemaVersion?: '2.0'
  open: boolean
  style?: CSSProperties
  searchByNeed: Record<string, NeedSearchState>
  onToggle: () => void
  onSearch: (need: DataNeed) => void
}) {
  return (
    <aside className="dneeds" style={style} aria-label="What would improve this call">
      <button
        className="dneeds__head"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="data-needs-call-panel"
      >
        <span className="dneeds__chev" data-open={open} aria-hidden>▸</span>
        <span className="dneeds__heading">
          <span className="dneeds__title">What would improve this call</span>
          <span className="dneeds__subtitle">
            Closing these gaps would improve understanding, but evidence can strengthen, weaken, or leave the call unchanged. It never guarantees conviction.
          </span>
        </span>
        <span className="dneeds__count">{needs.length}</span>
      </button>
      {open && (
        <div className="dneeds__body" id="data-needs-call-panel">
          {needs.length === 0 && integrityWarnings.length > 0 ? (
            <div className="dneeds__integrity dneeds__integrity--blocked" role="status">
              <span>Data guidance unavailable</span>
              <span>Refresh or rerun this call.</span>
            </div>
          ) : integrityWarnings.length > 0 ? (
            <div className="dneeds__integrity" role="status">
              Some guidance could not be verified and is hidden. Refresh or rerun this call.
            </div>
          ) : needs.length === 0 && schemaVersion === '2.0' ? (
            <div className="dneeds__empty">This call did not identify an active data gap.</div>
          ) : needs.length === 0 ? (
            <div className="dneeds__empty">This older call did not produce structured data guidance. Rerun to generate it.</div>
          ) : null}
          {needs.map((need, index) => (
            <NeedCard
              key={need.need_id}
              need={need}
              index={index}
              search={searchByNeed[need.need_id]}
              onSearch={() => onSearch(need)}
            />
          ))}
        </div>
      )}
    </aside>
  )
}

export function NeedCard({ need, index, search, onSearch }: {
  need: DataNeed
  index: number
  search?: NeedSearchState
  onSearch: () => void
}) {
  const lookup = need.source_lookup
  const publicUrl = lookup?.lookup_status === 'public_link_found' && lookup.public_url
    ? lookup.public_url
    : null
  // Keep one button at one tree position from idle → retry → searching → error. Moving a retry button
  // between the source row and a footer made React replace the focused element on click.
  const canSearch = !need.filing_required && !need.built_by && (!publicUrl || lookup?.stale === true)
  const isPriorityOne = need.priority === 1

  return (
    <article
      className={`dneed${isPriorityOne ? ' dneed--priority' : ''}${need.filing_required ? ' dneed--filing' : ''}`}
      style={{ '--i': Math.min(index, 5) } as CSSProperties}
    >
      <div className="dneed__top">
        <div className="dneed__series">{need.series}</div>
        {typeof need.priority === 'number' && (
          <span className="dneed__priority">{isPriorityOne ? 'Priority 1' : `Priority ${need.priority}`}</span>
        )}
      </div>

      <div className="dneed__label">Why it limits understanding</div>
      <p className="dneed__why">{need.why_it_caps || 'The run did not explain this gap.'}</p>

      {need.entry_orbs?.length ? (
        <div className="dneed__orbs" aria-label="Affected analysis">
          {need.entry_orbs.map((orb) => (
            <span
              className={`dneed__orb${orb.route_status === 'historical' ? ' dneed__orb--historical' : ''}`}
              key={`${orb.module}/${orb.agent}`}
              title={`${orb.why} · ${Math.round(orb.confidence * 100)}% routing confidence${orb.route_status === 'historical' ? ' · historical route; no longer rerunnable' : ''}`}
            >
              {orb.module} · {orb.agent}{orb.route_status === 'historical' ? ' · historical' : ''}
            </span>
          ))}
        </div>
      ) : need.entry_modules.length ? (
        <div className="dneed__orbs" aria-label="Affected modules">
          {need.entry_modules.map((module) => <span className="dneed__orb dneed__orb--legacy" key={module}>{module}</span>)}
        </div>
      ) : null}

      {need.expected_impact && (
        <div className="dneed__impact">
          <div className="dneed__impact-side">
            <span className="dneed__impact-label">If supportive</span>
            <span>{need.expected_impact.if_supportive}</span>
          </div>
          <div className="dneed__impact-side dneed__impact-side--adverse">
            <span className="dneed__impact-label">If adverse</span>
            <span>{need.expected_impact.if_adverse}</span>
          </div>
        </div>
      )}

      <div className="dneed__source">
        <span className="dneed__source-label">Source lookup</span>
        {need.built_by ? (
          <span className="dneed__built">Feed already available</span>
        ) : need.filing_required ? (
          <span className="dneed__filing-required">Statutory filing required · public search cannot close this</span>
        ) : publicUrl ? (
          <span className="dneed__source-found" role="status" aria-live="polite">
            <span>{lookup?.stale ? 'Previously found — recheck' : 'Candidate public link'}</span>
            <a
              className="dneed__source-link"
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              title={`HTTPS syntax and public DNS were checked${lookup?.checked_at ? ` on ${lookup.checked_at}` : ''}. Data access and reuse rights were not verified: ${publicUrl}`}
            >
              {shortHost(publicUrl)} ↗
            </a>
            <span className="dneed__access-caveat">Access and reuse rights not verified</span>
            <span className={`dneed__checked${lookup?.stale ? ' is-stale' : ''}`}>
              {checkedLabel(lookup?.checked_at, lookup?.stale)}
            </span>
          </span>
        ) : search?.status === 'error' ? (
          <span className="dneed__source-error" role="alert">{search.message}</span>
        ) : lookup?.lookup_status === 'could_not_find' && search?.status !== 'searching' ? (
          <span className="dneed__not-found" role="status" aria-live="polite">
            <span>{lookup?.stale ? 'Previously: Could not find — recheck' : 'Could not find'}</span>
            <span className={`dneed__checked${lookup?.stale ? ' is-stale' : ''}`}>
              {checkedLabel(lookup?.checked_at, lookup?.stale)}
            </span>
          </span>
        ) : null}
        {publicUrl && search?.status === 'error' && (
          <span className="dneed__source-error" role="alert">{search.message}</span>
        )}
      </div>

      {canSearch && <div className="dneed__actions">
        <button
          className="dneed__find"
          onClick={onSearch}
          disabled={search?.status === 'searching'}
          aria-busy={search?.status === 'searching'}
        >
          {search?.status === 'searching' ? (
            <><span className="dneed__search-skeleton" aria-hidden />Searching…</>
          ) : search?.status === 'error' ? 'Try again'
            : lookup?.lookup_status === 'could_not_find' ? 'Search again'
              : lookup?.stale ? 'Recheck link'
              : 'Find public source'}
        </button>
      </div>}
    </article>
  )
}
