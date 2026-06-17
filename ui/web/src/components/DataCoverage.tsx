import type { CoverageGroup } from '../lib/types'

// Plain-English age for a present doc, from the server's ageMonths (null => unknown date).
function ageLabel(ageMonths: number | null): string {
  if (ageMonths == null) return ''
  if (ageMonths < 1) return '<1mo'
  if (ageMonths < 12) return `${Math.round(ageMonths)}mo`
  return `${(ageMonths / 12).toFixed(1)}yr`
}

const TIER_LABEL: Record<string, string> = { critical: 'crit', core: 'core', recommended: 'rec', optional: 'opt' }

// The upload-aligned data-coverage list — organised around the SOURCE DOCUMENTS a person uploads, in
// four tiers (critical → core → recommended → optional). Presence is computed server-side
// (dataStatus.coverage), file-type / filename / tab-aware. Two modes:
//  • 'panel' — a ticker that HAS data: each present row names the satisfying file (+ tab, age/staleness)
//    and the facets it bundles; absent rows show the precise doc + consequence. A Critical gap (e.g. no
//    current price) is flagged red.
//  • 'guide' — a COLD ticker / zero folders: the same groups, all unmet, as an "upload these first"
//    guide carrying the exact quantity/recency each module needs.
// Never a gate (CLAUDE.md §11 — a thin pool caps conviction, it does not block a run).
export function DataCoverage({ coverage, mode }: { coverage: CoverageGroup[]; mode: 'panel' | 'guide' }) {
  if (!coverage?.length) return null
  const present = coverage.filter((g) => g.present).length

  return (
    <div className="cov" data-mode={mode}>
      <div className="cov__head">
        <span className="cov__title">{mode === 'guide' ? 'Upload to begin' : 'Data coverage'}</span>
        {mode === 'panel' && <span className="cov__count">{present}/{coverage.length}</span>}
      </div>

      <div className="cov__rows">
        {coverage.map((g) => {
          const missCrit = g.tier === 'critical' && !g.present
          const haveCovers = g.covers?.filter((c) => c.present).map((c) => c.label) ?? []
          // panel + present: prefer "covers a · b" when the group bundles facets, else name the file (+ tab).
          const detail =
            mode === 'panel' && g.present
              ? haveCovers.length
                ? `covers ${haveCovers.join(' · ')}`
                : `${g.filename ?? ''}${g.sheet ? ` · ${g.sheet} tab` : ''}`
              : g.helps
          return (
            <div className="cov__row" data-present={g.present ? 'true' : 'false'} data-crit={missCrit ? 'true' : 'false'} key={g.key}>
              <span className="cov__mark">{g.present ? '✓' : '○'}</span>
              <div className="cov__main">
                <div className="cov__top">
                  <span className="cov__label">{g.label}</span>
                  <span className="cov__tier" data-tier={g.tier}>{TIER_LABEL[g.tier] ?? g.tier}</span>
                  {mode === 'panel' && g.present && (g.ageMonths != null || g.stale) && (
                    <span className="cov__age" data-stale={g.stale ? 'true' : 'false'}>
                      {g.stale ? 'stale · ' : ''}
                      {ageLabel(g.ageMonths)}
                    </span>
                  )}
                </div>
                <div className="cov__sub" title={mode === 'panel' && g.present ? g.filename ?? detail : g.helps}>{detail}</div>
              </div>
            </div>
          )
        })}
      </div>

      {mode === 'guide' && <div className="cov__foot">Drop these into the synced Drive folder — the swarm wakes the moment they land.</div>}
    </div>
  )
}
