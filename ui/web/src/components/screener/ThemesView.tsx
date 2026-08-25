import { useMemo, useState } from 'react'
import { fmtStampLocal } from '../../lib/format'
import { useStore } from '../../lib/store'
import {
  compareBriefingThemes,
  themeSliceDisplay,
  themeStageIsStale,
  themesForPmSurface,
  validatedThemeNarrative,
  type Theme,
  type ThemeDetail,
  type ThemePlayer,
  type ThemePlayerEvidence,
  type ThemeSliceDisplay,
} from '../../lib/themes'
import { useWireConfig } from '../wire/WireContext'

const INITIAL_NEWS_ROWS = 8

function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null
  } catch {
    return null
  }
}

function finiteCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
}

export function exactNewsCount(theme: Theme): number {
  // The server defines member_count as the current deduplicated proof core. Assessment.unique_evidence_count
  // also includes excluded off-theme rows, so it would overstate the exact news the detail can show.
  return finiteCount(theme.member_count)
}

export function rankedValidatedThemes(themes: readonly Theme[]): Theme[] {
  return [...themesForPmSurface(themes)].sort(compareBriefingThemes)
}

function compilerDebt(
  queue: ReturnType<typeof useStore.getState>['themeFormationQueue'],
  health: ReturnType<typeof useStore.getState>['themeCompilerHealth'],
): number {
  return Math.max(finiteCount(queue?.total), finiteCount(health?.queue.total))
}

function freshnessStamp(value: string | null | undefined): string {
  return fmtStampLocal(value || undefined) || 'time unavailable'
}

export function ThemesView() {
  const themes = useStore((state) => state.themes)
  const status = useStore((state) => state.themesStatus)
  const generatedAt = useStore((state) => state.themesGeneratedAt)
  const selectedTheme = useStore((state) => state.selectedTheme)
  const geo = useStore((state) => state.themesGeo)
  const subject = useStore((state) => state.themesSubject)
  const formationQueue = useStore((state) => state.themeFormationQueue)
  const compilerHealth = useStore((state) => state.themeCompilerHealth)
  const selectTheme = useStore((state) => state.selectTheme)
  const retryThemes = useStore((state) => state.retryThemes)
  const wireConfig = useWireConfig()

  const slice = themeSliceDisplay(geo.label, subject, wireConfig?.flow ? null : wireConfig?.eventScope)
  const ranked = useMemo(() => rankedValidatedThemes(themes), [themes])
  const hasSavedList = ranked.length > 0
  const stale = hasSavedList && (status !== 'ready' || themeStageIsStale(generatedAt))
  const debt = compilerDebt(formationQueue, compilerHealth)

  if (selectedTheme) {
    return <ThemeDetailView sourceSlice={slice} stale={stale} refreshFailed={status === 'error'} generatedAt={generatedAt} />
  }

  return (
    <main className="themes themes-simple" aria-busy={status === 'loading'}>
      <header className="themes-simple__head">
        <div>
          <h1>Themes</h1>
          <p>{slice.active ? `Validated themes from ${slice.label}.` : 'Validated themes, the news behind them, and the companies affected.'}</p>
        </div>
        {generatedAt && <span className={stale ? 'is-stale' : ''}>Evidence updated {freshnessStamp(generatedAt)}</span>}
      </header>

      {stale && (
        <div className="themes-simple__warning" role="alert">
          <div>
            <b>Saved Themes snapshot — not current</b>
            <span>{status === 'error' ? 'The latest refresh failed.' : 'The last successful validation is more than 10 minutes old.'} Read the saved evidence for audit, then refresh before acting.</span>
          </div>
          <button type="button" onClick={() => void retryThemes()} disabled={status === 'loading'}>{status === 'loading' ? 'Refreshing…' : 'Refresh Themes'}</button>
        </div>
      )}

      {status === 'loading' && !hasSavedList ? (
        <div className="themes-simple__empty" role="status" aria-live="polite">
          <div className="themes__shimmer" />
          <b>Building the Themes list…</b>
          <span>Only validated narratives will appear here.</span>
        </div>
      ) : status === 'error' && !hasSavedList ? (
        <div className="themes-simple__empty" role="alert" aria-live="assertive">
          <b>The Themes list could not be loaded.</b>
          <span>{debt > 0 ? `${debt} raw news pattern${debt === 1 ? '' : 's'} await validation, but none is a proven theme yet.` : 'There is no saved validated theme to show.'}</span>
          <button type="button" onClick={() => void retryThemes()}>Retry Themes</button>
        </div>
      ) : !hasSavedList ? (
        <div className="themes-simple__empty" role="status" aria-live="polite">
          <b>No validated theme yet.</b>
          <span>{debt > 0 ? `${debt} raw news pattern${debt === 1 ? '' : 's'} ${debt === 1 ? 'is' : 'are'} still being checked. Raw patterns are not investment themes.` : slice.active ? `No evidence in ${slice.label} currently forms a validated theme.` : 'The engine has not found enough connected evidence to form a theme.'}</span>
        </div>
      ) : (
        <section className="theme-list" aria-label="Ranked validated themes">
          {ranked.map((theme) => <ThemeListRow key={theme.theme_id} theme={theme} stale={stale} onOpen={selectTheme} />)}
        </section>
      )}
    </main>
  )
}

