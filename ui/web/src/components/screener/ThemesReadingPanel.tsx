import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { fmtStampLocal } from '../../lib/format'
import { GICS_SECTORS, gicsOf } from '../../lib/gics'
import { useStore } from '../../lib/store'
import { compareBriefingThemes, themeBriefingEvidence, themeStageIsStale, themesForPmSurface, validatedThemeNarrative, type Theme, type ThemesIndex, type ValidatedThemeEvidence } from '../../lib/themes'

/** Navigation tags only: use the existing taxonomy on exact supporting headlines, never off-theme
 * members or unverified company guesses. One theme can belong to several sectors. */
export function readingThemeSectors(theme: Theme): string[] {
  const sectors = new Set<string>()
  for (const row of themeBriefingEvidence(theme)) {
    if (row.stance === 'supports') for (const sector of gicsOf({ headline: row.headline }).sectors) sectors.add(sector)
  }
  return GICS_SECTORS.filter((sector) => sectors.has(sector))
}

export function ThemeReadingCard({ theme }: { theme: Theme }) {
  const narrative = validatedThemeNarrative(theme)
  if (!narrative) return null
  const evidence = themeBriefingEvidence(theme)
  const supports = evidence.filter((row) => row.stance === 'supports')
  const challenges = evidence.filter((row) => row.stance === 'challenges')
  const whyNow = supports.find((row) => row.event_id === narrative.why_now_event_id)
  const sectors = readingThemeSectors(theme)
  return <article className="bidea theme-reading" aria-label={theme.name}>
    <header className="theme-reading__head"><h3>{theme.name}</h3><span className="bidea__tag">{theme.activity === 'challenged' ? 'Challenged' : theme.activity === 'new' ? 'New' : theme.activity === 'reinforced' ? 'Developing' : 'Monitoring'}</span></header>
    {(theme.assessment || theme.opportunity)?.metrics.pending_revalidation && <p className="bidea__refresh"><strong>New evidence awaiting revalidation</strong>The explanation below reflects the last validated sources. New matching reports are still being checked for support or challenges.</p>}
    <div className="bidea__tags">{(sectors.length ? sectors : ['Unclassified']).map((sector) => <span className="bidea__tag" key={sector}>{sector}</span>)}<span className="bidea__tag">Horizon: {narrative.horizon}</span></div>
    <p className="theme-reading__thesis">{narrative.thesis}</p>
    <div><h4>What is happening and why now</h4><p>{narrative.why_now}</p>
      {whyNow && <p className="theme-reading__citation"><a href={whyNow.url} target="_blank" rel="noreferrer">{whyNow.source_name} ↗</a> · Source observed <time dateTime={whyNow.found_at}>{fmtStampLocal(whyNow.found_at)}</time></p>}
    </div>
    <div><h4>Why it matters <small>· research interpretation</small></h4><ol>{narrative.mechanism_steps.map((step, i) => <li key={i}>{step}</li>)}</ol></div>
    {challenges.length > 0 && <div className="theme-reading__challenges"><h4>Evidence that challenges the theme</h4><SourceList rows={challenges} /></div>}
    <div><h4>What would change this view</h4><p>{narrative.falsifier}</p></div>
    <details className="theme-reading__sources" open><summary>Supporting sources · {supports.length} retained reports</summary><SourceList rows={supports} /></details>
    <p className="theme-reading__foot">Validated <time dateTime={narrative.validated_at}>{fmtStampLocal(narrative.validated_at)}</time> · A theme to study before choosing companies.</p>
  </article>
}

function SourceList({ rows }: { rows: ValidatedThemeEvidence[] }) {
  return <ul className="discovery-reports">{rows.map((row) => <li key={row.event_id}><a href={row.url} target="_blank" rel="noreferrer">{row.headline}</a>
    <small>{row.source_name} · {row.source_tier.replace(/_/g, ' ')} · Source observed <time dateTime={row.found_at}>{fmtStampLocal(row.found_at)}</time> · Reported, unverified</small>
  </li>)}</ul>
}

