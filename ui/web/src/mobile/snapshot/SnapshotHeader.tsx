// The one-glance card under the header. Rendering only — every derivation lives in snapshotView.ts
// (tested per swarm). Tapping the card opens the switcher, same as the header.
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { decisionColor } from '../../lib/format'
import type { QuoteRead, SwarmMeta } from '../../lib/types'
import { commoditySnapshot, researchSnapshot, signalSnapshot, type Snapshot } from './snapshotView'

const nfmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: d })

export function useSnapshot(swarm: string | undefined, subject: string | undefined, layout: SwarmMeta['layout'] | undefined): Snapshot | null {
  const [snap, setSnap] = useState<Snapshot | null>(null)
  useEffect(() => {
    if (!swarm || !subject) { setSnap(null); return }
    let dead = false
    setSnap(null)
    void (async () => {
      try {
        if (swarm === 'research') {
          const d = await api.decision(subject).catch(() => null)
          const q: QuoteRead | null = d ? await api.quote(subject, d.run_root).catch(() => null) : null
          if (!dead) setSnap(researchSnapshot(d, q))
        } else if (layout === 'flow') {
          const b = await api.screenerBoard()
          if (dead) return
          const sig = (b.signals || []).find((s) => s.signal_id === subject)
          const th = (b.theses || []).find((t) => t.signal_id === subject)
          setSnap(signalSnapshot(sig, th))
        } else {
          const [subs, rec] = await Promise.all([
            api.swarmSubjects(swarm).catch(() => ({ subjects: [], summaries: [] })),
            api.decision(subject, swarm).catch(() => null),
          ])
          if (dead) return
          setSnap(commoditySnapshot(subs.summaries.find((x) => x.subject === subject), rec))
        }
      } catch {
        if (!dead) setSnap(null)
      }
    })()
    return () => { dead = true }
  }, [swarm, subject, layout])
  return snap
}

export function SnapshotHeader({ snap, onTap }: { snap: Snapshot | null; onTap: () => void }) {
  if (!snap) return null
  if (snap.kind === 'never-run') {
    return (
      <button className="msnap" onClick={onTap}>
        <span className="msnap__sub">{snap.note}</span>
      </button>
    )
  }
  if (snap.kind === 'signal') {
    return (
      <button className="msnap" onClick={onTap}>
        {snap.headline && <span className="msnap__headline">{snap.headline}</span>}
        <span className="msnap__rowline">
          {snap.routing && <span className="msnap__pill">{snap.routing}</span>}
          {snap.edge != null && <span className="msnap__sub">edge {snap.edge}</span>}
        </span>
      </button>
    )
  }
  if (snap.kind === 'commodity') {
    return (
      <button className="msnap" onClick={onTap}>
        <span className="msnap__rowline">
          {snap.verdict && <span className="msnap__pill" style={{ color: decisionColor(snap.verdict) }}>{snap.verdict}</span>}
          {snap.confidence != null && (
            <span className="msnap__sub">
              confidence {snap.confidence}
              {snap.confidenceRaw != null && <span className="msnap__faint"> ({snap.confidenceRaw} before red-team cap)</span>}
            </span>
          )}
          {snap.targetExposure !== undefined && <span className="msnap__sub">target {snap.targetExposure == null ? 'awaiting evidence' : `${snap.targetExposure} risk units`}</span>}
          {snap.conflict && <span className="msnap__conflict">horizons conflict</span>}
        </span>
        {snap.price != null && (
          <span className="msnap__price mono">
            {nfmt(snap.price)} {snap.priceUnit}
            {snap.asOf && <span className="msnap__faint"> · as of {snap.asOf}</span>}
          </span>
        )}
        {snap.chips.length > 0 && (
          <span className="msnap__chips">{snap.chips.map((c) => <span key={c} className="msnap__chip">{c}</span>)}</span>
        )}
        {snap.horizons && (
          <span className="msnap__horizons">
            {snap.horizons.map((horizon) => (
              <span className="msnap__horizon" key={horizon.name}>
                <b>{horizon.name}</b> · {horizon.classification}
                {horizon.implementableReturnPct != null && <> · {horizon.implementableReturnPct > 0 ? '+' : ''}{horizon.implementableReturnPct}% implementable</>}
                {horizon.targetDate && <span className="msnap__faint"> · to {horizon.targetDate}</span>}
              </span>
            ))}
          </span>
        )}
      </button>
    )
  }
  // research
  return (
    <button className="msnap" onClick={onTap}>
      <span className="msnap__rowline">
        {snap.verdict && <span className="msnap__pill" style={{ color: decisionColor(snap.verdict) }}>{snap.verdict}</span>}
        {snap.confidence != null && (
          <span className="msnap__sub">
            confidence {snap.confidence}/100
            {snap.confidenceRaw != null && <span className="msnap__faint"> ({snap.confidenceRaw} before cap)</span>}
          </span>
        )}
      </span>
      {snap.entry != null && (
        <span className="msnap__price mono">
          {/* the currency is never optional decoration on a global book: 238.34 is a different number in
              USD, INR and NOK, and the derivation already carries it (§27 — figures travel with their unit) */}
          entry {snap.currency ? `${snap.currency} ` : ''}{nfmt(snap.entry)}
          {snap.live != null && (
            <>
              {' '}→ {snap.liveIsClose ? 'last close' : 'now'} {nfmt(snap.live)}
              {/* Freshness qualifiers travel with the price — a stale or delayed tick must never read as a
                  current one (mirrors desktop DecisionBanner's quote.delayed / quote.stale tooltip text). */}
              {snap.liveStale && <span className="msnap__faint"> · not current</span>}
              {!snap.liveStale && snap.liveDelayed && <span className="msnap__faint"> · delayed</span>}
            </>
          )}
          {snap.movePct != null && (
            <span className={snap.movePct < 0 ? 'msnap__neg' : 'msnap__pos'}> {snap.movePct > 0 ? '+' : ''}{nfmt(snap.movePct, 1)}%</span>
          )}
        </span>
      )}
    </button>
  )
}