function ThemeListRow({ theme, stale, onOpen }: { theme: Theme; stale: boolean; onOpen: (id: string) => void }) {
  const narrative = validatedThemeNarrative(theme)
  const counts = theme.player_counts
  const firstOrder = finiteCount(counts?.first_order)
  const secondOrder = finiteCount(counts?.second_order)
  const newsCount = exactNewsCount(theme)
  const ideaReady = theme.idea_ready === true

  return (
    <button
      type="button"
      className="theme-list__row"
      onClick={() => onOpen(theme.theme_id)}
      aria-label={`Open ${theme.name}. ${ideaReady ? 'Idea-ready' : 'Theme only'}. ${firstOrder} first-order players, ${secondOrder} second-order players, ${newsCount} exact news items.`}
    >
      <span className={`theme-list__status${ideaReady ? ' is-ready' : ''}`}>{ideaReady ? 'Idea-ready' : 'Theme only'}</span>
      <span className="theme-list__story">
        <b>{theme.name}</b>
        <span>{narrative?.why_now || 'Why now is not proven from available evidence.'}</span>
      </span>
      <span className="theme-list__count"><b>{firstOrder}</b><small>First order</small></span>
      <span className="theme-list__count"><b>{secondOrder}</b><small>Second order</small></span>
      <span className="theme-list__count"><b>{newsCount}</b><small>Exact news</small></span>
      <span className="theme-list__latest"><b>{stale ? 'Last saved evidence' : 'Latest evidence'}</b><small>{freshnessStamp(theme.last_flow)}</small></span>
    </button>
  )
}

export function ThemeDetailView({ sourceSlice, stale, refreshFailed, generatedAt }: { sourceSlice: ThemeSliceDisplay; stale: boolean; refreshFailed: boolean; generatedAt: string | null }) {
  const selectedId = useStore((state) => state.selectedTheme)
  const detail = useStore((state) => state.themeDetail)
  const detailError = useStore((state) => state.themeDetailError)
  const loading = useStore((state) => state.themesLoading)
  const selectTheme = useStore((state) => state.selectTheme)

  if (loading) {
    return (
      <main className="theme-detail" aria-busy="true">
        <button type="button" className="theme-detail__back" onClick={() => selectTheme(null)}>← All themes</button>
        <div className="themes-simple__empty" role="status" aria-live="polite"><div className="themes__shimmer" /><b>Loading exact theme evidence…</b></div>
      </main>
    )
  }

  if (!detail) {
    return (
      <main className="theme-detail">
        <button type="button" className="theme-detail__back" onClick={() => selectTheme(null)}>← All themes</button>
        <div className="themes-simple__empty" role="alert">
          <b>Theme detail could not be loaded.</b>
          <span>{detailError || 'The detail endpoint returned no current evidence package.'}</span>
          <div className="themes-simple__empty-actions">
            <button type="button" onClick={() => selectTheme(null)}>Back to Themes</button>
            {selectedId && <button type="button" onClick={() => void selectTheme(selectedId)}>Retry detail</button>}
          </div>
        </div>
      </main>
    )
  }

  return <ThemeDetailContent detail={detail} sourceSlice={sourceSlice} stale={stale} refreshFailed={refreshFailed} generatedAt={generatedAt} onBack={() => selectTheme(null)} />
}