export function ThemesReadingPanel() {
  const staticMode = useStore((s) => s.staticMode)
  const [index, setIndex] = useState<ThemesIndex | null>(null)
  const [sector, setSector] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)
  const retry = useCallback(() => setRefresh((n) => n + 1), [])

  useEffect(() => {
    let alive = true
    let pending = false
    const load = async () => {
      if (pending) return
      pending = true
      setLoading(true)
      try {
        // This is a read-only projection of the approved-source pipeline. Opening the tab never
        // generates a brief, starts research, or changes the wire's geo/company/market selections.
        const next = await api.newsThemes()
        if (!next || !Array.isArray(next.themes) || typeof next.generated_at !== 'string'
          || next.themes.some((t) => !t || typeof t.theme_id !== 'string' || typeof t.name !== 'string')) throw new Error('The theme data could not be read. Please retry.')
        if (alive) { setIndex(next); setError(null) }
      } catch (e: any) {
        if (alive) setError(e?.message || 'Could not load themes. Please retry.')
      } finally {
        pending = false
        if (alive) setLoading(false)
      }
    }
    void load()
    const timer = setInterval(() => void load(), 30_000)
    return () => { alive = false; clearInterval(timer) }
  }, [refresh])

  const themes = useMemo(() => [...themesForPmSurface(index?.themes || [])].sort(compareBriefingThemes), [index])
  const tagged = useMemo(() => themes.map((theme) => ({ theme, sectors: readingThemeSectors(theme) })), [themes])
  const visible = tagged.filter((row) => sector === 'all' || (sector === 'unclassified' ? row.sectors.length === 0 : row.sectors.includes(sector)))
  const stale = !!index && themes.length > 0 && (error !== null || themeStageIsStale(index.generated_at))
  const queued = index?.formation_queue?.total || 0

  return <section role="tabpanel" id="ideas-themes-panel" aria-labelledby="ideas-themes-tab" aria-busy={loading}>
    <div className="discovery-filters theme-reading__filters"><label>Sector <select aria-label="Theme sector" value={sector} onChange={(e) => setSector(e.target.value)}>
      <option value="all">All sectors · {themes.length}</option>{GICS_SECTORS.map((name) => <option key={name} value={name}>{name} · {tagged.filter((row) => row.sectors.includes(name)).length}</option>)}
      <option value="unclassified">Unclassified · {tagged.filter((row) => !row.sectors.length).length}</option>
    </select></label><small>Sector tags inferred from supporting source headlines.</small>
      <button type="button" disabled={loading} onClick={retry}>{loading ? 'Refreshing…' : 'Refresh themes'}</button>
    </div>
    <header className="bideas__sectionhead"><div><h2>Themes to study</h2><p>Follow connected developments in approved sources. Understand the change, then explore the companies.</p></div>{index && <span>{visible.length} shown</span>}</header>
    {index?.generated_at && <p className="theme-reading__updated">Evidence updated <time dateTime={index.generated_at}>{fmtStampLocal(index.generated_at)}</time></p>}
    {error && <div className="bideas__fetch bideas__fetch--bad" role="alert">{error}{index && ' Showing the last loaded themes.'}<button type="button" disabled={loading} onClick={retry}>Retry</button></div>}
    {stale && !error && <div className="bideas__fetch bideas__fetch--warn" role="status">Saved evidence · the last successful theme validation is more than 10 minutes old.</div>}
    {staticMode && <p className="discovery-muted">Connect the engine to read themes from its approved sources.</p>}
    {!index && loading && <div className="bideas__list" role="status" aria-label="Loading themes"><div className="bidea bidea--skeleton" /><div className="bidea bidea--skeleton" /></div>}
    {index && visible.length === 0 && <p className="bideas__queueempty">{sector !== 'all' ? `No validated themes match ${sector === 'unclassified' ? 'Unclassified' : sector}. Choose All sectors to read other themes.`
      : `No validated themes are available yet.${queued ? ` ${queued} source patterns are still being checked.` : ' Themes appear when connected source reports support a complete explanation.'}`}</p>}
    <div className="bideas__list">{visible.map(({ theme }) => <ThemeReadingCard key={theme.theme_id} theme={theme} />)}</div>
  </section>
}