export function ThemeDetailContent({
  detail,
  sourceSlice,
  stale,
  refreshFailed,
  generatedAt,
  onBack,
}: {
  detail: ThemeDetail
  sourceSlice: ThemeSliceDisplay
  stale: boolean
  refreshFailed: boolean
  generatedAt: string | null
  onBack: () => void
}) {
  const [showAllNews, setShowAllNews] = useState(false)
  const theme = detail.theme
  const narrative = validatedThemeNarrative(theme)
  const formation = detail.formation
  const firstOrder = validPlayers(detail.players?.first_order, 1)
  const secondOrder = validPlayers(detail.players?.second_order, 2)
  const evidenceNews = useMemo(() => sortedEvidenceNews(detail), [detail])
  const shownNews = showAllNews ? evidenceNews : evidenceNews.slice(0, INITIAL_NEWS_ROWS)
  const whyNowNews = evidenceNews.find((row) => row.event_id === narrative?.why_now_event_id)
  const ideaReady = theme.idea_ready === true

  if (!narrative) {
    return (
      <main className="theme-detail">
        <button type="button" className="theme-detail__back" onClick={onBack}>← All themes</button>
        <div className="themes-simple__empty" role="alert"><b>This theme no longer has a complete validated narrative.</b><span>It has been hidden from the investment reading flow until normal revalidation finishes.</span></div>
      </main>
    )
  }

  return (
    <main className="theme-detail">
      <button type="button" className="theme-detail__back" onClick={onBack}>← All themes</button>

      {stale && (
        <div className="theme-detail__warning" role="alert">
          <b>Saved evidence — not current</b>
          <span>{refreshFailed ? 'The latest Themes refresh failed.' : 'The last successful Themes validation is stale.'} This package is retained for audit from {freshnessStamp(generatedAt)}.</span>
        </div>
      )}
      {sourceSlice.active && <div className="theme-detail__scope" role="note"><b>Evidence scoped to {sourceSlice.label}</b><span>The news and players below come from the same slice as the list you opened.</span></div>}

      <section className="theme-section theme-section--hero" data-theme-section="1">
        <span className="theme-section__number">1</span>
        <div>
          <div className="theme-section__heading"><h1>The theme</h1><span className={`theme-list__status${ideaReady ? ' is-ready' : ''}`}>{ideaReady ? 'Idea-ready' : 'Theme only'}</span></div>
          <h2>{theme.name}</h2>
          <p className="theme-section__lead">{narrative.thesis}</p>
          <div className="theme-section__facts"><span>Latest evidence <b>{freshnessStamp(theme.last_flow)}</b></span><span>Validated <b>{freshnessStamp(narrative.validated_at)}</b></span><span>Time horizon <b>{narrative.horizon}</b></span></div>
          {!ideaReady && <div className="theme-section__not-ready"><b>Why this is theme-only</b><span>{theme.idea_blockers?.length ? theme.idea_blockers.join(' ') : 'No player package has cleared every Ideas admission check yet.'}</span></div>}
        </div>
      </section>

      <section className="theme-section" data-theme-section="2">
        <span className="theme-section__number">2</span>
        <div>
          <h2>How this theme formed</h2>
          {formation ? (
            <>
              <p className="theme-section__label">Shared signals</p>
              <div className="theme-section__anchors">{formation.shared_narrative_anchors.map((anchor) => <span key={anchor}>{anchor}</span>)}</div>
              <div className="formation-metrics">
                <Metric value={formation.distinct_news_count} label="distinct news items" />
                <Metric value={formation.publisher_count} label="publishers" />
                <Metric value={formation.supporting_count} label="supporting" />
                <Metric value={formation.challenging_count} label="challenging" />
                <Metric value={formation.excluded_off_theme_count} label="off-theme excluded" />
              </div>
              <p className="theme-section__quiet">First seen {freshnessStamp(formation.first_seen)} · validated {freshnessStamp(formation.validated_at)}</p>
            </>
          ) : <EvidenceEmpty />}
        </div>
      </section>

      <section className="theme-section" data-theme-section="3">
        <span className="theme-section__number">3</span>
        <div>
          <h2>How the effect travels</h2>
          <div className="effect-now"><b>Why now</b><p>{narrative.why_now}</p>{whyNowNews && <EvidenceNewsSource row={whyNowNews} />}</div>
          <ol className="effect-chain">{narrative.mechanism_steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol>
        </div>
      </section>

      <PlayerSection number="4" title="First-order players" players={firstOrder} />
      <PlayerSection number="5" title="Second-order players" players={secondOrder} />

      <section className="theme-section" data-theme-section="6">
        <span className="theme-section__number">6</span>
        <div><h2>What would prove this wrong</h2><p className="falsifier">{narrative.falsifier}</p></div>
      </section>

      <section className="theme-section" data-theme-section="7">
        <span className="theme-section__number">7</span>
        <div>
          <div className="theme-section__heading"><h2>Exact news</h2><span>{evidenceNews.length} retained unique item{evidenceNews.length === 1 ? '' : 's'}</span></div>
          {shownNews.length ? <div className="evidence-news">{shownNews.map((row) => <EvidenceNewsRow key={row.event_id} row={row} />)}</div> : <EvidenceEmpty />}
          {evidenceNews.length > INITIAL_NEWS_ROWS && <button type="button" className="evidence-news__toggle" aria-expanded={showAllNews} onClick={() => setShowAllNews((shown) => !shown)}>{showAllNews ? 'Show first 8' : `Show all ${evidenceNews.length}`}</button>}
        </div>
      </section>
    </main>
  )
}

function Metric({ value, label }: { value: number; label: string }) {
  return <span><b>{finiteCount(value)}</b>{label}</span>
}

function EvidenceEmpty() {
  return <p className="theme-section__empty">Not proven from available evidence.</p>
}

function validPlayers(value: ThemePlayer[] | undefined, order: 1 | 2): ThemePlayer[] {
  if (!Array.isArray(value)) return []
  return value.filter((player) => player && player.order === order && !!player.name?.trim() && !!player.mechanism?.trim() && Array.isArray(player.evidence) && player.evidence.length > 0)
}

function PlayerSection({ number, title, players }: { number: '4' | '5'; title: string; players: ThemePlayer[] }) {
  return (
    <section className="theme-section" data-theme-section={number}>
      <span className="theme-section__number">{number}</span>
      <div>
        <div className="theme-section__heading"><h2>{title}</h2><span>{players.length}</span></div>
        {players.length ? <div className="theme-players">{players.map((player) => <PlayerCard key={`${player.name}-${player.ticker || 'unlisted'}-${player.relationship}`} player={player} />)}</div> : <EvidenceEmpty />}
      </div>
    </section>
  )
}

const SIDE_LABEL: Record<ThemePlayer['side'], string> = { beneficiary: 'May gain', harmed: 'May be hurt', unclear: 'Direction unclear' }
const RELATIONSHIP_LABEL: Record<ThemePlayer['relationship'], string> = {
  direct_subject: 'Named subject',
  parent: 'Parent',
  supplier: 'Supplier',
  customer: 'Customer',
  competitor: 'Competitor',
  substitute: 'Substitute',
  other: 'Other sourced relationship',
}

function PlayerCard({ player }: { player: ThemePlayer }) {
  const verifiedListing = player.listing_status === 'verified_public' && Boolean(player.ticker)
  const listing = verifiedListing ? player.ticker : 'No verified listing'
  return (
    <article className={`theme-player theme-player--${player.side}`}>
      <header><div><h3>{player.name}</h3><span className={verifiedListing ? 'is-public' : ''}>{listing}</span></div><b>{SIDE_LABEL[player.side]}</b></header>
      <dl>
        <div><dt>Relationship</dt><dd>{RELATIONSHIP_LABEL[player.relationship]}</dd></div>
        <div><dt>Mechanism</dt><dd>{player.mechanism}</dd></div>
        <div><dt>Basis</dt><dd>{player.mechanism_basis === 'engine_inference' ? 'Engine inference — relationship is sourced, mechanism is inferred' : 'Stated by the source'}</dd></div>
        <div><dt>Ideas use</dt><dd>{player.idea_eligible ? 'Eligible to seed Ideas' : 'Visible evidence only — cannot seed Ideas'}</dd></div>
      </dl>
      <div className="theme-player__sources"><b>Exact supporting sources</b>{player.evidence.map((evidence, index) => <PlayerEvidence key={`${evidence.event_id || evidence.source_ref || evidence.source_file || 'source'}-${index}`} evidence={evidence} />)}</div>
    </article>
  )
}

function PlayerEvidence({ evidence }: { evidence: ThemePlayerEvidence }) {
  const url = safeHttpUrl(evidence.url)
  const label = evidence.kind === 'relationship_export'
    ? evidence.source_ref || evidence.source_file || 'Relationship export'
    : evidence.headline || evidence.event_id || 'Exact news event'
  const meta = [evidence.publisher, evidence.published_at ? freshnessStamp(evidence.published_at) : null].filter(Boolean).join(' · ')
  return <div>{url ? <a href={url} target="_blank" rel="noreferrer">{label}</a> : <span>{label}</span>}{meta && <small>{meta}</small>}</div>
}

type EvidenceNewsRowType = NonNullable<ThemeDetail['evidence_news']>[number]

function sortedEvidenceNews(detail: ThemeDetail): EvidenceNewsRowType[] {
  if (!Array.isArray(detail.evidence_news)) return []
  return [...detail.evidence_news].sort((a, b) => {
    const at = Date.parse(a.published_at)
    const bt = Date.parse(b.published_at)
    const clock = (Number.isFinite(bt) ? bt : -Infinity) - (Number.isFinite(at) ? at : -Infinity)
    return clock || a.event_id.localeCompare(b.event_id)
  })
}

const ROLE_LABEL: Record<EvidenceNewsRowType['roles'][number], string> = { why_now: 'Why now', support: 'Support', challenge: 'Challenge', player_proof: 'Player proof' }

function EvidenceNewsSource({ row }: { row: EvidenceNewsRowType }) {
  const url = safeHttpUrl(row.url)
  return <div className="effect-now__source">{url ? <a href={url} target="_blank" rel="noreferrer">{row.headline}</a> : <span>{row.headline}</span>}<small>{row.publisher || 'Publisher unavailable'} · {freshnessStamp(row.published_at)}</small></div>
}

function EvidenceNewsRow({ row }: { row: EvidenceNewsRowType }) {
  const url = safeHttpUrl(row.url)
  return (
    <article className="evidence-news__row">
      <div className="evidence-news__badges"><span className={`is-${row.stance}`}>{row.stance === 'challenges' ? 'Challenges' : 'Supports'}</span>{row.roles.map((role) => <span key={role}>{ROLE_LABEL[role]}</span>)}</div>
      {url ? <a href={url} target="_blank" rel="noreferrer">{row.headline}</a> : <h3>{row.headline}</h3>}
      <p>{row.publisher || 'Publisher unavailable'} · {freshnessStamp(row.published_at)}</p>
    </article>
  )
}
